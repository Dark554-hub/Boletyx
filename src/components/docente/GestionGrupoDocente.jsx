import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  IconUsers,
  IconGrade,
  IconCheck,
  IconAlert,
} from '../Icons'

const ESTILOS = `
.gd-page {
  --gd-blue: #203A50;
  --gd-border: #DCE5EA;
  --gd-text: #172B3A;
  --gd-text-2: #647889;
  --gd-text-3: #8FA0AF;

  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px 50px;
}

.gd-header {
  margin-bottom: 22px;
}

.gd-header h1 {
  margin: 0 0 5px;
  color: var(--gd-text);
  font-size: 24px;
  font-weight: 700;
}

.gd-header p {
  margin: 0;
  color: var(--gd-text-2);
  font-size: 14px;
}

.gd-alert {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  padding: 12px 16px;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.gd-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.gd-tab {
  padding: 9px 15px;
  color: var(--gd-text-2);
  background: #fff;
  border: 1px solid var(--gd-border);
  border-radius: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.gd-tab:hover {
  color: var(--gd-blue);
  background: #f4f9fb;
}

.gd-tab.active {
  color: #fff;
  background: var(--gd-blue);
  border-color: var(--gd-blue);
}

.gd-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.gd-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 100px;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--gd-border);
  border-radius: 14px;
}

.gd-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
}

.gd-stat-value {
  color: var(--gd-text);
  font-size: 22px;
  font-weight: 800;
}

.gd-stat-label {
  margin-top: 3px;
  color: var(--gd-text-3);
  font-size: 12px;
}

.gd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.gd-search {
  width: min(420px, 100%);
  padding: 10px 12px;
  color: var(--gd-text);
  background: #fff;
  border: 1px solid var(--gd-border);
  border-radius: 10px;
  outline: none;
  font-size: 13px;
}

.gd-search:focus {
  border-color: var(--gd-blue);
  box-shadow: 0 0 0 3px rgba(32,58,80,.08);
}

.gd-readonly {
  padding: 7px 10px;
  color: #1d4e89;
  background: #e3eefa;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.gd-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--gd-border);
  border-radius: 14px;
}

.gd-card-head {
  padding: 18px 20px;
  border-bottom: 1px solid var(--gd-border);
}

.gd-card-title {
  color: var(--gd-text);
  font-size: 16px;
  font-weight: 700;
}

.gd-card-subtitle {
  margin-top: 4px;
  color: var(--gd-text-2);
  font-size: 12px;
}

.gd-table-wrap {
  overflow-x: auto;
}

.gd-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.gd-table th {
  padding: 12px 16px;
  color: var(--gd-text-2);
  background: #F7F9FA;
  border-bottom: 1px solid var(--gd-border);
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.gd-table td {
  padding: 14px 16px;
  color: var(--gd-text);
  border-bottom: 1px solid #EDF1F3;
  font-size: 13px;
}

.gd-table tbody tr:last-child td {
  border-bottom: 0;
}

.gd-table tbody tr:hover {
  background: #FAFCFD;
}

.gd-alumno {
  font-weight: 700;
}

.gd-muted {
  color: var(--gd-text-3);
}

.gd-pill {
  display: inline-block;
  padding: 4px 9px;
  color: #1d4e89;
  background: #e3eefa;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.gd-empty {
  padding: 36px 20px;
  color: var(--gd-text-2);
  text-align: center;
  font-size: 14px;
}

@media (max-width: 1000px) {
  .gd-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .gd-page {
    padding: 18px 12px 35px;
  }

  .gd-stats {
    grid-template-columns: 1fr;
  }

  .gd-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .gd-tab {
    flex-shrink: 0;
  }

  .gd-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .gd-search {
    width: 100%;
  }
}
`

