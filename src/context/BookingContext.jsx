import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const BookingContext = createContext(null)

function dbToBooking(row) {
  return {
    id:               row.id,
    tecnicoId:        row.tecnico_id,
    clienteId:        row.cliente_id,
    clienteNome:      row.cliente_nome,
    clienteEmail:     row.cliente_email,
    clienteTelefono:  row.cliente_telefono,
    servizio:         row.servizio,
    descrizione:      row.descrizione,
    dataIntervento:   row.data_intervento,
    oraIntervento:    row.ora_intervento,
    indirizzo:        row.indirizzo,
    stato:            row.stato,
    confermatoDa:     row.confermata_da,
    createdAt:        row.created_at,
  }
}

function bookingToDb(b) {
  return {
    id:               b.id,
    tecnico_id:       b.tecnicoId,
    cliente_id:       b.clienteId       || null,
    cliente_nome:     b.clienteNome     || null,
    cliente_email:    b.clienteEmail    || null,
    cliente_telefono: b.clienteTelefono || null,
    servizio:         b.servizio        || null,
    descrizione:      b.descrizione     || null,
    data_intervento:  b.dataIntervento  || null,
    ora_intervento:   b.oraIntervento   || null,
    indirizzo:        b.indirizzo       || null,
    stato:            b.stato           || 'in_attesa',
    confermata_da:    b.confermatoDa    || null,
  }
}

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    // Carica tutte le prenotazioni
    supabase
      .from('prenotazioni')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setBookings(data.map(dbToBooking))
      })

    // Aggiornamenti in tempo reale
    const channel = supabase
      .channel('prenotazioni_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prenotazioni' }, ({ new: row }) => {
        setBookings(prev => [dbToBooking(row), ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prenotazioni' }, ({ new: row }) => {
        setBookings(prev => prev.map(b => b.id === row.id ? dbToBooking(row) : b))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addBooking = async (data) => {
    const ts  = Date.now()
    const id  = 'PT' + ts.toString().slice(-8)
    const booking = { ...data, id, stato: 'in_attesa', createdAt: new Date().toISOString() }
    const { error } = await supabase.from('prenotazioni').insert(bookingToDb(booking))
    if (error) {
      // Fallback locale se l'utente non è autenticato
      setBookings(prev => [booking, ...prev])
    }
    return booking
  }

  const updateBooking = async (id, updates) => {
    const dbUpdates = {}
    if (updates.stato       !== undefined) dbUpdates.stato        = updates.stato
    if (updates.confermatoDa !== undefined) dbUpdates.confermata_da = updates.confermatoDa

    await supabase.from('prenotazioni').update(dbUpdates).eq('id', id)
    // Lo stato verrà aggiornato via Realtime subscription
  }

  const getByCliente     = (clienteId)     => bookings.filter(b => b.clienteId     === clienteId)
  const getByTecnico     = (tecnicoUserId) => bookings.filter(b => b.confermatoDa  === tecnicoUserId)
  const getPending       = ()              => bookings.filter(b => b.stato          === 'in_attesa')
  const getOccupied      = (tecnicoId, date) =>
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
