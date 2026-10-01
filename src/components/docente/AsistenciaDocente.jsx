import { useState } from 'react'
import { GRUPOS_DOCENTE } from '../../data/mockData'
import { IconUsers, IconCheck, IconAlert, IconCalendar, IconSave } from '../Icons'

const MAX_CLASES = 45

export default function AsistenciaDocente({ user }) {
  const grupos = GRUPOS_DOCENTE[user.id] || []
  const [activeGrupo, setActiveGrupo] = useState(grupos[0]?.id || '')
  const [guardado, setGuardado]       = useState(false)
  const [presentes, setPresentes]     = useState({})

  const grupo = grupos.find(g => g.id === activeGrupo) || grupos[0]
  if (!grupo) return <p style={{ padding: 24, color: 'var(--text-secondary)' }}>Sin grupos asignados.</p>

  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const togglePresente = (id) => setPresentes(p => ({ ...p, [id]: p[id] === undefined ? false : !p[id] }))

  const handleGuardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Control de Asistencia</h1>
        <p>Registra la asistencia diaria de tus grupos</p>
      </div>

      {guardado && (
        <div style={{
          background: '#dcfce7', border: '1px solid #86efac',
          borderRadius: 'var(--radius-sm)', padding: '12px 18px',
          marginBottom: 20, color: '#166534', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconCheck size={16} /> Asistencia guardada correctamente.
        </div>
      )}

      <div className="grupo-tabs">
        {grupos.map(g => (
          <button
            key={g.id}
            className={`grupo-tab${activeGrupo === g.id ? ' active' : ''}`}
            onClick={() => setActiveGrupo(g.id)}
          >
            {g.grupo} · {g.materia}
          </button>
        ))}
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(32,58,80,.07)' }}>
            <IconCalendar size={22} style={{ color: 'var(--azul-profundo)' }} />
          </div>
          <div className="stat-info">
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{today}</div>
            <div className="stat-label" style={{ marginTop: 4 }}>Fecha de hoy</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,.08)' }}>
            <IconCheck size={22} style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {grupo.alumnos.reduce((a, al) => a + al.asistencias, 0)}
            </div>
            <div className="stat-label">Asistencias acumuladas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.08)' }}>
            <IconAlert size={22} style={{ color: '#dc2626' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#dc2626' }}>
              {grupo.alumnos.reduce((a, al) => a + al.faltas, 0)}
            </div>
            <div className="stat-label">Faltas acumuladas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.08)' }}>
            <IconUsers size={22} style={{ color: '#ca8a04' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{grupo.alumnos.length}</div>
            <div className="stat-label">Total alumnos</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <div>
            <div className="card-title">Pase de lista — {grupo.grupo}</div>
            <div className="card-subtitle">Marca los alumnos presentes hoy</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                const all = {}
                grupo.alumnos.forEach(a => { all[a.id] = true })
                setPresentes(all)
              }}
            >
              Todos presentes
            </button>
            <button className="btn btn-primary" onClick={handleGuardar}>
              <IconSave size={14} /> Guardar
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Alumno</th>
                  <th style={{ textAlign: 'center' }}>Asistencias</th>
                  <th style={{ textAlign: 'center' }}>Faltas</th>
                  <th>% Asistencia</th>
                  <th style={{ textAlign: 'center' }}>Hoy</th>
                </tr>
              </thead>
              <tbody>
                {grupo.alumnos.map((al, idx) => {
                  const presente = presentes[al.id] === undefined ? true : presentes[al.id]
                  const pct = Math.round((al.asistencias / MAX_CLASES) * 100)
                  const c = pct >= 80 ? '#16a34a' : pct >= 70 ? '#ca8a04' : '#dc2626'
                  return (
                    <tr key={al.id} style={{ background: presente ? undefined : 'rgba(239,68,68,.03)' }}>
                      <td style={{ color: 'var(--text-light)', fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                      <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{al.asistencias}</td>
                      <td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{al.faltas}</td>
                      <td>
                        <div className="grade-bar-wrap">
                          <div className="grade-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 38, color: c }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => togglePresente(al.id)}
                          style={{
                            width: 34, height: 34,
                            border: `2px solid ${presente ? '#22c55e' : '#ef4444'}`,
                            background: presente ? '#dcfce7' : '#fee2e2',
                            borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .15s', color: presente ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {presente
                            ? <IconCheck size={15} />
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
