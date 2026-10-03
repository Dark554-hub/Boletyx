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
  --asis-blue-light: #7995AB;
  --asis-celeste: #96BBCF;
  --asis-celeste-light: #CCE0E6;
  --asis-bg: #F4F7F9;
  --asis-border: #DCE5EA;
  --asis-text: #172B3A;
  --asis-text-2: #647889;
  --asis-text-3: #8FA0AF;

  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px 50px;
}


/* ==================================================
   HEADER
================================================== */

.asis-page .asis-header {
  margin-bottom: 22px;
}

.asis-page .asis-header h1 {
  margin: 0 0 5px;
  color: var(--asis-text);
  font-size: 24px;
  font-weight: 700;
}

.asis-page .asis-header p {
  margin: 0;
  color: var(--asis-text-2);
  font-size: 14px;
}


/* ==================================================
   MENSAJES
================================================== */

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


/* ==================================================
   TABS
================================================== */

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


/* ==================================================
   ESTADÍSTICAS
================================================== */

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


/* ==================================================
   CARD
================================================== */

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


/* ==================================================
   BOTONES
================================================== */

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


/* ==================================================
   TABLA
================================================== */

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


/* ==================================================
   PROGRESO
================================================== */

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


/* ==================================================
   PRESENTE / AUSENTE
================================================== */

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


/* ==================================================
   VACÍO / LOADING
================================================== */

.asis-empty {
  padding: 38px 20px;

  text-align: center;

  color: var(--asis-text-2);

  font-size: 14px;
}


/* ==================================================
   RESPONSIVE
================================================== */

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


