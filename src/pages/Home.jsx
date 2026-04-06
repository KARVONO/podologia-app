import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function calcEdad(fechaNac) {
  if (!fechaNac) return ''
  const hoy = new Date()
  const nac = new Date(fechaNac)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad + ' a'
}

function fmtDni(dni) {
  return dni ? dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

export default function Home() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pacientes')
      .select('id, hc_numero, dni, apellido, nombre, fecha_nac, telefono')
      .order('apellido', { ascending: true })
    setPacientes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = pacientes.filter(p => {
    const q = filtro.toLowerCase()
    return (
      p.apellido?.toLowerCase().includes(q) ||
      p.nombre?.toLowerCase().includes(q) ||
      p.dni?.toString().includes(q) ||
      p.hc_numero?.toLowerCase().includes(q)
    )
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-logo">🦶</div>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">PodoConsulta</div>
          <div className="topbar-sub">Historias Clínicas</div>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer' }}>
          Salir
        </button>
      </div>

      <div className="page">
        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>

        <button className="btn-primary" style={{ marginBottom: 20 }} onClick={() => navigate('/nuevo-paciente')}>
          + Nuevo paciente
        </button>

        {loading ? (
          <div className="loading"><div className="spinner" /> Cargando pacientes...</div>
        ) : filtrados.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">
              {filtro ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}
            </div>
          </div>
        ) : (
          filtrados.map(p => {
            const ini = ((p.apellido?.[0] || '') + (p.nombre?.[0] || '')).toUpperCase()
            const edad = calcEdad(p.fecha_nac)
            return (
              <div key={p.id} className="patient-card" onClick={() => navigate(`/paciente/${p.id}`)}>
                <div className="avatar">{ini}</div>
                <div style={{ flex: 1 }}>
                  <div className="patient-name">{p.apellido}, {p.nombre}</div>
                  <div className="patient-meta">
                    {p.hc_numero} · DNI {fmtDni(p.dni)}{edad ? ` · ${edad}` : ''}{p.telefono ? ` · ${p.telefono}` : ''}
                  </div>
                </div>
                <div className="chevron">›</div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
