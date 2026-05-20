import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench, Zap, Eye, EyeOff, AlertCircle, User, HardHat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const specializzazioni = ['Idraulico', 'Elettricista', 'Idraulico & Elettricista', 'Caldaista', 'Climatizzazione']
const zone = ['Milano', 'Roma', 'Napoli', 'Torino', 'Bologna', 'Firenze', 'Venezia', 'Genova', 'Palermo', 'Bari', 'Altra città']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [ruolo, setRuolo] = useState('')
  const [form, setForm] = useState({
    nome: '', cognome: '', email: '', password: '', confermaPassword: '',
    specializzazione: '', certificazioni: '', zona: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const goToStep2 = e => {
    e.preventDefault()
    setError('')
    if (!ruolo) { setError('Seleziona il tipo di account'); return }
    if (form.password.length < 6) { setError('La password deve avere almeno 6 caratteri'); return }
    if (form.password !== form.confermaPassword) { setError('Le password non coincidono'); return }
    setStep(2)
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = register({ ...form, ruolo })
      navigate(ruolo === 'tecnico' ? '/dashboard/tecnico' : '/dashboard/cliente')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-2">
              <Wrench size={18} className="text-white" />
              <Zap size={18} className="text-orange-400" />
            </div>
            <span translate="no">Pronto</span><span translate="no" className="text-orange-400">Tecnico</span>
          </Link>
          <h1 className="text-white text-2xl font-bold mt-6">Crea il tuo account</h1>
          <p className="text-blue-200 mt-1">
            {step === 1 ? 'Informazioni personali' : ruolo === 'tecnico' ? 'Dati professionali' : 'Quasi fatto!'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-orange-400' : 'bg-white/20'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-orange-400' : 'bg-white/20'}`} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToStep2} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
                  <input
                    type="text" name="nome" value={form.nome} onChange={handle} required
                    placeholder="Mario"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cognome</label>
                  <input
                    type="text" name="cognome" value={form.cognome} onChange={handle} required
                    placeholder="Rossi"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handle} required
                  placeholder="mario.rossi@email.it"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handle} required placeholder="Minimo 6 caratteri"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Conferma Password</label>
                <input
                  type="password" name="confermaPassword" value={form.confermaPassword}
                  onChange={handle} required placeholder="Ripeti la password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di account</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRuolo('cliente')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      ruolo === 'cliente'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <User size={24} />
                    <span className="font-semibold text-sm">Cliente</span>
                    <span className="text-xs opacity-70">Cerco un tecnico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuolo('tecnico')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      ruolo === 'tecnico'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <HardHat size={24} />
                    <span className="font-semibold text-sm">Tecnico</span>
                    <span className="text-xs opacity-70">Offro servizi</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3 text-sm">
                Continua
              </button>
            </form>
          )}

          {step === 2 && ruolo === 'tecnico' && (
            <form onSubmit={submit} className="space-y-5">
              <p className="text-sm text-gray-500 -mt-1 mb-2">
                Compila i tuoi dati professionali per essere trovato dai clienti.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Specializzazione</label>
                <select
                  name="specializzazione" value={form.specializzazione} onChange={handle} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                >
                  <option value="">Seleziona specializzazione</option>
                  {specializzazioni.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Certificazioni</label>
                <input
                  type="text" name="certificazioni" value={form.certificazioni} onChange={handle}
                  placeholder="Es. Patentino gas, CIG, CEI 11-27..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zona di lavoro</label>
                <select
                  name="zona" value={form.zona} onChange={handle} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                >
                  <option value="">Seleziona città</option>
                  {zone.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 btn-secondary py-3 text-sm">
                  Indietro
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 btn-accent py-3 text-sm disabled:opacity-60">
                  {loading ? 'Registrazione...' : 'Completa Registrazione'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && ruolo === 'cliente' && (
            <form onSubmit={submit} className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Tutto pronto, {form.nome}!</h3>
                <p className="text-gray-500 text-sm">
                  Il tuo account cliente è configurato. Potrai iniziare subito a cercare tecnici qualificati vicino a te.
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 btn-secondary py-3 text-sm">
                  Indietro
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 btn-primary py-3 text-sm disabled:opacity-60">
                  {loading ? 'Registrazione...' : 'Crea Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Hai già un account?{' '}
            <Link to="/accedi" className="text-blue-700 font-semibold hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
