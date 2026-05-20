import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'pt_users'
const SESSION_KEY = 'pt_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    } catch {
      return []
    }
  }

  const register = ({ nome, cognome, email, password, ruolo, specializzazione, certificazioni, zona }) => {
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email già registrata')
    }
    const newUser = {
      id: Date.now().toString(),
      nome,
      cognome,
      email: email.toLowerCase(),
      password,
      ruolo,
      ...(ruolo === 'tecnico' && { specializzazione, certificazioni, zona }),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    const session = { ...newUser }
    delete session.password
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

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

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
