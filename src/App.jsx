import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import NuevoPaciente from './pages/NuevoPaciente'
import Paciente from './pages/Paciente'
import NuevaConsulta from './pages/NuevaConsulta'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="login-wrap">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🦶</div>
          <div style={{ marginTop: 12, color: '#999' }}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (!session) return <Login onLogin={setSession} />

  return (
    <div className="app-wrap">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo-paciente" element={<NuevoPaciente />} />
        <Route path="/paciente/:id" element={<Paciente />} />
        <Route path="/paciente/:id/nueva-consulta" element={<NuevaConsulta />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}
