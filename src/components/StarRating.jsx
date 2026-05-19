import { Star } from 'lucide-react'

export default function StarRating({ rating, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  )
}
