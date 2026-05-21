const CITTA_COORDS = {
  'milano': { lat: 45.4654, lng: 9.1865 },
  'roma': { lat: 41.9028, lng: 12.4964 },
  'napoli': { lat: 40.8518, lng: 14.2681 },
  'torino': { lat: 45.0703, lng: 7.6869 },
  'bologna': { lat: 44.4949, lng: 11.3426 },
  'firenze': { lat: 43.7696, lng: 11.2558 },
  'venezia': { lat: 45.4408, lng: 12.3155 },
  'genova': { lat: 44.4056, lng: 8.9463 },
  'palermo': { lat: 38.1157, lng: 13.3615 },
  'bari': { lat: 41.1171, lng: 16.8719 },
  'catania': { lat: 37.5023, lng: 15.0873 },
  'verona': { lat: 45.4384, lng: 10.9916 },
  'messina': { lat: 38.1938, lng: 15.5540 },
  'padova': { lat: 45.4064, lng: 11.8768 },
  'trieste': { lat: 45.6495, lng: 13.7768 },
  'brescia': { lat: 45.5416, lng: 10.2118 },
  'taranto': { lat: 40.4764, lng: 17.2297 },
  'prato': { lat: 43.8777, lng: 11.1023 },
  'modena': { lat: 44.6471, lng: 10.9252 },
  'reggio emilia': { lat: 44.6989, lng: 10.6297 },
  'perugia': { lat: 43.1121, lng: 12.3888 },
  'livorno': { lat: 43.5528, lng: 10.3117 },
  'cagliari': { lat: 39.2238, lng: 9.1217 },
  'foggia': { lat: 41.4621, lng: 15.5441 },
  'bergamo': { lat: 45.6983, lng: 9.6773 },
  'monza': { lat: 45.5845, lng: 9.2744 },
  'reggio calabria': { lat: 38.1113, lng: 15.6677 },
  'lecce': { lat: 40.3516, lng: 18.1750 },
  'ancona': { lat: 43.6158, lng: 13.5189 },
  'trento': { lat: 46.0748, lng: 11.1217 },
  'salerno': { lat: 40.6824, lng: 14.7681 },
}

export function getCittaCoords(nomeCitta) {
  if (!nomeCitta) return null
  const key = nomeCitta.toLowerCase().trim()
  if (CITTA_COORDS[key]) return CITTA_COORDS[key]
  const found = Object.keys(CITTA_COORDS).find(k => key.startsWith(k) || k.startsWith(key))
  return found ? CITTA_COORDS[found] : null
}

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
