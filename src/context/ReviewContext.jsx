import { createContext, useContext, useState } from 'react'
import { DEMO_REVIEWS } from '../data/mockDatabase'

const ReviewContext = createContext(null)
const STORAGE_KEY = 'pt_reviews'

function load() {
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Merge: demo reviews always present, local reviews appended (skip duplicates by id)
    const localIds = new Set(local.map(r => r.id))
    const demoFiltered = DEMO_REVIEWS.filter(r => !localIds.has(r.id))
    return [...demoFiltered, ...local]
  } catch { return [...DEMO_REVIEWS] }
}

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(load)

  const persist = (list) => {
    // Save only non-demo reviews to localStorage
    const localOnly = list.filter(r => !r.id.startsWith('DEMO_'))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localOnly))
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
