import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useReview } from '../context/ReviewContext'
import { formatKm, zoomDaRaggio } from '../utils/geo'

// Mappa colori Tailwind → hex per DivIcon
const BG_COLORS = {
  'bg-blue-600': '#2563eb',
  'bg-yellow-600': '#ca8a04',
  'bg-green-600': '#16a34a',
  'bg-red-600': '#dc2626',
  'bg-purple-600': '#9333ea',
  'bg-orange-600': '#ea580c',
}

function makeTechIcon(tech) {
  const bg = BG_COLORS[tech.avatarColor] || '#1e3a8a'
  const ring = tech.available ? '#16a34a' : '#d97706'
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:42px;height:42px;">
        <div style="
          width:42px;height:42px;
          background:${bg};
          border:3px solid ${ring};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:#fff;
          box-shadow:0 3px 12px rgba(0,0,0,0.25);
          font-family:system-ui,sans-serif;
          letter-spacing:0.5px;
        ">${tech.avatar}</div>
        <div style="
          position:absolute;bottom:1px;right:1px;
          width:11px;height:11px;
          background:${ring};
          border:2px solid #fff;
          border-radius:50%;
        "></div>
      </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -26],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div class="geo-pulse-ring" style="
        position:absolute;inset:-8px;
        background:rgba(29,78,216,0.2);
        border-radius:50%;
      "></div>
      <div style="
        width:24px;height:24px;
        background:#1d4ed8;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(29,78,216,0.5);
      "></div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 })
  }, [center, zoom, map])
  return null
}

function StarsMini({ value }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? '#facc15' : '#e5e7eb', fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

function TechPopup({ tech, distanzaKm }) {
  const { getByTecnico } = useReview()
  const reviews = getByTecnico(tech.id)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.stelle, 0) / reviews.length
    : tech.rating
  const totalReviews = reviews.length > 0 ? reviews.length : tech.reviews

  return (
    <div style={{ minWidth: 210, fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: BG_COLORS[tech.avatarColor] || '#1e3a8a',
          color: '#fff', fontWeight: 700, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {tech.avatar}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
            {tech.name}
          </div>
          <div style={{ color: tech.available ? '#16a34a' : '#d97706', fontSize: 11, fontWeight: 600 }}>
            ● {tech.available ? 'Disponibile' : 'Occupato'}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <StarsMini value={avgRating} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{avgRating.toFixed(1)}</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>({totalReviews})</span>
      </div>

      {/* Specializations */}
      <div style={{ marginBottom: 4 }}>
        {tech.specializations.slice(0, 2).map(s => (
          <span key={s} style={{
            display: 'inline-block', marginRight: 4,
            padding: '1px 7px', borderRadius: 20,
            background: '#f3f4f6', color: '#374151', fontSize: 10, fontWeight: 600,
          }}>{s}</span>
        ))}
      </div>

      {/* Distanza */}
      {distanzaKm !== null && distanzaKm !== undefined && (
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          📍 {formatKm(distanzaKm)} da te · €{tech.pricePerHour}/h
        </div>
      )}

      {/* Risposta */}
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
        ⚡ Risponde {tech.responseTime}
      </div>

      {/* Bottoni */}
      <div style={{ display: 'flex', gap: 6 }}>
        <a
          href={`/tecnici/${tech.id}`}
          style={{
            flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600,
            padding: '6px 8px', borderRadius: 8,
            background: '#f3f4f6', color: '#374151', textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = '#e5e7eb'}
          onMouseLeave={e => e.target.style.background = '#f3f4f6'}
        >
          Profilo
        </a>
        <a
          href="/preventivo"
          style={{
            flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600,
            padding: '6px 8px', borderRadius: 8,
            background: '#1e3a8a', color: '#fff', textDecoration: 'none',
          }}
          onMouseEnter={e => e.target.style.background = '#1e40af'}
          onMouseLeave={e => e.target.style.background = '#1e3a8a'}
        >
          Prenota
        </a>
      </div>
    </div>
  )
}

const ITALY_CENTER = [42.5, 12.5]

export default function MappaTeacnici({ tecnici, position, raggio }) {
  const mapCenter = position ? [position.lat, position.lng] : ITALY_CENTER
  const zoom = position ? zoomDaRaggio(raggio) : 6

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '100%', minHeight: 360 }}>
      <MapContainer
        center={ITALY_CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Tile basemap CartoDB Positron (leggero e pulito) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Panner reattivo */}
        <MapController center={mapCenter} zoom={zoom} />

        {/* Cerchio raggio di ricerca */}
        {position && (
          <Circle
            center={[position.lat, position.lng]}
            radius={raggio * 1000}
            pathOptions={{ color: '#1e3a8a', fillColor: '#1e3a8a', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' }}
          />
        )}

        {/* Pin posizione utente */}
        {position && (
          <Marker position={[position.lat, position.lng]} icon={userIcon}>
            <Popup maxWidth={160}>
              <div style={{ textAlign: 'center', fontFamily: 'system-ui,sans-serif', padding: '2px 0' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>📍</div>
                <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 13 }}>La tua posizione</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pin tecnici */}
        {tecnici.map(tech => (
          tech.lat && tech.lng ? (
            <Marker
              key={tech.id}
              position={[tech.lat, tech.lng]}
              icon={makeTechIcon(tech)}
            >
              <Popup maxWidth={240} minWidth={220}>
                <TechPopup tech={tech} distanzaKm={tech.distanzaKm} />
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>

      {/* Legenda */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm rounded-xl shadow px-3 py-2 flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-green-500 bg-white inline-block"></span>
          Disponibile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-white inline-block"></span>
          Occupato
        </span>
        {position && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-700 inline-block"></span>
            Tu
          </span>
        )}
      </div>
    </div>
  )
}
