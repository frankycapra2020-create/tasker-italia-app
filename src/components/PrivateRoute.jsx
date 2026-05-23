import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, ruolo }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/accedi" state={{ from: location.pathname }} replace />
  }

  if (ruolo && user.ruolo !== ruolo) {
    return <Navigate to={user.ruolo === 'tecnico' ? '/dashboard/tecnico' : '/dashboard/cliente'} replace />
  }

  return children
}
