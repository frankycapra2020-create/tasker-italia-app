import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase, Star, Euro, MapPin, Award, Clock, TrendingUp, CheckCircle, Wrench, Zap } from 'lucide-react'

const jobRequests = [
  { id: 1, servizio: 'Perdita tubo bagno', cliente: 'Anna M.', zona: 'Milano Centro', urgenza: 'Urgente', data: '21 mag 2026' },
  { id: 2, servizio: 'Sostituzione rubinetto', cliente: 'Luca B.', zona: 'Milano Nord', urgenza: 'Normale', data: '22 mag 2026' },
  { id: 3, servizio: 'Revisione impianto', cliente: 'Giulia R.', zona: 'Sesto S. Giovanni', urgenza: 'Programmato', data: '25 mag 2026' },
]

const urgenzaColor = {
  'Urgente': 'bg-red-100 text-red-700',
  'Normale': 'bg-blue-100 text-blue-700',
  'Programmato': 'bg-gray-100 text-gray-600',
}

const specializzazioneIcon = {
  'Idraulico': <Wrench size={20} className="text-blue-600" />,
  'Elettricista': <Zap size={20} className="text-yellow-600" />,
  'Idraulico & Elettricista': <Wrench size={20} className="text-purple-600" />,
  'Caldaista': <Wrench size={20} className="text-red-600" />,
  'Climatizzazione': <Zap size={20} className="text-cyan-600" />,
}

export default function DashboardTecnico() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center font-bold text-orange-600 text-lg">
              {user.nome[0]}{user.cognome[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.nome} {user.cognome}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="badge bg-orange-100 text-orange-700 text-xs">
                  {specializzazioneIcon[user.specializzazione]}
                  {user.specializzazione || 'Tecnico'}
                </span>
                {user.zona && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} /> {user.zona}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary text-sm py-2.5 px-5 self-start">
          Esci
        </button>
      </div>

      {/* Profilo alert */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <CheckCircle size={22} className="text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Profilo attivo sulla piattaforma</h3>
          <p className="text-gray-600 text-xs mt-0.5">
            Stai ricevendo richieste per la zona {user.zona || 'selezionata'}.
            {user.certificazioni && ` Certificazioni registrate: ${user.certificazioni}.`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Briefcase size={20} className="text-blue-600" />, label: 'Lavori completati', value: '0', bg: 'bg-blue-50' },
          { icon: <Star size={20} className="text-yellow-500" />, label: 'Valutazione media', value: '—', bg: 'bg-yellow-50' },
          { icon: <Euro size={20} className="text-green-600" />, label: 'Guadagni totali', value: '€ 0', bg: 'bg-green-50' },
          { icon: <TrendingUp size={20} className="text-purple-600" />, label: 'Tasso accettazione', value: '—', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Richieste in arrivo */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">Richieste in arrivo</h2>
            <span className="badge bg-blue-100 text-blue-700 text-xs">{jobRequests.length} nuove</span>
          </div>
          <div className="space-y-3">
            {jobRequests.map(r => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{r.servizio}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{r.cliente}</span>
                      <span>·</span>
                      <MapPin size={11} className="inline" />
                      <span>{r.zona}</span>
                      <span>·</span>
                      <Clock size={11} className="inline" />
                      <span>{r.data}</span>
                    </div>
                  </div>
                  <span className={`badge text-xs shrink-0 ${urgenzaColor[r.urgenza]}`}>{r.urgenza}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs py-1.5 px-4">Accetta</button>
                  <button className="btn-secondary text-xs py-1.5 px-4">Rifiuta</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Il tuo profilo</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Award size={16} className="text-orange-500" />
                <span className="font-medium">Specializzazione:</span>
                <span>{user.specializzazione || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-blue-500" />
                <span className="font-medium">Zona:</span>
                <span>{user.zona || '—'}</span>
              </div>
              {user.certificazioni && (
                <div className="flex items-start gap-2 text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Certificazioni: </span>
                    <span>{user.certificazioni}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Star size={16} className="text-yellow-500" />
                <span className="font-medium">Valutazione:</span>
                <span className="text-gray-400">Nessuna ancora</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <h3 className="font-bold mb-2">Completa il profilo</h3>
            <p className="text-blue-100 text-sm mb-4">Aggiungi foto e descrizione per ricevere più richieste.</p>
            <button className="btn-accent text-sm py-2.5 w-full">
              Aggiorna profilo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
