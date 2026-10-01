import { useState } from 'react'
import { GRUPOS_DOCENTE } from '../../data/mockData'
import { IconChart, IconCheck, IconAlert, IconUsers, IconStar, IconDownload, IconFolder } from '../Icons'

const REPORT_TYPES = [
  { id: 'rendimiento', Icon: IconChart, title: 'Reporte de Rendimiento',   desc: 'Promedio general por grupo y alumno' },
  { id: 'asistencia',  Icon: IconCheck, title: 'Reporte de Asistencia',    desc: 'Porcentaje de asistencia por alumno' },
  { id: 'riesgo',      Icon: IconAlert, title: 'Alumnos en Riesgo',        desc: 'Alumnos con promedio menor a 7.0' },
  { id: 'excelencia',  Icon: IconStar,  title: 'Alumnos en Excelencia',    desc: 'Alumnos con promedio mayor a 9.0' },
]

function gradeColor(p) {
  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  return '#dc2626'
}

export default function ReportesDocente({ user }) {
  const grupos = GRUPOS_DOCENTE[user.id] || []
  const [activeReport, setActiveReport] = useState(null)

  const allAlumnos = grupos.flatMap(g => g.alumnos.map(a => ({ ...a, grupo: g.grupo, materia: g.materia })))
  const enRiesgo   = allAlumnos.filter(a => a.promedio < 7)
  const excelentes = allAlumnos.filter(a => a.promedio >= 9)

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Reportes</h1>
        <p>Genera y descarga reportes académicos de tus grupos</p>
      </div>

      {/* Report type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        {REPORT_TYPES.map(r => (
          <div
            className="reporte-card"
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            style={{ border: activeReport === r.id ? '2px solid var(--azul-profundo)' : '1px solid var(--border)' }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 10,
              background: activeReport === r.id ? 'rgba(32,58,80,.1)' : 'rgba(32,58,80,.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--azul-profundo)',
            }}>
              <r.Icon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: 'var(--text-primary)' }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Generated report tables ── */}
      {activeReport === 'rendimiento' && (
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">Reporte de Rendimiento</div>
              <div className="card-subtitle">Generado: {new Date().toLocaleDateString('es-MX')}</div>
            </div>
            <button className="btn btn-outline"><IconDownload size={14} /> Exportar PDF</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Alumno</th><th>Grupo</th><th>Materia</th><th>Promedio</th><th style={{ textAlign: 'center' }}>Estado</th></tr>
                </thead>
                <tbody>
                  {allAlumnos.map((al, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                      <td>{al.grupo}</td>
                      <td>{al.materia}</td>
                      <td><span style={{ fontWeight: 700, color: gradeColor(al.promedio) }}>{al.promedio.toFixed(1)}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`pill ${al.promedio >= 9 ? 'pill-success' : al.promedio >= 7 ? 'pill-warning' : 'pill-danger'}`}>
                          {al.promedio >= 9 ? 'Excelente' : al.promedio >= 7 ? 'Regular' : 'Riesgo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'riesgo' && (
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">Alumnos en Riesgo ({enRiesgo.length})</div>
              <div className="card-subtitle">Promedio inferior a 7.0 — requieren atención</div>
            </div>
            <button className="btn btn-outline"><IconDownload size={14} /> Exportar PDF</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {enRiesgo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)', fontSize: 14 }}>
                Sin alumnos en riesgo. Excelente trabajo.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Alumno</th><th>Grupo</th><th>Materia</th><th>Promedio</th><th>Faltas</th></tr>
                  </thead>
                  <tbody>
                    {enRiesgo.map((al, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                        <td>{al.grupo}</td>
                        <td>{al.materia}</td>
                        <td><span style={{ color: '#dc2626', fontWeight: 700 }}>{al.promedio.toFixed(1)}</span></td>
                        <td><span style={{ color: '#dc2626', fontWeight: 700 }}>{al.faltas}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeReport === 'excelencia' && (
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">Alumnos en Excelencia ({excelentes.length})</div>
              <div className="card-subtitle">Promedio superior a 9.0</div>
            </div>
            <button className="btn btn-outline"><IconDownload size={14} /> Exportar PDF</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Alumno</th><th>Grupo</th><th>Materia</th><th>Promedio</th></tr>
                </thead>
                <tbody>
                  {excelentes.map((al, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                      <td>{al.grupo}</td>
                      <td>{al.materia}</td>
                      <td><span style={{ color: '#16a34a', fontWeight: 700 }}>{al.promedio.toFixed(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'asistencia' && (
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">Reporte de Asistencia</div>
              <div className="card-subtitle">Porcentaje acumulado — 45 clases totales</div>
            </div>
            <button className="btn btn-outline"><IconDownload size={14} /> Exportar PDF</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Alumno</th><th>Grupo</th><th>Asistencias</th><th>Faltas</th><th>% Asistencia</th></tr>
                </thead>
                <tbody>
                  {allAlumnos.map((al, i) => {
                    const pct = Math.round((al.asistencias / 45) * 100)
                    const c = pct >= 80 ? '#16a34a' : pct >= 70 ? '#ca8a04' : '#dc2626'
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{al.nombre}</td>
                        <td>{al.grupo}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{al.asistencias}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{al.faltas}</td>
                        <td>
                          <div className="grade-bar-wrap">
                            <div className="grade-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
                            </div>
                            <span style={{ fontWeight: 700, color: c, minWidth: 38 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