export default function GestionGrupoDocente({ user }) {
  const [asignaciones, setAsignaciones] = useState([])
  const [activeAsignacion, setActiveAsignacion] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [user?.docente_id])

  async function cargarDatos() {
    if (!user?.docente_id) {
      setError('No se encontró el identificador del docente.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('grupo_materias')
        .select(`
          id,
          grupo_id,
          materia_id,

          grupos (
            id,
            nombre,
            semestre,
            turno,
            ciclo_escolar,

            inscripciones (
              id,
              alumno_id,

              alumnos (
                id,
                matricula,
                semestre,
                grupo,
                turno,

                perfiles (
                  nombre,
                  apellido
                )
              )
            )
          ),

          materias (
            id,
            nombre
          )
        `)
        .eq('docente_id', user.docente_id)
        .order('id')

      if (queryError) {
        throw queryError
      }

      const formateadas = (data || []).map(asignacion => {
        const grupo = Array.isArray(asignacion.grupos)
          ? asignacion.grupos[0]
          : asignacion.grupos

        const materia = Array.isArray(asignacion.materias)
          ? asignacion.materias[0]
          : asignacion.materias

        const alumnos = (grupo?.inscripciones || [])
          .map(inscripcion => {
            const alumno = Array.isArray(inscripcion.alumnos)
              ? inscripcion.alumnos[0]
              : inscripcion.alumnos

            const perfil = Array.isArray(alumno?.perfiles)
              ? alumno.perfiles[0]
              : alumno?.perfiles

            if (!alumno?.id) {
              return null
            }

            return {
              id: alumno.id,
              inscripcion_id: inscripcion.id,
              matricula: alumno.matricula || 'Sin matrícula',
              nombre: [perfil?.nombre, perfil?.apellido]
                .filter(Boolean)
                .join(' ') || 'Alumno sin nombre',
              semestre: alumno.semestre ?? grupo?.semestre ?? '—',
              grupoAlumno: alumno.grupo || grupo?.nombre || '—',
              turno: alumno.turno || grupo?.turno || '—',
            }
          })
          .filter(Boolean)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

        return {
          id: asignacion.id,
          grupo_id: asignacion.grupo_id,
          grupo: grupo?.nombre || 'Sin grupo',
          semestre: grupo?.semestre ?? '—',
          turno: grupo?.turno || '—',
          ciclo: grupo?.ciclo_escolar || 'Sin ciclo',
          materia: materia?.nombre || 'Sin materia',
          alumnos,
        }
      })

      setAsignaciones(formateadas)

      setActiveAsignacion(current => {
        const existe = formateadas.some(
          item => String(item.id) === String(current)
        )

        return existe
          ? current
          : formateadas[0]?.id ?? null
      })
    } catch (err) {
      console.error('Error cargando gestión de grupos:', err)

      setError(
        err?.message ||
          'No se pudo cargar la información de los grupos.'
      )
    } finally {
      setLoading(false)
    }
  }

  const asignacion = useMemo(() => {
    return (
      asignaciones.find(
        item =>
          String(item.id) ===
          String(activeAsignacion)
      ) || asignaciones[0] || null
    )
  }, [asignaciones, activeAsignacion])

  const alumnosFiltrados = useMemo(() => {
    if (!asignacion) {
      return []
    }

    const texto = busqueda.trim().toLowerCase()

    if (!texto) {
      return asignacion.alumnos
    }

    return asignacion.alumnos.filter(alumno => {
      return (
        alumno.nombre.toLowerCase().includes(texto) ||
        String(alumno.matricula)
          .toLowerCase()
          .includes(texto)
      )
    })
  }, [asignacion, busqueda])

  const totalGrupos = useMemo(() => {
    return new Set(
      asignaciones.map(item => String(item.grupo_id))
    ).size
  }, [asignaciones])

  const totalMaterias = useMemo(() => {
    return new Set(
      asignaciones.map(item => item.materia)
    ).size
  }, [asignaciones])

  const totalAlumnosUnicos = useMemo(() => {
    const ids = new Set()

    asignaciones.forEach(item => {
      item.alumnos.forEach(alumno => {
        ids.add(String(alumno.id))
      })
    })

    return ids.size
  }, [asignaciones])

  if (loading) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="gd-page">
          <div className="gd-card">
            <div className="gd-empty">
              Cargando grupos y alumnos...
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error && asignaciones.length === 0) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="gd-page">
          <div className="gd-alert">
            <IconAlert size={16} />
            {error}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{ESTILOS}</style>

      <div className="gd-page fade-in">
        <div className="gd-header">
          <h1>Mis grupos</h1>

          <p>
            Consulta los alumnos inscritos en tus grupos y materias asignadas
          </p>
        </div>

        {error && (
          <div className="gd-alert">
            <IconAlert size={16} />
            {error}
          </div>
        )}

        <div className="gd-stats">
          <div className="gd-stat">
            <div
              className="gd-stat-icon"
              style={{ background: 'rgba(32,58,80,.07)' }}
            >
              <IconUsers size={21} style={{ color: '#203A50' }} />
            </div>

            <div>
              <div className="gd-stat-value">
                {totalAlumnosUnicos}
              </div>

              <div className="gd-stat-label">
                Alumnos únicos
              </div>
            </div>
          </div>

          <div className="gd-stat">
            <div
              className="gd-stat-icon"
              style={{ background: 'rgba(37,99,235,.08)' }}
            >
              <IconGrade size={21} style={{ color: '#2563eb' }} />
            </div>

            <div>
              <div className="gd-stat-value">
                {totalMaterias}
              </div>

              <div className="gd-stat-label">
                Materias asignadas
              </div>
            </div>
          </div>

          <div className="gd-stat">
            <div
              className="gd-stat-icon"
              style={{ background: 'rgba(34,197,94,.08)' }}
            >
              <IconCheck size={21} style={{ color: '#16a34a' }} />
            </div>

            <div>
              <div className="gd-stat-value">
                {totalGrupos}
              </div>

              <div className="gd-stat-label">
                Grupos distintos
              </div>
            </div>
          </div>

          <div className="gd-stat">
            <div
              className="gd-stat-icon"
              style={{ background: 'rgba(245,158,11,.08)' }}
            >
              <IconUsers size={21} style={{ color: '#ca8a04' }} />
            </div>

            <div>
              <div className="gd-stat-value">
                {asignacion?.alumnos.length || 0}
              </div>

              <div className="gd-stat-label">
                Alumnos del grupo actual
              </div>
            </div>
          </div>
        </div>

        <div className="gd-tabs">
          {asignaciones.map(item => (
            <button
              key={item.id}
              type="button"
              className={`gd-tab${
                String(activeAsignacion) === String(item.id)
                  ? ' active'
                  : ''
              }`}
              onClick={() => {
                setActiveAsignacion(item.id)
                setBusqueda('')
              }}
            >
              {item.grupo} · {item.materia}
            </button>
          ))}
        </div>

        {!asignacion ? (
          <div className="gd-card">
            <div className="gd-empty">
              No tienes grupos o materias asignadas.
            </div>
          </div>
        ) : (
          <>
            <div className="gd-toolbar">
              <input
                className="gd-search"
                type="search"
                placeholder="Buscar por nombre o matrícula..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />

              <span className="gd-readonly">
                Consulta de alumnos
              </span>
            </div>

            <div className="gd-card">
              <div className="gd-card-head">
                <div className="gd-card-title">
                  {asignacion.grupo} — {asignacion.materia}
                </div>

                <div className="gd-card-subtitle">
                  Semestre {asignacion.semestre}
                  {' · '}
                  Turno {asignacion.turno}
                  {' · '}
                  Ciclo {asignacion.ciclo}
                  {' · '}
                  {asignacion.alumnos.length} alumno(s) inscrito(s)
                </div>
              </div>

              {alumnosFiltrados.length === 0 ? (
                <div className="gd-empty">
                  {busqueda
                    ? 'No se encontraron alumnos con esa búsqueda.'
                    : 'No hay alumnos inscritos en este grupo.'}
                </div>
              ) : (
                <div className="gd-table-wrap">
                  <table className="gd-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Alumno</th>
                        <th>Matrícula</th>
                        <th>Semestre</th>
                        <th>Grupo</th>
                        <th>Turno</th>
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {alumnosFiltrados.map((alumno, index) => (
                        <tr key={alumno.inscripcion_id}>
                          <td className="gd-muted">
                            {index + 1}
                          </td>

                          <td className="gd-alumno">
                            {alumno.nombre}
                          </td>

                          <td>
                            {alumno.matricula}
                          </td>

                          <td>
                            {alumno.semestre}
                          </td>

                          <td>
                            {alumno.grupoAlumno}
                          </td>

                          <td>
                            {alumno.turno}
                          </td>

                          <td>
                            <span className="gd-pill">
                              Inscrito
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
