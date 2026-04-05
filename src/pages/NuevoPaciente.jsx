import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function NuevoPaciente() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    dni: '', apellido: '', nombre: '',
    fecha_nac: '', telefono: '', domicilio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.dni || !form.apellido || !form.nombre) {
      setError('DNI, apellido y nombre son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('pacientes')
      .insert([{
        hc_numero: 'HC-TMP',
        dni: form.dni,
        apellido: form.apellido.trim(),
        nombre: form.nombre.trim(),
        fecha_nac: form.fecha_nac || null,
        telefono: form.telefono || null,
        domicilio: form.domicilio || null,
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        setError('Ya existe un paciente con ese DNI')
      } else {
        setError('Error al guardar. Intentá de nuevo.')
      }
      setLoading(false)
      return
    }
    navigate(`/paciente/${data.id}`, { replace: true })
  }

  return (
    <>
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>← Volver</button>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Nuevo paciente</div>
        </div>
      </div>

      <div className="page">
        {error && <div className="error-msg">{error}</div>}

        <div className="section-title">Datos personales</div>
        <div className="card">
          <div className="field">
            <label>DNI *</label>
            <input
              type="number"
              placeholder="Ej: 30123456"
              value={form.dni}
              onChange={e => set('dni', e.target.value)}
            />
          </div>
          <div className="row2">
            <div className="field">
              <label>Apellido *</label>
              <input
                type="text"
                placeholder="García"
                value={form.apellido}
                onChange={e => set('apellido', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Nombre *</label>
              <input
                type="text"
                placeholder="María"
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
              />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={form.fecha_nac}
                onChange={e => set('fecha_nac', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Teléfono de referencia</label>
              <input
                type="tel"
                placeholder="011-1234-5678"
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Domicilio</label>
            <input
              type="text"
              placeholder="Calle, número, ciudad"
              value={form.domicilio}
              onChange={e => set('domicilio', e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={guardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar y continuar →'}
        </button>
      </div>
    </>
  )
}
