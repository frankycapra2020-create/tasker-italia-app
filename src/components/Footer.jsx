import { Link } from 'react-router-dom'
import { Wrench, Zap, Phone, Mail, MapPin, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="flex items-center gap-1 bg-blue-800 text-white rounded-lg p-1.5">
                <Wrench size={14} />
                <Zap size={14} />
              </div>
              <div className="flex flex-col leading-tight">
                <span>Pronto<span className="text-orange-400">Tecnico</span></span>
                <span className="text-[10px] font-normal text-gray-400 tracking-tight">Il tuo tecnico di fiducia, sempre vicino a te</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Il marketplace di fiducia per servizi tecnici professionali. Idraulici ed elettricisti verificati in tutta Italia.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Shield size={14} />
              <span>Tecnici verificati e assicurati</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Servizi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/servizi" className="hover:text-white transition-colors">Idraulica</Link></li>
              <li><Link to="/servizi" className="hover:text-white transition-colors">Elettricità</Link></li>
              <li><Link to="/servizi" className="hover:text-white transition-colors">Caldaie & Riscaldamento</Link></li>
              <li><Link to="/servizi" className="hover:text-white transition-colors">Climatizzazione</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Informazioni</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tutorial" className="hover:text-white transition-colors">Tutorial Sicurezza</Link></li>
              <li><Link to="/tecnici" className="hover:text-white transition-colors">I nostri Tecnici</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Come funziona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Diventa Tecnico</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contatti</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-orange-400 flex-shrink-0" />
                <span>Emergenze: <a href="tel:800123456" className="text-white hover:text-orange-400">800 123 456</a></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-orange-400 flex-shrink-0" />
                <span>info@prontotecnico.it</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <span>Via Roma 42, 20121 Milano, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 ProntoTecnico S.r.l. – P.IVA IT12345678901 – REA MI-1234567</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Informativa sulla Privacy</a>
            <a href="#" className="hover:text-white">Termini di servizio</a>
            <a href="#" className="hover:text-white">Politica sui Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
