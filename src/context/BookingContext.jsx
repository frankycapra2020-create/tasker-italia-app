import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)
const STORAGE_KEY = 'pt_bookings'

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(loadFromStorage)

  const persist = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    setBookings(list)
  }

  const addBooking = (data) => {
    const ts = Date.now()
    const id = 'PT' + ts.toString().slice(-8)
    const booking = { ...data, id, stato: 'in_attesa', createdAt: new Date().toISOString() }
    const updated = [...bookings, booking]
    persist(updated)
    return booking
  }

  const updateBooking = (id, updates) =>
    persist(bookings.map(b => b.id === id ? { ...b, ...updates } : b))

  const getByCliente = (clienteId) => bookings.filter(b => b.clienteId === clienteId)

  const getByTecnico = (tecnicoUserId) => bookings.filter(b => b.confermatoDa === tecnicoUserId)

  const getPending = () => bookings.filter(b => b.stato === 'in_attesa')

  const getOccupied = (tecnicoId, date) =>
    bookings
      .filter(b => b.tecnicoId === tecnicoId && b.dataIntervento === date && b.stato !== 'annullata')
      .map(b => b.oraIntervento)

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking, getByCliente, getByTecnico, getPending, getOccupied }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
