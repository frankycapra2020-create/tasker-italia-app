import { Link } from 'react-router-dom'
import { Shield, Clock, Star, Zap, Wrench, ThermometerSun, Wind, ArrowRight, Quote } from 'lucide-react'
import { services } from '../data/services'
import { technicians } from '../data/technicians'
import { tutorials } from '../data/tutorials'
import ServiceCard from '../components/ServiceCard'
import TechnicianCard from '../components/TechnicianCard'
import VideoCard from '../components/VideoCard'
import { useReview } from '../context/ReviewContext'
import { StarsDisplay } from '../components/ReviewCard'

const stats = [
  { value: '2.400+', label: 'Tecnici certificati' },
  { value: '98%', label: 'Clienti soddisfatti' },
  { value: '< 2h', label: 'Tempo medio risposta' },
  { value: '15 anni', label: 'Di esperienza media' },
]

const serviceCategories = [
  { icon: <Wrench size={28} />, title: 'Idraulica', desc: 'Perdite, scarichi, sanitari', color: 'bg-blue-50 text-blue-700', to: '/servizi' },
  { icon: <Zap size={28} />, title: 'Elettricità', desc: 'Impianti, guasti, domotica', color: 'bg-yellow-50 text-yellow-700', to: '/servizi' },
  { icon: <ThermometerSun size={28} />, title: 'Caldaie', desc: 'Manutenzione, riparazioni', color: 'bg-red-50 text-red-700', to: '/servizi' },
  { icon: <Wind size={28} />, title: 'Climatizzazione', desc: 'Installazione, gas F-GAS', color: 'bg-cyan-50 text-cyan-700', to: '/servizi' },
]

const FALLBACK_REVIEWS = [
  {
    id: 'demo1',
    clienteNome: 'Marco R.',
    stelle: 5,
    commento: 'Lavoro eccellente! Il tecnico è arrivato puntuale e ha risolto il problema in meno di un\'ora. Lo consiglio a tutti.',
    servizio: 'Perdita tubo cucina',
    tecnicoNome: 'Luca Ferretti',
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'demo2',
    clienteNome: 'Sofia M.',
    stelle: 5,
    commento: 'Ottimo professionista. Ha installato l\'impianto elettrico in modo impeccabile, tutto ordinato e in regola.',
    servizio: 'Impianto elettrico',
    tecnicoNome: 'Andrea Ricci',
    createdAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'demo3',
    clienteNome: 'Giovanni B.',
    stelle: 5,
    commento: 'Caldaia riparata in tempo record. Prezzi onesti, lavoro garantito e professionalità eccezionale.',
    servizio: 'Riparazione caldaia',
    tecnicoNome: 'Marco Bianchi',
    createdAt: '2024-02-28T09:00:00Z',
  },
]

