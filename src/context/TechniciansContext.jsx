import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { technicians as demoTecnici } from '../data/technicians'
import { DEMO_REGISTERED_TECNICI } from '../data/mockDatabase'

export const TECNICI_EVENT = 'pt_tecnici_updated'

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
  'bg-orange-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600',
]

function colorForId(id) {
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function profileToTecnico(p) {
  const nome    = p.nome    || ''
  const cognome = p.cognome || ''
  return {
    id:              `user_${p.id}`,
    isReal:          true,
    name:            `${nome} ${cognome}`.trim(),
    avatar:          `${nome[0]?.toUpperCase() || '?'}${cognome[0]?.toUpperCase() || ''}`,
    foto:            p.foto  || null,
    avatarColor:     colorForId(p.id),
    specializations: Array.isArray(p.specializzazioni) && p.specializzazioni.length
      ? p.specializzazioni
      : p.specializzazione ? [p.specializzazione] : [],
    location:        p.zona  || 'Italia',
    lat:             null,
    lng:             null,
    userId:          p.id,
    rating:          null,
    reviews:         0,
    completedJobs:   0,
    yearsExp:        p.anni_esperienza  || 0,
    pricePerHour:    p.tariffe?.oraria  || 60,
    available:       p.disponibile_ora !== false,
    attivo:          p.attivo          !== false,
    certified:       false,
    bio:             p.bio             || '',
    certifications:  p.certificazioni  ? [p.certificazioni] : [],
    languages:       null,
    responseTime:    null,
    raggioOperativo: p.raggio_operativo || 100,
    tariffe:         p.tariffe         || {},
    disponibilita:   p.disponibilita   || null,
  }
}

const TechniciansContext = createContext(null)

export function TechniciansProvider({ children }) {
  const [registeredTecnici, setRegisteredTecnici] = useState([])

  const loadFromSupabase = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('ruolo', 'tecnico')
    if (data) setRegisteredTecnici(data.map(profileToTecnico))
  }

  useEffect(() => {
    loadFromSupabase()

    // Aggiornamenti real-time dei profili tecnici
    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadFromSupabase()
      })
      .subscribe()

    const handler = () => loadFromSupabase()
    window.addEventListener(TECNICI_EVENT, handler)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener(TECNICI_EVENT, handler)
    }
  }, [])

  const allTecnici = [...demoTecnici, ...DEMO_REGISTERED_TECNICI, ...registeredTecnici]

  const getTecnicoById = (id) => {
    const demo = demoTecnici.find(t => String(t.id) === String(id))
    if (demo) return demo
    const demoReg = DEMO_REGISTERED_TECNICI.find(t => String(t.id) === String(id))
    if (demoReg) return demoReg
    return registeredTecnici.find(t => String(t.id) === String(id)) || null
  }

  return (
    <TechniciansContext.Provider value={{ allTecnici, getTecnicoById }}>
      {children}
    </TechniciansContext.Provider>
  )
}

export const useTechnicians = () => useContext(TechniciansContext)
