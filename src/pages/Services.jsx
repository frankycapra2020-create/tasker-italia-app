import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { services, categories } from '../data/services'
import ServiceCard from '../components/ServiceCard'

export default function Services() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('tutti')
  const [onlyUrgent, setOnlyUrgent] = useState(false)

  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'tutti' || s.category === activeCategory
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    const matchUrgent = !onlyUrgent || s.urgency
    return matchCat && matchSearch && matchUrgent
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tutti i servizi</h1>
        <p className="text-gray-500 text-lg">Soluzioni professionali per ogni esigenza domestica e commerciale</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca un servizio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUrgent}
              onChange={e => setOnlyUrgent(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            Solo interventi urgenti
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setActiveCategory('tutti')}
            className={`badge cursor-pointer transition-colors ${activeCategory === 'tutti' ? 'bg-brand-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tutti
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`badge cursor-pointer transition-colors ${activeCategory === cat.id ? 'bg-brand-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">{filtered.length} servizi trovati</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <SlidersHorizontal size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-gray-600">Nessun servizio trovato</p>
          <p className="text-sm mt-1">Prova a modificare i filtri di ricerca</p>
        </div>
      )}
    </div>
  )
}
