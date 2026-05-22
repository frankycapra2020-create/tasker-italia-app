import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useReview } from '../context/ReviewContext'
import { useChat } from '../context/ChatContext'
import { useNotifiche } from '../hooks/useNotifiche'
import { useLocation } from 'react-router-dom'
import ReviewCard from '../components/ReviewCard'
import ChatWindow from '../components/ChatWindow'
import { Briefcase, Star, Euro, MapPin, Award, Clock, TrendingUp, CheckCircle, Wrench, Zap, Calendar, Check, X, AlertCircle, MessageSquare, Bell, Navigation, Tag, Plus, Trash2, Percent, Camera, Phone, FileText, User, Eye, EyeOff } from 'lucide-react'

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
const formatDateIT = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}
const formatMsgTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString())
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getDate()} ${MESI[d.getMonth()]}`
}

const STATO_STYLE = {
  in_attesa:  { badge: 'bg-yellow-100 text-yellow-700', label: 'In attesa' },
  confermata: { badge: 'bg-blue-100 text-blue-700',    label: 'Confermata' },
  completata: { badge: 'bg-green-100 text-green-700',  label: 'Completata' },
  annullata:  { badge: 'bg-red-100 text-red-700',      label: 'Annullata' },
  archiviato: { badge: 'bg-gray-100 text-gray-500',    label: 'Archiviato' },
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

const SPECIALIZZAZIONI_LIST = ['Idraulico', 'Elettricista', 'Caldaista', 'Climatizzazione']

const TABS = ['Nuove richieste', 'Miei interventi', 'Recensioni', 'Messaggi', 'Tariffe', 'Disponibilità', 'Profilo']

const GIORNI_SETTIMANA = [
  { key: 'lun', label: 'Lunedì' },
  { key: 'mar', label: 'Martedì' },
  { key: 'mer', label: 'Mercoledì' },
  { key: 'gio', label: 'Giovedì' },
  { key: 'ven', label: 'Venerdì' },
  { key: 'sab', label: 'Sabato' },
  { key: 'dom', label: 'Domenica' },
]

const DEFAULT_DISP = {
  lun: { attivo: true, inizio: '08:00', fine: '18:00' },
  mar: { attivo: true, inizio: '08:00', fine: '18:00' },
  mer: { attivo: true, inizio: '08:00', fine: '18:00' },
  gio: { attivo: true, inizio: '08:00', fine: '18:00' },
  ven: { attivo: true, inizio: '08:00', fine: '18:00' },
  sab: { attivo: false, inizio: '09:00', fine: '13:00' },
  dom: { attivo: false, inizio: '09:00', fine: '13:00' },
}

const CAMPI_TARIFFE = [
  { key: 'oraria',            label: 'Tariffa oraria',              unit: '€/ora', Icon: Euro,    desc: 'Costo per ogni ora di lavoro',          min: 20, max: 300, step: 5  },
  { key: 'chiamata',          label: 'Costo fisso chiamata',        unit: '€',     Icon: MapPin,  desc: 'Costo fisso per ogni uscita/intervento', min: 0,  max: 150, step: 5  },
  { key: 'urgenzaExtra',      label: 'Supplemento urgenza',         unit: '€',     Icon: AlertCircle, desc: 'Extra fisso per interventi urgenti',  min: 0,  max: 100, step: 5  },
  { key: 'festiviPerc',       label: 'Supplemento festivi/notturni',unit: '%',     Icon: Percent, desc: 'Percentuale aggiuntiva su festivi e notturni', min: 0, max: 100, step: 5 },
  { key: 'minimoIntervento',  label: 'Tariffa minima intervento',   unit: '€',     Icon: TrendingUp, desc: 'Importo minimo addebitato per ogni lavoro', min: 0, max: 300, step: 10 },
]

function ProfiloTab({ user, updateUser }) {
  const fileRef = useRef(null)
  const [foto, setFoto] = useState(user.foto || null)
  const [nome, setNome] = useState(user.nome || '')
  const [cognome, setCognome] = useState(user.cognome || '')
  const [telefono, setTelefono] = useState(user.telefono || '')
  const [citta, setCitta] = useState(user.zona || '')
  const [bio, setBio] = useState(user.bio || '')
  const [specs, setSpecs] = useState(() => {
    if (Array.isArray(user.specializzazioni) && user.specializzazioni.length) return user.specializzazioni
    if (user.specializzazione) return [user.specializzazione]
    return []
  })
  const [anniEsperienza, setAnniEsperienza] = useState(user.anniEsperienza ?? '')
  const [tariffaOraria, setTariffaOraria] = useState(user.tariffe?.oraria ?? 65)
  const [raggioKm, setRaggioKm] = useState(user.raggioOperativo ?? 50)
  const [saved, setSaved] = useState(false)
  const [fotoError, setFotoError] = useState('')

  const handleFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFotoError('Immagine troppo grande. Usa un file inferiore a 2 MB.')
      return
    }
    setFotoError('')
    const reader = new FileReader()
    reader.onload = (ev) => setFoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const toggleSpec = (spec) =>
    setSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])

  const handleSave = () => {
    const specPrimaria = specs.length > 0 ? specs.join(' & ') : (user.specializzazione || '')
    updateUser({
      foto,
      nome: nome.trim() || user.nome,
      cognome: cognome.trim() || user.cognome,
      telefono: telefono.trim(),
      zona: citta.trim() || user.zona,
      bio: bio.trim(),
      specializzazioni: specs,
      specializzazione: specPrimaria,
      anniEsperienza: anniEsperienza !== '' ? Number(anniEsperienza) : 0,
      raggioOperativo: raggioKm,
      tariffe: { ...(user.tariffe || {}), oraria: tariffaOraria },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const avatarInitials = `${(nome[0] || user.nome[0] || '?').toUpperCase()}${(cognome[0] || user.cognome[0] || '').toUpperCase()}`

  return (
    <div className="space-y-7">
      {/* Foto profilo */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={15} className="text-orange-500" /> Foto profilo
        </h3>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center border border-gray-200">
              {foto
                ? <img src={foto} alt="profilo" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-orange-600">{avatarInitials}</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-md transition"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm py-2 px-4">
              Cambia foto
            </button>
            {foto && (
              <button onClick={() => setFoto(null)} className="block mt-2 text-xs text-red-500 hover:text-red-700 transition">
                Rimuovi foto
              </button>
            )}
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG — max 2 MB</p>
            {fotoError && <p className="text-xs text-red-500 mt-1">{fotoError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </div>
      </div>

      {/* Dati personali */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={15} className="text-blue-500" /> Dati personali
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Mario"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Cognome</label>
            <input
              type="text"
              value={cognome}
              onChange={e => setCognome(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Rossi"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <Phone size={11} /> Telefono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="+39 333 123 4567"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <MapPin size={11} /> Città / Zona operativa
            </label>
            <input
              type="text"
              value={citta}
              onChange={e => setCitta(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Milano"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <Briefcase size={11} /> Anni di esperienza
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={anniEsperienza}
              onChange={e => setAnniEsperienza(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Es. 10"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <FileText size={15} className="text-green-500" /> Descrizione professionale
        </h3>
        <p className="text-xs text-gray-400 mb-3">Raccontati ai clienti: esperienza, punti di forza, aree di specializzazione</p>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="Es. Tecnico con 15 anni di esperienza in impianti idraulici residenziali e commerciali…"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
      </div>

      {/* Specializzazioni */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Award size={15} className="text-orange-500" /> Specializzazioni
        </h3>
        <p className="text-xs text-gray-400 mb-3">Seleziona le tue aree di competenza (una o più)</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZZAZIONI_LIST.map(spec => {
            const sel = specs.includes(spec)
            return (
              <button
                key={spec}
                onClick={() => toggleSpec(spec)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  sel
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {SPEC_ICON[spec]}
                {spec}
                {sel && <CheckCircle size={13} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tariffa oraria */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Euro size={15} className="text-green-500" /> Tariffa oraria
        </h3>
        <p className="text-xs text-gray-400 mb-3">La tariffa base visibile sul tuo profilo pubblico</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="500"
            value={tariffaOraria}
            onChange={e => setTariffaOraria(Number(e.target.value))}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="text-sm text-gray-500 font-medium">€/ora</span>
        </div>
      </div>

      {/* Raggio operativo */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Navigation size={15} className="text-orange-500" /> Raggio operativo
        </h3>
        <p className="text-xs text-gray-400 mb-3">Accetti lavori entro questa distanza dalla tua zona</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Distanza massima</span>
          <span className="font-bold text-orange-600 text-sm">{raggioKm} km</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={raggioKm}
          onChange={e => setRaggioKm(Number(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Salva */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="btn-accent py-2.5 px-6 text-sm flex items-center gap-2"
        >
          <CheckCircle size={15} /> Salva modifiche
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle size={14} /> Profilo aggiornato!
          </span>
        )}
      </div>
    </div>
  )
}

function TariffeTab({ user, updateUser }) {
  const initTariffe = {
    oraria:           user.tariffe?.oraria           ?? 65,
    chiamata:         user.tariffe?.chiamata          ?? 25,
    urgenzaExtra:     user.tariffe?.urgenzaExtra      ?? 30,
    festiviPerc:      user.tariffe?.festiviPerc       ?? 30,
    minimoIntervento: user.tariffe?.minimoIntervento  ?? 80,
    servizi:          user.tariffe?.servizi           ?? [],
  }
  const [tariffe, setTariffe] = useState(initTariffe)
  const [saved, setSaved]     = useState(false)
  const [nomeNuovo, setNomeNuovo]   = useState('')
  const [prezzoNuovo, setPrezzoNuovo] = useState('')

  const setField = (key, val) =>
    setTariffe(t => ({ ...t, [key]: Number(val) }))

  const handleSave = () => {
    updateUser({ tariffe })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addServizio = () => {
    if (!nomeNuovo.trim()) return
    setTariffe(t => ({
      ...t,
      servizi: [...t.servizi, {
        nome: nomeNuovo.trim(),
        prezzo: prezzoNuovo !== '' ? Number(prezzoNuovo) : null,
      }],
    }))
    setNomeNuovo('')
    setPrezzoNuovo('')
  }

  const removeServizio = (idx) =>
    setTariffe(t => ({ ...t, servizi: t.servizi.filter((_, i) => i !== idx) }))

  const updateServizio = (idx, field, val) =>
    setTariffe(t => ({
      ...t,
      servizi: t.servizi.map((s, i) =>
        i !== idx ? s : {
          ...s,
          [field]: field === 'prezzo'
            ? (val === '' ? null : Number(val))
            : val,
        }
      ),
    }))

  return (
    <div className="space-y-7">
      {/* Tariffe base */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Euro size={15} className="text-orange-500" /> Tariffe base
        </h3>
        <div className="space-y-4">
          {CAMPI_TARIFFE.map(({ key, label, unit, Icon, desc, min, max, step }) => (
            <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={tariffe[key]}
                    onChange={e => setField(key, e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-xs text-gray-500 font-medium w-10">{unit}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{desc}</p>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={tariffe[key]}
                onChange={e => setField(key, e.target.value)}
                className="w-full accent-orange-500 cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                <span>{min}{unit === '%' ? '%' : ' €'}</span>
                <span>{max}{unit === '%' ? '%' : ' €'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tariffe per servizio */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Tag size={15} className="text-blue-500" /> Tariffe per servizio
        </h3>
        <p className="text-xs text-gray-400 mb-4">Prezzi fissi per interventi specifici — visibili ai clienti sul tuo profilo</p>

        {tariffe.servizi.length > 0 && (
          <div className="space-y-2 mb-3">
            {tariffe.servizi.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <input
                  className="flex-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none min-w-0"
                  value={s.nome}
                  onChange={e => updateServizio(i, 'nome', e.target.value)}
                  placeholder="Nome servizio"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400">€</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={s.prezzo ?? ''}
                    onChange={e => updateServizio(i, 'prezzo', e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  onClick={() => removeServizio(i)}
                  className="p-1 text-gray-300 hover:text-red-500 transition shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Aggiungi servizio */}
        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
            placeholder="Nome servizio (es. Sostituzione rubinetto)"
            value={nomeNuovo}
            onChange={e => setNomeNuovo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addServizio()}
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-gray-400">€</span>
            <input
              type="number"
              min="0"
              placeholder="prezzo"
              value={prezzoNuovo}
              onChange={e => setPrezzoNuovo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addServizio()}
              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            onClick={addServizio}
            className="shrink-0 p-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition"
            title="Aggiungi servizio"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Salva */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="btn-accent py-2.5 px-6 text-sm flex items-center gap-2"
        >
          <CheckCircle size={15} /> Salva tariffe
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle size={14} /> Tariffe salvate con successo!
          </span>
        )}
      </div>
    </div>
  )
}

function DisponibilitaTab({ user, updateUser }) {
  const [disp, setDisp] = useState(user.disponibilita ?? DEFAULT_DISP)
  const [disponibileOra, setDisponibileOra] = useState(user.disponibileOra !== false)
  const [saved, setSaved] = useState(false)

  const toggleGiorno = (key) =>
    setDisp(d => ({ ...d, [key]: { ...d[key], attivo: !d[key].attivo } }))

  const setOrario = (key, field, val) =>
    setDisp(d => ({ ...d, [key]: { ...d[key], [field]: val } }))

  const handleSave = () => {
    updateUser({ disponibilita: disp, disponibileOra })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Calendar size={15} className="text-blue-500" /> Orari di lavoro settimanali
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Imposta i giorni e gli orari in cui sei disponibile. I clienti vedranno solo gli slot compatibili nel calendario di prenotazione.
        </p>
        <div className="space-y-2">
          {GIORNI_SETTIMANA.map(({ key, label }) => {
            const g = disp[key]
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  g.attivo ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <button
                  onClick={() => toggleGiorno(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                    g.attivo ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={g.attivo ? 'Disabilita' : 'Abilita'}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      g.attivo ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className={`w-20 text-sm font-medium shrink-0 ${g.attivo ? 'text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </span>
                {g.attivo ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <input
                      type="time"
                      value={g.inizio}
                      onChange={e => setOrario(key, 'inizio', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-xs text-gray-400">–</span>
                    <input
                      type="time"
                      value={g.fine}
                      onChange={e => setOrario(key, 'fine', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic flex-1">Non disponibile</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Disponibile ora */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {disponibileOra
                ? <Eye size={14} className="text-green-600 shrink-0" />
                : <EyeOff size={14} className="text-gray-400 shrink-0" />
              }
              <span className="text-sm font-semibold text-gray-700">Disponibile ora</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {disponibileOra
                ? 'Il tuo profilo mostra "● Disponibile ora" ai clienti'
                : 'Il tuo profilo mostra "● Limitata disponibilità" ai clienti'
              }
            </p>
          </div>
          <button
            onClick={() => setDisponibileOra(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${disponibileOra ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-label="Disponibile ora"
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${disponibileOra ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          className="btn-accent py-2.5 px-6 text-sm flex items-center gap-2"
        >
          <CheckCircle size={15} /> Salva disponibilità
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle size={14} /> Disponibilità salvata!
          </span>
        )}
      </div>
    </div>
  )
}

export default function DashboardTecnico() {
  const { user, logout, updateUser } = useAuth()
  const location = useLocation()
  const erroreAccesso = location.state?.errore || null
  const { getPending, getByTecnico, updateBooking } = useBooking()
  const { getByBookingIds, addReply, getAvgRating } = useReview()
  const { getUnread, getLastMessage, getTotalUnread } = useChat()
  const [tab, setTab] = useState(0)
  const [chatBookingId, setChatBookingId] = useState(null)
  const [raggioKm, setRaggioKm] = useState(user.raggioOperativo ?? 50)

  const handleRaggioChange = (val) => {
    setRaggioKm(val)
    updateUser({ raggioOperativo: val })
  }

  const pendingAll = getPending().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const miei = getByTecnico(user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const myBookingIds = miei.map(b => b.id)
  const myReviews = getByBookingIds(myBookingIds).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const completati = miei.filter(b => b.stato === 'completata' || b.stato === 'archiviato')

  const now = new Date()
  const guadagniMese = completati
    .filter(b => {
      const d = new Date(b.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + (b.totaleStimato ?? 0), 0)

  const todayISO = now.toISOString().slice(0, 10)
  const prossimiApp = [...miei]
    .filter(b => b.stato === 'confermata' && b.dataIntervento >= todayISO)
    .sort((a, b) => a.dataIntervento.localeCompare(b.dataIntervento))

  const avgRating = getAvgRating(null)
  const avgFromReviews = myReviews.length > 0
    ? myReviews.reduce((s, r) => s + r.stelle, 0) / myReviews.length
    : null

  const accetta = (id) => updateBooking(id, { stato: 'confermata', confermatoDa: user.id })
  const rifiuta = (id) => {
    if (confirm('Vuoi rifiutare questa richiesta?')) updateBooking(id, { stato: 'annullata' })
  }
  const completa = (id) => updateBooking(id, { stato: 'completata' })

  const totalUnread = getTotalUnread(miei.map(b => b.id), user.id)

  // Sort miei bookings by last message time for Messaggi tab
  const mieiConChat = [...miei].sort((a, b) => {
    const la = getLastMessage(a.id)?.createdAt || a.createdAt
    const lb = getLastMessage(b.id)?.createdAt || b.createdAt
    return new Date(lb) - new Date(la)
  })

  const chatBooking = chatBookingId ? miei.find(b => b.id === chatBookingId) : null

  const { permission: notifPerm, requestPermission, supported: notifSupported } = useNotifiche(user, miei, chatBookingId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {chatBooking && (
        <ChatWindow
          booking={chatBooking}
          currentUser={user}
          onClose={() => setChatBookingId(null)}
        />
      )}
      {erroreAccesso && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">{erroreAccesso}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {user.foto
            ? <img src={user.foto} alt="profilo" className="w-12 h-12 rounded-xl object-cover shrink-0" />
            : <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center font-bold text-orange-600 text-lg shrink-0">
                {user.nome[0]}{user.cognome[0]}
              </div>
          }
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
          { icon: <Briefcase size={20} className="text-blue-600" />,    label: 'Lavori completati',  value: completati.length, bg: 'bg-blue-50' },
          { icon: <Euro size={20} className="text-green-600" />,        label: 'Guadagni del mese',  value: guadagniMese > 0 ? `€ ${guadagniMese}` : '€ 0', bg: 'bg-green-50' },
          { icon: <Star size={20} className="text-yellow-500" fill={avgFromReviews !== null ? 'currentColor' : 'none'} />, label: 'Valutazione media', value: avgFromReviews !== null ? `${avgFromReviews.toFixed(1)} ★` : '—', bg: 'bg-yellow-50' },
          { icon: <TrendingUp size={20} className="text-orange-500" />, label: 'Nuove richieste',    value: pendingAll.length, bg: 'bg-orange-50' },
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
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors relative whitespace-nowrap px-2 ${
                    tab === i ? 'text-blue-800' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t}
                  {i === 0 && pendingAll.length > 0 && (
                    <span className="ml-1.5 badge bg-red-100 text-red-600 text-xs">{pendingAll.length}</span>
                  )}
                  {i === 2 && myReviews.length > 0 && (
                    <span className="ml-1.5 badge bg-yellow-100 text-yellow-700 text-xs">{myReviews.length}</span>
                  )}
                  {i === 3 && totalUnread > 0 && (
                    <span className="ml-1.5 badge bg-red-500 text-white text-xs">{totalUnread}</span>
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

              {/* Tab 3: Messaggi */}
              {tab === 3 && (
                <>
                  {mieiConChat.length === 0 ? (
                    <div className="text-center py-14">
                      <MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">Nessuna conversazione</p>
                      <p className="text-gray-400 text-sm mt-1">Le chat con i clienti appariranno qui dopo aver accettato interventi</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {mieiConChat.map(b => {
                        const last = getLastMessage(b.id)
                        const unread = getUnread(b.id, user.id)
                        const avatarLetter = (b.clienteNome || '?')[0].toUpperCase()
                        const statoStyle = STATO_STYLE[b.stato] ?? { badge: 'bg-gray-100 text-gray-600', label: b.stato }
                        return (
                          <button
                            key={b.id}
                            onClick={() => setChatBookingId(b.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left border border-transparent hover:border-gray-100"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm shrink-0">
                              {avatarLetter}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {b.clienteNome}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-gray-400">{last ? formatMsgTime(last.createdAt) : ''}</span>
                                  {unread > 0 && (
                                    <span className="w-5 h-5 bg-blue-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                      {unread > 9 ? '9+' : unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className={`text-xs truncate flex-1 ${unread > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {last
                                    ? (last.type === 'image' ? '📷 Foto' : last.type === 'file' ? `📎 ${last.fileName || 'File'}` : last.text)
                                    : b.servizio
                                  }
                                </p>
                                <span className={`badge text-[10px] shrink-0 ${statoStyle.badge}`}>{statoStyle.label}</span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Tab 4: Tariffe */}
              {tab === 4 && (
                <TariffeTab user={user} updateUser={updateUser} />
              )}

              {/* Tab 5: Disponibilità */}
              {tab === 5 && (
                <DisponibilitaTab user={user} updateUser={updateUser} />
              )}

              {/* Tab 6: Profilo */}
              {tab === 6 && (
                <ProfiloTab user={user} updateUser={updateUser} />
              )}

              {/* Tab 2: Recensioni */}
              {tab === 2 && (
                <>
                  {myReviews.length === 0 ? (
                    <div className="text-center py-14">
                      <MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">Nessuna recensione ancora</p>
                      <p className="text-gray-400 text-sm mt-1">Le recensioni dei clienti appariranno qui dopo i lavori completati</p>
                    </div>
                  ) : (
                    <>
                      {avgFromReviews !== null && (
                        <div className="flex items-center gap-3 mb-5 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                          <Star size={24} className="text-yellow-400" fill="currentColor" />
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{avgFromReviews.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm ml-2">media su {myReviews.length} {myReviews.length === 1 ? 'recensione' : 'recensioni'}</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-4">
                        {myReviews.map(r => (
                          <ReviewCard key={r.id} review={r} onReply={addReply} canReply={true} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Prossimi appuntamenti */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" /> Prossimi appuntamenti
            </h2>
            {prossimiApp.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Nessun appuntamento confermato</p>
            ) : (
              <div className="space-y-2">
                {prossimiApp.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-start gap-2.5 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="bg-blue-100 p-1.5 rounded-lg shrink-0">
                      {CAT_ICON[b.categoria] ?? <Briefcase size={13} className="text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{b.servizio}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.clienteNome}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        {formatDateIT(b.dataIntervento)} · {b.oraIntervento}
                      </p>
                    </div>
                  </div>
                ))}
                {prossimiApp.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">+{prossimiApp.length - 3} altri appuntamenti</p>
                )}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center shrink-0 border border-gray-200">
                {user.foto
                  ? <img src={user.foto} alt="profilo" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-orange-600">{user.nome[0]}{user.cognome[0]}</span>
                }
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-tight">{user.nome} {user.cognome}</h2>
                {user.bio
                  ? <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{user.bio}</p>
                  : <p className="text-xs text-gray-400 mt-0.5 italic">Nessuna bio</p>
                }
              </div>
            </div>
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
                <span className={avgFromReviews !== null ? 'font-semibold text-gray-800' : 'text-gray-400'}>
                  {avgFromReviews !== null ? `${avgFromReviews.toFixed(1)} (${myReviews.length})` : 'Nessuna ancora'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Navigation size={15} className="text-orange-500" />
                  Raggio operativo
                </span>
                <span className="font-bold text-orange-600 text-sm">{raggioKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={raggioKm}
                onChange={e => handleRaggioChange(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 km</span>
                <span>100 km</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Accetti lavori entro <span className="font-semibold text-gray-600">{raggioKm} km</span> dalla tua zona operativa.
              </p>
            </div>

            {/* Toggle disponibilità pubblica */}
            <div className="pt-4 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {user.attivo !== false
                      ? <Eye size={14} className="text-green-600 shrink-0" />
                      : <EyeOff size={14} className="text-gray-400 shrink-0" />
                    }
                    <span className="text-sm font-semibold text-gray-700">Disponibile per lavori</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {user.attivo !== false
                      ? 'Il tuo profilo è visibile ai clienti'
                      : 'Sei in pausa — non appari nella lista pubblica'
                    }
                  </p>
                </div>
                <button
                  onClick={() => updateUser({ attivo: !(user.attivo !== false) })}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    user.attivo !== false ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  aria-label="Attiva/disattiva disponibilità"
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    user.attivo !== false ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
              {user.attivo === false && (
                <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <EyeOff size={12} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Profilo nascosto dai clienti</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifiche push */}
          {notifSupported && notifPerm === 'default' && (
            <div className="card p-4 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-xl shrink-0">
                  <Bell size={16} className="text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">Abilita notifiche</h3>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">Ricevi avvisi sui nuovi messaggi dei clienti in tempo reale</p>
                  <button
                    onClick={requestPermission}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white py-1.5 px-3 rounded-lg transition"
                  >
                    <Bell size={12} /> Abilita ora
                  </button>
                </div>
              </div>
            </div>
          )}
          {notifSupported && notifPerm === 'granted' && (
            <div className="flex items-center gap-2 px-1 text-xs text-green-600 font-medium">
              <CheckCircle size={13} /> Notifiche messaggi attive
            </div>
          )}

          <div className="card p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <h3 className="font-bold mb-2">Completa il profilo</h3>
            <p className="text-blue-100 text-sm mb-4">Aggiungi foto e descrizione per ricevere più richieste.</p>
            <button onClick={() => setTab(6)} className="btn-accent text-sm py-2.5 w-full">Aggiorna profilo</button>
          </div>
        </div>
      </div>
    </div>
  )
}
