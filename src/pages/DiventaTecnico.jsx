import { Link } from 'react-router-dom'
import {
  Euro, Clock, MapPin, Shield,
  CheckCircle, ChevronRight,
  Star, Zap, Wrench, Users,
} from 'lucide-react'

const VANTAGGI = [
  {
    icon: Euro,
    color: 'bg-green-100 text-green-700',
    title: 'Guadagna fino a €3.000/mese',
    desc: 'Imposta tu le tue tariffe. Tariffa oraria, prezzi fissi per servizio, supplementi urgenza e festivi: sei tu il capo.',
  },
  {
    icon: Clock,
    color: 'bg-blue-100 text-blue-700',
    title: 'Scegli i tuoi orari',
    desc: 'Lavora quando vuoi. Imposta la tua disponibilità settimanale e ricevi solo richieste compatibili con i tuoi orari.',
  },
  {
    icon: MapPin,
    color: 'bg-orange-100 text-orange-700',
    title: 'Lavora nella tua zona',
    desc: 'Imposta il raggio operativo da 5 a 100 km. Intervieni solo dove vuoi, senza sprecare tempo e carburante.',
  },
  {
    icon: Shield,
    color: 'bg-purple-100 text-purple-700',
    title: 'Pagamenti sicuri e garantiti',
    desc: 'Preventivi trasparenti approvati dai clienti prima dell\'intervento. Incassi in modo semplice e sicuro.',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Registrati gratis in 5 minuti',
    desc: 'Crea il tuo profilo tecnico con specializzazione, zona operativa e certificazioni. Nessun costo, nessuna commissione d\'ingresso.',
  },
  {
    n: 2,
    title: 'Imposta le tue tariffe e disponibilità',
    desc: 'Configura la tariffa oraria, i prezzi per tipo di servizio e i giorni/orari in cui sei disponibile. Tutto personalizzabile.',
  },
  {
    n: 3,
    title: 'Ricevi richieste e guadagna',
    desc: 'I clienti verificati ti trovano, tu scegli quali lavori accettare. Guadagni ogni volta che completi un intervento.',
  },
]

const STATS = [
  { value: '500+', label: 'Tecnici attivi' },
  { value: '€2.400', label: 'Guadagno medio/mese' },
  { value: '98%', label: 'Clienti soddisfatti' },
  { value: '4.8★', label: 'Valutazione media' },
]

const TESTIMONIALS = [
  {
    nome: 'Marco F.',
    spec: 'Idraulico',
    città: 'Milano',
    testo: 'Da quando mi sono iscritto guadagno il 40% in più. I clienti arrivano direttamente a me, niente intermediari.',
    stelle: 5,
  },
  {
    nome: 'Lucia B.',
    spec: 'Caldaista',
    città: 'Torino',
    testo: 'Finalmente posso lavorare solo nei miei orari e nella mia zona. Ho azzerato i tragitti inutili.',
    stelle: 5,
  },
  {
    nome: 'Antonio R.',
    spec: 'Idraulico & Elettricista',
    città: 'Napoli',
    testo: 'Il sistema di preventivi è trasparente. I clienti arrivano già informati sul prezzo. Meno discussioni, più lavoro.',
    stelle: 5,
  },
]

export default function DiventaTecnico() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px] opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400 rounded-full blur-[100px] opacity-10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-sm font-medium px-4 py-2 rounded-full mb-7 border border-white/20">
            <Wrench size={14} className="text-orange-400" />
            <span>Unisciti a 500+ tecnici su ProntoTecnico</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Guadagna fino a{' '}
            <span className="text-orange-400">€3.000 al mese</span>
            <br className="hidden sm:block" />
            {' '}come tecnico su ProntoTecnico
          </h1>
          <p className="text-lg text-blue-100 mb-9 max-w-2xl mx-auto leading-relaxed">
            Scegli i tuoi orari, lavora nella tua zona, imposta le tue tariffe.
            Clienti verificati, pagamenti sicuri, zero burocrazia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/registrati"
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center justify-center gap-2 text-base"
            >
              Registrati come Tecnico — È gratis <ChevronRight size={18} />
            </Link>
            <a
              href="#come-funziona"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition inline-flex items-center justify-center gap-2 text-base"
            >
              Come funziona
            </a>
          </div>
          <p className="text-blue-300 text-sm mt-5 flex items-center justify-center gap-1.5">
            <CheckCircle size={14} className="text-green-400" />
            Nessun costo fisso — Paghi solo quando guadagni
          </p>
        </div>
      </section>

      {/* ── Statistiche ── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vantaggi ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Perché scegliere ProntoTecnico?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">La piattaforma pensata dai tecnici, per i tecnici. Tutto il controllo nelle tue mani.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VANTAGGI.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="card p-7 flex gap-4">
                  <div className={`${v.color} p-3 rounded-xl shrink-0 self-start`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Come funziona ── */}
      <section id="come-funziona" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Come funziona</h2>
            <p className="text-gray-500">Tre passi e sei operativo</p>
          </div>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex gap-5 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-lg shadow-md">
                    {step.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 h-10 bg-orange-200 mt-1.5" />
                  )}
                </div>
                <div className="pb-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/registrati"
              className="btn-accent text-base py-3.5 px-8 inline-flex items-center gap-2"
            >
              Inizia adesso — Registrazione gratuita <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonianze ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cosa dicono i nostri tecnici</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.nome} className="card p-6 flex flex-col">
                <div className="flex mb-3">
                  {Array.from({ length: t.stelle }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic flex-1">"{t.testo}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0">
                    {t.nome[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{t.nome}</div>
                    <div className="text-xs text-gray-400">{t.spec} · {t.città}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Zap size={36} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-extrabold mb-3">Pronto a iniziare?</h2>
          <p className="text-orange-100 mb-8 text-base leading-relaxed">
            Registrati in 5 minuti, completa il profilo e inizia a ricevere richieste dai clienti nella tua zona.
            Nessun costo di iscrizione.
          </p>
          <Link
            to="/registrati"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-base"
          >
            <Users size={18} /> Registrati come Tecnico Gratis
          </Link>
          <p className="text-orange-200 text-sm mt-5">
            Hai già un account?{' '}
            <Link to="/accedi" className="underline text-white font-medium">Accedi</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
