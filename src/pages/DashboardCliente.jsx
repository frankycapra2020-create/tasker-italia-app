import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useReview } from '../context/ReviewContext'
import { Search, FileText, Star, Clock, Shield, ArrowRight, Calendar, MapPin, Wrench, CheckCircle, XCircle, Image } from 'lucide-react'

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const formatDateIT = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}

const STATO_STYLE = {
  in_attesa:   { badge: 'bg-yellow-100 text-yellow-700', label: 'In attesa' },
  confermata:  { badge: 'bg-blue-100 text-blue-700',    label: 'Confermata' },
  completata:  { badge: 'bg-green-100 text-green-700',  label: 'Completata' },
  annullata:   { badge: 'bg-red-100 text-red-700',      label: 'Annullata' },
}

function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
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
            size={28}
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

export default function DashboardCliente() {
  const { user, logout } = useAuth()
  const { getByCliente, updateBooking } = useBooking()
  const { addReview, hasReviewed } = useReview()

  const [reviewOpenId, setReviewOpenId] = useState(null)
  const [reviewStelle, setReviewStelle] = useState(0)
  const [reviewCommento, setReviewCommento] = useState('')
  const [reviewFoto, setReviewFoto] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  const prenotazioni = getByCliente(user.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  const totali = prenotazioni.length
  const inAttesa = prenotazioni.filter(b => b.stato === 'in_attesa').length
  const confermate = prenotazioni.filter(b => b.stato === 'confermata').length
  const completate = prenotazioni.filter(b => b.stato === 'completata').length

  const annullaPrenotazione = (id) => {
    if (confirm('Vuoi annullare questa prenotazione?')) {
      updateBooking(id, { stato: 'annullata' })
    }
  }

  const openReview = (id) => {
    setReviewOpenId(id)
    setReviewStelle(0)
    setReviewCommento('')
    setReviewFoto(null)
  }

  const submitReview = async (booking) => {
    if (reviewStelle === 0) return
    setReviewLoading(true)
    let fotoUrl = null
    if (reviewFoto) fotoUrl = await compressImage(reviewFoto)
    addReview({
      bookingId: booking.id,
      clienteId: user.id,
      clienteNome: `${user.nome} ${user.cognome}`,
      tecnicoId: booking.tecnicoId,
      tecnicoNome: booking.tecnicoNome,
      servizio: booking.servizio,
      stelle: reviewStelle,
      commento: reviewCommento.trim(),
      fotoUrl,
    })
    setReviewOpenId(null)
    setReviewLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ciao, {user.nome}!</h1>
          <p className="text-gray-500 mt-0.5">Gestisci le tue prenotazioni e trova i migliori tecnici</p>
        </div>
        <div className="flex gap-3">
          <Link to="/preventivo" className="btn-accent text-sm py-2.5 px-5">
            + Nuova prenotazione
          </Link>
          <button onClick={logout} className="btn-secondary text-sm py-2.5 px-5">Esci</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <FileText size={20} className="text-blue-600" />, label: 'Totale prenotazioni', value: totali, bg: 'bg-blue-50' },
          { icon: <Clock size={20} className="text-yellow-500" />, label: 'In attesa', value: inAttesa, bg: 'bg-yellow-50' },
          { icon: <CheckCircle size={20} className="text-blue-500" />, label: 'Confermate', value: confermate, bg: 'bg-blue-50' },
          { icon: <Star size={20} className="text-green-600" />, label: 'Completate', value: completate, bg: 'bg-green-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista prenotazioni */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">Le mie prenotazioni</h2>
              <Link to="/preventivo" className="text-sm text-blue-700 font-semibold hover:underline flex items-center gap-1">
                Nuova <ArrowRight size={14} />
              </Link>
            </div>

            {prenotazioni.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">Nessuna prenotazione ancora</p>
                <p className="text-gray-400 text-sm mb-5">Prenota il tuo primo intervento in pochi minuti</p>
                <Link to="/preventivo" className="btn-accent text-sm py-2.5 px-6">
                  Prenota ora
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {prenotazioni.map(b => {
                  const stato = STATO_STYLE[b.stato] ?? { badge: 'bg-gray-100 text-gray-600', label: b.stato }
                  const cancellabile = b.stato === 'in_attesa'
                  const puoRecensire = b.stato === 'completata' && !hasReviewed(b.id)
                  const haRecensito = b.stato === 'completata' && hasReviewed(b.id)
                  const reviewAperta = reviewOpenId === b.id
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
                        <div className="text-right shrink-0">
                          <div className="font-bold text-gray-800 text-sm">€ {b.totaleStimato}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{b.oreStimate}h · {b.id}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      {(cancellabile || puoRecensire || haRecensito) && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap">
                          {cancellabile && (
                            <button
                              onClick={() => annullaPrenotazione(b.id)}
                              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                              <XCircle size={13} /> Annulla prenotazione
                            </button>
                          )}
                          {puoRecensire && !reviewAperta && (
                            <button
                              onClick={() => openReview(b.id)}
                              className="flex items-center gap-1.5 text-xs text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
                            >
                              <Star size={13} fill="currentColor" /> Lascia una recensione
                            </button>
                          )}
                          {haRecensito && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle size={13} /> Recensione inviata
                            </span>
                          )}
                        </div>
                      )}

                      {/* Form recensione inline */}
                      {reviewAperta && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                          <p className="text-sm font-semibold text-gray-800">Valuta il lavoro di {b.tecnicoNome}</p>
                          <div>
                            <StarSelector value={reviewStelle} onChange={setReviewStelle} />
                            {reviewStelle > 0 && (
                              <span className="text-xs text-gray-500 mt-1 block">
                                {['', 'Pessimo', 'Scarso', 'Discreto', 'Buono', 'Eccellente'][reviewStelle]}
                              </span>
                            )}
                          </div>
                          <textarea
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                            value={reviewCommento}
                            onChange={e => setReviewCommento(e.target.value)}
                            placeholder="Descrivi la tua esperienza (opzionale)..."
                          />
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer w-fit">
                            <Image size={14} />
                            <span>Aggiungi foto (opzionale)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => setReviewFoto(e.target.files[0] ?? null)}
                            />
                          </label>
                          {reviewFoto && (
                            <p className="text-xs text-green-600">{reviewFoto.name}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitReview(b)}
                              disabled={reviewStelle === 0 || reviewLoading}
                              className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
                            >
                              {reviewLoading ? 'Invio...' : 'Pubblica recensione'}
                            </button>
                            <button
                              onClick={() => setReviewOpenId(null)}
                              className="btn-secondary text-xs py-2 px-4"
                            >
                              Annulla
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
                  <div className="text-xs text-gray-500">Calendari e preventivo immediato</div>
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
