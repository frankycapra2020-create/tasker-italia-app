import { Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'
import { categories } from '../data/services'

export default function ServiceCard({ service }) {
  const cat = categories.find(c => c.id === service.category)
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat?.icon}</span>
          <span className={`badge ${cat?.color}`}>{cat?.label}</span>
        </div>
        {service.urgency && (
          <span className="badge bg-red-100 text-red-700">
            <AlertCircle size={11} /> Urgente
          </span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 text-lg leading-snug">{service.title}</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{service.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {service.tags.map(tag => (
          <span key={tag} className="badge bg-gray-100 text-gray-600">
            <CheckCircle size={10} /> {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1"><Clock size={14} />{service.duration}</span>
        <StarRating rating={service.rating} count={service.reviews} size={13} />
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <span className="text-lg font-bold text-brand-800">{service.price}</span>
        <Link to="/preventivo" className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          Richiedi preventivo <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
