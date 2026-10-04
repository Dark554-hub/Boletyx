import { useEffect, useMemo, useState } from 'react'

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
  IconDoc,
} from '../Icons'


// ==================================================
// HELPERS
// ==================================================

function gradeColor(p) {
  if (p === null || p === undefined) {
    return '#8FA0AF'
  }

  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  if (p >= 6) return '#f59e0b'

  return '#dc2626'
}


function GradeState({ p }) {
  if (
    p === null ||
    p === undefined ||
    !Number.isFinite(Number(p))
  ) {
    return (
      <Pill variant="default">
        Sin evaluar
      </Pill>
    )
  }

  const promedio = Number(p)

  if (promedio >= 9) {
    return (
      <Pill variant="success">
        Excelente
      </Pill>
    )
  }

  if (promedio >= 7) {
    return (
      <Pill variant="warning">
        Regular
      </Pill>
    )
  }

  if (promedio >= 6) {
    return (
      <Pill variant="warning">
        En riesgo
      </Pill>
    )
  }

  return (
    <Pill variant="danger">
      Reprobado
    </Pill>
  )
}


function KardexState({ p }) {
  if (
    p === null ||
    p === undefined ||
    !Number.isFinite(Number(p))
  ) {
    return (
      <Pill variant="default">
        Sin calificación
      </Pill>
    )
  }

  return Number(p) >= 6 ? (
    <Pill variant="success">
      Aprobada
    </Pill>
  ) : (
    <Pill variant="danger">
      Reprobada
    </Pill>
  )
}


function convertirCalificacion(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null
  }

  const numero = Number(valor)

  return Number.isFinite(numero)
    ? numero
    : null
}


function calcularPromedio(parciales) {
  const validos = parciales.filter(
    parcial =>
      Number.isFinite(parcial)
  )

  if (validos.length === 0) {
    return null
  }

  const suma = validos.reduce(
    (total, parcial) =>
      total + parcial,
    0
  )

  return suma / validos.length
}


function mostrarCalificacion(valor) {
  if (
    valor === null ||
    valor === undefined ||
    !Number.isFinite(Number(valor))
  ) {
    return '—'
  }

  return Number(valor).toFixed(1)
}


function obtenerRelacion(relacion) {
  if (!relacion) return null

  return Array.isArray(relacion)
    ? relacion[0]
    : relacion
}


function compararCiclosDesc(a, b) {
  return String(b || '')
    .localeCompare(
      String(a || ''),
      'es',
      {
        numeric: true,
      }
    )
}


// ==================================================
// COMPONENTE
// ==================================================

