import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ClientDashboard from './pages/ClientDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ColaboradorLogin from './pages/ColaboradorLogin'
import ColaboradorDashboard from './pages/ColaboradorDashboard'

// Guard para rotas admin
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('fat_admin_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/status/:token" element={<ClientDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Rotas Colaborador */}
        <Route path="/colaborador/login" element={<ColaboradorLogin />} />
        <Route path="/colaborador/dashboard" element={<ColaboradorDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
