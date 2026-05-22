import { createContext, useContext, useState } from 'react'

const FavoritesContext = createContext()

const FAVORITES_KEY = 'pt_favorites'
const PORTFOLIO_KEY = 'pt_portfolio'

const compressPortfolioImage = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      let w = img.width, h = img.height
      if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX }
      else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.80))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
})

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}') } catch { return {} }
  })

  const [portfolio, setPortfolio] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || '{}') } catch { return {} }
  })

  const toggleFavorite = (clienteId, tecnicoId) => {
    setFavorites(prev => {
      const curr = prev[clienteId] || []
      const updated = curr.includes(tecnicoId)
        ? curr.filter(id => id !== tecnicoId)
        : [...curr, tecnicoId]
      const next = { ...prev, [clienteId]: updated }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (clienteId, tecnicoId) =>
    (favorites[clienteId] || []).includes(tecnicoId)

  const getFavoriteIds = (clienteId) => favorites[clienteId] || []

  const addPhoto = async (tecnicoId, file) => {
    const dataUrl = await compressPortfolioImage(file)
    setPortfolio(prev => {
      const curr = prev[tecnicoId] || []
      if (curr.length >= 6) return prev
      const next = { ...prev, [tecnicoId]: [...curr, { dataUrl, didascalia: '' }] }
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next))
      return next
    })
  }

  const removePhoto = (tecnicoId, idx) => {
    setPortfolio(prev => {
      const curr = [...(prev[tecnicoId] || [])]
      curr.splice(idx, 1)
      const next = { ...prev, [tecnicoId]: curr }
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next))
      return next
    })
  }

  const updateCaption = (tecnicoId, idx, didascalia) => {
    setPortfolio(prev => {
      const curr = [...(prev[tecnicoId] || [])]
      if (!curr[idx]) return prev
      curr[idx] = { ...curr[idx], didascalia }
      const next = { ...prev, [tecnicoId]: curr }
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next))
      return next
    })
  }

  const getPortfolio = (tecnicoId) => portfolio[tecnicoId] || []

  return (
    <FavoritesContext.Provider value={{
      toggleFavorite, isFavorite, getFavoriteIds,
      addPhoto, removePhoto, updateCaption, getPortfolio,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
