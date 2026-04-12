import { useState } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Verificando...')

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:9001/api/health')
      const data = await response.json()
      setBackendStatus(data.message || 'Backend UP')
    } catch (error) {
      setBackendStatus('Backend no disponible')
    }
  }

  return (
    <div className="app">
      <h1>Scholarium Frontend</h1>
      <p>Frontend funcionando correctamente</p>

      <div className="backend-check">
        <button onClick={checkBackendHealth}>
          Verificar Backend
        </button>
        <p>Estado del backend: {backendStatus}</p>
      </div>
    </div>
  )
}

export default App