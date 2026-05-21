import { createContext, useContext, useState } from 'react'

const ReviewContext = createContext(null)
const STORAGE_KEY = 'pt_reviews'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(load)

  const persist = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    setReviews(list)
  }

  const addReview = (data) => {
    const id = 'RV' + Date.now().toString().slice(-8)
    const r = { ...data, id, createdAt: new Date().toISOString() }
    persist([...reviews, r])
    return r
  }

  const addReply = (reviewId, risposta) =>
    persist(reviews.map(r =>
      r.id === reviewId ? { ...r, risposta, rispostaData: new Date().toISOString() } : r
    ))

  const getByTecnico = (tecnicoId) => reviews.filter(r => r.tecnicoId === tecnicoId)

  const getByBookingIds = (ids) => reviews.filter(r => ids.includes(r.bookingId))

  const hasReviewed = (bookingId) => reviews.some(r => r.bookingId === bookingId)

  const getAvgRating = (tecnicoId) => {
    const rs = getByTecnico(tecnicoId)
    return rs.length ? rs.reduce((s, r) => s + r.stelle, 0) / rs.length : null
  }

  const getTopReviews = (limit = 3) =>
    reviews
      .filter(r => r.stelle >= 4 && r.commento?.length > 20)
      .sort((a, b) => b.stelle - a.stelle || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)

  return (
    <ReviewContext.Provider value={{ reviews, addReview, addReply, getByTecnico, getByBookingIds, hasReviewed, getAvgRating, getTopReviews }}>
      {children}
    </ReviewContext.Provider>
  )
}

export const useReview = () => useContext(ReviewContext)
