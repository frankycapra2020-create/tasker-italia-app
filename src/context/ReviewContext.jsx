import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_REVIEWS } from '../data/mockDatabase'

const ReviewContext = createContext(null)

function dbToReview(row) {
  return {
    id:           row.id,
    bookingId:    row.booking_id,
    tecnicoId:    row.tecnico_id,
    clienteId:    row.cliente_id,
    clienteNome:  row.cliente_nome,
    stelle:       row.stelle,
    commento:     row.commento,
    servizio:     row.servizio,
    tecnicoNome:  row.tecnico_nome,
    risposta:     row.risposta,
    rispostaData: row.risposta_data,
    createdAt:    row.created_at,
  }
}

function reviewToDb(r) {
  return {
    id:           r.id,
    booking_id:   r.bookingId   || null,
    tecnico_id:   r.tecnicoId,
    cliente_id:   r.clienteId   || null,
    cliente_nome: r.clienteNome || null,
    stelle:       r.stelle,
    commento:     r.commento    || null,
    servizio:     r.servizio    || null,
    tecnico_nome: r.tecnicoNome || null,
  }
}

function merge(dbReviews) {
  const dbIds = new Set(dbReviews.map(r => r.id))
  return [...DEMO_REVIEWS.filter(r => !dbIds.has(r.id)), ...dbReviews]
}

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(DEMO_REVIEWS)

  useEffect(() => {
    supabase
      .from('recensioni')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(merge(data.map(dbToReview)))
      })

    const channel = supabase
      .channel('recensioni_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recensioni' }, ({ new: row }) => {
        setReviews(prev => {
          const r = dbToReview(row)
          return prev.some(p => p.id === r.id) ? prev : [r, ...prev]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'recensioni' }, ({ new: row }) => {
        setReviews(prev => prev.map(r => r.id === row.id ? dbToReview(row) : r))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addReview = async (data) => {
    const id = 'RV' + Date.now().toString().slice(-8)
    const r  = { ...data, id, createdAt: new Date().toISOString() }
    const { error } = await supabase.from('recensioni').insert(reviewToDb(r))
    if (error) {
      // Fallback locale
      setReviews(prev => [r, ...prev])
    }
    return r
  }

  const addReply = async (reviewId, risposta) => {
    await supabase
      .from('recensioni')
      .update({ risposta, risposta_data: new Date().toISOString() })
      .eq('id', reviewId)
    // Aggiornamento via Realtime
  }

  const getByTecnico    = (tecnicoId) => reviews.filter(r => String(r.tecnicoId) === String(tecnicoId))
  const getByBookingIds = (ids)       => reviews.filter(r => ids.includes(r.bookingId))
  const hasReviewed     = (bookingId) => reviews.some(r => r.bookingId === bookingId)

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
