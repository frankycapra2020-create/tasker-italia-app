import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const GeoContext = createContext(null)

// status: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'
export function GeoProvider({ children }) {
  const [position, setPosition] = useState(null)   // { lat, lng }
  const [address, setAddress] = useState(null)     // { via, citta, cap }
  const [status, setStatus] = useState('idle')

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=it`,
      )
      const data = await res.json()
      const a = data.address || {}
      const via = [a.road, a.house_number].filter(Boolean).join(', ')
      const citta = a.city || a.town || a.village || a.municipality || ''
      const cap = a.postcode || ''
      setAddress({ via, citta, cap, display: data.display_name })
    } catch {
      // geocoding non critico, fallisce silenziosamente
    }
  }

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setStatus('unavailable'); return }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude
        const lng = coords.longitude
        setPosition({ lat, lng })
        setStatus('granted')
        reverseGeocode(lat, lng)
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'unavailable')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300_000 }
    )
  }, [])

  return (
    <GeoContext.Provider value={{ position, address, status, requestLocation }}>
      {children}
    </GeoContext.Provider>
  )
}

export const useGeo = () => useContext(GeoContext)
