import { useEffect, useRef, useState } from 'react'
import { useChat } from '../context/ChatContext'

const supported = typeof window !== 'undefined' && 'Notification' in window

export function useNotifiche(currentUser, bookings, activeChatBookingId = null) {
  const { getMessages } = useChat()
  const prevRef = useRef({})
  const [permission, setPermission] = useState(
    supported ? Notification.permission : 'denied'
  )

  const requestPermission = async () => {
    if (!supported) return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  // Runs after every render — ref guard prevents duplicate notifications
  useEffect(() => {
    if (!currentUser || !bookings.length) return

    bookings.forEach(booking => {
      const msgs = getMessages(booking.id)
      const prev = prevRef.current[booking.id]

      if (prev === undefined) {
        // First render for this booking: record count, don't notify
        prevRef.current[booking.id] = msgs.length
        return
      }

      if (msgs.length > prev) {
        const newMsgs = msgs.slice(prev).filter(m => m.senderId !== currentUser.id)

        if (newMsgs.length > 0 && booking.id !== activeChatBookingId && permission === 'granted') {
          const last = newMsgs[newMsgs.length - 1]
          const title = `ProntoTecnico — ${last.senderNome}`
          const body =
            last.type === 'image' ? '📷 Ha inviato una foto'
            : last.type === 'file' ? `📎 ${last.fileName || 'Documento'}`
            : last.text || 'Nuovo messaggio'

          try {
            const notif = new Notification(title, {
              body,
              icon: '/favicon.ico',
              tag: `pt-chat-${booking.id}`,
              renotify: true,
            })
            notif.onclick = () => { window.focus(); notif.close() }
          } catch {}
        }

        prevRef.current[booking.id] = msgs.length
      }
    })
  })

  return { permission, requestPermission, supported }
}
