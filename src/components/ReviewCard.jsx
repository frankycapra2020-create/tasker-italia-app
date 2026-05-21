import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'

const fmt = (str) =>
  new Date(str).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

export function StarsDisplay({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}
          fill={n <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({ review, onReply, canReply = false }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const initials = review.clienteNome
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  const submit = () => {
    if (!replyText.trim()) return
    onReply(review.id, replyText.trim())
    setReplyOpen(false)
    setReplyText('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-800">{review.clienteNome}</div>
            <div className="text-xs text-gray-400">{fmt(review.createdAt)}</div>
          </div>
        </div>
        <StarsDisplay value={review.stelle} />
      </div>

      {review.servizio && (
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
          {review.servizio}
        </div>
      )}

      {review.commento && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.commento}</p>
      )}

      {review.fotoUrl && (
        <img
          src={review.fotoUrl}
          alt="Foto intervento"
          className="mt-3 rounded-xl max-h-40 w-auto object-cover border border-gray-100"
        />
      )}

      {/* Risposta del tecnico */}
      {review.risposta && (
        <div className="mt-3 bg-blue-50 rounded-xl p-3 border-l-4 border-blue-300">
          <div className="text-xs font-semibold text-blue-700 mb-1">
            Risposta del tecnico · {fmt(review.rispostaData)}
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{review.risposta}</p>
        </div>
      )}

      {/* Form risposta */}
      {canReply && !review.risposta && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {!replyOpen ? (
            <button
              onClick={() => setReplyOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
            >
              <MessageCircle size={13} /> Rispondi alla recensione
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Scrivi una risposta professionale..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={submit}
                  disabled={!replyText.trim()}
                  className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
                >
                  Pubblica risposta
                </button>
                <button
                  onClick={() => { setReplyOpen(false); setReplyText('') }}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