function ReviewWidget({ review }) {
  const initials = review.clienteNome
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'
  const fmt = (str) =>
    new Date(str).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <Quote size={20} className="text-blue-200" />
      <p className="text-gray-700 text-sm leading-relaxed flex-1">"{review.commento}"</p>
      <div>
        <StarsDisplay value={review.stelle} size={14} />
        {review.servizio && (
          <span className="text-xs text-gray-400 mt-1 block">{review.servizio}</span>
        )}
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-800">{review.clienteNome}</div>
          <div className="text-xs text-gray-400">{fmt(review.createdAt)}</div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { getTopReviews } = useReview()
  const topReviews = getTopReviews(3)
  const displayReviews = topReviews.length >= 2 ? topReviews : FALLBACK_REVIEWS

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="badge bg-orange-500/20 text-orange-200 mb-4">
              🇮🇹 Il marketplace n.1 in Italia per servizi tecnici
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mt-4 mb-6 text-white">
              Tecnici esperti,
              <br />
              <span className="text-orange-400">quando ne hai bisogno</span>
            </h1>
            <p className="text-blue-100 text-xl mb-8 leading-relaxed">
              Trova idraulici ed elettricisti certificati vicino a te. Interventi garantiti, prezzi trasparenti e sicurezza al primo posto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/preventivo" className="btn-accent text-base py-4 px-8 text-center">
                Richiedi Preventivo Gratuito
              </Link>
              <Link to="/servizi" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 text-base py-4 px-8 text-center">
                Esplora i Servizi
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-6 text-sm text-blue-100">
              <Shield size={16} className="text-green-400" />
              Tutti i tecnici sono verificati, assicurati e con garanzia sul lavoro
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-blue-900">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Servizi disponibili</h2>
          <p className="text-gray-500 mt-2">Professionalità certificata in ogni settore tecnico</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {serviceCategories.map(cat => (
            <Link key={cat.title} to={cat.to} className={`card p-6 text-center ${cat.color} hover:shadow-lg transition-shadow`}>
              <div className="flex justify-center mb-3">{cat.icon}</div>
              <h3 className="font-bold text-lg">{cat.title}</h3>
              <p className="text-sm opacity-70 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Servizi più richiesti</h2>
              <p className="text-gray-500 mt-1">Soluzioni rapide per le esigenze più comuni</p>
            </div>
            <Link to="/servizi" className="hidden md:flex items-center gap-1 text-blue-800 font-semibold hover:gap-2 transition-all">
              Vedi tutti <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/servizi" className="btn-secondary">Vedi tutti i servizi</Link>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-900 rounded-3xl p-10 md:p-14 text-white text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3">
              <Shield size={36} className="text-orange-400" />
              <h3 className="font-bold text-xl text-white">100% Verificati</h3>
              <p className="text-blue-100 text-sm">Ogni tecnico è controllato: documenti, certificazioni e assicurazione professionale.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Clock size={36} className="text-orange-400" />
              <h3 className="font-bold text-xl text-white">Risposta Rapida</h3>
              <p className="text-blue-100 text-sm">Per le emergenze garantiamo un tecnico disponibile entro 2 ore, 7 giorni su 7.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Star size={36} className="text-orange-400" />
              <h3 className="font-bold text-xl text-white">Garanzia Lavoro</h3>
              <p className="text-blue-100 text-sm">Soddisfatto o rimborsato. Ogni lavoro è garantito con copertura fino a 12 mesi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Technicians */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">I nostri migliori tecnici</h2>
              <p className="text-gray-500 mt-1">Professionisti selezionati con le valutazioni più alte</p>
            </div>
            <Link to="/tecnici" className="hidden md:flex items-center gap-1 text-blue-800 font-semibold hover:gap-2 transition-all">
              Vedi tutti <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.slice(0, 3).map(t => <TechnicianCard key={t.id} tech={t} />)}
          </div>
        </div>
      </section>

      {/* Reviews Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="badge bg-yellow-100 text-yellow-700 mb-3">
            <Star size={11} fill="currentColor" /> Recensioni verificate
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Cosa dicono i nostri clienti</h2>
          <p className="text-gray-500 mt-2">Recensioni reali da clienti che hanno completato un intervento</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map(r => <ReviewWidget key={r.id} review={r} />)}
        </div>
        <div className="text-center mt-8">
          <Link to="/tecnici" className="btn-secondary">
            Leggi tutte le recensioni
          </Link>
        </div>
      </section>

      {/* Safety Tutorials Preview */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="badge bg-red-100 text-red-700 mb-2">
                <Shield size={11} /> Sicurezza domestica
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Tutorial video gratuiti</h2>
              <p className="text-gray-500 mt-1">Impara a gestire le emergenze più comuni in casa</p>
            </div>
            <Link to="/tutorial" className="hidden md:flex items-center gap-1 text-blue-800 font-semibold hover:gap-2 transition-all">
              Vedi tutti <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.slice(0, 3).map(t => <VideoCard key={t.id} tutorial={t} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/tutorial" className="btn-primary">
              Esplora tutti i tutorial gratuiti
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
