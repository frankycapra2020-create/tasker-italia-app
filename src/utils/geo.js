export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const rad = x => x * Math.PI / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function zoomDaRaggio(km) {
  if (km <= 5) return 13
  if (km <= 10) return 12
  if (km <= 25) return 10
  return 8
}
