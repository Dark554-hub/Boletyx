import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  StatCard,
  PageHeader,
  Pill,
  GradeBar,
} from '../UI'

import {
  IconGrade,
  IconStar,
  IconAlert,
  IconCheck,
} from '../Icons'

function gradeColor(p) {
  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  return '#dc2626'
}

function GradeState({ p }) {
  if (p >= 9) {
    return (
      <Pill variant="success">
        Excelente
      </Pill>
    )
  }

  if (p >= 6) {
    return (
      <Pill variant="warning">
        Regular
      </Pill>
    )
  }

  return (
    <Pill variant="danger">
      Reprobado
    </Pill>
  )
}

function calcularPromedio(p1, p2, p3) {
  return (p1 + p2 + p3) / 3
}

export default function CalifAlumno({ user }) {
  const [materias, setMaterias] = useState([])

  const [grupoActual, setGrupoActual] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!user?.alumno_id) {
        setError(
          'No se encontró el identificador del alumno.'
        )

        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const {
          data: inscripciones,
          error: inscripcionesError,
        } = await supabase
          .from('inscripciones')
          .select(`
            id,

            grupos (
              id,
              nombre,
              semestre,
              turno,
              ciclo_escolar,

              grupo_materias (
                id,

                materias (
                  id,
                  nombre
                ),

                docentes (
                  id,

                  perfiles (
                    nombre,
                    apellido
                  )
                )
              )
            ),

            calificaciones (
              id,
              grupo_materia_id,
              parcial_1,
              parcial_2,
              parcial_3,
              promedio
            )
          `)
          .eq(
            'alumno_id',
            user.alumno_id
          )

        if (inscripcionesError) {
          throw inscripcionesError
        }

        const materiasFormateadas = []

        let grupoEncontrado = null

        for (
          const inscripcion of
            inscripciones || []
        ) {
          const grupo =
            Array.isArray(
              inscripcion.grupos
            )
              ? inscripcion.grupos[0]
              : inscripcion.grupos

          if (!grupo) continue

          if (!grupoEncontrado) {
            grupoEncontrado = grupo
          }

          const asignaciones =
            grupo.grupo_materias || []

          const calificaciones =
            inscripcion.calificaciones || []

          for (
            const asignacion of
              asignaciones
          ) {
            const materia =
              Array.isArray(
                asignacion.materias
              )
                ? asignacion.materias[0]
                : asignacion.materias

            const docente =
              Array.isArray(
                asignacion.docentes
              )
                ? asignacion.docentes[0]
                : asignacion.docentes

            const perfilDocente =
              Array.isArray(
                docente?.perfiles
              )
                ? docente.perfiles[0]
                : docente?.perfiles

            const calificacion =
              calificaciones.find(
                c =>
                  Number(
                    c.grupo_materia_id
                  ) ===
                  Number(
                    asignacion.id
                  )
              )

            const p1 =
              Number(
                calificacion
                  ?.parcial_1 ?? 0
              )

            const p2 =
              Number(
                calificacion
                  ?.parcial_2 ?? 0
              )

            const p3 =
              Number(
                calificacion
                  ?.parcial_3 ?? 0
              )

            const promedio =
              calificacion?.promedio != null
                ? Number(
                    calificacion.promedio
                  )
                : calcularPromedio(
                    p1,
                    p2,
                    p3
                  )

            materiasFormateadas.push({
              id: asignacion.id,

              grupo_materia_id:
                asignacion.id,

              nombre:
                materia?.nombre ||
                'Sin materia',

              docente:
                perfilDocente
                  ? `${perfilDocente.nombre} ${perfilDocente.apellido}`
                  : 'Sin docente',

              calificaciones: [
                p1,
                p2,
                p3,
              ],

              promedio,
            })
          }
        }

        setGrupoActual(
          grupoEncontrado
        )

        setMaterias(
          materiasFormateadas
        )
      } catch (err) {
        console.error(
          'Error cargando calificaciones:',
          err
        )

        setError(
          'No se pudieron cargar las calificaciones.'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarCalificaciones()
  }, [user?.alumno_id])

  const promedioGeneral =
    materias.length > 0
      ? (
          materias.reduce(
            (
              total,
              materia
            ) =>
              total +
              materia.promedio,
            0
          ) / materias.length
        ).toFixed(2)
      : '0.00'

  const aprobadas =
    materias.filter(
      materia =>
        materia.promedio >= 6
    ).length

  const enRiesgo =
    materias.filter(
      materia =>
        materia.promedio < 6
    ).length

  const excelencia =
    materias.filter(
      materia =>
        materia.promedio >= 9
    ).length

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando calificaciones...
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#dc2626',
        }}
      >
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calificaciones"
        subtitle={
          grupoActual
            ? `${grupoActual.nombre} · ${grupoActual.semestre || user.semestre || '—'}° Semestre · Ciclo ${grupoActual.ciclo_escolar || '—'}`
            : `${user.semestre || '—'}° Semestre`
        }
        action={
          <Pill variant="blue">
            P1 · P2 · P3
          </Pill>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <IconGrade
              size={22}
              style={{
                color: '#203A50',
              }}
            />
          }
          label="Promedio general"
          value={promedioGeneral}
          valueColor={gradeColor(
            Number(
              promedioGeneral
            )
          )}
        />

        <StatCard
          icon={
            <IconCheck
              size={22}
              style={{
                color: '#16a34a',
              }}
            />
          }
          label="Aprobadas"
          value={aprobadas}
          valueColor="#16a34a"
        />

        <StatCard
          icon={
            <IconAlert
              size={22}
              style={{
                color: '#dc2626',
              }}
            />
          }
          label="En riesgo"
          value={enRiesgo}
          valueColor="#dc2626"
        />

        <StatCard
          icon={
            <IconStar
              size={22}
              style={{
                color: '#ca8a04',
              }}
            />
          }
          label="Excelencia"
          value={excelencia}
          valueColor="#ca8a04"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Detalle por materia
            </CardTitle>

            <CardSubtitle>
              Parciales P1 · P2 · P3
            </CardSubtitle>
          </div>

          <Pill variant="default">
            {materias.length}{' '}
            materias
          </Pill>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                style={{
                  background:
                    '#F4F7FA',
                  borderBottom:
                    '1px solid #DDE4ED',
                }}
              >
                <th
                  className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '190px',
                  }}
                >
                  Materia
                </th>

                <th
                  className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '180px',
                  }}
                >
                  Docente
                </th>

                {[
                  'P1',
                  'P2',
                  'P3',
                ].map(p => (
                  <th
                    key={p}
                    className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                    style={{
                      color:
                        '#8FA0AF',
                      width: '90px',
                      borderLeft:
                        '1px solid #DDE4ED',
                    }}
                  >
                    {p}
                  </th>
                ))}

                <th
                  className="px-5 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '190px',
                    borderLeft:
                      '1px solid #DDE4ED',
                  }}
                >
                  Promedio
                </th>

                <th
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                  style={{
                    color: '#8FA0AF',
                    width: '140px',
                    borderLeft:
                      '1px solid #DDE4ED',
                  }}
                >
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {materias.map(
                materia => (
                  <tr
                    key={materia.id}
                    className="border-b transition-colors"
                    style={{
                      borderColor:
                        '#DDE4ED',
                    }}
                    onMouseEnter={e =>
                      (
                        e.currentTarget
                          .style
                          .background
                      ) =
                        '#F4F7FA'
                    }
                    onMouseLeave={e =>
                      (
                        e.currentTarget
                          .style
                          .background
                      ) =
                        'transparent'
                    }
                  >
                    <td
                      className="px-4 py-4 font-semibold"
                      style={{
                        color:
                          '#0F1E2B',
                      }}
                    >
                      {materia.nombre}
                    </td>

                    <td
                      className="px-4 py-4 text-xs"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      {materia.docente}
                    </td>

                    {materia.calificaciones.map(
                      (
                        calificacion,
                        index
                      ) => (
                        <td
                          key={index}
                          className="px-3 py-4 text-center"
                          style={{
                            width:
                              '90px',
                            borderLeft:
                              '1px solid #DDE4ED',
                          }}
                        >
                          <span
                            className="font-bold tabular-nums"
                            style={{
                              color:
                                gradeColor(
                                  calificacion
                                ),
                            }}
                          >
                            {
                              calificacion
                            }
                          </span>
                        </td>
                      )
                    )}

                    <td
                      className="px-5 py-4"
                      style={{
                        minWidth:
                          '190px',
                        borderLeft:
                          '1px solid #DDE4ED',
                      }}
                    >
                      <GradeBar
                        value={
                          materia.promedio
                        }
                      />
                    </td>

                    <td
                      className="px-4 py-4 text-center"
                      style={{
                        borderLeft:
                          '1px solid #DDE4ED',
                      }}
                    >
                      <GradeState
                        p={
                          materia.promedio
                        }
                      />
                    </td>
                  </tr>
                )
              )}

              {materias.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    No hay materias
                    disponibles para este
                    alumno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}