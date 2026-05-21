import { MapPin, Clock, Briefcase, Shield, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReview } from '../context/ReviewContext'
import { StarsDisplay } from './ReviewCard'

function getBadges(tech, avgRating, reviewCount) {
  const rating = avgRating ?? tech.rating
  const count = reviewCount > 0 ? reviewCount : tech.reviews
  const out = []
  if (tech.certified)
    out.push({ label: 'Verificato', cls: 'bg-blue-50 text-blue-700', icon: '✓' })
  if (rating >= 4.8 && count >= 5)
    out.push({ label: 'Top Rated', cls: 'bg-amber-50 text-amber-700', icon: '⭐' })
  if (tech.responseTime?.match(/< [12] /))
    out.push({ label: 'Risposta Rapida', cls: 'bg-green-50 text-green-700', icon: '⚡' })
  return out
}

export default function TechnicianCard({ tech }) {
  const { getByTecnico } = useReview()
  const reviews = getByTecnico(tech.id)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.stelle, 0) / reviews.length
    : tech.rating
  const totalReviews = reviews.length > 0 ? reviews.length : tech.reviews
  const badges = getBadges(tech, avgRating, reviews.length)

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className={`${tech.avatarColor} text-white text-lg font-bold w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
          {tech.avatar}
        </div>
        <div className="flex-1 min-w-0">
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
          <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
            <MapPin size={13} /> {tech.location}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StarsDisplay value={avgRating} />
        <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
        <span className="text-xs text-gray-400">({totalReviews})</span>
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
          <div className="font-bold text-gray-900">{tech.completedJobs}</div>
          <div className="text-xs text-gray-500">Lavori</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="font-bold text-gray-900">{tech.yearsExp} anni</div>
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
          <Clock size={12} /> Risponde {tech.responseTime}
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
