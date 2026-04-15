import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './main/Pages/Auth/Login'
import Register from './main/Pages/Auth/Register'
import './App.css'
import { useState } from 'react'
// Importa los estilos de PrimeReact
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* más rutas después */}
        {/* <Route path="/portales" element={<Portales />} /> */}
      </Routes>
    </Router>
  )
}

export default App