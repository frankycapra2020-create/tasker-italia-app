const CITTA_COORDS = {
  // ── Grandi città ──────────────────────────────────────────────────────────
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

  // ── Nord-Ovest ────────────────────────────────────────────────────────────
  'aosta': { lat: 45.7372, lng: 7.3200 },
  'novara': { lat: 45.4469, lng: 8.6220 },
  'alessandria': { lat: 44.9124, lng: 8.6151 },
  'asti': { lat: 44.9003, lng: 8.2064 },
  'cuneo': { lat: 44.3845, lng: 7.5420 },
  'biella': { lat: 45.5628, lng: 8.0580 },
  'vercelli': { lat: 45.3204, lng: 8.4188 },
  'verbania': { lat: 45.9221, lng: 8.5520 },
  'varese': { lat: 45.8205, lng: 8.8257 },
  'como': { lat: 45.8080, lng: 9.0851 },
  'lecco': { lat: 45.8566, lng: 9.3956 },
  'sondrio': { lat: 46.1699, lng: 9.8714 },
  'pavia': { lat: 45.1847, lng: 9.1582 },
  'cremona': { lat: 45.1330, lng: 10.0227 },
  'mantova': { lat: 45.1564, lng: 10.7914 },
  'lodi': { lat: 45.3143, lng: 9.5035 },
  'imperia': { lat: 43.8882, lng: 8.0268 },
  'savona': { lat: 44.3071, lng: 8.4814 },
  'la spezia': { lat: 44.1024, lng: 9.8243 },

  // ── Nord-Est ──────────────────────────────────────────────────────────────
  'bolzano': { lat: 46.4983, lng: 11.3548 },
  'vicenza': { lat: 45.5455, lng: 11.5354 },
  'treviso': { lat: 45.6669, lng: 12.2421 },
  'rovigo': { lat: 45.0695, lng: 11.7901 },
  'belluno': { lat: 46.1436, lng: 12.2165 },
  'udine': { lat: 46.0633, lng: 13.2356 },
  'pordenone': { lat: 45.9636, lng: 12.6616 },
  'gorizia': { lat: 45.9408, lng: 13.6197 },
  'ferrara': { lat: 44.8381, lng: 11.6198 },
  'parma': { lat: 44.8015, lng: 10.3279 },
  'piacenza': { lat: 45.0526, lng: 9.6930 },
  'ravenna': { lat: 44.4184, lng: 12.2035 },
  'forlì': { lat: 44.2227, lng: 12.0407 },
  'forli': { lat: 44.2227, lng: 12.0407 },
  'cesena': { lat: 44.1391, lng: 12.2435 },
  'rimini': { lat: 44.0595, lng: 12.5683 },
  'reggio-emilia': { lat: 44.6989, lng: 10.6297 },

  // ── Centro ────────────────────────────────────────────────────────────────
  'pistoia': { lat: 43.9330, lng: 10.9176 },
  'lucca': { lat: 43.8430, lng: 10.5050 },
  'siena': { lat: 43.3186, lng: 11.3307 },
  'arezzo': { lat: 43.4633, lng: 11.8796 },
  'grosseto': { lat: 42.7605, lng: 11.1126 },
  'massa': { lat: 44.0346, lng: 10.1399 },
  'viterbo': { lat: 42.4191, lng: 12.1043 },
  'terni': { lat: 42.5636, lng: 12.6472 },
  'macerata': { lat: 43.2988, lng: 13.4536 },
  'fermo': { lat: 43.1603, lng: 13.7158 },
  'ascoli piceno': { lat: 42.8539, lng: 13.5745 },
  'pesaro': { lat: 43.9107, lng: 12.9126 },
  'urbino': { lat: 43.7262, lng: 12.6363 },
  'rieti': { lat: 42.4040, lng: 12.8566 },
  'frosinone': { lat: 41.6399, lng: 13.3401 },
  'latina': { lat: 41.4677, lng: 12.9035 },
  'l\'aquila': { lat: 42.3498, lng: 13.3995 },
  'pescara': { lat: 42.4611, lng: 14.2158 },
  'chieti': { lat: 42.3511, lng: 14.1681 },
  'teramo': { lat: 42.6586, lng: 13.7042 },
  'campobasso': { lat: 41.5622, lng: 14.6562 },
  'isernia': { lat: 41.5960, lng: 14.2304 },

  // ── Sud ──────────────────────────────────────────────────────────────────
  'caserta': { lat: 41.0742, lng: 14.3326 },
  'benevento': { lat: 41.1297, lng: 14.7811 },
  'avellino': { lat: 40.9149, lng: 14.7908 },
  'cosenza': { lat: 39.2982, lng: 16.2543 },
  'catanzaro': { lat: 38.9101, lng: 16.5887 },
  'crotone': { lat: 39.0809, lng: 17.1269 },
  'vibo valentia': { lat: 38.6757, lng: 16.1003 },
  'potenza': { lat: 40.6402, lng: 15.8057 },
  'matera': { lat: 40.6664, lng: 16.6043 },
  'brindisi': { lat: 40.6369, lng: 17.9471 },
  'andria': { lat: 41.2294, lng: 16.2958 },
  'barletta': { lat: 41.3192, lng: 16.2821 },
  'trani': { lat: 41.2751, lng: 16.4166 },
  'bat': { lat: 41.2294, lng: 16.2958 },
  'altamura': { lat: 40.8259, lng: 16.5526 },
  'molfetta': { lat: 41.1998, lng: 16.5979 },

  // ── Sicilia ───────────────────────────────────────────────────────────────
  'siracusa': { lat: 37.0755, lng: 15.2866 },
  'ragusa': { lat: 36.9270, lng: 14.7243 },
  'trapani': { lat: 38.0176, lng: 12.5365 },
  'agrigento': { lat: 37.3111, lng: 13.5765 },
  'caltanissetta': { lat: 37.4913, lng: 14.0625 },
  'enna': { lat: 37.5664, lng: 14.2789 },

  // ── Sardegna ──────────────────────────────────────────────────────────────
  'sassari': { lat: 40.7259, lng: 8.5556 },
  'olbia': { lat: 40.9237, lng: 9.4986 },
  'nuoro': { lat: 40.3208, lng: 9.3309 },
  'oristano': { lat: 39.9061, lng: 8.5906 },
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
