import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  IconUsers,
  IconCheck,
  IconAlert,
  IconCalendar,
  IconSave,
} from '../Icons'

const ESTILOS = `
.asis-page {
  --asis-blue: #203A50;
  --asis-celeste: #96BBCF;
  --asis-bg: #F4F7F9;
  --asis-border: #DCE5EA;
  --asis-text: #172B3A;
  --asis-text-2: #647889;
  --asis-text-3: #8FA0AF;

  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px 50px;
}

.asis-header {
  margin-bottom: 22px;
}

.asis-header h1 {
  margin: 0 0 5px;
  color: var(--asis-text);
  font-size: 24px;
  font-weight: 700;
}

.asis-header p {
  margin: 0;
  color: var(--asis-text-2);
  font-size: 14px;
}

.asis-alert {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.asis-alert.success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #86efac;
}

.asis-alert.error {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.asis-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.asis-tab {
  border: 1px solid var(--asis-border);
  background: #fff;
  color: var(--asis-text-2);
  padding: 9px 15px;
  border-radius: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background .15s,
    color .15s,
    border-color .15s,
    box-shadow .15s;
}

.asis-tab:hover {
  border-color: var(--asis-celeste);
  background: #f4f9fb;
  color: var(--asis-blue);
}

.asis-tab.active {
  background: var(--asis-blue);
  border-color: var(--asis-blue);
  color: #fff;
  box-shadow: 0 4px 12px rgba(32,58,80,.15);
}

.asis-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--asis-border);
  border-radius: 13px;
}

.asis-date-block {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
}

.asis-field label {
  display: block;
  margin-bottom: 6px;
  color: var(--asis-text-3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.asis-date-input {
  min-height: 39px;
  padding: 0 12px;
  color: var(--asis-text);
  background: #fff;
  border: 1px solid var(--asis-border);
  border-radius: 9px;
  outline: none;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.asis-date-input:focus {
  border-color: var(--asis-blue);
  box-shadow: 0 0 0 3px rgba(32,58,80,.08);
}

.asis-date-status {
  color: var(--asis-text-2);
  font-size: 12px;
  line-height: 1.4;
}

.asis-date-status strong {
  color: var(--asis-text);
}

.asis-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.asis-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 104px;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--asis-border);
  border-radius: 14px;
  box-shadow: 0 2px 5px rgba(32,58,80,.03);
}

.asis-stat-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.asis-stat-content {
  min-width: 0;
}

.asis-stat-value {
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
  color: var(--asis-text);
}

.asis-stat-date {
  font-size: 13px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--asis-text);
  text-transform: capitalize;
}

.asis-stat-label {
  margin-top: 5px;
  font-size: 12px;
  color: var(--asis-text-3);
}

.asis-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--asis-border);
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(32,58,80,.035);
}

.asis-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--asis-border);
}

.asis-card-title {
  color: var(--asis-text);
  font-size: 16px;
  font-weight: 700;
}

.asis-card-subtitle {
  margin-top: 4px;
  color: var(--asis-text-2);
  font-size: 12px;
}

.asis-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.asis-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background .15s,
    border-color .15s,
    opacity .15s;
}

.asis-btn:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.asis-btn-outline {
  border: 1px solid var(--asis-border);
  background: #fff;
  color: var(--asis-blue);
}

.asis-btn-outline:hover:not(:disabled) {
  background: #f4f9fb;
  border-color: var(--asis-celeste);
}

.asis-btn-primary {
  border: 1px solid var(--asis-blue);
  background: var(--asis-blue);
  color: #fff;
}

.asis-btn-primary:hover:not(:disabled) {
  background: #172f42;
}

.asis-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.asis-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
}

.asis-table th {
  padding: 12px 16px;
  background: #F7F9FA;
  border-bottom: 1px solid var(--asis-border);
  color: var(--asis-text-2);
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .03em;
  white-space: nowrap;
}

.asis-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #EDF1F3;
  color: var(--asis-text);
  font-size: 13px;
  vertical-align: middle;
}

.asis-table tbody tr:last-child td {
  border-bottom: 0;
}

.asis-table tbody tr {
  transition: background .15s;
}

.asis-table tbody tr:hover {
  background: #FAFCFD;
}

.asis-table tbody tr.ausente {
  background: rgba(239,68,68,.035);
}

.asis-alumno {
  font-weight: 700;
}

.asis-matricula {
  color: var(--asis-text-2);
}

.asis-center {
  text-align: center !important;
}

.asis-progress-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 150px;
}

.asis-progress {
  flex: 1;
  height: 7px;
  overflow: hidden;
  background: #E8EDF0;
  border-radius: 999px;
}

.asis-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .2s;
}

.asis-percent {
  min-width: 40px;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
}

.asis-status-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  cursor: pointer;
  transition:
    transform .12s,
    background .15s,
    border-color .15s;
  font: inherit;
}

.asis-status-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.asis-status-btn.presente {
  color: #16a34a;
  background: #dcfce7;
  border: 2px solid #22c55e;
}

.asis-status-btn.ausente {
  color: #dc2626;
  background: #fee2e2;
  border: 2px solid #ef4444;
}

.asis-status-btn:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.asis-empty {
  padding: 38px 20px;
  text-align: center;
  color: var(--asis-text-2);
  font-size: 14px;
}

@media (max-width: 1050px) {
  .asis-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .asis-page {
    padding: 18px 12px 35px;
  }

  .asis-stats {
    grid-template-columns: 1fr;
  }

  .asis-toolbar,
  .asis-card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .asis-actions {
    width: 100%;
  }

  .asis-btn {
    flex: 1;
  }

  .asis-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 3px;
  }

  .asis-tab {
    flex-shrink: 0;
  }
}
`