export default function AsistenciaDocente({ user }) {

  // ==================================================
  // ESTADOS
  // ==================================================

  const [grupos, setGrupos] = useState([])
  const [activeGrupo, setActiveGrupo] = useState('')

  const [presentes, setPresentes] = useState({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')


  // ==================================================
  // FECHA
  // ==================================================

  const fechaHoy = useMemo(() => {
    const hoy = new Date()

    const year = hoy.getFullYear()

    const month = String(
      hoy.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      hoy.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }, [])


  const today = useMemo(() => {
    return new Date().toLocaleDateString(
      'es-MX',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
  }, [])


  // ==================================================
  // GRUPO ACTIVO
  // ==================================================

  const grupo = useMemo(() => {
    return (
      grupos.find(
        g =>
          String(g.id) ===
          String(activeGrupo)
      ) || null
    )
  }, [grupos, activeGrupo])


  // ==================================================
  // CARGAR INFORMACIÓN
  // ==================================================

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
      } = await supabase.auth.getUser()


      if (authError) {
        throw authError
      }


      const authUser = authData?.user


      if (!authUser?.id) {
        throw new Error(
          'No se encontró la sesión del docente.'
        )
      }


      // ================================================
      // DOCENTE
      // ================================================

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


      // ================================================
      // ASIGNACIONES
      // ================================================

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


      // ================================================
      // ALUMNOS + ASISTENCIAS
      // ================================================

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
                  .map(inscripcion => {

                    const alumno =
                      inscripcion.alumnos

                    const perfil =
                      alumno?.perfiles


                    const registros =
                      (historial || []).filter(
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


                    const registroHoy =
                      registros.find(
                        registro =>
                          registro.fecha ===
                          fechaHoy
                      )


                    const nombre =
                      [
                        perfil?.nombre,
                        perfil?.apellido,
                      ]
                        .filter(Boolean)
                        .join(' ') ||
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

                      estadoHoy:
                        registroHoy?.estado ||
                        null,
                    }
                  })
                  .filter(
                    alumno => alumno.id
                  )
                  .sort(
                    (a, b) =>
                      a.nombre.localeCompare(
                        b.nombre,
                        'es'
                      )
                  )


              return {
                id: asignacion.id,

                grupo_materia_id:
                  asignacion.id,

                grupo_id:
                  asignacion.grupo_id,

                materia_id:
                  asignacion.materia_id,

                grupo:
                  asignacion.grupos?.nombre ||
                  'Sin grupo',

                semestre:
                  asignacion.grupos?.semestre,

                turno:
                  asignacion.grupos?.turno,

                ciclo:
                  asignacion.grupos?.ciclo_escolar,

                materia:
                  asignacion.materias?.nombre ||
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
            g =>
              String(g.id) ===
              String(current)
          )

        if (existe) {
          return current
        }

        return gruposCargados[0]?.id || ''
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


  // ==================================================
  // ESTADO DE HOY
  // ==================================================

  useEffect(() => {
    if (!grupo) {
      setPresentes({})
      return
    }


    const estados = {}


    grupo.alumnos.forEach(alumno => {
      estados[alumno.id] =
        alumno.estadoHoy !== 'ausente'
    })


    setPresentes(estados)
    setGuardado(false)

  }, [grupo?.id])


  // ==================================================
  // PRESENTE / AUSENTE
  // ==================================================

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


  // ==================================================
  // TODOS PRESENTES
  // ==================================================

  const marcarTodosPresentes = () => {
    if (!grupo) return


    const todos = {}


    grupo.alumnos.forEach(alumno => {
      todos[alumno.id] = true
    })


    setPresentes(todos)
    setGuardado(false)
  }


  // ==================================================
  // GUARDAR
  // ==================================================

  const handleGuardar = async () => {
    if (!grupo) return


    if (!grupo.alumnos.length) {
      setError(
        'No hay alumnos inscritos en este grupo.'
      )
      return
    }


    try {
      setSaving(true)
      setError('')
      setGuardado(false)


      const registros =
        grupo.alumnos.map(alumno => ({
          inscripcion_id:
            alumno.inscripcion_id,

          grupo_materia_id:
            grupo.grupo_materia_id,

          fecha:
            fechaHoy,

          estado:
            presentes[alumno.id] === false
              ? 'ausente'
              : 'presente',

          updated_at:
            new Date().toISOString(),
        }))


      const {
        error: guardarError,
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


      /*
        Recargar para que los acumulados
        se actualicen inmediatamente.
      */

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


  // ==================================================
  // TOTALES
  // ==================================================

  const totalAsistencias =
    useMemo(() => {
      if (!grupo) return 0

      return grupo.alumnos.reduce(
        (total, alumno) =>
          total + alumno.asistencias,
        0
      )
    }, [grupo])


  const totalFaltas =
    useMemo(() => {
      if (!grupo) return 0

      return grupo.alumnos.reduce(
        (total, alumno) =>
          total + alumno.faltas,
        0
      )
    }, [grupo])


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="asis-page fade-in">

          <div className="asis-header">
            <h1>Control de Asistencia</h1>

            <p>
              Registra la asistencia diaria de tus grupos
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


  // ==================================================
  // SIN GRUPOS
  // ==================================================

  if (!grupos.length) {
    return (
      <>
        <style>{ESTILOS}</style>

        <div className="asis-page fade-in">

          <div className="asis-header">
            <h1>Control de Asistencia</h1>

            <p>
              Registra la asistencia diaria de tus grupos
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


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <>
      <style>{ESTILOS}</style>

      <div className="asis-page fade-in">

        {/* HEADER */}

        <div className="asis-header">
          <h1>Control de Asistencia</h1>

          <p>
            Registra la asistencia diaria de tus grupos
          </p>
        </div>


        {/* MENSAJE GUARDADO */}

        {guardado && (
          <div className="asis-alert success">
            <IconCheck size={16} />

            Asistencia guardada correctamente.
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="asis-alert error">
            <IconAlert size={16} />

            {error}
          </div>
        )}


        {/* TABS */}

        <div className="asis-tabs">

          {grupos.map(g => (
            <button
              key={g.id}
              type="button"
              className={
                `asis-tab${
                  String(activeGrupo) ===
                  String(g.id)
                    ? ' active'
                    : ''
                }`
              }
              onClick={() =>
                setActiveGrupo(g.id)
              }
            >
              {g.grupo} · {g.materia}
            </button>
          ))}

        </div>


        {/* ESTADÍSTICAS */}

        <div className="asis-stats">

          {/* FECHA */}

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
                  color: '#203A50',
                }}
              />
            </div>


            <div className="asis-stat-content">

              <div className="asis-stat-date">
                {today}
              </div>

              <div className="asis-stat-label">
                Fecha de hoy
              </div>

            </div>

          </div>


          {/* ASISTENCIAS */}

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
                  color: '#16a34a',
                }}
              />
            </div>


            <div className="asis-stat-content">

              <div
                className="asis-stat-value"
                style={{
                  color: '#16a34a',
                }}
              >
                {totalAsistencias}
              </div>

              <div className="asis-stat-label">
                Asistencias acumuladas
              </div>

            </div>

          </div>


          {/* FALTAS */}

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
                  color: '#dc2626',
                }}
              />
            </div>


            <div className="asis-stat-content">

              <div
                className="asis-stat-value"
                style={{
                  color: '#dc2626',
                }}
              >
                {totalFaltas}
              </div>

              <div className="asis-stat-label">
                Faltas acumuladas
              </div>

            </div>

          </div>


          {/* ALUMNOS */}

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
                  color: '#ca8a04',
                }}
              />
            </div>


            <div className="asis-stat-content">

              <div className="asis-stat-value">
                {grupo?.alumnos?.length || 0}
              </div>

              <div className="asis-stat-label">
                Total alumnos
              </div>

            </div>

          </div>

        </div>


        {/* PASE DE LISTA */}

        <div className="asis-card">

          <div className="asis-card-header">

            <div>

              <div className="asis-card-title">
                Pase de lista — {grupo?.grupo}
              </div>

              <div className="asis-card-subtitle">
                {grupo?.materia}

                {grupo?.turno
                  ? ` · ${grupo.turno}`
                  : ''}
              </div>

            </div>


            <div className="asis-actions">

              <button
                type="button"
                className="asis-btn asis-btn-outline"
                onClick={marcarTodosPresentes}
                disabled={saving}
              >
                <IconCheck size={14} />
                Todos presentes
              </button>


              <button
                type="button"
                className="asis-btn asis-btn-primary"
                onClick={handleGuardar}
                disabled={
                  saving ||
                  !grupo?.alumnos?.length
                }
              >
                <IconSave size={14} />

                {saving
                  ? 'Guardando...'
                  : 'Guardar'}
              </button>

            </div>

          </div>


          {/* SIN ALUMNOS */}

          {!grupo?.alumnos?.length ? (

            <div className="asis-empty">
              No hay alumnos inscritos en este grupo.
            </div>

          ) : (

            /* TABLA */

            <div className="asis-table-wrap">

              <table className="asis-table">

                <thead>
                  <tr>
                    <th>#</th>

                    <th>Alumno</th>

                    <th>Matrícula</th>

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
                      Hoy
                    </th>
                  </tr>
                </thead>


                <tbody>

                  {grupo.alumnos.map(
                    (al, idx) => {

                      const presente =
                        presentes[al.id] !== false


                      const totalClases =
                        al.asistencias +
                        al.faltas


                      /*
                        Si todavía no existen clases
                        registradas mostramos 100% como
                        estado inicial.

                        En cuanto se guarda la primera
                        asistencia se calcula con datos
                        reales.
                      */

                      const pct =
                        totalClases > 0
                          ? Math.round(
                              (
                                al.asistencias /
                                totalClases
                              ) * 100
                            )
                          : 100


                      const color =
                        pct >= 80
                          ? '#16a34a'
                          : pct >= 70
                            ? '#ca8a04'
                            : '#dc2626'


                      return (
                        <tr
                          key={al.id}
                          className={
                            presente
                              ? ''
                              : 'ausente'
                          }
                        >

                          <td
                            style={{
                              color: '#8FA0AF',
                              width: 45,
                            }}
                          >
                            {idx + 1}
                          </td>


                          <td className="asis-alumno">
                            {al.nombre}
                          </td>


                          <td className="asis-matricula">
                            {al.matricula || '—'}
                          </td>


                          <td
                            className="asis-center"
                            style={{
                              color: '#16a34a',
                              fontWeight: 700,
                            }}
                          >
                            {al.asistencias}
                          </td>


                          <td
                            className="asis-center"
                            style={{
                              color: '#dc2626',
                              fontWeight: 700,
                            }}
                          >
                            {al.faltas}
                          </td>


                          <td>

                            <div className="asis-progress-wrap">

                              <div className="asis-progress">

                                <div
                                  className="asis-progress-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: color,
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

                          </td>


                          <td className="asis-center">

                            <button
                              type="button"
                              className={
                                `asis-status-btn ${
                                  presente
                                    ? 'presente'
                                    : 'ausente'
                                }`
                              }
                              onClick={() =>
                                togglePresente(al.id)
                              }
                              disabled={saving}
                              title={
                                presente
                                  ? 'Presente'
                                  : 'Ausente'
                              }
                            >

                              {presente ? (

                                <IconCheck size={16} />

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