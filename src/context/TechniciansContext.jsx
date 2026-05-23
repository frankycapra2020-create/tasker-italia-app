import { createContext, useContext, useState, useEffect } from 'react'
import { technicians as demoTecnici } from '../data/technicians'
import { DEMO_REGISTERED_TECNICI } from '../data/mockDatabase'

const USERS_KEY = 'pt_users'
export const TECNICI_EVENT = 'pt_tecnici_updated'

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
  'bg-orange-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600',
]

function colorForId(id) {
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function userToTecnico(u) {
  const nome = u.nome || ''
  const cognome = u.cognome || ''
  return {
    id: `user_${u.id}`,
    isReal: true,
    name: `${nome} ${cognome}`.trim(),
    avatar: `${nome[0]?.toUpperCase() || '?'}${cognome[0]?.toUpperCase() || ''}`,
    foto: u.foto || null,
    avatarColor: colorForId(u.id),
    specializations: Array.isArray(u.specializzazioni) && u.specializzazioni.length
      ? u.specializzazioni
      : u.specializzazione ? [u.specializzazione] : [],
    location: u.zona || 'Italia',
    lat: null,
    lng: null,
    userId: u.id,
    rating: null,
    reviews: 0,
    completedJobs: 0,
    yearsExp: u.anniEsperienza || 0,
    pricePerHour: u.tariffe?.oraria || 60,
    available: u.disponibileOra !== false,
    attivo: u.attivo !== false,
    certified: false,
    bio: u.bio || '',
    certifications: u.certificazioni ? [u.certificazioni] : [],
    languages: null,
    responseTime: null,
    raggioOperativo: u.raggioOperativo || 100,
    tariffe: u.tariffe || {},
    disponibilita: u.disponibilita || null,
  }
}

function loadRegisteredTecnici() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return users
      .filter(u => u.ruolo === 'tecnico' && u.attivo !== false)
      .map(userToTecnico)
  } catch {
    return []
  }
}

function loadAllRegisteredTecnici() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return users.filter(u => u.ruolo === 'tecnico').map(userToTecnico)
  } catch {
    return []
  }
}

const TechniciansContext = createContext(null)

export function TechniciansProvider({ children }) {
  const [registeredTecnici, setRegisteredTecnici] = useState(() => loadRegisteredTecnici())

  useEffect(() => {
    const handler = () => setRegisteredTecnici(loadRegisteredTecnici())
    window.addEventListener(TECNICI_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(TECNICI_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const allTecnici = [...demoTecnici, ...DEMO_REGISTERED_TECNICI, ...registeredTecnici]

  const getTecnicoById = (id) => {
    const demo = demoTecnici.find(t => String(t.id) === String(id))
    if (demo) return demo
    const demoReg = DEMO_REGISTERED_TECNICI.find(t => String(t.id) === String(id))
    if (demoReg) return demoReg
    return loadAllRegisteredTecnici().find(t => String(t.id) === String(id)) || null
  }

  return (
    <TechniciansContext.Provider value={{ allTecnici, getTecnicoById }}>
      {children}
    </TechniciansContext.Provider>
  )
}

export const useTechnicians = () => useContext(TechniciansContext)
