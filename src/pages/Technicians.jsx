import { useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Navigation, MapPin, Map, List, Loader, Shield, CheckCircle } from 'lucide-react'
import { useTechnicians } from '../context/TechniciansContext'
import TechnicianCard from '../components/TechnicianCard'
import { useReview } from '../context/ReviewContext'
import { useGeo } from '../context/GeoContext'
import { haversineKm } from '../utils/geo'

const MappaTeacnici = lazy(() => import('../components/MappaTeacnici'))

const specializations = ['Tutti', 'Idraulica', 'Elettricità', 'Caldaie', 'Climatizzazione', 'Fotovoltaico', 'Domotica']

const STAR_FILTERS = [
  { v: 0, label: 'Tutte le stelle' },
  { v: 4, label: '4★+' },
  { v: 4.5, label: '4.5★+' },
  { v: 5, label: '5★' },
]

const RAGGI = [5, 10, 25, 50]

const GEO_STATUS_MSG = {
  loading: { text: 'Rilevamento posizione…', icon: <Loader size={14} className="animate-spin" />, cls: 'text-blue-700 bg-blue-50 border-blue-100' },
  denied:  { text: 'Accesso alla posizione negato — abilitalo nelle impostazioni del browser', icon: '🚫', cls: 'text-red-600 bg-red-50 border-red-100' },
  unavailable: { text: 'Geolocalizzazione non disponibile sul tuo dispositivo', icon: '📡', cls: 'text-gray-600 bg-gray-50 border-gray-100' },
}

