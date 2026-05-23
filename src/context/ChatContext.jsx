import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ChatContext = createContext(null)
const READ_KEY = 'pt_chat_read'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

function dbToMsg(row) {
  return {
    id:         row.id,
    bookingId:  row.booking_id,
    senderId:   row.sender_id,
    senderNome: row.sender_nome,
    text:       row.text       || null,
    type:       row.type       || 'text',
    fileUrl:    row.file_url   || null,
    fileName:   row.file_name  || null,
    createdAt:  row.created_at,
  }
}

export function ChatProvider({ children }) {
  const [chats, setChats]       = useState({})
  const [readMap, setReadMap]   = useState(() => load(READ_KEY, {}))

  const chatsRef   = useRef(chats)
  chatsRef.current = chats
  const readMapRef   = useRef(readMap)
  readMapRef.current = readMap

  useEffect(() => {
    // Carica tutti i messaggi al mount
    supabase
      .from('messaggi_chat')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => {
          const msg = dbToMsg(row)
          if (!map[msg.bookingId]) map[msg.bookingId] = []
          map[msg.bookingId].push(msg)
        })
        setChats(map)
      })

    // Aggiornamenti in tempo reale
    const channel = supabase
      .channel('messaggi_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaggi_chat' }, ({ new: row }) => {
        const msg = dbToMsg(row)
        setChats(prev => {
          const existing = prev[msg.bookingId] || []
          if (existing.some(m => m.id === msg.id)) return prev
          return { ...prev, [msg.bookingId]: [...existing, msg] }
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const sendMessage = useCallback(async ({ bookingId, senderId, senderNome, text, type = 'text', fileUrl, fileName }) => {
    const msg = {
      id:         `m${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      bookingId,
      senderId,
      senderNome,
      text:       text     || null,
      type,
      fileUrl:    fileUrl  || null,
      fileName:   fileName || null,
      createdAt:  new Date().toISOString(),
    }

    // Ottimismo: aggiorna UI immediatamente
    setChats(prev => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] || []), msg],
    }))

    await supabase.from('messaggi_chat').insert({
      id:          msg.id,
      booking_id:  bookingId,
      sender_id:   senderId   || null,
      sender_nome: senderNome || null,
      text:        msg.text,
      type:        msg.type,
      file_url:    msg.fileUrl,
      file_name:   msg.fileName,
      created_at:  msg.createdAt,
    })

    return msg
  }, [])

  const markAsRead = useCallback((bookingId, userId) => {
    const key     = `${userId}_${bookingId}`
    const now     = new Date().toISOString()
    const updated = { ...readMapRef.current, [key]: now }
    localStorage.setItem(READ_KEY, JSON.stringify(updated))
    setReadMap(updated)
  }, [])

  const getMessages    = useCallback((bookingId) => chats[bookingId] || [], [chats])

  const getMsgStatus   = useCallback((msg, bookingId, otherUserId) => {
    const key      = `${otherUserId}_${bookingId}`
    const lastRead = readMapRef.current[key]
    if (!lastRead) return 'inviato'
    return lastRead >= msg.createdAt ? 'letto' : 'consegnato'
  }, [readMap])

  const getUnread = useCallback((bookingId, userId) => {
    const key      = `${userId}_${bookingId}`
    const lastRead = readMapRef.current[key]
    const msgs     = chats[bookingId] || []
    return msgs.filter(m => m.senderId !== userId && (!lastRead || m.createdAt > lastRead)).length
  }, [chats, readMap])

  const getTotalUnread = useCallback((bookingIds, userId) =>
    bookingIds.reduce((sum, bid) => sum + getUnread(bid, userId), 0),
  [getUnread])

  const getLastMessage = useCallback((bookingId) => {
    const msgs = chats[bookingId] || []
    return msgs.length ? msgs[msgs.length - 1] : null
  }, [chats])

  return (
    <ChatContext.Provider value={{ sendMessage, markAsRead, getMessages, getMsgStatus, getUnread, getTotalUnread, getLastMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
