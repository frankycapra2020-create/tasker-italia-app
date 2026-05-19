import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Technicians from './pages/Technicians'
import Tutorials from './pages/Tutorials'
import Booking from './pages/Booking'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servizi" element={<Services />} />
            <Route path="/tecnici" element={<Technicians />} />
            <Route path="/tutorial" element={<Tutorials />} />
            <Route path="/preventivo" element={<Booking />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