export default function Technicians() {
  const { allTecnici } = useTechnicians()
  const { getAvgRating } = useReview()
  const { position, status, requestLocation } = useGeo()

  const [search, setSearch] = useState('')
  const [activeSpec, setActiveSpec] = useState('Tutti')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [minRating, setMinRating] = useState(0)
  const [viciniAMe, setViciniAMe] = useState(false)
  const [raggio, setRaggio] = useState(25)
  const [showMappa, setShowMappa] = useState(false)

  const liveRating = (t) => {
    const avg = getAvgRating(t.id)
    return avg !== null ? avg : t.rating  // may return null for new registered tecnici
  }

  const techsWithDist = allTecnici.map(t => ({
    ...t,
    distanzaKm: position && t.lat ? haversineKm(position.lat, position.lng, t.lat, t.lng) : null,
  }))

  const filtered = techsWithDist
    .filter(t => {
      const matchSpec = activeSpec === 'Tutti' || t.specializations.some(s =>
        s.toLowerCase().includes(activeSpec.toLowerCase()) ||
        activeSpec.toLowerCase().includes(s.toLowerCase())
      )
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase()) ||
        t.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const matchAvail = !onlyAvailable || t.available
      const rating = liveRating(t)
      const matchRating = minRating === 0
        ? true
        : rating === null
          ? false
          : minRating === 5 ? rating >= 4.95 : rating >= minRating
      const matchVicino = !viciniAMe || !position || (t.distanzaKm !== null && t.distanzaKm <= raggio)
      return matchSpec && matchSearch && matchAvail && matchRating && matchVicino
    })
    .sort((a, b) => {
      if (sortBy === 'distanza' && a.distanzaKm !== null && b.distanzaKm !== null)
        return a.distanzaKm - b.distanzaKm
      if (sortBy === 'rating') return (liveRating(b) ?? -1) - (liveRating(a) ?? -1)
      if (sortBy === 'price') return a.pricePerHour - b.pricePerHour
      if (sortBy === 'jobs') return b.completedJobs - a.completedJobs
      return 0
    })

  const geoMsg = GEO_STATUS_MSG[status]

  const handleViciniToggle = () => {
    if (!viciniAMe && status === 'idle') requestLocation()
    setViciniAMe(v => !v)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">I nostri tecnici</h1>
        <p className="text-gray-500 text-lg">Oltre 2.400 professionisti verificati e assicurati in tutta Italia</p>
      </div>

      {/* Banner stato geo */}
      {geoMsg && (
        <div className={`flex items-center gap-2.5 mb-5 px-4 py-3 rounded-xl border text-sm font-medium ${geoMsg.cls}`}>
          <span className="shrink-0">{geoMsg.icon}</span>
          <span>{geoMsg.text}</span>
        </div>
      )}

      {/* Banner invito geolocalizzazione (solo idle) */}
      {status === 'idle' && (
        <div className="flex items-center justify-between gap-4 mb-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2.5 text-sm text-blue-800">
            <Navigation size={16} className="shrink-0" />
            <span className="font-medium">Trova tecnici vicino a te in pochi secondi</span>
          </div>
          <button
            onClick={requestLocation}
            className="shrink-0 text-xs font-semibold bg-blue-800 hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg transition"
          >
            Usa la mia posizione
          </button>
        </div>
      )}

      {/* Barra filtri */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
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
            <option value="rating">Per valutazione</option>
            {position && <option value="distanza">Per distanza</option>}
            <option value="price">Per prezzo</option>
            <option value="jobs">Per lavori svolti</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={e => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            Solo disponibili
          </label>
        </div>

        {/* Specializzazioni + Vicino a me */}
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
          <button
            onClick={handleViciniToggle}
            className={`badge cursor-pointer transition-colors flex items-center gap-1 ${viciniAMe && position ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Navigation size={11} />
            Vicino a me
          </button>
        </div>

        {/* Raggio di ricerca (visibile solo quando geo attivo) */}
        {viciniAMe && position && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mr-1">
              <MapPin size={12} /> Raggio:
            </span>
            {RAGGI.map(r => (
              <button
                key={r}
                onClick={() => setRaggio(r)}
                className={`badge cursor-pointer transition-colors text-xs ${raggio === r ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {r} km
              </button>
            ))}
          </div>
        )}

        {/* Rating */}
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

      {/* Header risultati + toggle mappa */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-500 text-sm">
          {filtered.length} tecnici trovati
          {viciniAMe && position && ` entro ${raggio} km`}
        </p>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setShowMappa(false)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${!showMappa ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={15} /> Lista
          </button>
          <button
            onClick={() => setShowMappa(true)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition ${showMappa ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Map size={15} /> Mappa
          </button>
        </div>
      </div>

      {/* Banner garanzia */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl">
        <Shield size={18} className="text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-green-800">La nostra garanzia soddisfatti</span>
          <span className="text-xs text-green-600 ml-2">Se non sei soddisfatto, apri una disputa entro 24 ore dal completamento.</span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
          <CheckCircle size={12} /> Lavori garantiti
        </div>
      </div>

      {/* Vista lista */}
      {!showMappa && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(t => <TechnicianCard key={t.id} tech={t} distanzaKm={t.distanzaKm} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-600">Nessun tecnico trovato</p>
            <p className="text-sm mt-1">Prova a modificare i filtri o ad aumentare il raggio di ricerca</p>
          </div>
        )
      )}

      {/* Vista mappa + lista compatta a lato */}
      {showMappa && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* Lista compatta */}
          <div className="overflow-y-auto max-h-[600px] space-y-2 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nessun tecnico in quest'area</p>
              </div>
            ) : filtered.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 hover:border-blue-200 transition">
                {t.foto
                  ? <img src={t.foto} alt={t.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  : <div className={`${t.avatarColor} text-white text-sm font-bold w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                      {t.avatar}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800 truncate">{t.name}</span>
                    {t.available
                      ? <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">● Disponibile</span>
                      : <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">● Occupato</span>
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{t.location.split(',')[0]}</span>
                    {t.distanzaKm !== null && (
                      <span className="text-xs font-semibold text-blue-700 flex items-center gap-0.5">
                        <Navigation size={9} /> {t.distanzaKm < 10 ? t.distanzaKm.toFixed(1) : Math.round(t.distanzaKm)} km
                      </span>
                    )}
                    <span className="text-xs text-gray-400">€{t.pricePerHour}/h</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Link
                    to={`/tecnici/${t.id}`}
                    className="text-xs text-blue-700 font-semibold border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition text-center"
                  >
                    Profilo
                  </Link>
                  <Link
                    to="/preventivo"
                    className="text-xs bg-blue-800 hover:bg-blue-900 text-white font-semibold px-2.5 py-1.5 rounded-lg transition text-center"
                  >
                    Prenota
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mappa */}
          <div style={{ height: 600 }}>
            <Suspense fallback={
              <div className="h-full rounded-2xl bg-gray-100 flex items-center justify-center">
                <Loader size={28} className="text-blue-700 animate-spin" />
              </div>
            }>
              <MappaTeacnici tecnici={filtered} position={position} raggio={raggio} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
