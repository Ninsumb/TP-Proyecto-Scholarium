import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './main/Pages/Auth/Login'
import Register from './main/Pages/Auth/Register'
import './App.css'
import { Portales } from './main/Pages/Portales/Portales'
import { LayoutMain } from './main/Layouts/LayoutMain'


function App() {
  return (
    <Router>
      <Routes>
        <Route element={<LayoutMain/>}>
          {/* Redirige la raíz al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Aquí puedes agregar más rutas en el futuro */}
          {<Route path="/portales" element={<Portales />} /> }
        </Route>
      </Routes>
    </Router>
  )
}

export default App





