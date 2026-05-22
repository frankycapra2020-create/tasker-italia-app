import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useReview } from '../context/ReviewContext'
import { useChat } from '../context/ChatContext'
import { useFavorites } from '../context/FavoritesContext'
import { useTechnicians } from '../context/TechniciansContext'
import { useNotifiche } from '../hooks/useNotifiche'
import ChatWindow from '../components/ChatWindow'
import {
  Search, FileText, Star, Clock, Shield, ArrowRight, Calendar, MapPin,
  Wrench, CheckCircle, XCircle, Image, MessageSquare, Bell, AlertCircle,
  Archive, Heart, RotateCcw, Download, RefreshCw, ChevronRight,
} from 'lucide-react'

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const MESI_FULL = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

const formatDateIT = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}

const formatDateFull = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI_FULL[parseInt(m) - 1]} ${y}`
}

function formatMsgTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString())
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getDate()} ${MESI[d.getMonth()]}`
}

const STATO_STYLE = {
  in_attesa:  { badge: 'bg-yellow-100 text-yellow-700', label: 'In attesa' },
  confermata: { badge: 'bg-blue-100 text-blue-700',    label: 'Confermata' },
  completata: { badge: 'bg-green-100 text-green-700',  label: 'Completata' },
  annullata:  { badge: 'bg-red-100 text-red-700',      label: 'Annullata' },
  archiviato: { badge: 'bg-gray-100 text-gray-500',    label: 'Archiviato' },
}

const LABEL_STELLE = ['', 'Pessimo', 'Scarso', 'Discreto', 'Buono', 'Eccellente']

function StarSelector({ value, onChange, size = 32 }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={n <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'}
            fill={n <= (hover || value) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

const compressImage = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 400
      let w = img.width, h = img.height
      if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX }
      else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
})

