import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function NuevaConsulta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [valueHelps, setValueHelps] = useState({})
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    proximo_turno: '',
    motivo: '',
    tratamiento: '',
    observaciones: '',
  })
  const [pie, setPie] = useState([])
  const [patologias, setPatologias] = useState([])
  const [sudoracion, setSudoracion] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const [{ data: pac }, { data: vh }] = await Promise.all([
        supabase.from('pacientes').select('apellido,nombre,hc_numero').eq('id', id).single(),
        supabase.from('value_helps').select('*').eq('activo', true).order('orden'),
      ])
      setPaciente(pac)
      const map = {}
      ;(vh || []).forEach(v => {
        if (!map[v.categoria]) map[v.categoria] = []
        map[v.categoria].push(v.valor)
      })
      setValueHelps(map)
    }
    init()
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const togglePie = (lado) => {
    setPie(prev => prev.includes(lado) ? prev.filter(p => p !== lado) : [...prev, lado])
  }
  const toggleChip = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const guardar = async () => {
    if (!form.fecha) { setError('La fecha es obligatoria'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.from('consultas').insert([{
      paciente_id: parseInt(id),
      fecha: form.fecha,
      proximo_turno: form.proximo_turno || null,
      motivo: form.motivo || null,
      pie,
      patologias,
      sudoracion,
      tratamiento: form.tratamiento || null,
      observaciones: form.observaciones || null,
    }])
    if (error) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }
    navigate(`/paciente/${id}`, { replace: true })
  }

  return (
    <>
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>← Volver</button>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Nueva consulta</div>
          {paciente && <div className="topbar-sub">{paciente.apellido}, {paciente.nombre} · {paciente.hc_numero}</div>}
        </div>
      </div>

      <div className="page">
        {error && <div className="error-msg">{error}</div>}

        <div className="section-title">Fecha de consulta</div>
        <div className="card">
          <div className="row2">
            <div className="field">
              <label>Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className="field">
              <label>Próximo turno</label>
              <input type="date" value={form.proximo_turno} onChange={e => set('proximo_turno', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Motivo de consulta</label>
            <input
              type="text"
              placeholder="Ej: Control, dolor en uña, etc."
              value={form.motivo}
              onChange={e => set('motivo', e.target.value)}
            />
          </div>
        </div>

        <div className="section-title">Pie afectado</div>
        <div className="card">
          <div className="pie-grid">
            <div className={`pie-btn${pie.includes('D') ? ' active' : ''}`} onClick={() => togglePie('D')}>
              🦶 Pie derecho
            </div>
            <div className={`pie-btn${pie.includes('I') ? ' active' : ''}`} onClick={() => togglePie('I')}>
              🦶 Pie izquierdo
            </div>
          </div>
        </div>

        <div className="section-title">Patología ungueal</div>
        <div className="card">
          <div className="chip-group">
            {(valueHelps['patologia'] || []).map(p => (
              <div
                key={p}
                className={`chip${patologias.includes(p) ? ' active' : ''}`}
                onClick={() => toggleChip(p, patologias, setPatologias)}
              >{p}</div>
            ))}
          </div>
        </div>

        <div className="section-title">Sudoración y piel</div>
        <div className="card">
          <div className="chip-group">
            {(valueHelps['sudoracion'] || []).map(s => (
              <div
                key={s}
                className={`chip${sudoracion.includes(s) ? ' active' : ''}`}
                onClick={() => toggleChip(s, sudoracion, setSudoracion)}
              >{s}</div>
            ))}
          </div>
        </div>

        <div className="section-title">Tratamiento realizado</div>
        <div className="card">
          <div className="field">
            <label>Descripción del tratamiento</label>
            <textarea
              placeholder="Describir el tratamiento realizado en esta consulta..."
              value={form.tratamiento}
              onChange={e => set('tratamiento', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Observaciones adicionales</label>
            <textarea
              placeholder="Notas adicionales..."
              style={{ minHeight: 70 }}
              value={form.observaciones}
              onChange={e => set('observaciones', e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={guardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar consulta ✓'}
        </button>
      </div>
    </>
  )
}