function fechaLocalISO() {
  const hoy = new Date()

  const year = hoy.getFullYear()

  const month = String(
    hoy.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    hoy.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [year, month, day] =
    fecha.split('-').map(Number)

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    'es-MX',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )
}

export default function AsistenciaDocente({ user }) {
  const [grupos, setGrupos] = useState([])
  const [activeGrupo, setActiveGrupo] = useState('')

  const [presentes, setPresentes] = useState({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const fechaHoy = useMemo(
    () => fechaLocalISO(),
    []
  )

  const [
    fechaSeleccionada,
    setFechaSeleccionada,
  ] = useState(fechaHoy)

  const grupo = useMemo(() => {
    return (
      grupos.find(
        item =>
          String(item.id) ===
          String(activeGrupo)
      ) || null
    )
  }, [grupos, activeGrupo])

  useEffect(() => {
    cargarGrupos()
  }, [user?.id])

  async function cargarGrupos() {
    try {
      setLoading(true)
      setError('')

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      const authUser =
        authData?.user

      if (!authUser?.id) {
        throw new Error(
          'No se encontró la sesión del docente.'
        )
      }

      const {
        data: docente,
        error: docenteError,
      } = await supabase
        .from('docentes')
        .select(`
          id,
          perfil_id
        `)
        .eq(
          'perfil_id',
          authUser.id
        )
        .maybeSingle()

      if (docenteError) {
        throw docenteError
      }

      if (!docente) {
        setGrupos([])
        setActiveGrupo('')

        throw new Error(
          'No se encontró el registro del docente.'
        )
      }

      const {
        data: asignaciones,
        error: asignacionesError,
      } = await supabase
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
            ciclo_escolar
          ),

          materias (
            id,
            nombre
          )
        `)
        .eq(
          'docente_id',
          docente.id
        )
        .order('grupo_id', {
          ascending: true,
        })

      if (asignacionesError) {
        throw asignacionesError
      }

      if (!asignaciones?.length) {
        setGrupos([])
        setActiveGrupo('')
        return
      }

      const gruposCargados =
        await Promise.all(
          asignaciones.map(
            async asignacion => {
              const {
                data: inscripciones,
                error: inscripcionesError,
              } = await supabase
                .from('inscripciones')
                .select(`
                  id,
                  alumno_id,

                  alumnos (
                    id,
                    matricula,

                    perfiles (
                      id,
                      nombre,
                      apellido
                    )
                  )
                `)
                .eq(
                  'grupo_id',
                  asignacion.grupo_id
                )

              if (inscripcionesError) {
                throw inscripcionesError
              }

              const {
                data: historial,
                error: historialError,
              } = await supabase
                .from('asistencias')
                .select(`
                  id,
                  inscripcion_id,
                  grupo_materia_id,
                  fecha,
                  estado
                `)
                .eq(
                  'grupo_materia_id',
                  asignacion.id
                )

              if (historialError) {
                throw historialError
              }

              const alumnos =
                (inscripciones || [])
                  .map(
                    inscripcion => {
                      const alumno =
                        Array.isArray(
                          inscripcion.alumnos
                        )
                          ? inscripcion
                              .alumnos[0]
                          : inscripcion.alumnos

                      const perfil =
                        Array.isArray(
                          alumno?.perfiles
                        )
                          ? alumno
                              .perfiles[0]
                          : alumno?.perfiles

                      const registros =
                        (
                          historial || []
                        ).filter(
                          registro =>
                            Number(
                              registro.inscripcion_id
                            ) ===
                            Number(
                              inscripcion.id
                            )
                        )

                      const asistencias =
                        registros.filter(
                          registro =>
                            registro.estado ===
                            'presente'
                        ).length

                      const faltas =
                        registros.filter(
                          registro =>
                            registro.estado ===
                            'ausente'
                        ).length

                      const nombre =
                        [
                          perfil?.nombre,
                          perfil?.apellido,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ' '
                          ) ||
                        'Alumno'

                      return {
                        id: alumno?.id,

                        inscripcion_id:
                          inscripcion.id,

                        matricula:
                          alumno?.matricula,

                        nombre,

                        asistencias,
                        faltas,

                        registros,
                      }
                    }
                  )
                  .filter(
                    alumno =>
                      alumno.id
                  )
                  .sort(
                    (a, b) =>
                      a.nombre.localeCompare(
                        b.nombre,
                        'es'
                      )
                  )

              const grupoRelacion =
                Array.isArray(
                  asignacion.grupos
                )
                  ? asignacion
                      .grupos[0]
                  : asignacion.grupos

              const materiaRelacion =
                Array.isArray(
                  asignacion.materias
                )
                  ? asignacion
                      .materias[0]
                  : asignacion.materias

              return {
                id: asignacion.id,

                grupo_materia_id:
                  asignacion.id,

                grupo_id:
                  asignacion.grupo_id,

                materia_id:
                  asignacion.materia_id,

                grupo:
                  grupoRelacion?.nombre ||
                  'Sin grupo',

                semestre:
                  grupoRelacion?.semestre,

                turno:
                  grupoRelacion?.turno,

                ciclo:
                  grupoRelacion?.ciclo_escolar,

                materia:
                  materiaRelacion?.nombre ||
                  'Materia',

                alumnos,
              }
            }
          )
        )

      setGrupos(gruposCargados)

      setActiveGrupo(current => {
        const existe =
          gruposCargados.some(
            item =>
              String(item.id) ===
              String(current)
          )

        if (existe) {
          return current
        }

        return (
          gruposCargados[0]?.id ||
          ''
        )
      })
    } catch (err) {
      console.error(
        'Error cargando asistencia:',
        err
      )

      setGrupos([])
      setActiveGrupo('')

      setError(
        err?.message ||
          'No se pudo cargar la información de asistencia.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!grupo) {
      setPresentes({})
      return
    }

    const estados = {}

    grupo.alumnos.forEach(
      alumno => {
        const registro =
          alumno.registros.find(
            item =>
              item.fecha ===
              fechaSeleccionada
          )

        // Si la fecha todavía no tiene pase de lista,
        // iniciamos en presente para conservar el
        // comportamiento rápido del componente original.
        estados[alumno.id] =
          registro
            ? registro.estado !==
              'ausente'
            : true
      }
    )

    setPresentes(estados)
    setGuardado(false)
    setError('')
  }, [
    grupo?.id,
    fechaSeleccionada,
  ])

  const togglePresente = id => {
    setPresentes(previous => ({
      ...previous,
      [id]:
        previous[id] === undefined
          ? false
          : !previous[id],
    }))

    setGuardado(false)
  }

  const marcarTodosPresentes =
    () => {
      if (!grupo) return

      const todos = {}

      grupo.alumnos.forEach(
        alumno => {
          todos[alumno.id] = true
        }
      )

      setPresentes(todos)
      setGuardado(false)
    }

  const registrosFecha =
    useMemo(() => {
      if (!grupo) {
        return 0
      }

      return grupo.alumnos.filter(
        alumno =>
          alumno.registros.some(
            registro =>
              registro.fecha ===
              fechaSeleccionada
          )
      ).length
    }, [
      grupo,
      fechaSeleccionada,
    ])

  const handleGuardar =
    async () => {
      if (!grupo) return

      if (
        !grupo.alumnos.length
      ) {
        setError(
          'No hay alumnos inscritos en este grupo.'
        )
        return
      }

      if (
        fechaSeleccionada >
        fechaHoy
      ) {
        setError(
          'No puedes registrar asistencia en una fecha futura.'
        )
        return
      }

      try {
        setSaving(true)
        setError('')
        setGuardado(false)

        const registros =
          grupo.alumnos.map(
            alumno => ({
              inscripcion_id:
                alumno.inscripcion_id,

              grupo_materia_id:
                grupo.grupo_materia_id,

              fecha:
                fechaSeleccionada,

              estado:
                presentes[
                  alumno.id
                ] === false
                  ? 'ausente'
                  : 'presente',

              updated_at:
                new Date().toISOString(),
            })
          )

        const {
          error:
            guardarError,
        } = await supabase
          .from('asistencias')
          .upsert(
            registros,
            {
              onConflict:
                'inscripcion_id,grupo_materia_id,fecha',
            }
          )

        if (guardarError) {
          throw guardarError
        }

        await cargarGrupos()

        setGuardado(true)

        setTimeout(() => {
          setGuardado(false)
        }, 3000)
      } catch (err) {
        console.error(
          'Error guardando asistencia:',
          err
        )

        setError(
          err?.message ||
            'No se pudo guardar la asistencia.'
        )
      } finally {
        setSaving(false)
      }
    }

  const totalAsistencias =
    useMemo(() => {
      if (!grupo) return 0

      return grupo.alumnos.reduce(
        (total, alumno) =>
          total +
          alumno.asistencias,
        0
      )
    }, [grupo])

  const totalFaltas =
    useMemo(() => {
      if (!grupo) return 0

      return grupo.alumnos.reduce(
        (total, alumno) =>
          total +
          alumno.faltas,
        0
      )
    }, [grupo])

  const fechaVisible =
    formatearFecha(
      fechaSeleccionada
    )

  if (loading) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="asis-page fade-in">
          <div className="asis-header">
            <h1>
              Control de Asistencia
            </h1>

            <p>
              Registra y corrige la asistencia de tus grupos
            </p>
          </div>

          <div className="asis-card">
            <div className="asis-empty">
              Cargando grupos y asistencia...
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!grupos.length) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="asis-page fade-in">
          <div className="asis-header">
            <h1>
              Control de Asistencia
            </h1>

            <p>
              Registra y corrige la asistencia de tus grupos
            </p>
          </div>

          {error && (
            <div className="asis-alert error">
              <IconAlert size={16} />
              {error}
            </div>
          )}

          {!error && (
            <div className="asis-card">
              <div className="asis-empty">
                Sin grupos o materias asignadas.
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <style>{ESTILOS}</style>

      <div className="asis-page fade-in">
        <div className="asis-header">
          <h1>
            Control de Asistencia
          </h1>

          <p>
            Registra asistencia diaria o corrige una fecha anterior sin duplicar registros
          </p>
        </div>

        {guardado && (
          <div className="asis-alert success">
            <IconCheck size={16} />

            {registrosFecha > 0
              ? 'Asistencia actualizada correctamente.'
              : 'Asistencia guardada correctamente.'}
          </div>
        )}

        {error && (
          <div className="asis-alert error">
            <IconAlert size={16} />

            {error}
          </div>
        )}

        <div className="asis-tabs">
          {grupos.map(item => (
            <button
              key={item.id}
              type="button"
              className={`asis-tab${
                String(
                  activeGrupo
                ) ===
                String(item.id)
                  ? ' active'
                  : ''
              }`}
              onClick={() =>
                setActiveGrupo(
                  item.id
                )
              }
            >
              {item.grupo} ·{' '}
              {item.materia}
            </button>
          ))}
        </div>

        <div className="asis-toolbar">
          <div className="asis-date-block">
            <div className="asis-field">
              <label>
                Fecha del pase de lista
              </label>

              <input
                type="date"
                className="asis-date-input"
                value={
                  fechaSeleccionada
                }
                max={fechaHoy}
                onChange={e =>
                  setFechaSeleccionada(
                    e.target.value
                  )
                }
                disabled={saving}
              />
            </div>

            <button
              type="button"
              className="asis-btn asis-btn-outline"
              onClick={() =>
                setFechaSeleccionada(
                  fechaHoy
                )
              }
              disabled={
                saving ||
                fechaSeleccionada ===
                  fechaHoy
              }
            >
              <IconCalendar
                size={14}
              />
              Hoy
            </button>
          </div>

          <div className="asis-date-status">
            <strong>
              {fechaVisible}
            </strong>
            <br />

            {registrosFecha > 0
              ? `${registrosFecha} registro(s) existentes. Al guardar, se corregirán sin duplicarse.`
              : 'Esta fecha todavía no tiene pase de lista guardado.'}
          </div>
        </div>

        <div className="asis-stats">
          <div className="asis-stat">
            <div
              className="asis-stat-icon"
              style={{
                background:
                  'rgba(32,58,80,.07)',
              }}
            >
              <IconCalendar
                size={22}
                style={{
                  color:
                    '#203A50',
                }}
              />
            </div>

            <div className="asis-stat-content">
              <div className="asis-stat-date">
                {fechaVisible}
              </div>

              <div className="asis-stat-label">
                Fecha seleccionada
              </div>
            </div>
          </div>

          <div className="asis-stat">
            <div
              className="asis-stat-icon"
              style={{
                background:
                  'rgba(34,197,94,.08)',
              }}
            >
              <IconCheck
                size={22}
                style={{
                  color:
                    '#16a34a',
                }}
              />
            </div>

            <div className="asis-stat-content">
              <div
                className="asis-stat-value"
                style={{
                  color:
                    '#16a34a',
                }}
              >
                {totalAsistencias}
              </div>

              <div className="asis-stat-label">
                Asistencias acumuladas
              </div>
            </div>
          </div>

          <div className="asis-stat">
            <div
              className="asis-stat-icon"
              style={{
                background:
                  'rgba(239,68,68,.08)',
              }}
            >
              <IconAlert
                size={22}
                style={{
                  color:
                    '#dc2626',
                }}
              />
            </div>

            <div className="asis-stat-content">
              <div
                className="asis-stat-value"
                style={{
                  color:
                    '#dc2626',
                }}
              >
                {totalFaltas}
              </div>

              <div className="asis-stat-label">
                Faltas acumuladas
              </div>
            </div>
          </div>

          <div className="asis-stat">
            <div
              className="asis-stat-icon"
              style={{
                background:
                  'rgba(245,158,11,.08)',
              }}
            >
              <IconUsers
                size={22}
                style={{
                  color:
                    '#ca8a04',
                }}
              />
            </div>

            <div className="asis-stat-content">
              <div className="asis-stat-value">
                {grupo?.alumnos
                  ?.length || 0}
              </div>

              <div className="asis-stat-label">
                Total alumnos
              </div>
            </div>
          </div>
        </div>

        <div className="asis-card">
          <div className="asis-card-header">
            <div>
              <div className="asis-card-title">
                Pase de lista —{' '}
                {grupo?.grupo}
              </div>

              <div className="asis-card-subtitle">
                {grupo?.materia}

                {grupo?.turno
                  ? ` · ${grupo.turno}`
                  : ''}

                {' · '}
                {fechaVisible}
              </div>
            </div>

            <div className="asis-actions">
              <button
                type="button"
                className="asis-btn asis-btn-outline"
                onClick={
                  marcarTodosPresentes
                }
                disabled={saving}
              >
                <IconCheck
                  size={14}
                />
                Todos presentes
              </button>

              <button
                type="button"
                className="asis-btn asis-btn-primary"
                onClick={
                  handleGuardar
                }
                disabled={
                  saving ||
                  !grupo?.alumnos
                    ?.length
                }
              >
                <IconSave
                  size={14}
                />

                {saving
                  ? 'Guardando...'
                  : registrosFecha >
                      0
                    ? 'Actualizar asistencia'
                    : 'Guardar asistencia'}
              </button>
            </div>
          </div>

          {!grupo?.alumnos
            ?.length ? (
            <div className="asis-empty">
              No hay alumnos inscritos en este grupo.
            </div>
          ) : (
            <div className="asis-table-wrap">
              <table className="asis-table">
                <thead>
                  <tr>
                    <th>#</th>

                    <th>
                      Alumno
                    </th>

                    <th>
                      Matrícula
                    </th>

                    <th className="asis-center">
                      Asistencias
                    </th>

                    <th className="asis-center">
                      Faltas
                    </th>

                    <th>
                      % Asistencia
                    </th>

                    <th className="asis-center">
                      {fechaSeleccionada ===
                      fechaHoy
                        ? 'Hoy'
                        : 'Estado'}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {grupo.alumnos.map(
                    (
                      alumno,
                      idx
                    ) => {
                      const presente =
                        presentes[
                          alumno.id
                        ] !== false

                      const totalClases =
                        alumno.asistencias +
                        alumno.faltas

                      const pct =
                        totalClases >
                        0
                          ? Math.round(
                              (
                                alumno.asistencias /
                                totalClases
                              ) *
                                100
                            )
                          : null

                      const color =
                        pct === null
                          ? '#8FA0AF'
                          : pct >= 80
                            ? '#16a34a'
                            : pct >= 70
                              ? '#ca8a04'
                              : '#dc2626'

                      return (
                        <tr
                          key={
                            alumno.id
                          }
                          className={
                            presente
                              ? ''
                              : 'ausente'
                          }
                        >
                          <td
                            style={{
                              color:
                                '#8FA0AF',
                              width:
                                45,
                            }}
                          >
                            {idx +
                              1}
                          </td>

                          <td className="asis-alumno">
                            {
                              alumno.nombre
                            }
                          </td>

                          <td className="asis-matricula">
                            {alumno.matricula ||
                              '—'}
                          </td>

                          <td
                            className="asis-center"
                            style={{
                              color:
                                '#16a34a',
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              alumno.asistencias
                            }
                          </td>

                          <td
                            className="asis-center"
                            style={{
                              color:
                                '#dc2626',
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              alumno.faltas
                            }
                          </td>

                          <td>
                            {pct ===
                            null ? (
                              <span
                                style={{
                                  color:
                                    '#8FA0AF',
                                  fontSize:
                                    12,
                                }}
                              >
                                Sin
                                registros
                              </span>
                            ) : (
                              <div className="asis-progress-wrap">
                                <div className="asis-progress">
                                  <div
                                    className="asis-progress-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background:
                                        color,
                                    }}
                                  />
                                </div>

                                <span
                                  className="asis-percent"
                                  style={{
                                    color,
                                  }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="asis-center">
                            <button
                              type="button"
                              className={`asis-status-btn ${
                                presente
                                  ? 'presente'
                                  : 'ausente'
                              }`}
                              onClick={() =>
                                togglePresente(
                                  alumno.id
                                )
                              }
                              disabled={
                                saving
                              }
                              title={
                                presente
                                  ? 'Presente'
                                  : 'Ausente'
                              }
                            >
                              {presente ? (
                                <IconCheck
                                  size={16}
                                />
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                >
                                  <line
                                    x1="18"
                                    y1="6"
                                    x2="6"
                                    y2="18"
                                  />

                                  <line
                                    x1="6"
                                    y1="6"
                                    x2="18"
                                    y2="18"
                                  />
                                </svg>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
