import { useState } from 'react'
import { Shield, Search, AlertTriangle, PlayCircle } from 'lucide-react'
import { tutorials, tutorialCategories } from '../data/tutorials'
import VideoCard from '../components/VideoCard'

export default function Tutorials() {
  const [activeCategory, setActiveCategory] = useState('tutti')
  const [search, setSearch] = useState('')

  const filtered = tutorials.filter(t => {
    const matchCat = activeCategory === 'tutti' || t.category === activeCategory
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const emergencyTutorials = tutorials.filter(t => t.category === 'emergenze')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="badge bg-red-100 text-red-700 mb-3">
          <Shield size={12} /> Formazione gratuita sulla sicurezza
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 mt-1">Tutorial Video Sicurezza</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Video educativi realizzati dai nostri tecnici certificati. Impara a gestire le situazioni di emergenza più comuni in casa in modo sicuro.
        </p>
      </div>

      {/* Emergency banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 mb-1">In caso di emergenza reale</h3>
            <p className="text-red-700 text-sm mb-3">
              Se sei in pericolo immediato o hai un'emergenza che richiede intervento tecnico urgente, non perdere tempo con i video:
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:112" className="btn-primary bg-red-600 hover:bg-red-700 py-2 text-sm">
                📞 Emergenze: 112
              </a>
              <a href="tel:115" className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-red-200 transition-colors">
                🔥 Vigili del fuoco: 115
              </a>
              <a href="tel:800123456" className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-red-200 transition-colors">
                🔧 Tecnico urgente: 800 123 456
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Search & filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca un tutorial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tutorialCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`badge cursor-pointer transition-colors ${activeCategory === cat.id ? 'bg-brand-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-800">{tutorials.length}</div>
          <div className="text-xs text-gray-500 mt-1">Video disponibili</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-800">100%</div>
          <div className="text-xs text-gray-500 mt-1">Gratuiti</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-800">
            {tutorials.reduce((s, t) => s + t.views, 0).toLocaleString('it-IT')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Visualizzazioni</div>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">{filtered.length} tutorial trovati</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => <VideoCard key={t.id} tutorial={t} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <PlayCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-gray-600">Nessun tutorial trovato</p>
          <p className="text-sm mt-1">Prova a cambiare i filtri</p>
        </div>
      )}

      {/* Safety disclaimer */}
      <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">⚠️ Avviso legale importante</p>
        <p>
          I contenuti di questi tutorial sono forniti a scopo puramente educativo e informativo.
          Per interventi su impianti elettrici, a gas e idraulici che richiedono abilitazione professionale
          (D.M. 37/08, patentino gas, cert. F-GAS), è obbligatorio rivolgersi a un tecnico abilitato.
          ProntoTecnico non è responsabile per interventi eseguiti da non professionisti.
        </p>
      </div>
    </div>
  )
}
