import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Clock, Briefcase, Shield, CheckCircle, Award, ChevronLeft } from 'lucide-react'
import { technicians } from '../data/technicians'
import { useReview } from '../context/ReviewContext'
import { useAuth } from '../context/AuthContext'
import ReviewCard, { StarsDisplay } from '../components/ReviewCard'

function getBadges(tech, avgRating, reviewCount) {
  const rating = avgRating ?? tech.rating
  const count = reviewCount > 0 ? reviewCount : tech.reviews
  const out = []
  if (tech.certified)
    out.push({ label: 'Verificato', cls: 'bg-blue-100 text-blue-700', icon: '✓' })
  if (rating >= 4.8 && count >= 5)
    out.push({ label: 'Top Rated', cls: 'bg-amber-100 text-amber-700', icon: '⭐' })
  if (tech.responseTime?.match(/< [12] /))
    out.push({ label: 'Risposta Rapida', cls: 'bg-green-100 text-green-700', icon: '⚡' })
  return out
}

export default function TechnicianProfile() {
  const { id } = useParams()
  const tech = technicians.find(t => t.id === parseInt(id))
  const { getByTecnico, addReply } = useReview()
  const { user } = useAuth()

  const [filterStelle, setFilterStelle] = useState(0)

  if (!tech) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 font-medium text-lg mb-4">Tecnico non trovato.</p>
        <Link to="/tecnici" className="btn-primary">← Torna ai tecnici</Link>
      </div>
    )
  }

  const reviews = getByTecnico(tech.id)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.stelle, 0) / reviews.length
    : tech.rating
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
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${tech.avatarColor}`}>
            {tech.avatar}
          </div>

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
              <span className="flex items-center gap-1"><Clock size={13} />Risponde {tech.responseTime}</span>
              <span className="flex items-center gap-1"><Briefcase size={13} />{tech.completedJobs} lavori completati</span>
              <span className="flex items-center gap-1"><Award size={13} />{tech.yearsExp} anni di esperienza</span>
            </div>
            <div className="flex items-center gap-3">
              <StarsDisplay value={avgRating} size={20} />
              <span className="font-bold text-gray-900 text-xl">{avgRating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({totalReviews} recensioni)</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2 min-w-[160px]">
            <Link to="/preventivo" className="btn-accent py-3 px-5 text-center text-sm">
              Prenota ora
            </Link>
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
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Chi sono</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{tech.bio}</p>
          </div>

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

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Lingue</h3>
            <div className="flex flex-wrap gap-1.5">
              {tech.languages.map(l => (
                <span key={l} className="badge bg-gray-100 text-gray-600">{l}</span>
              ))}
            </div>
          </div>

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
              <p className="text-gray-400 text-sm mt-1">
                Questo tecnico ha ricevuto {tech.reviews} valutazioni su altri canali verificati
              </p>
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
