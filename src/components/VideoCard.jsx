import { useState } from 'react'
import { Play, Clock, Eye, AlertTriangle, X } from 'lucide-react'

export default function VideoCard({ tutorial }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="card overflow-hidden flex flex-col">
        <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
          <img
            src={tutorial.thumbnail}
            alt={tutorial.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
              <Play size={24} className="text-brand-800 fill-brand-800" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {tutorial.duration}
          </span>
          {tutorial.tags.includes('Vita') && (
            <span className="absolute top-2 left-2 badge bg-red-500 text-white">
              <AlertTriangle size={10} /> Sicurezza vitale
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className={`badge ${tutorial.levelColor}`}>{tutorial.level}</span>
            {tutorial.tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge bg-gray-100 text-gray-600">{tag}</span>
            ))}
          </div>

          <h3 className="font-bold text-gray-900 leading-snug">{tutorial.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{tutorial.description}</p>

          {tutorial.safetyTips && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                <AlertTriangle size={12} /> Consigli di sicurezza
              </p>
              <ul className="space-y-1">
                {tutorial.safetyTips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2">
            <span>da {tutorial.instructor}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {tutorial.views.toLocaleString('it-IT')}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 z-10 hover:bg-black/80"
            >
              <X size={18} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${tutorial.videoId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={tutorial.title}
            />
          </div>
        </div>
      )}
    </>
  )
}
