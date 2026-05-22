import { MapPin, Clock, Briefcase, CheckCircle, Navigation, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReview } from '../context/ReviewContext'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { StarsDisplay } from './ReviewCard'
import { formatKm } from '../utils/geo'

function getBadges(tech, avgRating, reviewCount) {
  const rating = avgRating ?? tech.rating
  const count = reviewCount > 0 ? reviewCount : tech.reviews
  const out = []
  if (tech.certified)
    out.push({ label: 'Verificato', cls: 'bg-blue-50 text-blue-700', icon: '✓' })
  if (tech.certified)
    out.push({ label: 'Lavoro Garantito', cls: 'bg-green-50 text-green-700', icon: '✓' })
  if (rating >= 4.8 && count >= 5)
    out.push({ label: 'Top Rated', cls: 'bg-amber-50 text-amber-700', icon: '⭐' })
  if (tech.responseTime?.match(/< [12] /))
    out.push({ label: 'Risposta Rapida', cls: 'bg-green-50 text-green-700', icon: '⚡' })
  return out
}

export default function TechnicianCard({ tech, distanzaKm }) {
  const { getByTecnico: getReviews } = useReview()
  const { getByTecnico: getBookings } = useBooking()
  const { user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()

  const reviews = getReviews(tech.id)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.stelle, 0) / reviews.length
    : tech.rating
  const totalReviews = reviews.length > 0 ? reviews.length : tech.reviews
  const badges = getBadges(tech, avgRating, reviews.length)

  const completedJobs = tech.isReal && tech.userId
    ? getBookings(tech.userId).filter(b => b.stato === 'completata' || b.stato === 'archiviato').length
    : tech.completedJobs

  const isClient = user?.ruolo === 'cliente'
  const favorited = isClient && isFavorite(user.id, tech.id)

  const handleHeart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isClient) toggleFavorite(user.id, tech.id)
  }

  return (
    <div className="card p-6 flex flex-col gap-4 relative">
      {/* Bottone preferito */}
      {isClient && (
        <button
          onClick={handleHeart}
          title={favorited ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all ${
            favorited
              ? 'text-red-500 bg-red-50 hover:bg-red-100'
              : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
          }`}
        >
          <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="flex items-start gap-4">
        {tech.foto
          ? <img src={tech.foto} alt={tech.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
          : <div className={`${tech.avatarColor} text-white text-lg font-bold w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
              {tech.avatar}
            </div>
        }
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900">{tech.name}</h3>
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {badges.map(b => (
              <span key={b.label} className={`badge text-xs ${b.cls}`}>{b.icon} {b.label}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {tech.specializations.map(s => (
              <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={13} /> {tech.location}
            </span>
            {distanzaKm !== null && distanzaKm !== undefined && (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                <Navigation size={10} /> {formatKm(distanzaKm)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {avgRating !== null ? (
          <>
            <StarsDisplay value={avgRating} />
            <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({totalReviews})</span>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Nessuna valutazione ancora</span>
        )}
        {!tech.available && (
          <span className="badge bg-gray-100 text-gray-500 text-xs ml-auto">Limitata disponibilità</span>
        )}
        {tech.available && (
          <span className="badge bg-green-100 text-green-700 text-xs ml-auto">● Disponibile</span>
        )}
      </div>

      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{tech.bio}</p>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="font-bold text-gray-900">{completedJobs}</div>
          <div className="text-xs text-gray-500">Lavori</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="font-bold text-gray-900">{tech.yearsExp > 0 ? `${tech.yearsExp} anni` : '—'}</div>
          <div className="text-xs text-gray-500">Esperienza</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="font-bold text-gray-900">€{tech.pricePerHour}/h</div>
          <div className="text-xs text-gray-500">Tariffa</div>
        </div>
      </div>

      <div className="space-y-1">
        {tech.certifications.slice(0, 2).map(cert => (
          <div key={cert} className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle size={12} className="text-green-500 flex-shrink-0" /> {cert}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} /> {tech.responseTime ? `Risponde ${tech.responseTime}` : 'Nuovo sulla piattaforma'}
        </span>
        <div className="flex gap-2">
          <Link to={`/tecnici/${tech.id}`} className="btn-secondary text-sm py-2 px-3">
            Profilo
          </Link>
          <Link to="/preventivo" className="btn-primary text-sm py-2 px-4">
            Prenota
          </Link>
        </div>
      </div>
    </div>
  )
}
