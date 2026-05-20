import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, FileText, Star, Clock, Wrench, Zap, ArrowRight, Shield } from 'lucide-react'

const recentRequests = [
  { id: 1, servizio: 'Perdita tubo cucina', tecnico: 'Marco Ferretti', stato: 'Completato', data: '15 mag 2026', prezzo: '€ 120' },
  { id: 2, servizio: 'Impianto elettrico', tecnico: 'In attesa', stato: 'In attesa', data: '20 mag 2026', prezzo: '—' },
]

const statoColor = {
  'Completato': 'bg-green-100 text-green-700',
  'In attesa': 'bg-yellow-100 text-yellow-700',
  'In corso': 'bg-blue-100 text-blue-700',
}

export default function DashboardCliente() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ciao, {user.nome}! 👋
          </h1>
          <p className="text-gray-500 mt-0.5">Gestisci le tue richieste e trova i migliori tecnici</p>
        </div>
        <div className="flex gap-3">
          <Link to="/preventivo" className="btn-accent text-sm py-2.5 px-5">
            Nuova Richiesta
          </Link>
          <button onClick={logout} className="btn-secondary text-sm py-2.5 px-5">
            Esci
          </button>
        </div>
      </div>

      {/* Stats rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <FileText size={20} className="text-blue-600" />, label: 'Richieste totali', value: '2', bg: 'bg-blue-50' },
          { icon: <Star size={20} className="text-yellow-500" />, label: 'Valutazioni date', value: '1', bg: 'bg-yellow-50' },
          { icon: <Clock size={20} className="text-orange-500" />, label: 'In attesa', value: '1', bg: 'bg-orange-50' },
          { icon: <Shield size={20} className="text-green-600" />, label: 'Lavori garantiti', value: '1', bg: 'bg-green-50' },
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
        {/* Richieste recenti */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">Richieste recenti</h2>
            <Link to="/preventivo" className="text-sm text-blue-700 font-semibold hover:underline flex items-center gap-1">
              Nuova <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{r.servizio}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.tecnico} · {r.data}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">{r.prezzo}</span>
                  <span className={`badge text-xs ${statoColor[r.stato]}`}>{r.stato}</span>
                </div>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Nessuna richiesta ancora. Inizia ora!</p>
            )}
          </div>
        </div>

        {/* Azioni rapide */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Azioni rapide</h2>
            <div className="space-y-3">
              <Link to="/tecnici" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-blue-100 p-2.5 rounded-lg">
                  <Search size={18} className="text-blue-700" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition">Trova un tecnico</div>
                  <div className="text-xs text-gray-500">Cerca per zona o specializzazione</div>
                </div>
              </Link>
              <Link to="/preventivo" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-orange-100 p-2.5 rounded-lg">
                  <FileText size={18} className="text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-orange-600 transition">Richiedi preventivo</div>
                  <div className="text-xs text-gray-500">Gratis e senza impegno</div>
                </div>
              </Link>
              <Link to="/tutorial" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="bg-green-100 p-2.5 rounded-lg">
                  <Shield size={18} className="text-green-700" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-green-700 transition">Tutorial sicurezza</div>
                  <div className="text-xs text-gray-500">Guide video gratuite</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <h3 className="font-bold mb-2">Emergenza?</h3>
            <p className="text-blue-100 text-sm mb-4">Tecnico disponibile entro 2 ore, 7 giorni su 7.</p>
            <Link to="/preventivo" className="btn-accent text-sm py-2.5 w-full text-center">
              Intervento urgente
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
