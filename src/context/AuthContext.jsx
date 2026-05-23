import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TECNICI_EVENT } from './TechniciansContext'

const AuthContext = createContext(null)

const PENDING_KEY = 'pt_pending_verifica'
const VERIFICA_TTL_MS = 15 * 60 * 1000

// Mappa un profilo Supabase → oggetto utente dell'app
function profileToUser(authUser, profile) {
  return {
    id:               authUser.id,
    nome:             profile?.nome            ?? '',
    cognome:          profile?.cognome         ?? '',
    email:            profile?.email           ?? authUser.email ?? '',
    ruolo:            profile?.ruolo           ?? 'cliente',
    emailVerificata:  true,
    specializzazione: profile?.specializzazione ?? null,
    specializzazioni: profile?.specializzazioni ?? [],
    certificazioni:   profile?.certificazioni  ?? null,
    zona:             profile?.zona            ?? null,
    bio:              profile?.bio             ?? '',
    foto:             profile?.foto            ?? null,
    anniEsperienza:   profile?.anni_esperienza ?? 0,
    raggioOperativo:  profile?.raggio_operativo ?? 100,
    tariffe:          profile?.tariffe         ?? null,
    disponibilita:    profile?.disponibilita   ?? null,
    disponibileOra:   profile?.disponibile_ora !== false,
    attivo:           profile?.attivo          !== false,
    createdAt:        profile?.created_at      ?? new Date().toISOString(),
  }
}

async function fetchProfile(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()
  return profileToUser(authUser, profile)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Ripristina sessione all'avvio ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const u = await fetchProfile(session.user)
        setUser(u)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const u = await fetchProfile(session.user)
        setUser(u)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Registrazione in due fasi ─────────────────────────────────────────────

  // Fase 1: controlla email duplicata + salva pending in localStorage
  const registerPending = async (formData, codice) => {
    const emailLow = formData.email.toLowerCase()
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailLow)
      .maybeSingle()
    if (existing) throw new Error('Email già registrata')

    const pending = {
      userData: { ...formData, email: emailLow },
      codice,
      scadeAt: Date.now() + VERIFICA_TTL_MS,
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  }

  // Fase 2: verifica codice → crea utente Supabase + profilo
  const verifyEmail = async (email, codiceInserito) => {
    let pending
    try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') } catch {}

    if (!pending) throw new Error('Nessuna verifica in corso. Ripeti la registrazione.')
    if (pending.userData.email !== email.toLowerCase()) throw new Error('Email non corrisponde.')
    if (Date.now() > pending.scadeAt) {
      localStorage.removeItem(PENDING_KEY)
      throw new Error('Codice scaduto. Ripeti la registrazione.')
    }
    if (pending.codice !== codiceInserito.trim()) throw new Error('Codice non corretto. Riprova.')

    const { userData } = pending

    // Crea utente su Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email:    userData.email,
      password: userData.password,
      options: {
        data: {
          nome:             userData.nome,
          cognome:          userData.cognome,
          ruolo:            userData.ruolo,
          specializzazione: userData.specializzazione || null,
          certificazioni:   userData.certificazioni   || null,
          zona:             userData.zona             || null,
        },
      },
    })

    if (error) throw new Error(error.message)

    localStorage.removeItem(PENDING_KEY)

    // Se la sessione non è stata creata (email confirmation abilitata in Supabase),
    // effettua login manuale
    let authUser = data.user
    if (!data.session) {
      const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
        email:    userData.email,
        password: userData.password,
      })
      if (signInErr) throw new Error('Account creato. Accedi con le tue credenziali.')
      authUser = signIn.user
    }

    // Il trigger Supabase crea il profilo; aspetta un attimo e poi lo recupera
    await new Promise(r => setTimeout(r, 500))
    const sessionUser = await fetchProfile(authUser)
    setUser(sessionUser)

    if (userData.ruolo === 'tecnico') window.dispatchEvent(new Event(TECNICI_EVENT))
    return sessionUser
  }

  // Rinvia codice: aggiorna codice + scadenza nel pending
  const resendCode = (email, nuovoCodice) => {
    let pending
    try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') } catch {}
    if (!pending || pending.userData.email !== email.toLowerCase()) {
      throw new Error('Nessuna verifica in corso per questa email.')
    }
    pending.codice  = nuovoCodice
    pending.scadeAt = Date.now() + VERIFICA_TTL_MS
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Email o password non corretti')
    const sessionUser = await fetchProfile(data.user)
    setUser(sessionUser)
    return sessionUser
  }

  // ── Aggiorna profilo ──────────────────────────────────────────────────────

  const updateUser = async (updates) => {
    if (!user) return

    // Converti camelCase → snake_case per il DB
    const dbUpdates = {}
    if (updates.bio              !== undefined) dbUpdates.bio               = updates.bio
    if (updates.foto             !== undefined) dbUpdates.foto              = updates.foto
    if (updates.zona             !== undefined) dbUpdates.zona              = updates.zona
    if (updates.anniEsperienza   !== undefined) dbUpdates.anni_esperienza   = updates.anniEsperienza
    if (updates.raggioOperativo  !== undefined) dbUpdates.raggio_operativo  = updates.raggioOperativo
    if (updates.tariffe          !== undefined) dbUpdates.tariffe           = updates.tariffe
    if (updates.disponibilita    !== undefined) dbUpdates.disponibilita     = updates.disponibilita
    if (updates.disponibileOra   !== undefined) dbUpdates.disponibile_ora   = updates.disponibileOra
    if (updates.attivo           !== undefined) dbUpdates.attivo            = updates.attivo
    if (updates.specializzazioni !== undefined) dbUpdates.specializzazioni  = updates.specializzazioni
    if (updates.certificazioni   !== undefined) dbUpdates.certificazioni    = updates.certificazioni
    if (updates.nome             !== undefined) dbUpdates.nome              = updates.nome
    if (updates.cognome          !== undefined) dbUpdates.cognome           = updates.cognome

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)

    if (!error) {
      const updated = { ...user, ...updates }
      setUser(updated)
      if (user.ruolo === 'tecnico') window.dispatchEvent(new Event(TECNICI_EVENT))
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerPending, verifyEmail, resendCode, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
