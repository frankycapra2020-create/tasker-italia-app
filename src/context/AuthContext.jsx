import { createContext, useContext, useState } from 'react'
import { TECNICI_EVENT } from './TechniciansContext'

const AuthContext = createContext(null)

const USERS_KEY   = 'pt_users'
const SESSION_KEY = 'pt_session'
const PENDING_KEY = 'pt_pending_verifica'

const VERIFICA_TTL_MS = 15 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
  }

  // ── Registrazione in due fasi ─────────────────────────────────────────────

  // Fase 1: salva i dati in pending + codice; NON crea il profilo definitivo
  const registerPending = (formData, codice) => {
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      throw new Error('Email già registrata')
    }
    const pending = {
      userData: { ...formData, email: formData.email.toLowerCase() },
      codice,
      scadeAt: Date.now() + VERIFICA_TTL_MS,
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  }

  // Fase 2: verifica codice → crea utente definitivo + sessione
  const verifyEmail = (email, codiceInserito) => {
    let pending
    try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') } catch {}

    if (!pending) throw new Error('Nessuna verifica in corso. Ripeti la registrazione.')
    if (pending.userData.email !== email.toLowerCase()) throw new Error('Email non corrisponde.')
    if (Date.now() > pending.scadeAt) {
      localStorage.removeItem(PENDING_KEY)
      throw new Error('Codice scaduto. Ripeti la registrazione.')
    }
    if (pending.codice !== codiceInserito.trim()) throw new Error('Codice non corretto. Riprova.')

    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      localStorage.removeItem(PENDING_KEY)
      throw new Error('Email già registrata.')
    }

    const { userData } = pending
    const newUser = {
      id: Date.now().toString(),
      nome:           userData.nome,
      cognome:        userData.cognome,
      email:          userData.email,
      password:       userData.password,
      ruolo:          userData.ruolo,
      emailVerificata: true,
      ...(userData.ruolo === 'tecnico' && {
        specializzazione: userData.specializzazione,
        certificazioni:   userData.certificazioni,
        zona:             userData.zona,
      }),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    localStorage.removeItem(PENDING_KEY)

    const session = { ...newUser }
    delete session.password
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)

    if (newUser.ruolo === 'tecnico') window.dispatchEvent(new Event(TECNICI_EVENT))
    return session
  }

  // Rinvia codice: aggiorna il codice + scadenza nel pending
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

  const login = (email, password) => {
    const users = getUsers()
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) throw new Error('Email o password non corretti')
    const session = { ...found }
    delete session.password
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  // ── Aggiorna profilo ──────────────────────────────────────────────────────

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
    setUser(updated)
    if (user.ruolo === 'tecnico') window.dispatchEvent(new Event(TECNICI_EVENT))
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, registerPending, verifyEmail, resendCode, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
