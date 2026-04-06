import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function NuevoPaciente() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const esEdicion = !!editId

  const [form, setForm] = useState({
    dni: '', apellido: '', nombre: '',
    fecha_nac: '', telefono: '', domicilio: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingDatos, setLoadingDatos] = useState(esEdicion)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!esEdicion) return
    const cargar = async () => {
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', editId)
        .single()
      if (data) {
        setForm({
          dni: data.dni || '',
          apellido: data.apellido || '',
          nombre: data.nombre || '',
          fecha_nac: data.fecha_nac || '',
          telefono: data.telefono || '',
          domicilio: data.domicilio || '',
        })
      }
      setLoadingDatos(false)
    }
    cargar()
  }, [editId, esEdicion])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.dni || !form.apellido || !form.nombre) {
      setError('DNI, apellido y nombre son obligatorios')
      return
    }
    setLoading(true)
    setError('')

    if (esEdicion) {
      const { error } = await supabase
        .from('pacientes')
        .update({
          dni: form.dni,
          apellido: form.apellido.trim(),
          nombre: form.nombre.trim(),
          fecha_nac: form.fecha_nac || null,
          telefono: form.telefono || null,
          domicilio: form.domicilio || null,
        })
        .eq('id', editId)

      if (error) {
        setError(error.code === '23505' ? 'Ya existe otro paciente con ese DNI' : 'Error al guardar. Intentá de nuevo.')
        setLoading(false)
        return
      }
      navigate(`/paciente/${editId}`, { replace: true })
    } else {
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
        setError(error.code === '23505' ? 'Ya existe un paciente con ese DNI' : 'Error al guardar. Intentá de nuevo.')
        setLoading(false)
        return
      }
      navigate(`/paciente/${data.id}`, { replace: true })
    }
  }

  if (loadingDatos) {
    return <div className="loading"><div className="spinner" /> Cargando datos...</div>
  }

  return (
    <>
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>← Volver</button>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">{esEdicion ? 'Editar paciente' : 'Nuevo paciente'}</div>
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
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios ✓' : 'Guardar y continuar →'}
        </button>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>
    </>
  )
}
