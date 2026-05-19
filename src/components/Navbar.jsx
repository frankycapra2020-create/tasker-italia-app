import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Wrench, Zap, ChevronDown } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/servizi', label: 'Servizi' },
  { to: '/tecnici', label: 'Tecnici' },
  { to: '/tutorial', label: 'Tutorial Sicurezza' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-800">
            <div className="flex items-center gap-1 bg-blue-800 text-white rounded-lg p-1.5">
              <Wrench size={14} />
              <Zap size={14} />
            </div>
            <span>Tasker<span className="text-orange-500">Italia</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-600 hover:text-blue-800 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
              Accedi
            </button>
            <Link to="/preventivo" className="btn-accent text-sm py-2 px-4">
              Richiedi Preventivo
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.to ? 'bg-blue-50 text-blue-800' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button className="w-full text-sm font-medium text-gray-600 py-2">Accedi</button>
              <Link to="/preventivo" onClick={() => setOpen(false)} className="btn-accent text-sm py-2 text-center">
                Richiedi Preventivo
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