function ModalRecensione({ booking, stelle, setStelle, commento, setCommento, foto, setFoto, onSubmit, loading }) {
  const valid = stelle > 0 && commento.trim().length >= 20
  const mancano = Math.max(0, 20 - commento.trim().length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-3xl px-8 pt-8 pb-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-xl p-2">
              <Star size={22} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold">Com'è andato il lavoro?</h2>
          </div>
          <p className="text-orange-100 text-sm leading-relaxed">
            Lascia la tua valutazione per <span className="font-semibold text-white">{booking.tecnicoNome}</span>
            {booking.servizio && <> · <span className="italic">{booking.servizio}</span></>}
          </p>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Valutazione <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarSelector value={stelle} onChange={setStelle} size={36} />
              {stelle > 0 && (
                <span className="text-orange-600 font-semibold text-sm">{LABEL_STELLE[stelle]}</span>
              )}
            </div>
            {stelle === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">Tocca le stelle per valutare</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Commento <span className="text-red-400">*</span>
              <span className="font-normal text-gray-400 ml-1">(minimo 20 caratteri)</span>
            </label>
            <textarea
              value={commento}
              onChange={e => setCommento(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Descrivi com'è andato il lavoro: puntualità, qualità, professionalità..."
            />
            <div className="flex items-center justify-between mt-1.5">
              {mancano > 0 ? (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={11} /> Ancora {mancano} caratteri
                </span>
              ) : (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={11} /> Commento valido
                </span>
              )}
              <span className="text-xs text-gray-400">{commento.length}/500</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer w-fit hover:text-gray-700 transition">
              <div className="bg-gray-100 hover:bg-gray-200 rounded-lg p-1.5 transition">
                <Image size={14} />
              </div>
              <span>{foto ? <span className="text-green-600 font-medium">{foto.name}</span> : 'Aggiungi foto (opzionale)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setFoto(e.target.files[0] ?? null)}
              />
            </label>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed">
              La recensione è <strong>obbligatoria</strong> per archiviare il lavoro completato.
              Non è possibile saltare questo passaggio.
            </p>
          </div>

          <button
            onClick={onSubmit}
            disabled={!valid || loading}
            className="btn-accent w-full py-3.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Invio in corso…' : 'Invia recensione'}
          </button>

          {!valid && (
            <p className="text-xs text-center text-gray-400">
              {stelle === 0 && 'Seleziona prima una valutazione'}
              {stelle > 0 && mancano > 0 && `Aggiungi ancora ${mancano} caratteri al commento`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function scaricaRicevuta(booking) {
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Ricevuta #${booking.id}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1a1a2e; }
  .header { background: #1a237e; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 24px; }
  .header p { margin: 4px 0 0; opacity: 0.8; font-size: 14px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .row:last-child { border-bottom: none; }
  .label { color: #666; }
  .value { font-weight: 600; }
  .total-row { font-size: 16px; margin-top: 8px; padding-top: 12px; border-top: 2px solid #1a237e; }
  .total-row .value { color: #f57c00; font-size: 20px; }
  .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
  .footer { text-align: center; color: #999; font-size: 12px; margin-top: 32px; }
</style>
</head>
<body>
<div class="header">
  <h1>ProntoTecnico</h1>
  <p>Ricevuta intervento · ${new Date().toLocaleDateString('it-IT')}</p>
</div>
<div class="row"><span class="label">N° prenotazione</span><span class="value">${booking.id}</span></div>
<div class="row"><span class="label">Servizio</span><span class="value">${booking.servizio || '—'}</span></div>
<div class="row"><span class="label">Tecnico</span><span class="value">${booking.tecnicoNome || '—'}</span></div>
<div class="row"><span class="label">Data intervento</span><span class="value">${formatDateFull(booking.dataIntervento)} alle ${booking.oraIntervento || '—'}</span></div>
<div class="row"><span class="label">Indirizzo</span><span class="value">${booking.indirizzo || '—'}, ${booking.citta || ''}</span></div>
<div class="row"><span class="label">Ore lavorate</span><span class="value">${booking.oreStimate || '—'} ore</span></div>
<div class="row total-row"><span class="label">Totale pagato</span><span class="value">€ ${booking.totaleStimato}</span></div>
<div><span class="badge">✓ Lavoro completato</span></div>
<div class="footer">ProntoTecnico · Tutti i diritti riservati · Garanzia lavoro 12 mesi</div>
</body>
</html>`
  const w = window.open('', '_blank', 'width=700,height=800')
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

const TABS = [
  { id: 'prenotazioni', label: 'Prenotazioni', icon: <FileText size={15} /> },
  { id: 'preferiti',   label: 'Tecnici preferiti', icon: <Heart size={15} /> },
  { id: 'storico',     label: 'Storico lavori', icon: <Archive size={15} /> },
]

export default function DashboardCliente() {
  const { user, logout } = useAuth()
  const { getByCliente, updateBooking } = useBooking()
  const { addReview, hasReviewed } = useReview()
  const { getUnread, getLastMessage, getTotalUnread } = useChat()
  const { getFavoriteIds, toggleFavorite, isFavorite } = useFavorites()
  const { allTecnici } = useTechnicians()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('prenotazioni')

  const prenotazioni = getByCliente(user.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  const [reviewModalBooking, setReviewModalBooking] = useState(() => {
    const pending = prenotazioni.filter(b => b.stato === 'completata' && !hasReviewed(b.id))
    return pending[0] || null
  })
  const [reviewStelle, setReviewStelle]     = useState(0)
  const [reviewCommento, setReviewCommento] = useState('')
  const [reviewFoto, setReviewFoto]         = useState(null)
  const [reviewLoading, setReviewLoading]   = useState(false)
  const [chatBookingId, setChatBookingId]   = useState(null)

  const chatBookings = prenotazioni.filter(b => b.confermatoDa)
  const totalUnread = getTotalUnread(chatBookings.map(b => b.id), user.id)
  const { permission: notifPerm, requestPermission, supported: notifSupported } = useNotifiche(user, chatBookings, chatBookingId)

  const pendingReviews = prenotazioni.filter(b => b.stato === 'completata' && !hasReviewed(b.id))

  // Promemoria: prenotazioni confermate domani
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  const appuntamentiDomani = prenotazioni.filter(
    b => b.stato === 'confermata' && b.dataIntervento === tomorrowISO
  )

  const openReviewModal = (booking) => {
    setReviewModalBooking(booking)
    setReviewStelle(0)
    setReviewCommento('')
    setReviewFoto(null)
  }

  const submitReview = async () => {
    if (reviewStelle === 0 || reviewCommento.trim().length < 20) return
    setReviewLoading(true)
    let fotoUrl = null
    if (reviewFoto) fotoUrl = await compressImage(reviewFoto)
    addReview({
      bookingId:    reviewModalBooking.id,
      clienteId:    user.id,
      clienteNome:  `${user.nome} ${user.cognome}`,
      tecnicoId:    reviewModalBooking.tecnicoId,
      tecnicoNome:  reviewModalBooking.tecnicoNome,
      servizio:     reviewModalBooking.servizio,
      stelle:       reviewStelle,
      commento:     reviewCommento.trim(),
      fotoUrl,
    })
    updateBooking(reviewModalBooking.id, { stato: 'archiviato' })
    setReviewModalBooking(null)
    setReviewStelle(0)
    setReviewCommento('')
    setReviewFoto(null)
    setReviewLoading(false)
  }

  const annullaPrenotazione = (id) => {
    if (confirm('Vuoi annullare questa prenotazione?'))
      updateBooking(id, { stato: 'annullata' })
  }

  const riprenota = (booking) => {
    navigate('/preventivo', {
      state: {
        riprenota: {
          categoriaId: booking.categoria,
          servizio: booking.servizio,
          tecnicoId: booking.tecnicoId,
          oreStimate: booking.oreStimate,
        }
      }
    })
  }

  const chatBooking = chatBookingId ? prenotazioni.find(b => b.id === chatBookingId) : null

  const sortedChatBookings = [...chatBookings].sort((a, b) => {
    const la = getLastMessage(a.id)?.createdAt || a.createdAt
    const lb = getLastMessage(b.id)?.createdAt || b.createdAt
    return new Date(lb) - new Date(la)
  })

  // Stats
  const totali     = prenotazioni.length
  const inAttesa   = prenotazioni.filter(b => b.stato === 'in_attesa').length
  const confermate = prenotazioni.filter(b => b.stato === 'confermata').length
  const completate = prenotazioni.filter(b => b.stato === 'completata' || b.stato === 'archiviato').length

  // Tecnici preferiti
  const favoriteIds = getFavoriteIds(user.id)
  const tecniciFavoriti = allTecnici.filter(t => favoriteIds.includes(t.id))

  // Storico: prenotazioni completate/archiviate/annullate
  const storicoBookings = prenotazioni.filter(
    b => b.stato === 'completata' || b.stato === 'archiviato' || b.stato === 'annullata'
  )

  // Prenotazioni attive
  const prenotazioniAttive = prenotazioni.filter(
    b => b.stato === 'in_attesa' || b.stato === 'confermata'
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Modal recensione obbligatoria */}
      {reviewModalBooking && (
        <ModalRecensione
          booking={reviewModalBooking}
          stelle={reviewStelle}
          setStelle={setReviewStelle}
          commento={reviewCommento}
          setCommento={setReviewCommento}
          foto={reviewFoto}
          setFoto={setReviewFoto}
          onSubmit={submitReview}
          loading={reviewLoading}
        />
      )}

      {/* Chat window overlay */}
      {chatBooking && (
        <ChatWindow booking={chatBooking} currentUser={user} onClose={() => setChatBookingId(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ciao, {user.nome}!</h1>
          <p className="text-gray-500 mt-0.5">Gestisci le tue prenotazioni e trova i migliori tecnici</p>
        </div>
        <div className="flex gap-3">
          <Link to="/preventivo" className="btn-accent text-sm py-2.5 px-5">+ Nuova prenotazione</Link>
          <button onClick={logout} className="btn-secondary text-sm py-2.5 px-5">Esci</button>
        </div>
      </div>

      {/* Promemoria appuntamento domani */}
      {appuntamentiDomani.map(b => (
        <div key={b.id} className="w-full bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-5 mb-4 flex items-center gap-4 shadow-lg">
          <div className="bg-white/20 rounded-xl p-3 shrink-0">
            <Bell size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm">
              Promemoria: domani hai un appuntamento!
            </h3>
            <p className="text-blue-100 text-xs mt-0.5">
              Con <strong className="text-white">{b.tecnicoNome}</strong> alle <strong className="text-white">{b.oraIntervento}</strong> · {b.servizio}
            </p>
          </div>
          <span className="shrink-0 bg-white text-blue-700 font-bold text-xs px-3 py-2 rounded-xl shadow">
            {formatDateIT(b.dataIntervento)}
          </span>
        </div>
      ))}

      {/* Banner lavori da recensire */}
      {pendingReviews.length > 0 && (
        <button
          onClick={() => openReviewModal(pendingReviews[0])}
          className="w-full text-left cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl p-5 mb-8 flex items-center gap-4 transition shadow-lg"
        >
          <div className="bg-white/20 rounded-xl p-3 shrink-0">
            <Star size={22} className="text-white" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm">
              {pendingReviews.length === 1
                ? 'Hai 1 lavoro completato senza recensione!'
                : `Hai ${pendingReviews.length} lavori completati senza recensione!`}
            </h3>
            <p className="text-orange-100 text-xs mt-0.5 truncate">
              Lascia la tua valutazione per {pendingReviews[0].tecnicoNome} — ci vogliono solo 30 secondi
            </p>
          </div>
          <span className="shrink-0 bg-white text-orange-600 font-bold text-xs px-3 py-2 rounded-xl shadow">
            Recensisci ora →
          </span>
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <FileText size={20} className="text-blue-600" />,     label: 'Totale prenotazioni', value: totali,     bg: 'bg-blue-50' },
          { icon: <Clock size={20} className="text-yellow-500" />,      label: 'In attesa',           value: inAttesa,   bg: 'bg-yellow-50' },
          { icon: <CheckCircle size={20} className="text-blue-500" />,  label: 'Confermate',          value: confermate, bg: 'bg-blue-50' },
          { icon: <Star size={20} className="text-green-600" fill="currentColor" />, label: 'Completate', value: completate, bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'preferiti' && favoriteIds.length > 0 && (
              <span className="badge bg-red-100 text-red-600 text-xs">{favoriteIds.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Contenuto tab principale */}
        <div className="lg:col-span-2">

          {/* TAB: PRENOTAZIONI */}
          {activeTab === 'prenotazioni' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg">Le mie prenotazioni</h2>
                <Link to="/preventivo" className="text-sm text-blue-700 font-semibold hover:underline flex items-center gap-1">
                  Nuova <ArrowRight size={14} />
                </Link>
              </div>

              {prenotazioniAttive.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">Nessuna prenotazione attiva</p>
                  <p className="text-gray-400 text-sm mb-5">Prenota il tuo primo intervento in pochi minuti</p>
                  <Link to="/preventivo" className="btn-accent text-sm py-2.5 px-6">Prenota ora</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {prenotazioniAttive.map(b => {
                    const stato = STATO_STYLE[b.stato] ?? { badge: 'bg-gray-100 text-gray-600', label: b.stato }
                    const cancellabile = b.stato === 'in_attesa'
                    const canChat = !!b.confermatoDa
                    const unread = canChat ? getUnread(b.id, user.id) : 0

                    return (
                      <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800 text-sm">{b.servizio}</span>
                              <span className={`badge text-xs ${stato.badge}`}>{stato.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold ${b.tecnicoAvatarColor}`}>
                                  {b.tecnicoAvatar?.[0]}
                                </div>
                                {b.tecnicoNome}
                              </span>
                              <span className="flex items-center gap-1"><Calendar size={11} />{formatDateIT(b.dataIntervento)} ore {b.oraIntervento}</span>
                              <span className="flex items-center gap-1"><MapPin size={11} />{b.indirizzo}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <div className="font-bold text-gray-800 text-sm">€ {b.totaleStimato}</div>
                            <div className="text-xs text-gray-400">{b.oreStimate}h</div>
                            {canChat && (
                              <button
                                onClick={() => setChatBookingId(b.id)}
                                className="relative flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium transition mt-0.5"
                                title="Apri chat"
                              >
                                <MessageSquare size={14} />
                                Chat
                                {unread > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {unread > 9 ? '9+' : unread}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {cancellabile && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => annullaPrenotazione(b.id)}
                              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                              <XCircle size={13} /> Annulla prenotazione
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: TECNICI PREFERITI */}
          {activeTab === 'preferiti' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Heart size={18} className="text-red-500" fill="currentColor" />
                  I miei tecnici preferiti
                </h2>
                <Link to="/tecnici" className="text-sm text-blue-700 font-semibold hover:underline">
                  Esplora tecnici
                </Link>
              </div>

              {tecniciFavoriti.length === 0 ? (
                <div className="text-center py-16">
                  <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">Nessun tecnico nei preferiti</p>
                  <p className="text-gray-400 text-sm mb-5">Clicca il cuore ❤️ su un tecnico per aggiungerlo qui</p>
                  <Link to="/tecnici" className="btn-primary text-sm py-2.5 px-6">Sfoglia tecnici</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tecniciFavoriti.map(t => {
                    const lastBookingWithTech = prenotazioni.find(b => b.tecnicoId === t.id || b.tecnicoNome === t.name)
                    return (
                      <div key={t.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                        {t.foto
                          ? <img src={t.foto} alt={t.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          : <div className={`${t.avatarColor} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                              {t.avatar}
                            </div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{t.specializations?.join(', ')} · {t.location}</div>
                          <div className="text-xs text-gray-400 mt-0.5">€{t.pricePerHour}/ora · {t.completedJobs} lavori</div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Link
                            to={`/tecnici/${t.id}`}
                            className="text-xs text-blue-700 font-semibold hover:underline text-right"
                          >
                            Profilo
                          </Link>
                          {lastBookingWithTech && (
                            <button
                              onClick={() => riprenota(lastBookingWithTech)}
                              className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 px-3 rounded-lg transition"
                            >
                              <RefreshCw size={11} /> Riprenota
                            </button>
                          )}
                          <button
                            onClick={() => toggleFavorite(user.id, t.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                          >
                            <Heart size={12} fill="currentColor" className="text-red-400" /> Rimuovi
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: STORICO LAVORI */}
          {activeTab === 'storico' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Archive size={18} className="text-gray-600" />
                  Storico lavori
                </h2>
                <span className="text-xs text-gray-400">{storicoBookings.length} interventi</span>
              </div>

              {storicoBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Archive size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">Nessun intervento completato</p>
                  <p className="text-gray-400 text-sm">Gli interventi completati appariranno qui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storicoBookings.map(b => {
                    const stato = STATO_STYLE[b.stato] ?? { badge: 'bg-gray-100 text-gray-600', label: b.stato }
                    const haRecensito = b.stato === 'archiviato'
                    const puoRecensire = b.stato === 'completata' && !hasReviewed(b.id)
                    const completato = b.stato === 'completata' || b.stato === 'archiviato'

                    return (
                      <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800 text-sm">{b.servizio}</span>
                              <span className={`badge text-xs ${stato.badge}`}>{stato.label}</span>
                              {puoRecensire && (
                                <span className="badge bg-orange-100 text-orange-700 text-xs animate-pulse">
                                  ★ Recensione richiesta
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold ${b.tecnicoAvatarColor}`}>
                                  {b.tecnicoAvatar?.[0]}
                                </div>
                                {b.tecnicoNome}
                              </span>
                              <span className="flex items-center gap-1"><Calendar size={11} />{formatDateIT(b.dataIntervento)}</span>
                              <span className="flex items-center gap-1"><MapPin size={11} />{b.indirizzo}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <div className="font-bold text-gray-800 text-sm">€ {b.totaleStimato}</div>
                            <div className="text-xs text-gray-400">{b.oreStimate}h · {b.id}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap items-center">
                          {puoRecensire && (
                            <button
                              onClick={() => openReviewModal(b)}
                              className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 px-3 rounded-lg transition"
                            >
                              <Star size={12} fill="currentColor" /> Lascia la recensione
                            </button>
                          )}
                          {haRecensito && (
                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <CheckCircle size={13} /> Recensione inviata
                            </span>
                          )}
                          {completato && (
                            <>
                              <button
                                onClick={() => riprenota(b)}
                                className="flex items-center gap-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-lg transition"
                              >
                                <RefreshCw size={11} /> Riprenota
                              </button>
                              <button
                                onClick={() => scaricaRicevuta(b)}
                                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 font-medium py-1.5 px-3 rounded-lg transition"
                              >
                                <Download size={11} /> Scarica ricevuta
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Messaggi recenti */}
          {sortedChatBookings.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-700" />
                  Messaggi
                  {totalUnread > 0 && (
                    <span className="badge bg-red-500 text-white text-xs min-w-[20px] text-center">{totalUnread}</span>
                  )}
                </h2>
              </div>
              <div className="space-y-1">
                {sortedChatBookings.slice(0, 5).map(b => {
                  const last = getLastMessage(b.id)
                  const unread = getUnread(b.id, user.id)
                  const avatarLetter = (b.tecnicoNome || '?')[0].toUpperCase()
                  return (
                    <button
                      key={b.id}
                      onClick={() => setChatBookingId(b.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm shrink-0">
                        {avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {b.tecnicoNome}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">{last ? formatMsgTime(last.createdAt) : ''}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                            {last
                              ? (last.type === 'image' ? '📷 Foto' : last.type === 'file' ? `📎 ${last.fileName || 'File'}` : last.text)
                              : b.servizio
                            }
                          </p>
                          {unread > 0 && (
                            <span className="shrink-0 w-5 h-5 bg-blue-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notifiche push */}
          {notifSupported && notifPerm === 'default' && (
            <div className="card p-4 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-xl shrink-0">
                  <Bell size={16} className="text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">Abilita notifiche</h3>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">Ricevi avvisi sui nuovi messaggi anche con la scheda in background</p>
                  <button
                    onClick={requestPermission}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white py-1.5 px-3 rounded-lg transition"
                  >
                    <Bell size={12} /> Abilita ora
                  </button>
                </div>
              </div>
            </div>
          )}
          {notifSupported && notifPerm === 'granted' && (
            <div className="flex items-center gap-2 px-1 text-xs text-green-600 font-medium">
              <CheckCircle size={13} /> Notifiche messaggi attive
            </div>
          )}

          {/* Azioni rapide */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Azioni rapide</h2>
            <div className="space-y-3">
              <Link to="/tecnici" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-blue-100 p-2.5 rounded-lg"><Search size={18} className="text-blue-700" /></div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition">Trova un tecnico</div>
                  <div className="text-xs text-gray-500">Cerca per zona o specializzazione</div>
                </div>
              </Link>
              <Link to="/preventivo" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-orange-100 p-2.5 rounded-lg"><Wrench size={18} className="text-orange-600" /></div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-orange-600 transition">Prenota intervento</div>
                  <div className="text-xs text-gray-500">Calendario e preventivo immediato</div>
                </div>
              </Link>
              <Link to="/tutorial" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-green-100 p-2.5 rounded-lg"><Shield size={18} className="text-green-700" /></div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-green-700 transition">Tutorial sicurezza</div>
                  <div className="text-xs text-gray-500">Guide video gratuite</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <h3 className="font-bold mb-2">Emergenza?</h3>
            <p className="text-blue-100 text-sm mb-4">Tecnico disponibile entro 2 ore, 7 giorni su 7.</p>
            <Link to="/preventivo" className="btn-accent text-sm py-2.5 w-full text-center block">
              Intervento urgente
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
