import { useState } from 'react'
import { GRUPOS_DOCENTE } from '../../data/mockData'
import { IconUsers, IconGrade, IconCheck, IconAlert, IconSave, IconEdit } from '../Icons'

function gradeColor(p) {
  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  return '#dc2626'
}

export default function CalifDocente({ user }) {
  const grupos = GRUPOS_DOCENTE[user.id] || []
  const [activeGrupo, setActiveGrupo] = useState(grupos[0]?.id || '')
  const [editingId, setEditingId]     = useState(null)
  const [saved, setSaved]             = useState(false)

  const grupo = grupos.find(g => g.id === activeGrupo) || grupos[0]
  if (!grupo) return <p style={{ padding: 24, color: 'var(--text-secondary)' }}>Sin grupos asignados.</p>

  const promGrupo = (grupo.alumnos.reduce((a, al) => a + al.promedio, 0) / grupo.alumnos.length).toFixed(1)
  const aprobados = grupo.alumnos.filter(a => a.promedio >= 6).length

  const handleSave = () => {
    setSaved(true)
    setEditingId(null)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Calificaciones</h1>
        <p>Captura y consulta calificaciones de tus grupos</p>
      </div>

      {saved && (
        <div style={{
          background: '#dcfce7', border: '1px solid #86efac',
          borderRadius: 'var(--radius-sm)', padding: '12px 18px',
          marginBottom: 20, color: '#166534', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconCheck size={16} /> Calificaciones guardadas correctamente.
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
            <IconUsers size={22} style={{ color: 'var(--azul-profundo)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{grupo.alumnos.length}</div>
            <div className="stat-label">Alumnos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,.08)' }}>
            <IconGrade size={22} style={{ color: gradeColor(Number(promGrupo)) }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: gradeColor(Number(promGrupo)) }}>{promGrupo}</div>
            <div className="stat-label">Promedio del grupo</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,.08)' }}>
            <IconCheck size={22} style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#16a34a' }}>{aprobados}</div>
            <div className="stat-label">Aprobados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.08)' }}>
            <IconAlert size={22} style={{ color: '#dc2626' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#dc2626' }}>{grupo.alumnos.length - aprobados}</div>
            <div className="stat-label">En riesgo</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <div>
            <div className="card-title">{grupo.grupo} — {grupo.materia}</div>
            <div className="card-subtitle">Turno {grupo.turno}</div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            <IconSave size={14} /> Guardar cambios
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Alumno</th>
                  <th style={{ textAlign: 'center' }}>P1</th>
                  <th style={{ textAlign: 'center' }}>P2</th>
                  <th style={{ textAlign: 'center' }}>P3</th>
                  <th style={{ textAlign: 'center' }}>P4</th>
                  <th>Promedio</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {grupo.alumnos.map((al, idx) => (
                  <tr key={al.id}>
                    <td style={{ color: 'var(--text-light)', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                    {['p1','p2','p3','p4'].map(p => (
                      <td key={p} style={{ textAlign: 'center' }}>
                        {editingId === al.id ? (
                          <input
                            type="number" min="0" max="10" step="0.5"
                            defaultValue={al[p]}
                            style={{
                              width: 54, textAlign: 'center',
                              border: '1.5px solid var(--azul-profundo)',
                              borderRadius: 6, padding: '4px',
                              fontSize: 13, fontWeight: 700,
                              fontFamily: 'var(--font)',
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, color: gradeColor(al[p]) }}>{al[p]}</span>
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="grade-bar-wrap">
                        <div className="grade-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${(al.promedio / 10) * 100}%`, background: gradeColor(al.promedio) }} />
                        </div>
                        <span className="grade-num" style={{ color: gradeColor(al.promedio) }}>
                          {al.promedio.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pill ${al.promedio >= 6 ? 'pill-success' : 'pill-danger'}`}>
                        {al.promedio >= 6 ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '5px 10px', fontSize: 12, gap: 5 }}
                        onClick={() => setEditingId(editingId === al.id ? null : al.id)}
                      >
                        <IconEdit size={13} />
                        {editingId === al.id ? 'Listo' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