export default function CalifAlumno({ user }) {
  const [registros, setRegistros] =
    useState([])

  const [grupoActual, setGrupoActual] =
    useState(null)

  const [vista, setVista] =
    useState('actual')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // ==================================================
  // CARGAR CALIFICACIONES + HISTORIAL
  // ==================================================

  useEffect(() => {
    const cargarCalificaciones =
      async () => {
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

          const registrosFormateados = []
          const gruposInscritos = []

          for (
            const inscripcion of
              inscripciones || []
          ) {
            const grupo =
              obtenerRelacion(
                inscripcion.grupos
              )

            if (!grupo) {
              continue
            }

            gruposInscritos.push({
              inscripcionId:
                inscripcion.id,

              id:
                grupo.id,

              nombre:
                grupo.nombre,

              semestre:
                grupo.semestre,

              turno:
                grupo.turno,

              ciclo_escolar:
                grupo.ciclo_escolar,
            })

            const asignaciones =
              grupo.grupo_materias || []

            const calificaciones =
              inscripcion.calificaciones || []

            for (
              const asignacion of
                asignaciones
            ) {
              const materia =
                obtenerRelacion(
                  asignacion.materias
                )

              const docente =
                obtenerRelacion(
                  asignacion.docentes
                )

              const perfilDocente =
                obtenerRelacion(
                  docente?.perfiles
                )

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
                convertirCalificacion(
                  calificacion?.parcial_1
                )

              const p2 =
                convertirCalificacion(
                  calificacion?.parcial_2
                )

              const p3 =
                convertirCalificacion(
                  calificacion?.parcial_3
                )

              const parciales = [
                p1,
                p2,
                p3,
              ]

              const promedioGuardado =
                convertirCalificacion(
                  calificacion?.promedio
                )

              const promedio =
                promedioGuardado !== null
                  ? promedioGuardado
                  : calcularPromedio(
                      parciales
                    )

              const completada =
                promedioGuardado !== null ||
                parciales.every(
                  parcial =>
                    parcial !== null
                )

              const nombreDocente =
                perfilDocente
                  ? [
                      perfilDocente.nombre,
                      perfilDocente.apellido,
                    ]
                      .filter(Boolean)
                      .join(' ')
                  : 'Sin docente'

              registrosFormateados.push({
                id:
                  `${inscripcion.id}-${asignacion.id}`,

                inscripcion_id:
                  inscripcion.id,

                grupo_materia_id:
                  asignacion.id,

                materia_id:
                  materia?.id ?? null,

                nombre:
                  materia?.nombre ||
                  'Sin materia',

                docente:
                  nombreDocente,

                calificaciones:
                  parciales,

                promedio,

                promedioGuardado,

                completada,

                grupo_id:
                  grupo.id,

                grupo:
                  grupo.nombre ||
                  'Sin grupo',

                semestre:
                  grupo.semestre,

                turno:
                  grupo.turno,

                ciclo:
                  grupo.ciclo_escolar ||
                  'Sin ciclo',
              })
            }
          }

          const semestreUsuario =
            Number(user?.semestre)

          const candidatosActuales =
            gruposInscritos.filter(
              grupo =>
                Number.isFinite(
                  semestreUsuario
                ) &&
                Number(
                  grupo.semestre
                ) ===
                  semestreUsuario
            )

          const gruposOrdenados = [
            ...(
              candidatosActuales.length
                ? candidatosActuales
                : gruposInscritos
            ),
          ].sort((a, b) => {
            const ciclo =
              compararCiclosDesc(
                a.ciclo_escolar,
                b.ciclo_escolar
              )

            if (ciclo !== 0) {
              return ciclo
            }

            return (
              Number(
                b.semestre || 0
              ) -
              Number(
                a.semestre || 0
              )
            )
          })

          const actual =
            gruposOrdenados[0] || null

          setGrupoActual(actual)
          setRegistros(
            registrosFormateados
          )
        } catch (err) {
          console.error(
            'Error cargando calificaciones:',
            err
          )

          setError(
            err?.message ||
              'No se pudieron cargar las calificaciones.'
          )
        } finally {
          setLoading(false)
        }
      }

    cargarCalificaciones()
  }, [
    user?.alumno_id,
    user?.semestre,
  ])


  // ==================================================
  // CALIFICACIONES ACTUALES
  // ==================================================

  const materias = useMemo(() => {
    if (!grupoActual) {
      return []
    }

    return registros.filter(
      registro =>
        String(
          registro.inscripcion_id
        ) ===
        String(
          grupoActual.inscripcionId
        )
    )
  }, [
    registros,
    grupoActual,
  ])


  const materiasEvaluadas =
    useMemo(() => {
      return materias.filter(
        materia =>
          Number.isFinite(
            materia.promedio
          )
      )
    }, [materias])


  const promedioGeneral =
    useMemo(() => {
      if (
        materiasEvaluadas.length === 0
      ) {
        return null
      }

      const suma =
        materiasEvaluadas.reduce(
          (total, materia) =>
            total +
            materia.promedio,
          0
        )

      return (
        suma /
        materiasEvaluadas.length
      )
    }, [materiasEvaluadas])


  const aprobadas =
    useMemo(() => {
      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 6
      ).length
    }, [materiasEvaluadas])


  const enRiesgo =
    useMemo(() => {
      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 6 &&
          materia.promedio < 7
      ).length
    }, [materiasEvaluadas])


  const excelencia =
    useMemo(() => {
      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 9
      ).length
    }, [materiasEvaluadas])


  // ==================================================
  // KARDEX
  // ==================================================

  const kardex = useMemo(() => {
    if (!grupoActual) {
      return []
    }

    return registros
      .filter(
        registro =>
          String(
            registro.inscripcion_id
          ) !==
            String(
              grupoActual.inscripcionId
            ) &&
          registro.completada &&
          Number.isFinite(
            registro.promedio
          )
      )
      .sort((a, b) => {
        const ciclo =
          compararCiclosDesc(
            a.ciclo,
            b.ciclo
          )

        if (ciclo !== 0) {
          return ciclo
        }

        const semestre =
          Number(
            b.semestre || 0
          ) -
          Number(
            a.semestre || 0
          )

        if (semestre !== 0) {
          return semestre
        }

        return a.nombre.localeCompare(
          b.nombre,
          'es'
        )
      })
  }, [
    registros,
    grupoActual,
  ])


  const promedioKardex =
    useMemo(() => {
      if (!kardex.length) {
        return null
      }

      return (
        kardex.reduce(
          (total, materia) =>
            total +
            materia.promedio,
          0
        ) /
        kardex.length
      )
    }, [kardex])


  const aprobadasKardex =
    useMemo(() => {
      return kardex.filter(
        materia =>
          materia.promedio >= 6
      ).length
    }, [kardex])


  const reprobadasKardex =
    useMemo(() => {
      return kardex.filter(
        materia =>
          materia.promedio < 6
      ).length
    }, [kardex])


  const gruposKardex =
    useMemo(() => {
      const mapa = new Map()

      kardex.forEach(
        materia => {
          const llave =
            `${materia.ciclo}__${materia.semestre}__${materia.grupo}`

          if (!mapa.has(llave)) {
            mapa.set(
              llave,
              {
                llave,
                ciclo:
                  materia.ciclo,
                semestre:
                  materia.semestre,
                grupo:
                  materia.grupo,
                materias: [],
              }
            )
          }

          mapa
            .get(llave)
            .materias
            .push(materia)
        }
      )

      return [
        ...mapa.values(),
      ]
    }, [kardex])


  // ==================================================
  // ESTADOS
  // ==================================================

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


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calificaciones"
        subtitle={
          grupoActual
            ? `${grupoActual.nombre} · ${
                grupoActual.semestre ||
                user.semestre ||
                '—'
              }° Semestre · Ciclo ${
                grupoActual.ciclo_escolar ||
                '—'
              }`
            : `${user.semestre || '—'}° Semestre`
        }
        action={
          <Pill variant="blue">
            P1 · P2 · P3
          </Pill>
        }
      />


      {/* ============================================
          SELECTOR CALIFICACIONES / KARDEX
      ============================================ */}

      <div
        className="inline-flex gap-1 p-1 rounded-xl"
        style={{
          background: '#EEF3F6',
          border:
            '1px solid #DDE4ED',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setVista('actual')
          }
          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
          style={{
            fontFamily:
              'inherit',
            background:
              vista === 'actual'
                ? '#203A50'
                : 'transparent',
            color:
              vista === 'actual'
                ? '#fff'
                : '#506070',
          }}
        >
          Calificaciones actuales
        </button>

        <button
          type="button"
          onClick={() =>
            setVista('kardex')
          }
          className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
          style={{
            fontFamily:
              'inherit',
            background:
              vista === 'kardex'
                ? '#203A50'
                : 'transparent',
            color:
              vista === 'kardex'
                ? '#fff'
                : '#506070',
          }}
        >
          Kardex
        </button>
      </div>


      {/* ============================================
          VISTA ACTUAL
      ============================================ */}

      {vista === 'actual' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={
                <IconGrade
                  size={22}
                  style={{
                    color:
                      '#203A50',
                  }}
                />
              }
              label="Promedio general"
              value={
                promedioGeneral !==
                null
                  ? promedioGeneral.toFixed(
                      2
                    )
                  : '—'
              }
              valueColor={
                promedioGeneral !==
                null
                  ? gradeColor(
                      promedioGeneral
                    )
                  : '#8FA0AF'
              }
            />

            <StatCard
              icon={
                <IconCheck
                  size={22}
                  style={{
                    color:
                      '#16a34a',
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
                    color:
                      '#f59e0b',
                  }}
                />
              }
              label="En riesgo"
              value={enRiesgo}
              valueColor="#f59e0b"
            />

            <StatCard
              icon={
                <IconStar
                  size={22}
                  style={{
                    color:
                      '#ca8a04',
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
                {materias.length === 1
                  ? 'materia'
                  : 'materias'}
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
                        color:
                          '#8FA0AF',
                        minWidth:
                          '190px',
                      }}
                    >
                      Materia
                    </th>

                    <th
                      className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                      style={{
                        color:
                          '#8FA0AF',
                        minWidth:
                          '180px',
                      }}
                    >
                      Docente
                    </th>

                    {[
                      'P1',
                      'P2',
                      'P3',
                    ].map(
                      parcial => (
                        <th
                          key={
                            parcial
                          }
                          className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                          style={{
                            color:
                              '#8FA0AF',
                            width:
                              '90px',
                            borderLeft:
                              '1px solid #DDE4ED',
                          }}
                        >
                          {parcial}
                        </th>
                      )
                    )}

                    <th
                      className="px-5 py-3 text-[11px] font-black uppercase tracking-wider"
                      style={{
                        color:
                          '#8FA0AF',
                        minWidth:
                          '190px',
                        borderLeft:
                          '1px solid #DDE4ED',
                      }}
                    >
                      Promedio
                    </th>

                    <th
                      className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                      style={{
                        color:
                          '#8FA0AF',
                        width:
                          '140px',
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
                        key={
                          materia.id
                        }
                        className="border-b transition-colors"
                        style={{
                          borderColor:
                            '#DDE4ED',
                        }}
                        onMouseEnter={
                          e => {
                            e.currentTarget.style.background =
                              '#F4F7FA'
                          }
                        }
                        onMouseLeave={
                          e => {
                            e.currentTarget.style.background =
                              'transparent'
                          }
                        }
                      >
                        <td
                          className="px-4 py-4 font-semibold"
                          style={{
                            color:
                              '#0F1E2B',
                          }}
                        >
                          {
                            materia.nombre
                          }
                        </td>

                        <td
                          className="px-4 py-4 text-xs"
                          style={{
                            color:
                              '#8FA0AF',
                          }}
                        >
                          {
                            materia.docente
                          }
                        </td>

                        {materia.calificaciones.map(
                          (
                            calificacion,
                            index
                          ) => (
                            <td
                              key={
                                index
                              }
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
                                    calificacion ===
                                    null
                                      ? '#8FA0AF'
                                      : gradeColor(
                                          calificacion
                                        ),
                                }}
                              >
                                {mostrarCalificacion(
                                  calificacion
                                )}
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
                          {materia.promedio !==
                          null ? (
                            <GradeBar
                              value={
                                materia.promedio
                              }
                            />
                          ) : (
                            <span
                              style={{
                                color:
                                  '#8FA0AF',
                                fontSize:
                                  '12px',
                                fontWeight:
                                  600,
                              }}
                            >
                              Sin evaluar
                            </span>
                          )}
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

                  {materias.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-sm"
                        style={{
                          color:
                            '#8FA0AF',
                        }}
                      >
                        No hay materias disponibles para este alumno.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}


      {/* ============================================
          KARDEX
      ============================================ */}

      {vista === 'kardex' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={
                <IconDoc
                  size={22}
                  style={{
                    color:
                      '#203A50',
                  }}
                />
              }
              label="Materias cursadas"
              value={kardex.length}
              valueColor="#203A50"
            />

            <StatCard
              icon={
                <IconGrade
                  size={22}
                  style={{
                    color:
                      '#203A50',
                  }}
                />
              }
              label="Promedio histórico"
              value={
                promedioKardex !==
                null
                  ? promedioKardex.toFixed(
                      2
                    )
                  : '—'
              }
              valueColor={
                promedioKardex !==
                null
                  ? gradeColor(
                      promedioKardex
                    )
                  : '#8FA0AF'
              }
            />

            <StatCard
              icon={
                <IconCheck
                  size={22}
                  style={{
                    color:
                      '#16a34a',
                  }}
                />
              }
              label="Aprobadas"
              value={
                aprobadasKardex
              }
              valueColor="#16a34a"
            />

            <StatCard
              icon={
                <IconAlert
                  size={22}
                  style={{
                    color:
                      '#dc2626',
                  }}
                />
              }
              label="Reprobadas"
              value={
                reprobadasKardex
              }
              valueColor="#dc2626"
            />
          </div>


          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  Kardex académico
                </CardTitle>

                <CardSubtitle>
                  Materias concluidas de ciclos o semestres anteriores
                </CardSubtitle>
              </div>

              <Pill variant="default">
                {kardex.length}{' '}
                {kardex.length === 1
                  ? 'registro'
                  : 'registros'}
              </Pill>
            </CardHeader>


            {gruposKardex.length ===
            0 ? (
              <div
                className="px-6 py-12 text-center text-sm"
                style={{
                  color:
                    '#8FA0AF',
                }}
              >
                Aún no existen materias concluidas de ciclos o semestres anteriores para mostrar en el Kardex.
              </div>
            ) : (
              <div className="divide-y">
                {gruposKardex.map(
                  bloque => (
                    <div
                      key={
                        bloque.llave
                      }
                    >
                      <div
                        className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                        style={{
                          background:
                            '#F4F7FA',
                          borderBottom:
                            '1px solid #DDE4ED',
                        }}
                      >
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color:
                                '#203A50',
                            }}
                          >
                            {bloque.semestre ||
                              '—'}
                            ° Semestre ·{' '}
                            {bloque.grupo}
                          </p>

                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color:
                                '#8FA0AF',
                            }}
                          >
                            Ciclo{' '}
                            {
                              bloque.ciclo
                            }
                          </p>
                        </div>

                        <Pill variant="blue">
                          {
                            bloque
                              .materias
                              .length
                          }{' '}
                          {bloque.materias
                            .length === 1
                            ? 'materia'
                            : 'materias'}
                        </Pill>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr
                              style={{
                                borderBottom:
                                  '1px solid #DDE4ED',
                              }}
                            >
                              <th
                                className="text-left px-5 py-3 text-[11px] font-black uppercase tracking-wider"
                                style={{
                                  color:
                                    '#8FA0AF',
                                  minWidth:
                                    '220px',
                                }}
                              >
                                Materia
                              </th>

                              <th
                                className="text-left px-5 py-3 text-[11px] font-black uppercase tracking-wider"
                                style={{
                                  color:
                                    '#8FA0AF',
                                  minWidth:
                                    '180px',
                                }}
                              >
                                Docente
                              </th>

                              <th
                                className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                                style={{
                                  color:
                                    '#8FA0AF',
                                  width:
                                    '140px',
                                }}
                              >
                                Calificación
                              </th>

                              <th
                                className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                                style={{
                                  color:
                                    '#8FA0AF',
                                  width:
                                    '140px',
                                }}
                              >
                                Estado
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {bloque.materias.map(
                              materia => (
                                <tr
                                  key={
                                    materia.id
                                  }
                                  className="border-b"
                                  style={{
                                    borderColor:
                                      '#DDE4ED',
                                  }}
                                >
                                  <td
                                    className="px-5 py-4 font-semibold"
                                    style={{
                                      color:
                                        '#0F1E2B',
                                    }}
                                  >
                                    {
                                      materia.nombre
                                    }
                                  </td>

                                  <td
                                    className="px-5 py-4 text-xs"
                                    style={{
                                      color:
                                        '#8FA0AF',
                                    }}
                                  >
                                    {
                                      materia.docente
                                    }
                                  </td>

                                  <td className="px-5 py-4 text-center">
                                    <span
                                      className="font-black tabular-nums"
                                      style={{
                                        color:
                                          gradeColor(
                                            materia.promedio
                                          ),
                                      }}
                                    >
                                      {mostrarCalificacion(
                                        materia.promedio
                                      )}
                                    </span>
                                  </td>

                                  <td className="px-5 py-4 text-center">
                                    <KardexState
                                      p={
                                        materia.promedio
                                      }
                                    />
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
