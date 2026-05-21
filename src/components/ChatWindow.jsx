import { useState, useEffect, useRef } from 'react'
import { X, Send, Paperclip, Lock, Check, FileText, Download, ImageIcon } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

function formatTime(iso) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatDateLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Oggi'
  if (d.toDateString() === yesterday.toDateString()) return 'Ieri'
  return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`
}

function StatusTicks({ status }) {
  if (status === 'inviato') {
    return <Check size={11} className="text-blue-300 inline ml-0.5 shrink-0" />
  }
  if (status === 'consegnato') {
    return (
      <span className="inline-flex items-center ml-0.5 shrink-0">
        <Check size={11} className="text-blue-300 -mr-[5px]" />
        <Check size={11} className="text-blue-300" />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center ml-0.5 shrink-0">
      <Check size={11} className="text-white -mr-[5px]" />
      <Check size={11} className="text-white" />
    </span>
  )
}

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 640
      let w = img.width, h = img.height
      if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX }
      else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.65))
    }
    img.onerror = reject
    img.src = e.target.result
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const STATO_LABEL = {
  in_attesa: 'In attesa',
  confermata: 'Confermata',
  completata: 'Completata',
  annullata: 'Annullata',
}

const STATO_BADGE = {
  in_attesa: 'bg-yellow-500/30 text-yellow-100',
  confermata: 'bg-blue-400/30 text-blue-100',
  completata: 'bg-green-500/30 text-green-100',
  annullata: 'bg-red-500/30 text-red-200',
}

export default function ChatWindow({ booking, currentUser, onClose }) {
  const { sendMessage, markAsRead, getMessages, getMsgStatus } = useChat()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [fileError, setFileError] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const isCliente = currentUser.ruolo === 'cliente'
  const otherUserId = isCliente ? booking.confermatoDa : booking.clienteId
  const otherNome = isCliente ? booking.tecnicoNome : booking.clienteNome
  const isBlocked = booking.stato === 'annullata'

  const messages = getMessages(booking.id)

  useEffect(() => {
    markAsRead(booking.id, currentUser.id)
  }, [messages.length, booking.id, currentUser.id, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (!isBlocked) textareaRef.current?.focus()
  }, [isBlocked])

  // Group messages by day
  const grouped = []
  let lastDate = null
  messages.forEach(msg => {
    const label = formatDateLabel(msg.createdAt)
    if (label !== lastDate) {
      grouped.push({ type: 'sep', label, key: `sep-${label}` })
      lastDate = label
    }
    grouped.push({ type: 'msg', msg, key: msg.id })
  })

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isBlocked || sending) return
    sendMessage({
      bookingId: booking.id,
      senderId: currentUser.id,
      senderNome: `${currentUser.nome} ${currentUser.cognome}`,
      text: trimmed,
      type: 'text',
    })
    setText('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')
    const isImage = file.type.startsWith('image/')

    if (isImage) {
      if (file.size > 10 * 1024 * 1024) { setFileError('Immagine troppo grande (max 10 MB)'); return }
      setSending(true)
      try {
        const dataUrl = await compressImage(file)
        sendMessage({
          bookingId: booking.id,
          senderId: currentUser.id,
          senderNome: `${currentUser.nome} ${currentUser.cognome}`,
          type: 'image',
          fileUrl: dataUrl,
          fileName: file.name,
        })
      } catch { setFileError("Errore nell'elaborazione dell'immagine") }
      setSending(false)
    } else {
      if (file.size > 500 * 1024) { setFileError('Documento troppo grande (max 500 KB)'); return }
      setSending(true)
      const reader = new FileReader()
      reader.onload = (ev) => {
        sendMessage({
          bookingId: booking.id,
          senderId: currentUser.id,
          senderNome: `${currentUser.nome} ${currentUser.cognome}`,
          type: 'file',
          fileUrl: ev.target.result,
          fileName: file.name,
        })
        setSending(false)
      }
      reader.onerror = () => { setFileError('Errore nella lettura del file'); setSending(false) }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const avatarLetter = (otherNome || '?')[0].toUpperCase()

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[420px] h-[92vh] sm:h-[84vh] sm:mr-6 sm:mb-6 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{otherNome || 'Utente'}</div>
            <div className="text-blue-200 text-xs truncate">{booking.servizio} · {booking.id}</div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATO_BADGE[booking.stato] || 'bg-white/20 text-white'}`}>
            {STATO_LABEL[booking.stato] || booking.stato}
          </span>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition p-1 shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
          style={{ background: 'linear-gradient(180deg, #e8edf2 0%, #eff3f8 100%)' }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-8">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">💬</div>
              <p className="text-gray-500 text-sm font-medium">Nessun messaggio</p>
              <p className="text-gray-400 text-xs">Inizia la conversazione con {otherNome || 'la controparte'}</p>
            </div>
          )}

          {grouped.map(item => {
            if (item.type === 'sep') {
              return (
                <div key={item.key} className="flex justify-center py-2">
                  <span className="bg-white/80 text-gray-400 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                    {item.label}
                  </span>
                </div>
              )
            }

            const { msg } = item
            const isMine = msg.senderId === currentUser.id
            const status = isMine ? getMsgStatus(msg, booking.id, otherUserId) : null

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {msg.type === 'image' && msg.fileUrl ? (
                    <div className={`rounded-2xl overflow-hidden shadow-sm ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || 'Immagine'}
                          className="max-w-[220px] max-h-[200px] object-cover block"
                        />
                      </a>
                      <div className={`px-2 py-1.5 flex items-center justify-end gap-1 ${isMine ? 'bg-blue-700' : 'bg-white'}`}>
                        <ImageIcon size={10} className={isMine ? 'text-blue-200' : 'text-gray-300'} />
                        <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                        {isMine && <StatusTicks status={status} />}
                      </div>
                    </div>

                  ) : msg.type === 'file' && msg.fileUrl ? (
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl shadow-sm max-w-[220px] ${isMine ? 'bg-blue-700 rounded-br-sm' : 'bg-white rounded-bl-sm'}`}>
                      <div className={`p-2 rounded-xl shrink-0 ${isMine ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <FileText size={18} className={isMine ? 'text-white' : 'text-blue-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isMine ? 'text-white' : 'text-gray-800'}`}>
                          {msg.fileName || 'Documento'}
                        </p>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName || 'documento'}
                          className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${isMine ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                        >
                          <Download size={9} /> Scarica
                        </a>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                        {isMine && <StatusTicks status={status} />}
                      </div>
                    </div>

                  ) : (
                    <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${isMine ? 'bg-blue-700 rounded-br-sm' : 'bg-white rounded-bl-sm'}`}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isMine ? 'text-white' : 'text-gray-800'}`}>
                        {msg.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                        {isMine && <StatusTicks status={status} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Blocked notice */}
        {isBlocked && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center gap-2 shrink-0">
            <Lock size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">Chat disabilitata — prenotazione annullata</p>
          </div>
        )}

        {/* Input */}
        {!isBlocked && (
          <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
            {fileError && <p className="text-xs text-red-500 mb-1.5 px-1">{fileError}</p>}
            {sending && <p className="text-xs text-blue-500 mb-1.5 px-1">Caricamento in corso...</p>}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => { setFileError(''); fileInputRef.current?.click() }}
                className="p-2.5 text-gray-400 hover:text-blue-700 transition shrink-0 rounded-xl hover:bg-blue-50"
                title="Allega foto o documento"
              >
                <Paperclip size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFile}
              />
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrivi un messaggio..."
                rows={1}
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                style={{ minHeight: '42px', maxHeight: '96px' }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-full transition shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
