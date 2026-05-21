import { createContext, useContext, useState, useRef, useCallback } from 'react'

const ChatContext = createContext(null)
const CHATS_KEY = 'pt_chats'
const READ_KEY = 'pt_chat_read'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => load(CHATS_KEY, {}))
  const [readMap, setReadMap] = useState(() => load(READ_KEY, {}))

  const chatsRef = useRef(chats)
  chatsRef.current = chats
  const readMapRef = useRef(readMap)
  readMapRef.current = readMap

  const sendMessage = useCallback(({ bookingId, senderId, senderNome, text, type = 'text', fileUrl, fileName }) => {
    const msg = {
      id: `m${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      senderId,
      senderNome,
      text: text || null,
      type,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      createdAt: new Date().toISOString(),
    }
    const updated = { ...chatsRef.current, [bookingId]: [...(chatsRef.current[bookingId] || []), msg] }
    localStorage.setItem(CHATS_KEY, JSON.stringify(updated))
    setChats(updated)
    return msg
  }, [])

  const markAsRead = useCallback((bookingId, userId) => {
    const key = `${userId}_${bookingId}`
    const now = new Date().toISOString()
    const updated = { ...readMapRef.current, [key]: now }
    localStorage.setItem(READ_KEY, JSON.stringify(updated))
    setReadMap(updated)
  }, [])

  const getMessages = useCallback((bookingId) => chats[bookingId] || [], [chats])

  const getMsgStatus = useCallback((msg, bookingId, otherUserId) => {
    const key = `${otherUserId}_${bookingId}`
    const lastRead = readMap[key]
    if (!lastRead) return 'inviato'
    return lastRead >= msg.createdAt ? 'letto' : 'consegnato'
  }, [readMap])

  const getUnread = useCallback((bookingId, userId) => {
    const key = `${userId}_${bookingId}`
    const lastRead = readMap[key]
    const msgs = chats[bookingId] || []
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
