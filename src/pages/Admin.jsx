import { useState, useMemo } from 'react'
import {
  Euro, Users, Briefcase, TrendingUp, Shield, LogOut,
  CheckCircle, AlertCircle, Calendar, ArrowRight, BarChart2,
} from 'lucide-react'

const ADMIN_EMAIL    = 'admin@prontotecnico.it'
const ADMIN_PASSWORD = 'admin2024'
const COMMISSIONE    = 0.05

const MESI_BREVI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
const MESI_FULL  = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

const fmt = (n) => {
  if (n == null) return '€ 0,00'
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`
}

const fmtDate = (str) => {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI_BREVI[parseInt(m) - 1]} ${y}`
}

function LoginForm({ onLogin, error }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(email.trim(), password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
            <Shield size={16} className="text-orange-400" />
            <span className="text-white text-sm font-semibold">Area riservata</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ProntoTecnico</h1>
          <p className="text-blue-200 text-sm mt-1">Pannello amministratore</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Accesso Admin</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Email amministratore</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@prontotecnico.it"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-semibold mt-2"
            >
              Accedi al pannello
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div className={`${color} p-3 rounded-xl shrink-0`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function MiniBarChart({ data, maxValue, color = 'bg-blue-600' }) {
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const pct = maxValue > 0 ? (d.value / maxValue) * 100 : 0
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: '80px' }}>
              <div
                className={`w-full ${color} rounded-t-sm transition-all`}
                style={{ height: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
            </div>
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Admin() {
  const [loggedIn, setLoggedIn]   = useState(() => sessionStorage.getItem('pt_admin') === '1')
  const [loginError, setLoginError] = useState('')
  const [jobPage, setJobPage]     = useState(0)
  const JOB_PAGE_SIZE = 15

  const handleLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('pt_admin', '1')
      setLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Credenziali non valide. Riprova.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pt_admin')
    setLoggedIn(false)
  }

  // ─── Lettura dati da localStorage ────────────────────────────────────────────
  const data = useMemo(() => {
    if (!loggedIn) return null
    let bookings = []
    let users    = []
    try { bookings = JSON.parse(localStorage.getItem('pt_bookings') || '[]') } catch {}
    try { users    = JSON.parse(localStorage.getItem('pt_users')    || '[]') } catch {}

    const completati = bookings.filter(b => b.stato === 'completata' || b.stato === 'archiviato')

    const commissioni = completati.map(b => {
      const lordo = b.totaleStimato ?? 0
      const comm  = b.commissione ?? Math.round(lordo * COMMISSIONE * 100) / 100
      const netto = b.guadagnoNetto ?? (lordo - comm)
      return { ...b, lordo, comm, netto }
    })

    const totCommissioni = commissioni.reduce((s, b) => s + b.comm, 0)
    const totLordo       = commissioni.reduce((s, b) => s + b.lordo, 0)
    const totNetto       = commissioni.reduce((s, b) => s + b.netto, 0)

    const tecnici  = users.filter(u => u.ruolo === 'tecnico')
    const clienti  = users.filter(u => u.ruolo === 'cliente')

    // Grafico mensile ultimi 12 mesi
    const now     = new Date()
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const tot = commissioni
        .filter(b => b.createdAt?.startsWith(key))
        .reduce((s, b) => s + b.comm, 0)
      return { label: MESI_BREVI[d.getMonth()], value: tot, key }
    })

    const maxMonthly = Math.max(...monthly.map(m => m.value), 1)

    // Grafico per tecnico (top 5)
    const byTecnico = {}
    commissioni.forEach(b => {
      const k = b.tecnicoNome || 'Sconosciuto'
      if (!byTecnico[k]) byTecnico[k] = { lordo: 0, comm: 0, netto: 0, count: 0 }
      byTecnico[k].lordo += b.lordo
      byTecnico[k].comm  += b.comm
      byTecnico[k].netto += b.netto
      byTecnico[k].count += 1
    })

    const topTecnici = Object.entries(byTecnico)
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.lordo - a.lordo)
      .slice(0, 5)

    return {
      commissioni,
      totCommissioni,
      totLordo,
      totNetto,
      tecnici,
      clienti,
      bookings,
      monthly,
      maxMonthly,
      topTecnici,
    }
  }, [loggedIn])

  if (!loggedIn) return <LoginForm onLogin={handleLogin} error={loginError} />

  const { commissioni, totCommissioni, totLordo, totNetto, tecnici, clienti, bookings, monthly, maxMonthly, topTecnici } = data

  const paginatedJobs = commissioni
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(jobPage * JOB_PAGE_SIZE, (jobPage + 1) * JOB_PAGE_SIZE)

  const totalPages = Math.ceil(commissioni.length / JOB_PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header admin */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 rounded-xl p-2">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">ProntoTecnico Admin</div>
            <div className="text-blue-300 text-xs mt-0.5">Pannello di controllo</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition font-medium"
        >
          <LogOut size={15} /> Esci
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stat cards principali */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Euro size={22} className="text-green-600" />}
            label="Commissioni incassate"
            value={fmt(totCommissioni)}
            sub={`${commissioni.length} lavori completati`}
            color="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp size={22} className="text-blue-600" />}
            label="Volume totale transato"
            value={fmt(totLordo)}
            sub={`Netto tecnici: ${fmt(totNetto)}`}
            color="bg-blue-50"
          />
          <StatCard
            icon={<Users size={22} className="text-purple-600" />}
            label="Tecnici registrati"
            value={tecnici.length}
            sub={`${clienti.length} clienti`}
            color="bg-purple-50"
          />
          <StatCard
            icon={<Briefcase size={22} className="text-orange-500" />}
            label="Prenotazioni totali"
            value={bookings.length}
            sub={`${bookings.filter(b => b.stato === 'in_attesa').length} in attesa`}
            color="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Grafico entrate mensili */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-blue-600" />
                Commissioni mensili
              </h2>
              <span className="text-xs text-gray-400">Ultimi 12 mesi</span>
            </div>

            {totCommissioni === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <BarChart2 size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nessun dato disponibile ancora</p>
              </div>
            ) : (
              <MiniBarChart data={monthly} maxValue={maxMonthly} color="bg-blue-600" />
            )}

            {/* Sommario mensile */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="font-bold text-gray-900">{fmt(totCommissioni)}</div>
                <div className="text-xs text-gray-400">Totale commissioni</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">{fmt(totLordo)}</div>
                <div className="text-xs text-gray-400">Volume transato</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {totLordo > 0 ? `${(totCommissioni / totLordo * 100).toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-gray-400">Tasso commissione</div>
              </div>
            </div>
          </div>

          {/* Top tecnici per volume */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Top tecnici</h2>
            {topTecnici.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Nessun dato</p>
            ) : (
              <div className="space-y-3">
                {topTecnici.map((t, i) => (
                  <div key={t.nome} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.nome}</div>
                      <div className="text-xs text-gray-400">{t.count} lavori · {fmt(t.comm)} comm.</div>
                    </div>
                    <div className="text-sm font-bold text-gray-800 shrink-0">{fmt(t.lordo)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Distribuzione stati */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { stato: 'in_attesa',  label: 'In attesa',  color: 'bg-yellow-100 text-yellow-700' },
            { stato: 'confermata', label: 'Confermate', color: 'bg-blue-100 text-blue-700' },
            { stato: 'completata', label: 'Completate', color: 'bg-green-100 text-green-700' },
            { stato: 'archiviato', label: 'Archiviate', color: 'bg-gray-100 text-gray-600' },
            { stato: 'annullata',  label: 'Annullate',  color: 'bg-red-100 text-red-700' },
          ].map(s => (
            <div key={s.stato} className="card p-4 text-center">
              <div className={`badge ${s.color} text-xs mb-2 mx-auto`}>{s.label}</div>
              <div className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.stato === s.stato).length}
              </div>
            </div>
          ))}
        </div>

        {/* Lista lavori completati con commissioni */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">
              Lavori completati con commissione
              <span className="text-gray-400 font-normal text-base ml-2">({commissioni.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                Pagina {jobPage + 1} / {Math.max(totalPages, 1)}
              </div>
            </div>
          </div>

          {commissioni.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">Nessun lavoro completato ancora</p>
              <p className="text-sm mt-1">I lavori completati appariranno qui con la commissione calcolata</p>
            </div>
          ) : (
            <>
              {/* Intestazione tabella */}
              <div className="hidden md:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-3 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">
                <span>Servizio</span>
                <span>Tecnico · Cliente</span>
                <span className="text-right">Data</span>
                <span className="text-right">Lordo</span>
                <span className="text-right">Comm. 5%</span>
                <span className="text-right">Netto tecnico</span>
              </div>

              <div className="space-y-1">
                {paginatedJobs.map(b => (
                  <div
                    key={b.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-2 md:gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition text-sm border border-transparent hover:border-gray-100"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{b.servizio || '—'}</div>
                      <div className="text-xs text-gray-400 mt-0.5 md:hidden">
                        {b.tecnicoNome} · {fmtDate(b.dataIntervento)}
                      </div>
                    </div>
                    <div className="hidden md:block min-w-0">
                      <div className="font-medium text-gray-700 truncate">{b.tecnicoNome || '—'}</div>
                      <div className="text-xs text-gray-400 truncate">{b.clienteNome || '—'}</div>
                    </div>
                    <div className="hidden md:block text-right text-gray-500 text-xs self-center whitespace-nowrap">
                      {fmtDate(b.dataIntervento)}
                    </div>
                    <div className="text-right font-semibold text-gray-800 self-center">
                      <span className="md:hidden text-xs text-gray-400">Lordo: </span>
                      {fmt(b.lordo)}
                    </div>
                    <div className="text-right font-semibold text-green-700 self-center">
                      <span className="md:hidden text-xs text-gray-400">Comm: </span>
                      {fmt(b.comm)}
                    </div>
                    <div className="text-right font-semibold text-blue-700 self-center">
                      <span className="md:hidden text-xs text-gray-400">Netto: </span>
                      {fmt(b.netto)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setJobPage(p => Math.max(0, p - 1))}
                    disabled={jobPage === 0}
                    className="text-sm btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Precedente
                  </button>
                  <span className="text-xs text-gray-500">
                    {jobPage * JOB_PAGE_SIZE + 1}–{Math.min((jobPage + 1) * JOB_PAGE_SIZE, commissioni.length)} di {commissioni.length}
                  </span>
                  <button
                    onClick={() => setJobPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={jobPage >= totalPages - 1}
                    className="text-sm btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Successivo →
                  </button>
                </div>
              )}

              {/* Totali footer */}
              <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap justify-end gap-6 text-sm font-semibold">
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 font-normal">Volume totale:</span>
                  <span className="text-gray-800">{fmt(totLordo)}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 font-normal">Commissioni totali:</span>
                  <span className="text-green-700">{fmt(totCommissioni)}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 font-normal">Netto tecnici:</span>
                  <span className="text-blue-700">{fmt(totNetto)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Utenti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Users size={18} className="text-purple-600" /> Tecnici registrati ({tecnici.length})
            </h2>
            {tecnici.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nessun tecnico registrato</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tecnici.map(t => (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                      {(t.nome?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.nome} {t.cognome}</div>
                      <div className="text-xs text-gray-400 truncate">{t.email} · {t.specializzazione || '—'}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{fmtDate(t.createdAt?.slice(0, 10))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Clienti registrati ({clienti.length})
            </h2>
            {clienti.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nessun cliente registrato</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clienti.map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {(c.nome?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{c.nome} {c.cognome}</div>
                      <div className="text-xs text-gray-400 truncate">{c.email}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{fmtDate(c.createdAt?.slice(0, 10))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
