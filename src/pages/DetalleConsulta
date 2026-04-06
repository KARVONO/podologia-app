import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function fmtDate(d) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

export default function DetalleConsulta() {
  const { id, consultaId } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [valueHelps, setValueHelps] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fecha: '', proximo_turno: '', motivo: '',
    tratamiento: '', observaciones: '',
  })
  const [pie, setPie] = useState([])
  const [patologias, setPatologias] = useState([])
  const [sudoracion, setSudoracion] = useState([])

  useEffect(() => {
    const init = async () => {
      const [{ data: pac }, { data: cons }, { data: vh }] = await Promise.all([
        supabase.from('pacientes').select('apellido,nombre,hc_numero').eq('id', id).single(),
        supabase.from('consultas').select('*').eq('id', consultaId).single(),
        supabase.from('value_helps').select('*').eq('activo', true).order('orden'),
      ])
      setPaciente(pac)
      if (cons) {
        setForm({
          fecha: cons.fecha || '',
          proximo_turno: cons.proximo_turno || '',
          motivo: cons.motivo || '',
          tratamiento: cons.tratamiento || '',
          observaciones: cons.observaciones || '',
        })
        setPie(cons.pie || [])
        setPatologias(cons.patologias || [])
        setSudoracion(cons.sudoracion || [])
      }
      const map = {}
      ;(vh || []).forEach(v => {
        if (!map[v.categoria]) map[v.categoria] = []
        map[v.categoria].push(v.valor)
      })
      setValueHelps(map)
      setLoading(false)
    }
    init()
  }, [id, consultaId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const togglePie = (lado) => {
    setPie(prev => prev.includes(lado) ? prev.filter(p => p !== lado) : [...prev, lado])
  }
  const toggleChip = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const guardar = async () => {
    if (!form.fecha) { setError('La fecha es obligatoria'); return }
    setSaving(true)
    setError('')
    const { error } = await supabase.from('consultas').update({
      fecha: form.fecha,
      proximo_turno: form.proximo_turno || null,
      motivo: form.motivo || null,
      pie,
      patologias,
      sudoracion,
      tratamiento: form.tratamiento || null,
      observaciones: form.observaciones || null,
    }).eq('id', consultaId)
    if (error) {
      setError('Error al guardar. Intentá de nuevo.')
    } else {
      setEditMode(false)
    }
    setSaving(false)
  }

  const borrar = async () => {
    if (!window.confirm('¿Seguro que querés borrar esta consulta? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    await supabase.from('consultas').delete().eq('id', consultaId)
    navigate(`/paciente/${id}`, { replace: true })
  }

  if (loading) return <div className="loading"><div className="spinner" /> Cargando...</div>

  return (
    <>
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/paciente/${id}`)}>← Volver</button>
        <div style={{ flex: 1 }}>
          <div className="topbar-title">{editMode ? 'Editar consulta' : 'Detalle de consulta'}</div>
          {paciente && <div className="topbar-sub">{paciente.apellido}, {paciente.nombre}</div>}
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            style={{ background: 'none', border: 'none', color: '#1D9E75', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Editar
          </button>
        )}
      </div>

      <div className="page">
        {error && <div className="error-msg">{error}</div>}

        {/* MODO VISTA */}
        {!editMode && (
          <>
            <div className="section-title">Fecha de consulta</div>
            <div className="card">
              <div className="dato-row">
                <div className="dato-label">Fecha</div>
                <div className="dato-val">{fmtDate(form.fecha)}</div>
              </div>
              {form.proximo_turno && (
                <div className="dato-row">
                  <div className="dato-label">Próximo turno</div>
                  <div className="dato-val">{fmtDate(form.proximo_turno)}</div>
                </div>
              )}
              {form.motivo && (
                <div className="dato-row">
                  <div className="dato-label">Motivo</div>
                  <div className="dato-val">{form.motivo}</div>
                </div>
              )}
            </div>

            {(pie.length > 0 || patologias.length > 0 || sudoracion.length > 0) && (
              <>
                <div className="section-title">Hallazgos clínicos</div>
                <div className="card">
                  {pie.length > 0 && (
                    <div className="dato-row">
                      <div className="dato-label">Pie afectado</div>
                      <div className="dato-val">{pie.map(p => p === 'D' ? 'Pie Derecho' : 'Pie Izquierdo').join(', ')}</div>
                    </div>
                  )}
                  {patologias.length > 0 && (
                    <div className="dato-row">
                      <div className="dato-label">Patologías</div>
                      <div style={{ marginTop: 6 }} className="tag-group">
                        {patologias.map(p => <span key={p} className="tag">{p}</span>)}
                      </div>
                    </div>
                  )}
                  {sudoracion.length > 0 && (
                    <div className="dato-row">
                      <div className="dato-label">Sudoración / piel</div>
                      <div style={{ marginTop: 6 }} className="tag-group">
                        {sudoracion.map(s => <span key={s} className="tag">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {(form.tratamiento || form.observaciones) && (
              <>
                <div className="section-title">Tratamiento</div>
                <div className="card">
                  {form.tratamiento && (
                    <div className="dato-row">
                      <div className="dato-label">Tratamiento realizado</div>
                      <div className="dato-val" style={{ lineHeight: 1.6 }}>{form.tratamiento}</div>
                    </div>
                  )}
                  {form.observaciones && (
                    <div className="dato-row">
                      <div className="dato-label">Observaciones</div>
                      <div className="dato-val" style={{ lineHeight: 1.6 }}>{form.observaciones}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              className="btn-danger"
              style={{ width: '100%', marginTop: 24, padding: 14 }}
              onClick={borrar}
              disabled={deleting}
            >
              {deleting ? 'Borrando...' : 'Borrar esta consulta'}
            </button>
          </>
        )}

        {/* MODO EDICIÓN */}
        {editMode && (
          <>
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
                  <div key={p} className={`chip${patologias.includes(p) ? ' active' : ''}`}
                    onClick={() => toggleChip(p, patologias, setPatologias)}>{p}</div>
                ))}
              </div>
            </div>

            <div className="section-title">Sudoración y piel</div>
            <div className="card">
              <div className="chip-group">
                {(valueHelps['sudoracion'] || []).map(s => (
                  <div key={s} className={`chip${sudoracion.includes(s) ? ' active' : ''}`}
                    onClick={() => toggleChip(s, sudoracion, setSudoracion)}>{s}</div>
                ))}
              </div>
            </div>

            <div className="section-title">Tratamiento realizado</div>
            <div className="card">
              <div className="field">
                <label>Descripción del tratamiento</label>
                <textarea
                  placeholder="Describir el tratamiento..."
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

            <button className="btn-primary" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios ✓'}
            </button>
            <button className="btn-secondary" onClick={() => setEditMode(false)}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </>
  )
}
