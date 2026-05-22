import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Clock, Briefcase, CheckCircle, Award, ChevronLeft, Euro, AlertCircle, Heart, Image, X } from 'lucide-react'
import { useTechnicians } from '../context/TechniciansContext'
import { useReview } from '../context/ReviewContext'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import ReviewCard, { StarsDisplay } from '../components/ReviewCard'

function getBadges(tech, avgRating, reviewCount) {
  const rating = avgRating ?? tech.rating
  const count = reviewCount > 0 ? reviewCount : tech.reviews
  const out = []
  if (tech.certified)
    out.push({ label: 'Verificato', cls: 'bg-blue-100 text-blue-700', icon: '✓' })
  if (tech.certified)
    out.push({ label: 'Lavoro Garantito', cls: 'bg-green-100 text-green-700', icon: '✓' })
  if (rating >= 4.8 && count >= 5)
    out.push({ label: 'Top Rated', cls: 'bg-amber-100 text-amber-700', icon: '⭐' })
  if (tech.responseTime?.match(/< [12] /))
    out.push({ label: 'Risposta Rapida', cls: 'bg-green-100 text-green-700', icon: '⚡' })
  return out
}

function PortfolioGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null)
  if (!photos || photos.length === 0) return null
  return (
    <div className="card p-5">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Image size={15} className="text-orange-500" /> Portfolio lavori
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="relative group rounded-xl overflow-hidden aspect-square"
          >
            <img src={p.dataUrl} alt={p.didascalia || `Foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            {p.didascalia && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium line-clamp-2">{p.didascalia}</p>
              </div>
            )}
          </button>
        ))}
      </div>
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightbox].dataUrl}
              alt={photos[lightbox].didascalia || `Foto ${lightbox + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {photos[lightbox].didascalia && (
              <p className="text-white text-center mt-3 font-medium">{photos[lightbox].didascalia}</p>
            )}
            <p className="text-gray-400 text-center text-sm mt-1">{lightbox + 1} / {photos.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TechnicianProfile() {
  const { id } = useParams()
  const { getTecnicoById } = useTechnicians()
  const tech = getTecnicoById(id)
  const { getByTecnico, addReply } = useReview()
  const { getByTecnico: getBookings } = useBooking()
  const { user } = useAuth()
  const { toggleFavorite, isFavorite, getPortfolio } = useFavorites()

  const [filterStelle, setFilterStelle] = useState(0)

  if (!tech) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 font-medium text-lg mb-4">Tecnico non trovato.</p>
        <Link to="/tecnici" className="btn-primary">← Torna ai tecnici</Link>
      </div>
    )
  }

  const isClient = user?.ruolo === 'cliente'
  const favorited = isClient && isFavorite(user.id, tech.id)
  const portfolio = getPortfolio(tech.id)

  const completedJobs = tech.isReal && tech.userId
    ? getBookings(tech.userId).filter(b => b.stato === 'completata' || b.stato === 'archiviato').length
    : tech.completedJobs

  const reviews = getByTecnico(tech.id)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.stelle, 0) / reviews.length
    : (tech.rating ?? null)
  const totalReviews = reviews.length > 0 ? reviews.length : tech.reviews
  const badges = getBadges(tech, avgRating, reviews.length)

  const starDist = [5, 4, 3, 2, 1].map(s => ({
    stelle: s,
    count: reviews.filter(r => r.stelle === s).length,
  }))

  const displayedReviews = filterStelle === 0
    ? reviews
    : reviews.filter(r => r.stelle === filterStelle)

  const canReply = user?.ruolo === 'tecnico' && tech.name.includes(user.nome)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/tecnici" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline mb-6">
        <ChevronLeft size={14} /> Tutti i tecnici
      </Link>

      {/* Header profilo */}
      <div className="card p-7 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {tech.foto
            ? <img src={tech.foto} alt={tech.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            : <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${tech.avatarColor}`}>
                {tech.avatar}
              </div>
          }

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{tech.name}</h1>
              {badges.map(b => (
                <span key={b.label} className={`badge text-xs ${b.cls}`}>{b.icon} {b.label}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tech.specializations.map(s => (
                <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><MapPin size={13} />{tech.location}</span>
              {tech.responseTime && (
                <span className="flex items-center gap-1"><Clock size={13} />Risponde {tech.responseTime}</span>
              )}
              {completedJobs > 0 && (
                <span className="flex items-center gap-1"><Briefcase size={13} />{completedJobs} lavori completati</span>
              )}
              {tech.yearsExp > 0 && (
                <span className="flex items-center gap-1"><Award size={13} />{tech.yearsExp} {tech.yearsExp === 1 ? 'anno' : 'anni'} di esperienza</span>
              )}
            </div>
            {avgRating !== null ? (
              <div className="flex items-center gap-3">
                <StarsDisplay value={avgRating} size={20} />
                <span className="font-bold text-gray-900 text-xl">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({totalReviews} recensioni)</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">Nessuna valutazione ancora — primo a prenotare!</span>
            )}
          </div>

          <div className="shrink-0 flex flex-col gap-2 min-w-[160px]">
            <Link to="/preventivo" className="btn-accent py-3 px-5 text-center text-sm">
              Prenota ora
            </Link>
            {isClient && (
              <button
                onClick={() => toggleFavorite(user.id, tech.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl border text-sm font-semibold transition-all ${
                  favorited
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
                {favorited ? 'Nei preferiti' : 'Aggiungi preferiti'}
              </button>
            )}
            <div className="text-center">
              <span className="font-bold text-gray-800">€{tech.pricePerHour}/ora</span>
            </div>
            <span className={`text-xs text-center font-medium ${tech.available ? 'text-green-600' : 'text-amber-600'}`}>
              {tech.available ? '● Disponibile ora' : '● Limitata disponibilità'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar sinistra */}
        <div className="space-y-5">

          {/* Chi sono */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Chi sono</h3>
            {tech.bio
              ? <p className="text-sm text-gray-600 leading-relaxed">{tech.bio}</p>
              : <p className="text-sm text-gray-400 italic">Il tecnico non ha ancora aggiunto una descrizione.</p>
            }
          </div>

          {/* Tariffe */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Euro size={15} className="text-orange-500" /> Le mie tariffe
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tariffa oraria</span>
                <span className="font-bold text-gray-800">€{tech.tariffe?.oraria ?? tech.pricePerHour}/ora</span>
              </div>
              {(tech.tariffe?.chiamata ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tariffa di chiamata</span>
                  <span className="font-semibold text-gray-700">€{tech.tariffe.chiamata}</span>
                </div>
              )}
              {(tech.tariffe?.urgenzaExtra ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Supplemento urgenza</span>
                  <span className="font-semibold text-red-600">+€{tech.tariffe.urgenzaExtra}</span>
                </div>
              )}
              {(tech.tariffe?.festiviPerc ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Festivi/notturni</span>
                  <span className="font-semibold text-gray-700">+{tech.tariffe.festiviPerc}%</span>
                </div>
              )}
              {(tech.tariffe?.minimoIntervento ?? 0) > 0 && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Min. per intervento</span>
                  <span className="font-bold text-orange-600">€{tech.tariffe.minimoIntervento}</span>
                </div>
              )}
            </div>

            {tech.tariffe?.servizi?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prezzi fissi per servizio</p>
                <div className="space-y-2">
                  {tech.tariffe.servizi.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{s.nome}</span>
                      {s.prezzo != null
                        ? <span className="font-semibold text-gray-800 shrink-0 ml-2">€{s.prezzo}</span>
                        : <span className="text-gray-400 text-xs shrink-0 ml-2">a ore</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-start gap-1.5">
                <AlertCircle size={11} className="shrink-0 mt-0.5" />
                Prezzi indicativi. Il tecnico fornirà un preventivo definitivo prima dell'intervento.
              </p>
            </div>
          </div>

          {/* Disponibilità orari */}
          {tech.disponibilita && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-blue-500" /> Orari di lavoro
              </h3>
              <div className="space-y-1.5">
                {[
                  { key: 'lun', label: 'Lunedì' },
                  { key: 'mar', label: 'Martedì' },
                  { key: 'mer', label: 'Mercoledì' },
                  { key: 'gio', label: 'Giovedì' },
                  { key: 'ven', label: 'Venerdì' },
                  { key: 'sab', label: 'Sabato' },
                  { key: 'dom', label: 'Domenica' },
                ].map(({ key, label }) => {
                  const g = tech.disponibilita[key]
                  if (!g) return null
                  return (
                    <div key={key} className={`flex items-center gap-3 text-sm ${g.attivo ? '' : 'opacity-40'}`}>
                      <span className="w-20 text-xs font-medium text-gray-500 shrink-0">{label}</span>
                      {g.attivo
                        ? <span className="text-gray-700 font-medium">{g.inizio} – {g.fine}</span>
                        : <span className="text-gray-400 text-xs italic">Non disponibile</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Certificazioni */}
          {tech.certifications?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Certificazioni</h3>
              <div className="space-y-2">
                {tech.certifications.map(c => (
                  <div key={c} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />{c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lingue */}
          {tech.languages?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Lingue</h3>
              <div className="flex flex-wrap gap-1.5">
                {tech.languages.map(l => (
                  <span key={l} className="badge bg-gray-100 text-gray-600">{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio lavori */}
          <PortfolioGallery photos={portfolio} />

          {reviews.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">Distribuzione voti</h3>
              <div className="space-y-2">
                {starDist.map(({ stelle, count }) => {
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
                  return (
                    <button
                      key={stelle}
                      onClick={() => setFilterStelle(filterStelle === stelle ? 0 : stelle)}
                      className="w-full flex items-center gap-2 text-sm group"
                    >
                      <span className={`flex items-center gap-0.5 w-12 text-xs font-semibold shrink-0 ${filterStelle === stelle ? 'text-orange-600' : 'text-gray-500'}`}>
                        {stelle} <Star size={10} className="text-yellow-400" fill="currentColor" />
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right shrink-0">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recensioni */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-xl">
              Recensioni
              {reviews.length > 0 && (
                <span className="text-gray-400 font-normal text-base ml-2">({reviews.length})</span>
              )}
            </h2>
            {filterStelle > 0 && (
              <button onClick={() => setFilterStelle(0)} className="text-xs text-blue-600 hover:underline">
                Mostra tutte
              </button>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { v: 0, label: 'Tutte' },
                { v: 5, label: '5 ⭐' },
                { v: 4, label: '4 ⭐' },
                { v: 3, label: '3 ⭐' },
                { v: 2, label: '2 ⭐' },
                { v: 1, label: '1 ⭐' },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setFilterStelle(v)}
                  className={`badge cursor-pointer transition-colors ${filterStelle === v ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="card p-12 text-center">
              <Star size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Ancora nessuna recensione su questa piattaforma</p>
              {tech.reviews > 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  Questo tecnico ha ricevuto {tech.reviews} valutazioni su altri canali verificati
                </p>
              )}
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-400">Nessuna recensione con {filterStelle} {filterStelle === 1 ? 'stella' : 'stelle'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...displayedReviews]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(r => (
                  <ReviewCard key={r.id} review={r} onReply={addReply} canReply={canReply} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
