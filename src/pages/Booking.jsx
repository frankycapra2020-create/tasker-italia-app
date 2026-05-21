import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { technicians } from '../data/technicians'
import {
  Wrench, Zap, Thermometer, Wind, Star, MapPin, Clock,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Calendar, Phone,
} from 'lucide-react'

// ─── Dati di configurazione ──────────────────────────────────────────────────

const CATEGORIE = [
  {
    id: 'idraulica', label: 'Idraulica', Icon: Wrench,
    colorBorder: 'border-blue-300 bg-blue-50', colorIcon: 'bg-blue-100 text-blue-700', colorText: 'text-blue-700',
    tariffaBase: 65, range: '€60–120/ora',
    keywords: ['Idraulica', 'Termoidraulica'],
    servizi: ['Perdita o rottura tubo', 'Sblocco scarichi intasati', 'Installazione sanitari', 'Riparazione rubinetti', 'Manutenzione impianto idrico'],
  },
  {
    id: 'elettricità', label: 'Elettricità', Icon: Zap,
    colorBorder: 'border-yellow-300 bg-yellow-50', colorIcon: 'bg-yellow-100 text-yellow-700', colorText: 'text-yellow-700',
    tariffaBase: 60, range: '€50–100/ora',
    keywords: ['Elettricità', 'Domotica', 'Fotovoltaico'],
    servizi: ['Guasto o corto circuito', 'Nuovo impianto elettrico', 'Aggiunta prese/punti luce', 'Sostituzione quadro elettrico', 'Messa a norma impianto'],
  },
  {
    id: 'caldaia', label: 'Caldaia', Icon: Thermometer,
    colorBorder: 'border-red-300 bg-red-50', colorIcon: 'bg-red-100 text-red-700', colorText: 'text-red-700',
    tariffaBase: 65, range: '€60–100/ora',
    keywords: ['Caldaie', 'Termoidraulica'],
    servizi: ['Manutenzione annuale', 'Guasto o riparazione', 'Installazione nuova caldaia', 'Sostituzione componenti'],
  },
  {
    id: 'climatizzazione', label: 'Climatizzazione', Icon: Wind,
    colorBorder: 'border-cyan-300 bg-cyan-50', colorIcon: 'bg-cyan-100 text-cyan-700', colorText: 'text-cyan-700',
    tariffaBase: 60, range: '€55–90/ora',
    keywords: ['Climatizzazione'],
    servizi: ['Installazione climatizzatore', 'Manutenzione e pulizia', 'Ricarica gas refrigerante', 'Riparazione guasto'],
  },
]

const ORE_OPTIONS = [
  { value: 1, label: '1 ora' }, { value: 1.5, label: '1,5 ore' },
  { value: 2, label: '2 ore' }, { value: 3, label: '3 ore' },
  { value: 4, label: '4 ore' }, { value: 5, label: '5+ ore' },
]

const SLOTS_MATTINA = ['09:00', '10:00', '11:00', '12:00']
const SLOTS_POMERIGGIO = ['14:00', '15:00', '16:00', '17:00']

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
const GIORNI_BREVI = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']

// ─── Utilità ─────────────────────────────────────────────────────────────────

const formatDateIT = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}

const formatPrezzo = (n) => `€ ${Number.isInteger(n) ? n : n.toFixed(2)}`

// ─── Componenti interni ───────────────────────────────────────────────────────

function ErrMsg({ msg }) {
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle size={11} /> {msg}
    </p>
  )
}

