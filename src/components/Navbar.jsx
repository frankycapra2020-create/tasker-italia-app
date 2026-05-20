import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Wrench, Zap, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Inizio' },
  { to: '/servizi', label: 'Servizi' },
  { to: '/tecnici', label: 'Tecnici' },
  { to: '/tutorial', label: 'Tutorial Sicurezza' },
]

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dashboardPath = user.ruolo === 'tecnico' ? '/dashboard/tecnico' : '/dashboard/cliente'
  const initials = `${user.nome[0]}${user.cognome[0]}`.toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
          user.ruolo === 'tecnico' ? 'bg-orange-500' : 'bg-blue-700'
        }`}>
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.nome}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="text-sm font-semibold text-gray-800">{user.nome} {user.cognome}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <div className={`mt-1 badge text-xs ${user.ruolo === 'tecnico' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
              {user.ruolo === 'tecnico' ? 'Tecnico' : 'Cliente'}
            </div>
          </div>
          <div className="py-1">
            <button
              onClick={() => { navigate(dashboardPath); setOpen(false) }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <LayoutDashboard size={16} className="text-gray-400" />
              Pannello
            </button>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} />
                Esci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-800">
            <div className="flex items-center gap-1 bg-blue-800 text-white rounded-lg p-1.5">
              <Wrench size={14} />
              <Zap size={14} />
            </div>
            <div className="flex flex-col leading-tight">
              <span><span translate="no">Pronto</span><span translate="no" className="text-orange-500">Tecnico</span></span>
              <span className="text-[10px] font-normal text-gray-500 tracking-tight">Il tuo tecnico di fiducia, sempre vicino a te</span>
            </div>
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
            {user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <>
                <Link to="/accedi" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors">
                  Accedi
                </Link>
                <Link to="/registrati" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300">
                  Registrati
                </Link>
              </>
            )}
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
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                      user.ruolo === 'tecnico' ? 'bg-orange-500' : 'bg-blue-700'
                    }`}>
                      {user.nome[0]}{user.cognome[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{user.nome} {user.cognome}</div>
                      <div className="text-xs text-gray-500">{user.ruolo === 'tecnico' ? 'Tecnico' : 'Cliente'}</div>
                    </div>
                  </div>
                  <Link
                    to={user.ruolo === 'tecnico' ? '/dashboard/tecnico' : '/dashboard/cliente'}
                    onClick={() => setOpen(false)}
                    className="mx-1 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard size={16} /> Pannello
                  </Link>
                  <button
                    onClick={() => { logout(); setOpen(false) }}
                    className="mx-1 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Esci
                  </button>
                </>
              ) : (
                <>
                  <Link to="/accedi" onClick={() => setOpen(false)} className="w-full text-sm font-medium text-gray-600 py-2.5 px-4 rounded-lg hover:bg-gray-50 text-center">
                    Accedi
                  </Link>
                  <Link to="/registrati" onClick={() => setOpen(false)} className="w-full text-sm font-medium text-gray-600 py-2.5 px-4 rounded-lg border border-gray-200 text-center">
                    Registrati
                  </Link>
                </>
              )}
              <Link to="/preventivo" onClick={() => setOpen(false)} className="btn-accent text-sm py-2 text-center mx-1">
                Richiedi Preventivo
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
