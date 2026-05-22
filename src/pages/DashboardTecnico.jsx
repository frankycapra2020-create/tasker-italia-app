import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useReview } from '../context/ReviewContext'
import { useChat } from '../context/ChatContext'
import { useNotifiche } from '../hooks/useNotifiche'
import { useLocation } from 'react-router-dom'
import ReviewCard from '../components/ReviewCard'
import ChatWindow from '../components/ChatWindow'
import { Briefcase, Star, Euro, MapPin, Award, Clock, TrendingUp, CheckCircle, Wrench, Zap, Calendar, Check, X, AlertCircle, MessageSquare, Bell, Navigation, Tag, Plus, Trash2, Percent, Camera, Phone, FileText, User, Eye, EyeOff, Image, Edit2 } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'

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
  'Idraulica':              <Wrench size={20} className="text-blue-600" />,
  'Elettricità':            <Zap size={20} className="text-yellow-600" />,
  'Caldaie':                <Wrench size={20} className="text-red-600" />,
  'Climatizzazione':        <Zap size={20} className="text-cyan-600" />,
  'Termoidraulica':         <Wrench size={20} className="text-purple-600" />,
  'Idraulico':              <Wrench size={20} className="text-blue-600" />,
  'Elettricista':           <Zap size={20} className="text-yellow-600" />,
  'Idraulico & Elettricista': <Wrench size={20} className="text-purple-600" />,
  'Caldaista':              <Wrench size={20} className="text-red-600" />,
}

const SPECIALIZZAZIONI_LIST = ['Idraulica', 'Elettricità', 'Caldaie', 'Climatizzazione', 'Termoidraulica']
const CERTIFICAZIONI_PREDEFINITE = ['D.M. 37/08', 'CEI 64-8', 'Patentino Gas', 'F-GAS', 'UNI 11528']