function PreventivoBadge({ catInfo, oreStimate, urgenza, tecnico }) {
  const tariffa = tecnico?.pricePerHour ?? catInfo?.tariffaBase ?? 65
  const supplemento = urgenza === 'urgente' ? 30 : 0
  const totale = tariffa * oreStimate + supplemento

  return (
    <div className="card p-5 sticky top-20">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-orange-500">€</span> Stima preventivo
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tariffa oraria</span>
          <span className="font-medium">€{tariffa}/ora</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Ore stimate</span>
          <span className="font-medium">× {oreStimate}</span>
        </div>
        {supplemento > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Suppl. urgenza</span>
            <span className="font-medium">+ €{supplemento}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <span className="font-bold text-gray-900">Totale stimato</span>
          <span className="font-bold text-orange-600 text-lg">{formatPrezzo(totale)}</span>
        </div>
        {catInfo && (
          <p className="text-xs text-gray-400 mt-1">Range {catInfo.label}: {catInfo.range}</p>
        )}
      </div>
    </div>
  )
}

function Calendario({ tecnicoId, selected, onSelect, getOccupied }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const canPrev = year > today.getFullYear() || month > today.getMonth()

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const toISO = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const isDisabled = (d) => {
    const date = new Date(year, month, d)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart || date.getDay() === 0
  }

  const allSlots = [...SLOTS_MATTINA, ...SLOTS_POMERIGGIO]
  const hasSlots = (d) => {
    if (isDisabled(d)) return false
    return getOccupied(tecnicoId, toISO(d)).length < allSlots.length
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} disabled={!canPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-sm text-gray-800">{MESI[month]} {year}</span>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {GIORNI_BREVI.map(g => (
          <div key={g} className={`text-center text-xs font-semibold py-1 ${g === 'Do' ? 'text-gray-300' : 'text-gray-400'}`}>
            {g}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1
          const iso = toISO(d)
          const disabled = isDisabled(d)
          const isSun = new Date(year, month, d).getDay() === 0
          const isSelected = selected === iso

          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={[
                'relative h-9 w-full rounded-lg text-sm font-medium transition-all',
                disabled && !isSun ? 'text-gray-300 cursor-not-allowed' : '',
                isSun ? 'text-gray-200 cursor-not-allowed' : '',
                !disabled && !isSelected ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-600' : '',
                isSelected ? 'bg-orange-500 text-white shadow-md' : '',
              ].filter(Boolean).join(' ')}
            >
              {d}
              {!disabled && hasSlots(d) && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
              )}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
        Giorni disponibili &nbsp;·&nbsp; Domeniche chiuse
      </p>
    </div>
  )
}

// ─── Componente principale ────────────────────────────────────────────────────

