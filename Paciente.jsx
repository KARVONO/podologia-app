import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ANTECEDENTES_DEF = [
  { key: 'dbt',      label: 'Diabetes (DBT)',       cat: 'med_dbt' },
  { key: 'hta',      label: 'Hipertensión (HTA)',    cat: 'med_hta' },
  { key: 'cardio',   label: 'Cardíacos',             cat: 'med_cardio' },
  { key: 'anticoag', label: 'Anticoagulado',         cat: 'med_anticoag' },
  { key: 'hepatitis',label: 'Hepatitis',             cat: 'hepatitis' },
  { key: 'alergia',  label: 'Alergia',               cat: null },
  { key: 'otros',    label: 'Otros medicamentos',    cat: null },
]

function fmtDate(d) {
  if (!d) return ''
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}
function calcEdad(fechaNac) {
  if (!fechaNac) return null
  const hoy = new Date()
  const nac = new Date(fechaNac)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}
function fmtDni(dni) {
  return dni ? dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

export default function Paciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [paciente, setPaciente] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [antecedentes, setAntecedentes] = useState({})
  const [valueHelps, setValueHelps] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingAntec, setSavingAntec] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const [{ data: pac }, { data: cons }, { data: antec }, { data: vh }] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', id).single(),
      supabase.from('consultas').select('*').eq('paciente_id', id).order('fecha', { ascending: false }),
      supabase.from('antecedentes').select('*').eq('paciente_id', id),
      supabase.from('value_helps').select('*').eq('activo', true).order('orden'),
    ])
    setPaciente(pac)
    setConsultas(cons || [])
    const antecMap = {}
    ;(antec || []).forEach(a => { antecMap[a.tipo] = a })
    setAntecedentes(antecMap)
    const vhMap = {}
    ;(vh || []).forEach(v => {
      if (!vhMap[v.categoria]) vhMap[v.categoria] = []
      vhMap[v.categoria].push(v.valor)
    })
    setValueHelps(vhMap)
    setLoading(false)
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const toggleAntec = (key) => {
    setAntecedentes(prev => {
      const cur = prev[key] || { tipo: key, activo: false, medicamentos: [], detalle: '' }
      return { ...prev, [key]: { ...cur, activo: !cur.activo } }
    })
  }
  const toggleMed = (key, med) => {
    setAntecedentes(prev => {
      const cur = prev[key] || { tipo: key, activo: true, medicamentos: [], detalle: '' }
      const meds = cur.medicamentos || []
      const updated = meds.includes(med) ? meds.filter(m => m !== med) : [...meds, med]
      return { ...prev, [key]: { ...cur, medicamentos: updated } }
    })
  }
  const setDetalle = (key, val) => {
    setAntecedentes(prev => {
      const cur = prev[key] || { tipo: key, activo: true, medicamentos: [], detalle: '' }
      return { ...prev, [key]: { ...cur, detalle: val } }
    })
  }

  const guardarAntecedentes = async () => {
    setSavingAntec(true)
    const rows = ANTECEDENTES_DEF.map(a => {
      const cur = antecedentes[a.key] || {}
      return {
        paciente_id: parseInt(id),
        tipo: a.key,
        activo: cur.activo || false,
        medicamentos: cur.medicamentos || [],
        detalle: cur.detalle || null,
        updated_at: new Date().toISOString(),
      }
    })
    await supabase.from('antecedentes').upsert(rows, { onConflict: 'paciente_id,tipo' })
    setSavingAntec(false)
    alert('Antecedentes guardados ✓')
  }

  if (loading) return <div className="loading"><div className="spinner" /> Cargando...</div>
  if (!paciente) return <div className="page">Paciente no encontrado</div>

  const ini = ((paciente.apellido?.[0] || '') + (paciente.nombre?.[0] || '')).toUpperCase()
  const edad = calcEdad(paciente.fecha_nac)

  return (
    <>
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate('/')}>← Inicio</button>
      </div>

      <div className="page" style={{ paddingTop: 12 }}>
        {/* Header del paciente */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="avatar" style={{ width: 52, height: 52, fontSize: 17 }}>{ini}</div>
          <div style={{ flex: 1 }}>
            <div className="hc-badge">{paciente.hc_numero}</div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>{paciente.apellido}, {paciente.nombre}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              DNI {fmtDni(paciente.dni)}{edad ? ` · ${edad} años` : ''}{paciente.telefono ? ` · ${paciente.telefono}` : ''}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginLeft: -16, marginRight: -16, paddingLeft: 8 }}>
          {['Consultas', 'Antecedentes', 'Datos'].map((t, i) => (
            <div key={i} className={`tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
          ))}
        </div>

        {/* TAB 0: Consultas */}
        {tab === 0 && (
          <>
            <button className="btn-primary" style={{ marginBottom: 16 }} onClick={() => navigate(`/paciente/${id}/nueva-consulta`)}>
              + Nueva consulta
            </button>
            {consultas.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <div className="empty-text">Sin consultas registradas</div>
              </div>
            ) : consultas.map(c => (
              <div
                key={c.id}
                className="consulta-card"
                onClick={() => navigate(`/paciente/${id}/consulta/${c.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="consulta-fecha">
                      {fmtDate(c.fecha)}{c.proximo_turno ? ` · Próx: ${fmtDate(c.proximo_turno)}` : ''}
                    </div>
                    <div className="consulta-motivo">{c.motivo || 'Sin motivo registrado'}</div>
                  </div>
                  <div style={{ color: '#bbb', fontSize: 20, marginLeft: 8 }}>›</div>
                </div>
                {((c.pie?.length || 0) + (c.patologias?.length || 0) + (c.sudoracion?.length || 0)) > 0 && (
                  <div className="tag-group">
                    {(c.pie || []).map(p => <span key={p} className="tag">Pie {p === 'D' ? 'Derecho' : 'Izquierdo'}</span>)}
                    {(c.patologias || []).map(p => <span key={p} className="tag">{p}</span>)}
                    {(c.sudoracion || []).map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                )}
                {c.tratamiento && <div className="consulta-trat">{c.tratamiento}</div>}
              </div>
            ))}
          </>
        )}

        {/* TAB 1: Antecedentes */}
        {tab === 1 && (
          <>
            <div className="card">
              {ANTECEDENTES_DEF.map(a => {
                const cur = antecedentes[a.key] || {}
                const isOn = cur.activo || false
                const meds = cur.medicamentos || []
                const opts = a.cat ? (valueHelps[a.cat] || []) : []
                return (
                  <div key={a.key} className="toggle-row">
                    <div style={{ flex: 1 }}>
                      <div className="toggle-label">{a.label}</div>
                      {isOn && opts.length > 0 && (
                        <div className="pills">
                          {opts.map(o => (
                            <div
                              key={o}
                              className={`pill${meds.includes(o) ? ' active' : ''}`}
                              onClick={() => toggleMed(a.key, o)}
                            >{o}</div>
                          ))}
                        </div>
                      )}
                      {isOn && (a.key === 'alergia' || a.key === 'otros') && (
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="text"
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#f5f5f5' }}
                            placeholder={a.key === 'alergia' ? 'Describir alergia...' : 'Especificar medicamentos...'}
                            value={cur.detalle || ''}
                            onChange={e => setDetalle(a.key, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      className={`toggle-switch${isOn ? ' on' : ''}`}
                      onClick={() => toggleAntec(a.key)}
                    />
                  </div>
                )
              })}
            </div>
            <button className="btn-primary" onClick={guardarAntecedentes} disabled={savingAntec}>
              {savingAntec ? 'Guardando...' : 'Guardar antecedentes'}
            </button>
          </>
        )}

        {/* TAB 2: Datos personales */}
        {tab === 2 && (
          <>
            <div className="card">
              {[
                ['HC', paciente.hc_numero],
                ['DNI', fmtDni(paciente.dni)],
                ['Apellido y nombre', `${paciente.apellido}, ${paciente.nombre}`],
                ['Fecha de nacimiento', fmtDate(paciente.fecha_nac)],
                ['Edad', edad ? `${edad} años` : null],
                ['Teléfono', paciente.telefono],
                ['Domicilio', paciente.domicilio],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="dato-row">
                  <div className="dato-label">{k}</div>
                  <div className="dato-val">{v}</div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => navigate(`/nuevo-paciente?edit=${id}`)}>
              Editar datos del paciente
            </button>
          </>
        )}
      </div>
    </>
  )
}
