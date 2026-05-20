import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, ruolo }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/accedi" state={{ from: location.pathname }} replace />
  }

  if (ruolo && user.ruolo !== ruolo) {
    return <Navigate to={user.ruolo === 'tecnico' ? '/dashboard/tecnico' : '/dashboard/cliente'} replace />
  }

  return children
}
