import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { ReviewProvider } from './context/ReviewContext'
import { ChatProvider } from './context/ChatContext'
import { GeoProvider } from './context/GeoContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Services from './pages/Services'
import Technicians from './pages/Technicians'
import TechnicianProfile from './pages/TechnicianProfile'
import Tutorials from './pages/Tutorials'
import Booking from './pages/Booking'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardCliente from './pages/DashboardCliente'
import DashboardTecnico from './pages/DashboardTecnico'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <ReviewProvider>
            <ChatProvider>
            <GeoProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/servizi" element={<Services />} />
                  <Route path="/tecnici" element={<Technicians />} />
                  <Route path="/tecnici/:id" element={<TechnicianProfile />} />
                  <Route path="/tutorial" element={<Tutorials />} />
                  <Route path="/preventivo" element={<Booking />} />
                  <Route path="/accedi" element={<Login />} />
                  <Route path="/registrati" element={<Register />} />
                  <Route
                    path="/dashboard/cliente"
                    element={
                      <PrivateRoute ruolo="cliente">
                        <DashboardCliente />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dashboard/tecnico"
                    element={
                      <PrivateRoute ruolo="tecnico">
                        <DashboardTecnico />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
            </GeoProvider>
            </ChatProvider>
          </ReviewProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