const TABS = ['Nuove richieste', 'Miei interventi', 'Recensioni', 'Messaggi', 'Tariffe', 'Disponibilità', 'Profilo', 'Portfolio', 'Guadagni']
const COMMISSIONE_PERC = 0.05

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
    if (Array.isArray(user.specializzazioni) && user.specializzazioni.length)
      return [...new Set(user.specializzazioni)]
    if (user.specializzazione)
      return [...new Set(user.specializzazione.split(' & ').map(s => s.trim()).filter(Boolean))]
    return []
  })
  const [nuovaSpec, setNuovaSpec] = useState('')
  const [certs, setCerts] = useState(() => {
    if (Array.isArray(user.certificazioni) && user.certificazioni.length)
      return [...new Set(user.certificazioni)]
    if (typeof user.certificazioni === 'string' && user.certificazioni.trim())
      return [...new Set(user.certificazioni.split(',').map(s => s.trim()).filter(Boolean))]
    return []
  })
  const [nuovaCert, setNuovaCert] = useState('')
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

  const removeSpec = (spec) => setSpecs(prev => prev.filter(s => s !== spec))
  const addSpec = (spec) => {
    const val = spec.trim()
    if (!val || specs.some(s => s.toLowerCase() === val.toLowerCase())) return
    setSpecs(prev => [...new Set([...prev, val])])
  }
  const addCustomSpec = () => {
    addSpec(nuovaSpec)
    setNuovaSpec('')
  }

  const removeCert = (cert) => setCerts(prev => prev.filter(c => c !== cert))
  const addCert = (cert) => {
    if (cert && !certs.includes(cert)) setCerts(prev => [...prev, cert])
  }
  const addCustomCert = () => {
    const val = nuovaCert.trim()
    if (!val || certs.includes(val)) return
    setCerts(prev => [...prev, val])
    setNuovaCert('')
  }

  const handleSave = () => {
    const uniqueSpecs = [...new Set(specs)]
    const specPrimaria = uniqueSpecs.length > 0 ? uniqueSpecs.join(' & ') : (user.specializzazione || '')
    updateUser({
      foto,
      nome: nome.trim() || user.nome,
      cognome: cognome.trim() || user.cognome,
      telefono: telefono.trim(),
      zona: citta.trim() || user.zona,
      bio: bio.trim(),
      specializzazioni: uniqueSpecs,
      specializzazione: specPrimaria,
      certificazioni: certs,
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
          placeholder="Raccontati ai clienti: esperienza, punti di forza, aree di specializzazione…"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
      </div>

      {/* Specializzazioni */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Award size={15} className="text-orange-500" /> Specializzazioni
        </h3>
        <p className="text-xs text-gray-400 mb-3">Seleziona o aggiungi le tue aree di competenza</p>
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {specs.map(s => (
              <span key={s} className="flex items-center gap-1.5 bg-orange-100 border border-orange-200 text-orange-800 text-xs font-medium px-2.5 py-1.5 rounded-xl">
                {SPEC_ICON[s]}
                {s}
                <button onClick={() => removeSpec(s)} className="text-orange-400 hover:text-red-500 transition ml-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {SPECIALIZZAZIONI_LIST.filter(s => !specs.some(e => e.toLowerCase() === s.toLowerCase())).map(s => (
            <button
              key={s}
              onClick={() => addSpec(s)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 transition"
            >
              <Plus size={10} /> {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            placeholder="Altra specializzazione..."
            value={nuovaSpec}
            onChange={e => setNuovaSpec(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomSpec()}
          />
          <button
            onClick={addCustomSpec}
            className="shrink-0 p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            title="Aggiungi"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Certificazioni */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <CheckCircle size={15} className="text-green-500" /> Certificazioni
        </h3>
        <p className="text-xs text-gray-400 mb-3">Aggiungi le tue certificazioni professionali</p>
        {certs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {certs.map(c => (
              <span key={c} className="flex items-center gap-1.5 bg-green-100 border border-green-200 text-green-800 text-xs font-medium px-2.5 py-1.5 rounded-xl">
                {c}
                <button onClick={() => removeCert(c)} className="text-green-500 hover:text-red-500 transition ml-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {CERTIFICAZIONI_PREDEFINITE.filter(c => !certs.includes(c)).map(c => (
            <button
              key={c}
              onClick={() => addCert(c)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Plus size={10} /> {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            placeholder="Altra certificazione..."
            value={nuovaCert}
            onChange={e => setNuovaCert(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomCert()}
          />
          <button
            onClick={addCustomCert}
            className="shrink-0 p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            title="Aggiungi"
          >
            <Plus size={13} />
          </button>
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

const MESI_BREVI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

function GuadagniTab({ bookings }) {
  const completati = bookings.filter(b => b.stato === 'completata' || b.stato === 'archiviato')

  const totLordo = completati.reduce((s, b) => s + (b.totaleStimato ?? 0), 0)
  const totComm  = completati.reduce((s, b) => {
    const comm = b.commissione ?? Math.round((b.totaleStimato ?? 0) * COMMISSIONE_PERC * 100) / 100
    return s + comm
  }, 0)
  const totNetto = totLordo - totComm

  const fmt = (n) => `€ ${Number(n).toFixed(2).replace('.', ',')}`

  // Ultimi 12 mesi
  const now = new Date()
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const jobs = completati.filter(b => b.createdAt?.startsWith(key))
    const lordo = jobs.reduce((s, b) => s + (b.totaleStimato ?? 0), 0)
    const comm  = jobs.reduce((s, b) => {
      return s + (b.commissione ?? Math.round((b.totaleStimato ?? 0) * COMMISSIONE_PERC * 100) / 100)
    }, 0)
    return { label: MESI_BREVI[d.getMonth()], lordo, comm, netto: lordo - comm, count: jobs.length }
  })
  const maxVal = Math.max(...monthly.map(m => m.lordo), 1)

  return (
    <div className="space-y-6">
      {/* Cards riassunto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Guadagno lordo totale</div>
          <div className="text-2xl font-bold text-gray-900">{fmt(totLordo)}</div>
          <div className="text-xs text-gray-500 mt-1">{completati.length} lavori completati</div>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-100">
          <div className="text-xs text-red-500 mb-1">Commissione ProntoTecnico ({(COMMISSIONE_PERC * 100).toFixed(0)}%)</div>
          <div className="text-2xl font-bold text-red-600">− {fmt(totComm)}</div>
          <div className="text-xs text-red-400 mt-1">Copre garanzia e supporto</div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <div className="text-xs text-green-600 mb-1">Guadagno netto (a te)</div>
          <div className="text-2xl font-bold text-green-700">{fmt(totNetto)}</div>
          <div className="text-xs text-green-500 mt-1">Importo effettivo ricevuto</div>
        </div>
      </div>

      {/* Grafico mensile */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h4 className="font-semibold text-gray-800 mb-4 text-sm">Guadagni mensili (ultimi 12 mesi)</h4>
        {totLordo === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">Nessun lavoro completato ancora</div>
        ) : (
          <>
            <div className="flex items-end gap-1 h-28">
              {monthly.map((m, i) => {
                const pctLordo = maxVal > 0 ? (m.lordo / maxVal) * 100 : 0
                const pctNetto = maxVal > 0 ? (m.netto / maxVal) * 100 : 0
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0 group relative">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '90px' }}>
                      {/* Barra lordo (sfondo) */}
                      <div className="w-full relative" style={{ height: `${Math.max(pctLordo, pctLordo > 0 ? 3 : 0)}%` }}>
                        <div className="w-full h-full bg-gray-200 rounded-t-sm" />
                        {/* Barra netto (sovrapposta) */}
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-sm"
                          style={{ height: pctLordo > 0 ? `${(m.netto / m.lordo) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center">{m.label}</span>
                    {/* Tooltip on hover */}
                    {m.lordo > 0 && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <div>Lordo: {fmt(m.lordo)}</div>
                        <div className="text-green-400">Netto: {fmt(m.netto)}</div>
                        <div>{m.count} lavori</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Lordo</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Netto</span>
            </div>
          </>
        )}
      </div>

      {/* Lista lavori con commissione */}
      <div>
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Dettaglio per lavoro</h4>
        {completati.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Nessun lavoro completato</div>
        ) : (
          <div className="space-y-2">
            {[...completati]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 20)
              .map(b => {
                const lordo = b.totaleStimato ?? 0
                const comm  = b.commissione ?? Math.round(lordo * COMMISSIONE_PERC * 100) / 100
                const netto = b.guadagnoNetto ?? (lordo - comm)
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{b.servizio}</div>
                      <div className="text-xs text-gray-400">{b.clienteNome} · {formatDateIT(b.dataIntervento)}</div>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="text-xs text-gray-500">Lordo: <span className="font-semibold text-gray-700">{fmt(lordo)}</span></div>
                      <div className="text-xs text-red-500">Comm: − {fmt(comm)}</div>
                      <div className="text-xs text-green-600 font-bold">Netto: {fmt(netto)}</div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

function PortfolioTab({ tecnicoId }) {
  const { getPortfolio, addPhoto, removePhoto, updateCaption } = useFavorites()
  const portfolio = getPortfolio(tecnicoId)
  const [editingIdx, setEditingIdx] = useState(null)
  const [captionDraft, setCaptionDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (portfolio.length >= 6) return
    setUploading(true)
    await addPhoto(tecnicoId, file)
    setUploading(false)
    e.target.value = ''
  }

  const startEdit = (i) => {
    setEditingIdx(i)
    setCaptionDraft(portfolio[i]?.didascalia || '')
  }

  const saveCaption = (i) => {
    updateCaption(tecnicoId, i, captionDraft.trim())
    setEditingIdx(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Image size={15} className="text-orange-500" /> Portfolio lavori
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Carica fino a 6 foto dei tuoi lavori migliori. Le foto saranno visibili nel tuo profilo pubblico per convincere i clienti a sceglierti.
        </p>
      </div>

      {portfolio.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <Image size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm mb-1">Nessuna foto nel portfolio</p>
          <p className="text-gray-400 text-xs mb-4">Aggiungi foto dei tuoi lavori per aumentare le prenotazioni</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-accent text-sm py-2 px-5"
          >
            Carica prima foto
          </button>
        </div>
      )}

      {portfolio.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolio.map((p, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100">
              <img src={p.dataUrl} alt={p.didascalia || `Foto ${i + 1}`} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => startEdit(i)}
                  className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 shadow"
                  title="Modifica didascalia"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => removePhoto(tecnicoId, i)}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow"
                  title="Rimuovi foto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {p.didascalia && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="text-white text-xs line-clamp-2">{p.didascalia}</p>
                </div>
              )}
            </div>
          ))}
          {portfolio.length < 6 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              {uploading ? (
                <span className="text-xs">Caricamento…</span>
              ) : (
                <>
                  <Plus size={22} />
                  <span className="text-xs font-medium">Aggiungi foto</span>
                  <span className="text-xs text-gray-300">{portfolio.length}/6</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* Modifica didascalia */}
      {editingIdx !== null && portfolio[editingIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h4 className="font-bold text-gray-900 mb-3">Modifica didascalia</h4>
            <img src={portfolio[editingIdx].dataUrl} alt="" className="w-full aspect-video object-cover rounded-xl mb-4" />
            <textarea
              value={captionDraft}
              onChange={e => setCaptionDraft(e.target.value)}
              maxLength={120}
              rows={3}
              placeholder="Descrivi questo lavoro (es. Sostituzione impianto idrico, Milano 2024)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => saveCaption(editingIdx)} className="btn-accent text-sm py-2 px-5 flex-1">
                Salva
              </button>
              <button onClick={() => setEditingIdx(null)} className="btn-secondary text-sm py-2 px-4">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <span>Le foto vengono salvate localmente. Carica immagini di alta qualità dei tuoi lavori completati per aumentare la fiducia dei clienti.</span>
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
  const [editingBio, setEditingBio] = useState(false)
  const [bioInlineDraft, setBioInlineDraft] = useState(user.bio || '')

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
  const completatiMese = completati.filter(b => {
    const d = new Date(b.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const guadagniLordoMese = completatiMese.reduce((sum, b) => sum + (b.totaleStimato ?? 0), 0)
  const commissioneMese   = completatiMese.reduce((sum, b) => {
    return sum + (b.commissione ?? Math.round((b.totaleStimato ?? 0) * COMMISSIONE_PERC * 100) / 100)
  }, 0)
  const guadagniMese = guadagniLordoMese - commissioneMese

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
          { icon: <Euro size={20} className="text-green-600" />,        label: 'Guadagno netto mese', value: guadagniMese > 0 ? `€ ${guadagniMese.toFixed(0)}` : '€ 0', bg: 'bg-green-50', sub: guadagniLordoMese > 0 ? `lordo € ${guadagniLordoMese.toFixed(0)}` : null },
          { icon: <Star size={20} className="text-yellow-500" fill={avgFromReviews !== null ? 'currentColor' : 'none'} />, label: 'Valutazione media', value: avgFromReviews !== null ? `${avgFromReviews.toFixed(1)} ★` : '—', bg: 'bg-yellow-50' },
          { icon: <TrendingUp size={20} className="text-orange-500" />, label: 'Nuove richieste',    value: pendingAll.length, bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
              {s.sub && <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>}
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

              {/* Tab 7: Portfolio */}
              {tab === 7 && (
                <PortfolioTab tecnicoId={user.id} />
              )}

              {/* Tab 8: Guadagni */}
              {tab === 8 && (
                <GuadagniTab bookings={miei} />
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
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-base leading-tight">{user.nome} {user.cognome}</h2>
                {editingBio ? (
                  <div className="mt-1.5">
                    <textarea
                      autoFocus
                      value={bioInlineDraft}
                      onChange={e => setBioInlineDraft(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full border border-orange-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      placeholder="Raccontati ai clienti…"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { updateUser({ bio: bioInlineDraft.trim() }); setEditingBio(false) }}
                        className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-lg transition"
                      >
                        Salva
                      </button>
                      <button
                        onClick={() => setEditingBio(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 transition"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : user.bio ? (
                  <p
                    onClick={() => { setBioInlineDraft(user.bio); setEditingBio(true) }}
                    className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed cursor-pointer hover:text-orange-600 transition"
                    title="Clicca per modificare"
                  >
                    {user.bio}
                  </p>
                ) : (
                  <button
                    onClick={() => { setBioInlineDraft(''); setEditingBio(true) }}
                    className="text-xs text-gray-400 mt-0.5 italic hover:text-orange-500 transition flex items-center gap-1"
                  >
                    <Edit2 size={10} /> Aggiungi bio
                  </button>
                )}
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
              {(Array.isArray(user.certificazioni) ? user.certificazioni.length > 0 : !!user.certificazioni) && (
                <div className="flex items-start gap-2 text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Certificazioni: </span>
                    <span>{Array.isArray(user.certificazioni) ? user.certificazioni.join(', ') : user.certificazioni}</span>
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
