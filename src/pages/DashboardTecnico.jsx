import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { Briefcase, Star, Euro, MapPin, Award, Clock, TrendingUp, CheckCircle, Wrench, Zap, Calendar, Check, X, AlertCircle } from 'lucide-react'

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const formatDateIT = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}

const STATO_STYLE = {
  in_attesa:  { badge: 'bg-yellow-100 text-yellow-700', label: 'In attesa' },
  confermata: { badge: 'bg-blue-100 text-blue-700',    label: 'Confermata' },
  completata: { badge: 'bg-green-100 text-green-700',  label: 'Completata' },
  annullata:  { badge: 'bg-red-100 text-red-700',      label: 'Annullata' },
}

const CAT_ICON = {
  idraulica:       <Wrench size={14} className="text-blue-600" />,
  'elettricità':   <Zap size={14} className="text-yellow-600" />,
  caldaia:         <Wrench size={14} className="text-red-600" />,
  climatizzazione: <Zap size={14} className="text-cyan-600" />,
}

const SPEC_ICON = {
  'Idraulico':              <Wrench size={20} className="text-blue-600" />,
  'Elettricista':           <Zap size={20} className="text-yellow-600" />,
  'Idraulico & Elettricista': <Wrench size={20} className="text-purple-600" />,
  'Caldaista':              <Wrench size={20} className="text-red-600" />,
  'Climatizzazione':        <Zap size={20} className="text-cyan-600" />,
}

const TABS = ['Nuove richieste', 'Miei interventi']

export default function DashboardTecnico() {
  const { user, logout } = useAuth()
  const { getPending, getByTecnico, updateBooking } = useBooking()
  const [tab, setTab] = useState(0)

  const pendingAll = getPending().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const miei = getByTecnico(user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const completati = miei.filter(b => b.stato === 'completata')
  const guadagni = completati.reduce((sum, b) => sum + (b.totaleStimato ?? 0), 0)
  const inCorso = miei.filter(b => b.stato === 'confermata').length

  const accetta = (id) => updateBooking(id, { stato: 'confermata', confermatoDa: user.id })
  const rifiuta = (id) => {
    if (confirm('Vuoi rifiutare questa richiesta?')) updateBooking(id, { stato: 'annullata' })
  }
  const completa = (id) => updateBooking(id, { stato: 'completata' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center font-bold text-orange-600 text-lg">
            {user.nome[0]}{user.cognome[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.nome} {user.cognome}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="badge bg-orange-100 text-orange-700 text-xs flex items-center gap-1">
                {SPEC_ICON[user.specializzazione]}
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
        <button onClick={logout} className="btn-secondary text-sm py-2.5 px-5 self-start">Esci</button>
      </div>

      {/* Alert profilo */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <CheckCircle size={22} className="text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Profilo attivo sulla piattaforma</h3>
          <p className="text-gray-600 text-xs mt-0.5">
            Stai ricevendo richieste per la zona {user.zona || 'selezionata'}.
            {user.certificazioni && ` Certificazioni: ${user.certificazioni}.`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Briefcase size={20} className="text-blue-600" />,    label: 'Lavori completati',   value: completati.length, bg: 'bg-blue-50' },
          { icon: <Star size={20} className="text-yellow-500" />,       label: 'In corso',            value: inCorso, bg: 'bg-yellow-50' },
          { icon: <Euro size={20} className="text-green-600" />,        label: 'Guadagni totali',     value: guadagni > 0 ? `€ ${guadagni}` : '€ 0', bg: 'bg-green-50' },
          { icon: <TrendingUp size={20} className="text-orange-500" />, label: 'Nuove richieste',     value: pendingAll.length, bg: 'bg-orange-50' },
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
        {/* Pannello principale con tab */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                    tab === i ? 'text-blue-800' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t}
                  {i === 0 && pendingAll.length > 0 && (
                    <span className="ml-1.5 badge bg-red-100 text-red-600 text-xs">{pendingAll.length}</span>
                  )}
                  {tab === i && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab 0: Nuove richieste */}
              {tab === 0 && (
                <>
                  {pendingAll.length === 0 ? (
                    <div className="text-center py-14">
                      <AlertCircle size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">Nessuna richiesta in attesa</p>
                      <p className="text-gray-400 text-sm mt-1">Le nuove prenotazioni dai clienti appariranno qui</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingAll.map(b => (
                        <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {CAT_ICON[b.categoria]}
                                <span className="font-semibold text-gray-800 text-sm">{b.servizio}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                                <span>{b.clienteNome}</span>
                                <span className="flex items-center gap-1"><MapPin size={11} />{b.indirizzo}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />{formatDateIT(b.dataIntervento)} ore {b.oraIntervento}
                                </span>
                                <span className="flex items-center gap-1"><Clock size={11} />{b.oreStimate}h stimate</span>
                              </div>
                              {b.descrizione && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">"{b.descrizione}"</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-gray-800">€ {b.totaleStimato}</div>
                              {b.urgenza === 'urgente' && (
                                <span className="badge bg-red-100 text-red-600 text-xs mt-1">🚨 Urgente</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => accetta(b.id)}
                              className="flex items-center gap-1.5 btn-primary text-xs py-2 px-4"
                            >
                              <Check size={13} /> Accetta intervento
                            </button>
                            <button
                              onClick={() => rifiuta(b.id)}
                              className="flex items-center gap-1.5 btn-secondary text-xs py-2 px-4"
                            >
                              <X size={13} /> Rifiuta
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Tab 1: Miei interventi */}
              {tab === 1 && (
                <>
                  {miei.length === 0 ? (
                    <div className="text-center py-14">
                      <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">Nessun intervento accettato</p>
                      <p className="text-gray-400 text-sm mt-1">Accetta le richieste dai clienti per vederle qui</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {miei.map(b => {
                        const stato = STATO_STYLE[b.stato] ?? { badge: 'bg-gray-100 text-gray-600', label: b.stato }
                        return (
                          <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {CAT_ICON[b.categoria]}
                                  <span className="font-semibold text-gray-800 text-sm">{b.servizio}</span>
                                  <span className={`badge text-xs ${stato.badge}`}>{stato.label}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                                  <span>{b.clienteNome}</span>
                                  <span>{b.clienteTelefono}</span>
                                  <span className="flex items-center gap-1"><MapPin size={11} />{b.indirizzo}</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={11} />{formatDateIT(b.dataIntervento)} ore {b.oraIntervento}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-bold text-gray-800">€ {b.totaleStimato}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{b.id}</div>
                              </div>
                            </div>
                            {b.stato === 'confermata' && (
                              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                <button
                                  onClick={() => completa(b.id)}
                                  className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition"
                                >
                                  <CheckCircle size={13} /> Segna come completato
                                </button>
                                <button
                                  onClick={() => rifiuta(b.id)}
                                  className="flex items-center gap-1.5 btn-secondary text-xs py-2 px-4"
                                >
                                  <X size={13} /> Annulla
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
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
                <span className="text-gray-400">
                  {completati.length > 0 ? '4.8 (demo)' : 'Nessuna ancora'}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <h3 className="font-bold mb-2">Completa il profilo</h3>
            <p className="text-blue-100 text-sm mb-4">Aggiungi foto e descrizione per ricevere più richieste.</p>
            <button className="btn-accent text-sm py-2.5 w-full">Aggiorna profilo</button>
          </div>
        </div>
      </div>
    </div>
  )
}