export default function Booking() {
  const { user } = useAuth()
  const { addBooking, getOccupied } = useBooking()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [completedBooking, setCompletedBooking] = useState(null)
  const [errors, setErrors] = useState({})

  // Step 1
  const [categoria, setCategoria] = useState(null)
  const [servizio, setServizio] = useState('')
  const [oreStimate, setOreStimate] = useState(2)
  const [urgenza, setUrgenza] = useState('normale')
  const [indirizzo, setIndirizzo] = useState('')
  const [citta, setCitta] = useState('')
  const [descrizione, setDescrizione] = useState('')

  // Step 2
  const [tecnico, setTecnico] = useState(null)
  const [dataSelezionata, setDataSelezionata] = useState(null)
  const [oraSelezionata, setOraSelezionata] = useState(null)

  // Step 3
  const [nomeCliente, setNomeCliente] = useState(user ? `${user.nome} ${user.cognome}` : '')
  const [emailCliente, setEmailCliente] = useState(user?.email || '')
  const [telefono, setTelefono] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const catInfo = CATEGORIE.find(c => c.id === categoria)
  const tecniciFiltrati = catInfo
    ? technicians.filter(t => t.specializations.some(s => catInfo.keywords.includes(s)))
    : []
  const tariffa = tecnico?.pricePerHour ?? catInfo?.tariffaBase ?? 65
  const supplemento = urgenza === 'urgente' ? 30 : 0
  const totale = tariffa * oreStimate + supplemento
  const occupiedSlots = tecnico && dataSelezionata ? getOccupied(tecnico.id, dataSelezionata) : []

  // ── Validazione ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {}
    if (!categoria) {
      e.categoria = 'Seleziona una categoria per continuare'
    } else if (!servizio) {
      e.servizio = 'Seleziona il tipo di intervento'
    }
    if (!indirizzo.trim()) e.indirizzo = 'Campo obbligatorio'
    if (!citta.trim()) e.citta = 'Campo obbligatorio'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (!tecnico) e.tecnico = 'Seleziona un tecnico'
    if (!dataSelezionata) e.data = 'Seleziona una data'
    if (!oraSelezionata) e.ora = 'Seleziona un orario'
    return e
  }

  const validateStep3 = () => {
    const e = {}
    if (!user) {
      if (!nomeCliente.trim()) e.nome = 'Campo obbligatorio'
      if (!emailCliente.includes('@')) e.email = 'Email non valida'
    }
    if (!telefono.trim()) e.telefono = 'Campo obbligatorio'
    if (!acceptTerms) e.terms = 'Accetta i termini per continuare'
    return e
  }

  // ── Navigazione ────────────────────────────────────────────────────────────
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const avanti = () => {
    const errs = step === 1 ? validateStep1() : step === 2 ? validateStep2() : {}
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      scrollTop()
      return
    }
    setErrors({})
    setStep(s => s + 1)
    scrollTop()
  }

  const indietro = () => { setErrors({}); setStep(s => s - 1); scrollTop() }

  const handleCategoria = (id) => {
    setCategoria(id)
    setServizio('')
    setTecnico(null)
    setErrors(e => ({ ...e, categoria: undefined }))
  }

  const handleConferma = () => {
    const errs = validateStep3()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const booking = addBooking({
      clienteId: user?.id ?? null,
      clienteNome: user ? `${user.nome} ${user.cognome}` : nomeCliente,
      clienteEmail: user?.email ?? emailCliente,
      clienteTelefono: telefono,
      tecnicoId: tecnico.id,
      tecnicoNome: tecnico.name,
      tecnicoAvatar: tecnico.avatar,
      tecnicoAvatarColor: tecnico.avatarColor,
      categoria,
      servizio,
      oreStimate,
      urgenza,
      tariffa,
      supplemento,
      totaleStimato: totale,
      dataIntervento: dataSelezionata,
      oraIntervento: oraSelezionata,
      indirizzo: `${indirizzo}, ${citta}`,
      descrizione,
    })
    setCompletedBooking(booking)
  }

  const resetForm = () => {
    setStep(1); setCompletedBooking(null)
    setCategoria(null); setServizio(''); setOreStimate(2); setUrgenza('normale')
    setIndirizzo(''); setCitta(''); setDescrizione('')
    setTecnico(null); setDataSelezionata(null); setOraSelezionata(null)
    setTelefono(''); setAcceptTerms(false); setErrors({})
  }

  // ── Schermata di successo ──────────────────────────────────────────────────
  if (completedBooking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Prenotazione inviata!</h2>
          <p className="text-gray-500 mb-5">Il tecnico riceverà la tua richiesta e confermerà l'appuntamento a breve.</p>
          <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-6">
            <span className="text-xs text-gray-500 block">Codice prenotazione</span>
            <span className="font-bold text-orange-600 text-xl tracking-wider">{completedBooking.id}</span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 text-left text-sm space-y-2.5 mb-6 border border-gray-100">
            {[
              ['Servizio', completedBooking.servizio],
              ['Tecnico', completedBooking.tecnicoNome],
              ['Data', `${formatDateIT(completedBooking.dataIntervento)} alle ${completedBooking.oraIntervento}`],
              ['Indirizzo', completedBooking.indirizzo],
              ['Totale stimato', formatPrezzo(completedBooking.totaleStimato)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">{k}</span>
                <span className="font-medium text-gray-800 text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <button onClick={() => navigate('/dashboard/cliente')} className="btn-accent py-3 px-6">
                Vai alle mie prenotazioni
              </button>
            ) : (
              <button onClick={() => navigate('/accedi')} className="btn-primary py-3 px-6">
                Accedi per gestire le prenotazioni
              </button>
            )}
            <button onClick={resetForm} className="btn-secondary py-3 px-6">
              Nuova prenotazione
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Indicatore di step ─────────────────────────────────────────────────────
  const STEPS = [
    { n: 1, label: 'Servizio' },
    { n: 2, label: 'Tecnico e data' },
    { n: 3, label: 'Conferma' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prenota un intervento</h1>
        <p className="text-gray-500">Preventivo immediato · Tecnici verificati · Conferma in pochi minuti</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > n ? 'bg-green-500 text-white' : step === n ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > n ? <CheckCircle size={16} /> : n}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === n ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-16 mx-1 transition-colors ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════ STEP 1 ════════════════════════════════ */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Categoria */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-1">Che tipo di intervento ti serve?</h2>
              <p className="text-sm text-gray-500 mb-4">Seleziona la categoria del problema</p>
              {errors.categoria && <ErrMsg msg={errors.categoria} />}
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIE.map(({ id, label, Icon, colorBorder, colorIcon, colorText, range }) => {
                  const sel = categoria === id
                  return (
                    <button
                      key={id}
                      onClick={() => handleCategoria(id)}
                      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                        sel ? colorBorder : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${sel ? colorIcon : 'bg-gray-100'}`}>
                        <Icon size={22} className={sel ? '' : 'text-gray-500'} />
                      </div>
                      <span className={`font-semibold text-sm ${sel ? colorText : 'text-gray-700'}`}>{label}</span>
                      <span className="text-xs text-gray-400">{range}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Servizio specifico */}
            {catInfo && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Di cosa hai bisogno?</h2>
                {errors.servizio && <ErrMsg msg={errors.servizio} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catInfo.servizi.map(s => (
                    <button
                      key={s}
                      onClick={() => { setServizio(s); setErrors(e => ({ ...e, servizio: undefined })) }}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        servizio === s
                          ? 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-gray-100 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Durata stimata */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-1">Durata stimata dell'intervento</h2>
              <p className="text-sm text-gray-500 mb-4">Il tecnico potrà aggiornare la stima prima di iniziare</p>
              <div className="flex flex-wrap gap-2">
                {ORE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setOreStimate(value)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      oreStimate === value
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-gray-100 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgenza */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Quando hai bisogno del tecnico?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'normale', label: 'Programmato', desc: 'Scelgo io data e ora', extra: 'Tariffa standard', extraClass: 'text-gray-500', selClass: 'border-blue-400 bg-blue-50' },
                  { value: 'urgente', label: '🚨 Urgente', desc: 'Entro 2 ore', extra: '+€30 supplemento urgenza', extraClass: 'text-red-600', selClass: 'border-red-400 bg-red-50' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgenza(opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      urgenza === opt.value ? opt.selClass : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    <div className={`text-xs font-medium mt-1.5 ${opt.extraClass}`}>{opt.extra}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Indirizzo */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Dove si trova il problema?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Via / Indirizzo *</label>
                  <input
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.indirizzo ? 'border-red-400' : 'border-gray-200'}`}
                    value={indirizzo}
                    onChange={e => { setIndirizzo(e.target.value); setErrors(er => ({ ...er, indirizzo: undefined })) }}
                    placeholder="Via Roma 42"
                  />
                  {errors.indirizzo && <ErrMsg msg={errors.indirizzo} />}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Città *</label>
                  <input
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.citta ? 'border-red-400' : 'border-gray-200'}`}
                    value={citta}
                    onChange={e => { setCitta(e.target.value); setErrors(er => ({ ...er, citta: undefined })) }}
                    placeholder="Milano"
                  />
                  {errors.citta && <ErrMsg msg={errors.citta} />}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrizione (opzionale)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={descrizione}
                  onChange={e => setDescrizione(e.target.value)}
                  placeholder="Descrivi brevemente il problema..."
                />
              </div>
            </div>

            <button onClick={avanti} className="btn-accent w-full py-4 text-base flex items-center justify-center gap-2">
              Continua – Scegli tecnico e data <ChevronRight size={18} />
            </button>
          </div>

          <div>
            <PreventivoBadge catInfo={catInfo} oreStimate={oreStimate} urgenza={urgenza} tecnico={null} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════ STEP 2 ════════════════════════════════ */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Scelta tecnico */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-1">Scegli il tecnico</h2>
              <p className="text-sm text-gray-500 mb-4">Tecnici disponibili per {catInfo?.label}</p>
              {errors.tecnico && <ErrMsg msg={errors.tecnico} />}
              {tecniciFiltrati.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Nessun tecnico disponibile per questa categoria al momento.</p>
              )}
              <div className="space-y-3">
                {tecniciFiltrati.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTecnico(t)
                      setDataSelezionata(null)
                      setOraSelezionata(null)
                      setErrors(e => ({ ...e, tecnico: undefined }))
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      tecnico?.id === t.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${t.avatarColor}`}>
                        {t.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-800 text-sm">{t.name}</span>
                          <span className={`text-sm font-bold shrink-0 ${tecnico?.id === t.id ? 'text-orange-600' : 'text-gray-700'}`}>
                            €{t.pricePerHour}/ora
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star size={11} className="text-yellow-400" fill="currentColor" />
                            {t.rating} ({t.reviews})
                          </span>
                          <span className="flex items-center gap-1"><MapPin size={11} />{t.location.split(',')[0]}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{t.responseTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.specializations.map(s => (
                            <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>
                          ))}
                          {!t.available && <span className="badge bg-amber-100 text-amber-700 text-xs">Limitata disponibilità</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendario */}
            {tecnico && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-1">Scegli la data</h2>
                <p className="text-sm text-gray-500 mb-4">I punti verdi indicano i giorni con disponibilità</p>
                {errors.data && <ErrMsg msg={errors.data} />}
                <Calendario
                  tecnicoId={tecnico.id}
                  selected={dataSelezionata}
                  onSelect={(d) => {
                    setDataSelezionata(d)
                    setOraSelezionata(null)
                    setErrors(e => ({ ...e, data: undefined }))
                  }}
                  getOccupied={getOccupied}
                />
              </div>
            )}

            {/* Slot orari */}
            {dataSelezionata && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-1">Scegli l'orario</h2>
                <p className="text-sm text-gray-500 mb-4">{formatDateIT(dataSelezionata)}</p>
                {errors.ora && <ErrMsg msg={errors.ora} />}
                <div className="space-y-4">
                  {[
                    { label: 'Mattina', slots: SLOTS_MATTINA },
                    { label: 'Pomeriggio', slots: SLOTS_POMERIGGIO },
                  ].map(({ label, slots }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map(slot => {
                          const taken = occupiedSlots.includes(slot)
                          const sel = oraSelezionata === slot
                          return (
                            <button
                              key={slot}
                              disabled={taken}
                              onClick={() => {
                                setOraSelezionata(slot)
                                setErrors(e => ({ ...e, ora: undefined }))
                              }}
                              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                taken
                                  ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                  : sel
                                  ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                                  : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                              }`}
                            >
                              {taken ? '—' : slot}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={indietro} className="btn-secondary flex items-center gap-2 py-4 px-6">
                <ChevronLeft size={16} /> Indietro
              </button>
              <button onClick={avanti} className="btn-accent flex-1 py-4 flex items-center justify-center gap-2">
                Continua – Conferma preventivo <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <PreventivoBadge catInfo={catInfo} oreStimate={oreStimate} urgenza={urgenza} tecnico={tecnico} />
            {tecnico && dataSelezionata && oraSelezionata && (
              <div className="card p-5 bg-blue-50 border-blue-100">
                <h3 className="font-semibold text-blue-900 text-sm mb-3">Appuntamento selezionato</h3>
                <div className="text-sm space-y-2 text-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" />
                    {formatDateIT(dataSelezionata)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0" />
                    ore {oraSelezionata}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0 ${tecnico.avatarColor}`}>
                      {tecnico.avatar[0]}
                    </div>
                    {tecnico.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════ STEP 3 ════════════════════════════════ */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Riepilogo intervento */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Riepilogo prenotazione</h2>
              <div className="divide-y divide-gray-50">
                {[
                  ['Servizio', servizio],
                  ['Tecnico', `${tecnico?.name} · ${tecnico?.location}`],
                  ['Data e ora', `${formatDateIT(dataSelezionata)} alle ${oraSelezionata}`],
                  ['Indirizzo intervento', `${indirizzo}, ${citta}`],
                  ['Durata stimata', `${oreStimate} ${oreStimate === 1 ? 'ora' : 'ore'}`],
                  ['Tipo intervento', urgenza === 'urgente' ? '🚨 Urgente' : 'Programmato'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                    <span className="text-gray-500 shrink-0">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preventivo economico */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Preventivo economico</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tariffa oraria ({tecnico?.name})</span>
                  <span className="font-medium">€{tariffa}/ora</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ore stimate</span>
                  <span className="font-medium">× {oreStimate}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotale</span>
                  <span className="font-medium">{formatPrezzo(tariffa * oreStimate)}</span>
                </div>
                {supplemento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Supplemento urgenza</span>
                    <span className="font-medium">+ €{supplemento}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                  <span className="font-bold text-gray-900">Totale stimato</span>
                  <span className="font-bold text-orange-600 text-xl">{formatPrezzo(totale)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * Stima non vincolante. Il tecnico potrà aggiornare il preventivo prima dell'intervento.
              </p>
            </div>

            {/* Dati di contatto */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Dati di contatto</h2>

              {user ? (
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3 text-sm border border-blue-100">
                  <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.nome[0]}{user.cognome[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.nome} {user.cognome}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome e Cognome *</label>
                    <input
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-400' : 'border-gray-200'}`}
                      value={nomeCliente}
                      onChange={e => { setNomeCliente(e.target.value); setErrors(er => ({ ...er, nome: undefined })) }}
                      placeholder="Mario Rossi"
                    />
                    {errors.nome && <ErrMsg msg={errors.nome} />}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                      value={emailCliente}
                      onChange={e => { setEmailCliente(e.target.value); setErrors(er => ({ ...er, email: undefined })) }}
                      placeholder="mario@email.it"
                    />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Phone size={13} className="inline mr-1" />
                  Numero di telefono *
                </label>
                <input
                  type="tel"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefono ? 'border-red-400' : 'border-gray-200'}`}
                  value={telefono}
                  onChange={e => { setTelefono(e.target.value); setErrors(er => ({ ...er, telefono: undefined })) }}
                  placeholder="+39 333 1234567"
                />
                {errors.telefono && <ErrMsg msg={errors.telefono} />}
              </div>
            </div>

            {/* Termini */}
            <div className={`rounded-xl border p-4 transition-colors ${errors.terms ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => { setAcceptTerms(e.target.checked); setErrors(er => ({ ...er, terms: undefined })) }}
                  className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
                />
                <span className="text-sm text-gray-600">
                  Accetto i <a href="#" className="text-blue-700 hover:underline">Termini di Servizio</a> e la{' '}
                  <a href="#" className="text-blue-700 hover:underline">Privacy Policy</a> di ProntoTecnico (GDPR 2016/679) *
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.terms}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={indietro} className="btn-secondary flex items-center gap-2 py-4 px-6">
                <ChevronLeft size={16} /> Indietro
              </button>
              <button onClick={handleConferma} className="btn-accent flex-1 py-4 flex items-center justify-center gap-2 text-base">
                Conferma prenotazione <CheckCircle size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <PreventivoBadge catInfo={catInfo} oreStimate={oreStimate} urgenza={urgenza} tecnico={tecnico} />
            {tecnico && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Il tuo tecnico</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${tecnico.avatarColor}`}>
                    {tecnico.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{tecnico.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Star size={11} className="text-yellow-400" fill="currentColor" />
                      {tecnico.rating} · {tecnico.completedJobs} lavori completati
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{tecnico.location}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
