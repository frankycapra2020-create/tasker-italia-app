import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { technicians } from '../data/technicians'
import TechnicianCard from '../components/TechnicianCard'
import { useReview } from '../context/ReviewContext'

const specializations = ['Tutti', 'Idraulica', 'Elettricità', 'Caldaie', 'Climatizzazione', 'Fotovoltaico', 'Domotica']

const STAR_FILTERS = [
  { v: 0, label: 'Tutte le stelle' },
  { v: 4, label: '4★+' },
  { v: 4.5, label: '4.5★+' },
  { v: 5, label: '5★' },
]

export default function Technicians() {
  const { getAvgRating } = useReview()
  const [search, setSearch] = useState('')
  const [activeSpec, setActiveSpec] = useState('Tutti')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [minRating, setMinRating] = useState(0)

  const liveRating = (t) => {
    const avg = getAvgRating(t.id)
    return avg !== null ? avg : t.rating
  }

  const filtered = technicians
    .filter(t => {
      const matchSpec = activeSpec === 'Tutti' || t.specializations.includes(activeSpec)
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase()) ||
        t.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const matchAvail = !onlyAvailable || t.available
      const rating = liveRating(t)
      const matchRating = minRating === 0
        ? true
        : minRating === 5 ? rating >= 4.95 : rating >= minRating
      return matchSpec && matchSearch && matchAvail && matchRating
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return liveRating(b) - liveRating(a)
      if (sortBy === 'price') return a.pricePerHour - b.pricePerHour
      if (sortBy === 'jobs') return b.completedJobs - a.completedJobs
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">I nostri tecnici</h1>
        <p className="text-gray-500 text-lg">Oltre 2.400 professionisti verificati e assicurati in tutta Italia</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, città o specializzazione..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Ordina per valutazione</option>
            <option value="price">Ordina per prezzo</option>
            <option value="jobs">Ordina per lavori svolti</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={e => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            Solo disponibili ora
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveSpec(spec)}
              className={`badge cursor-pointer transition-colors ${activeSpec === spec ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {spec}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500 flex items-center mr-1">Valutazione minima:</span>
          {STAR_FILTERS.map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setMinRating(v)}
              className={`badge cursor-pointer transition-colors ${minRating === v ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">{filtered.length} tecnici trovati</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => <TechnicianCard key={t.id} tech={t} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-gray-600">Nessun tecnico trovato</p>
          <p className="text-sm mt-1">Prova a modificare i filtri di ricerca</p>
        </div>
      )}
    </div>
  )
}
