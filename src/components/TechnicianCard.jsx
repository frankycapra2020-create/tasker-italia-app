import { MapPin, Clock, Briefcase, Shield, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function TechnicianCard({ tech }) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className={`${tech.avatarColor} text-white text-lg font-bold w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
          {tech.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{tech.name}</h3>
            {tech.certified && (
              <span className="badge bg-blue-50 text-blue-700">
                <Shield size={10} /> Verificato
              </span>
            )}
            <span className={`badge ${tech.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {tech.available ? '● Disponibile' : '● Non disponibile'}
            </span>
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

      <StarRating rating={tech.rating} count={tech.reviews} />

      <p className="text-gray-500 text-sm leading-relaxed">{tech.bio}</p>

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
        <Link to="/preventivo" className="btn-primary text-sm py-2 px-4">
          Contatta
        </Link>
      </div>
    </div>
  )
}
