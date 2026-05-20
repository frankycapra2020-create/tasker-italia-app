import { useState } from 'react'
import { CheckCircle, AlertCircle, Phone, Clock, Shield, ChevronRight } from 'lucide-react'

const serviceOptions = [
  'Idraulica – perdita o rottura',
  'Idraulica – sblocco scarichi',
  'Idraulica – installazione sanitari',
  'Elettricità – guasto o corto circuito',
  'Elettricità – nuovo impianto',
  'Elettricità – aggiunta prese/punti luce',
  'Caldaia – manutenzione annuale',
  'Caldaia – guasto o riparazione',
  'Climatizzazione – installazione',
  'Climatizzazione – manutenzione',
  'Altro (da specificare)',
]

const urgencyOptions = [
  { value: 'urgente', label: '🚨 Urgente (entro 2 ore)', extra: '+€30 supplemento urgenza' },
  { value: 'oggi', label: '⏰ Oggi (entro la giornata)', extra: 'Disponibilità soggetta a tecnico' },
  { value: 'settimana', label: '📅 Questa settimana', extra: 'Prezzo standard' },
  { value: 'flessibile', label: '🗓️ Sono flessibile', extra: 'Migliore tariffa disponibile' },
]

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  service: '',
  urgency: '',
  description: '',
  acceptTerms: false,
}

export default function Booking() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Campo obbligatorio'
    if (!form.phone.trim()) e.phone = 'Campo obbligatorio'
    if (!form.email.includes('@')) e.email = 'Email non valida'
    if (!form.address.trim()) e.address = 'Campo obbligatorio'
    if (!form.city.trim()) e.city = 'Campo obbligatorio'
    if (!form.service) e.service = 'Seleziona un servizio'
    if (!form.urgency) e.urgency = 'Seleziona la tempistica'
    if (!form.acceptTerms) e.acceptTerms = 'Accetta i termini per continuare'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitted(true)
  }

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Richiesta inviata!</h2>
          <p className="text-gray-500 mb-6">
            Grazie <strong>{form.name}</strong>! Abbiamo ricevuto la tua richiesta per <em>{form.service}</em>.
            Un tecnico disponibile ti contatterà al <strong>{form.phone}</strong> entro breve.
          </p>
          <div className="bg-white rounded-2xl p-4 text-left text-sm mb-6 space-y-2 border border-gray-100">
            <div className="flex justify-between"><span className="text-gray-500">Servizio:</span><span className="font-medium">{form.service}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tempistica:</span><span className="font-medium">{urgencyOptions.find(o => o.value === form.urgency)?.label}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Città:</span><span className="font-medium">{form.city}</span></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-xl p-3">
            <Phone size={14} />
            Per emergenze immediate: <a href="tel:800123456" className="font-bold">800 123 456</a>
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm(initialForm) }}
            className="btn-secondary mt-6 text-sm py-2"
          >
            Nuova richiesta
          </button>
        </div>
      </div>
    )
  }

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )

  const inputClass = (field) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400' : 'border-gray-200'}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Richiedi un preventivo</h1>
        <p className="text-gray-500 text-lg">Gratuito e senza impegno. Risposta garantita entro 1 ora.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-8 space-y-6" noValidate>
            <h2 className="font-bold text-xl text-gray-900">I tuoi dati</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome e Cognome *" error={errors.name}>
                <input className={inputClass('name')} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Mario Rossi" />
              </Field>
              <Field label="Telefono *" error={errors.phone}>
                <input className={inputClass('phone')} type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+39 333 1234567" />
              </Field>
            </div>

            <Field label="Email *" error={errors.email}>
              <input className={inputClass('email')} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="mario@email.it" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Indirizzo *" error={errors.address}>
                <input className={inputClass('address')} value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Via Roma 42" />
              </Field>
              <Field label="Città *" error={errors.city}>
                <input className={inputClass('city')} value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="Milano" />
              </Field>
            </div>

            <hr className="border-gray-100" />
            <h2 className="font-bold text-xl text-gray-900">Il tuo problema</h2>

            <Field label="Tipo di servizio richiesto *" error={errors.service}>
              <select
                className={inputClass('service')}
                value={form.service}
                onChange={e => handleChange('service', e.target.value)}
              >
                <option value="">Seleziona un servizio...</option>
                {serviceOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="Quando hai bisogno dell'intervento? *" error={errors.urgency}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {urgencyOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${
                      form.urgency === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" name="urgency" value={opt.value} className="sr-only" onChange={() => handleChange('urgency', opt.value)} />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{opt.extra}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Descrizione del problema (opzionale)">
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Descrivi brevemente il problema, quando è iniziato, se ci sono stati episodi precedenti..."
              />
            </Field>

            <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${errors.acceptTerms ? 'border-red-400 bg-red-50' : 'border-transparent'}`}>
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={e => handleChange('acceptTerms', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#1a237e] flex-shrink-0"
              />
              <span className="text-sm text-gray-600">
                Accetto i <a href="#" className="text-blue-700 hover:underline">Termini di Servizio</a> e la{' '}
                <a href="#" className="text-blue-700 hover:underline">Informativa sulla Privacy</a> di ProntoTecnico (D.Lgs. 196/2003 e GDPR 2016/679) *
              </span>
            </label>
            {errors.acceptTerms && <p className="text-red-500 text-xs flex items-center gap-1 -mt-4"><AlertCircle size={11} />{errors.acceptTerms}</p>}

            <button type="submit" className="btn-accent w-full text-base py-4 flex items-center justify-center gap-2">
              Invia richiesta di preventivo <ChevronRight size={18} />
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Perché scegliere ProntoTecnico?</h3>
            <div className="space-y-4">
              {[
                { icon: <Shield size={18} className="text-blue-700" />, title: 'Tecnici verificati', desc: 'Ogni professionista è controllato: documenti, assicurazione e referenze.' },
                { icon: <Clock size={18} className="text-orange-500" />, title: 'Risposta in 1 ora', desc: 'Il nostro team trova il tecnico giusto per te in tempi record.' },
                { icon: <CheckCircle size={18} className="text-green-500" />, title: 'Preventivo gratuito', desc: 'Nessun costo nascosto. Il preventivo è sempre gratuito e senza impegno.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-red-500" />
              <h3 className="font-bold text-red-800">Emergenza?</h3>
            </div>
            <p className="text-sm text-red-700 mb-3">Per interventi urgenti (perdite, guasti, odore di gas) non aspettare il preventivo:</p>
            <a href="tel:800123456" className="btn-primary bg-red-600 hover:bg-red-700 w-full text-center text-sm py-3 flex items-center justify-center gap-2">
              <Phone size={15} /> Chiama ora: 800 123 456
            </a>
            <p className="text-xs text-red-500 mt-2 text-center">Disponibile 24/7 – 365 giorni l'anno</p>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Numeri di emergenza utili</h4>
            <div className="space-y-2 text-sm">
              {[
                { n: '112', label: 'Emergenze generali' },
                { n: '115', label: 'Vigili del fuoco' },
                { n: '118', label: 'Emergenza medica' },
                { n: '800 900 860', label: 'Gas: Segnalazione fughe' },
              ].map(e => (
                <div key={e.n} className="flex justify-between">
                  <span className="text-gray-500">{e.label}</span>
                  <a href={`tel:${e.n.replace(/\s/g, '')}`} className="font-bold text-blue-700 hover:text-blue-900">{e.n}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
