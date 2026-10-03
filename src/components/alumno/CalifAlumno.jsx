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
} from '../Icons'


// ==================================================
// COLORES
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


// ==================================================
// ESTADO DE CALIFICACIÓN
// ==================================================

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


// ==================================================
// CONVERTIR CALIFICACIÓN
// ==================================================

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


// ==================================================
// CALCULAR PROMEDIO
// ==================================================

function calcularPromedio(parciales) {

  const validos =
    parciales.filter(
      parcial =>
        Number.isFinite(parcial)
    )


  if (validos.length === 0) {
    return null
  }


  const suma =
    validos.reduce(
      (total, parcial) =>
        total + parcial,
      0
    )


  return suma / validos.length
}


// ==================================================
// MOSTRAR CALIFICACIÓN
// ==================================================

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


// ==================================================
// COMPONENTE
// ==================================================

export default function CalifAlumno({ user }) {

  const [materias, setMaterias] =
    useState([])

  const [grupoActual, setGrupoActual] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // ==================================================
  // CARGAR CALIFICACIONES
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


          const materiasFormateadas = []

          let grupoEncontrado = null


          // ============================================
          // RECORRER INSCRIPCIONES
          // ============================================

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


            if (!grupo) {
              continue
            }


            if (!grupoEncontrado) {
              grupoEncontrado = grupo
            }


            const asignaciones =
              grupo.grupo_materias || []


            const calificaciones =
              inscripcion.calificaciones || []


            // ==========================================
            // RECORRER MATERIAS
            // ==========================================

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


              // ========================================
              // BUSCAR CALIFICACIÓN DE ESTA MATERIA
              // ========================================

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


              // ========================================
              // PARCIALES
              // ========================================

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


              // ========================================
              // PROMEDIO
              // ========================================

              const promedioGuardado =
                convertirCalificacion(
                  calificacion?.promedio
                )


              /*
                Si Supabase ya tiene un promedio,
                usamos ese valor.

                Si todavía no existe promedio,
                calculamos únicamente con los
                parciales que ya fueron capturados.

                Ejemplo:

                P1 = 9
                P2 = null
                P3 = null

                Promedio temporal = 9

                NO:
                (9 + 0 + 0) / 3
              */

              const promedio =
                promedioGuardado !== null
                  ? promedioGuardado
                  : calcularPromedio(
                      parciales
                    )


              // ========================================
              // NOMBRE DEL DOCENTE
              // ========================================

              const nombreDocente =
                perfilDocente
                  ? [
                      perfilDocente.nombre,
                      perfilDocente.apellido,
                    ]
                      .filter(Boolean)
                      .join(' ')
                  : 'Sin docente'


              // ========================================
              // AGREGAR MATERIA
              // ========================================

              materiasFormateadas.push({

                id:
                  asignacion.id,

                grupo_materia_id:
                  asignacion.id,

                nombre:
                  materia?.nombre ||
                  'Sin materia',

                docente:
                  nombreDocente,

                calificaciones:
                  parciales,

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
            err?.message ||
            'No se pudieron cargar las calificaciones.'
          )

        } finally {

          setLoading(false)
        }
      }


    cargarCalificaciones()

  }, [user?.alumno_id])


  // ==================================================
  // MATERIAS EVALUADAS
  // ==================================================

  const materiasEvaluadas =
    useMemo(() => {

      return materias.filter(
        materia =>
          Number.isFinite(
            materia.promedio
          )
      )

    }, [materias])


  // ==================================================
  // PROMEDIO GENERAL
  // ==================================================

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


  // ==================================================
  // APROBADAS
  // ==================================================

  const aprobadas =
    useMemo(() => {

      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 6
      ).length

    }, [materiasEvaluadas])


  // ==================================================
  // EN RIESGO
  // ==================================================

  /*
    Una materia está "en riesgo" cuando
    sigue aprobada, pero tiene un promedio
    entre 6.0 y 6.9.
  */

  const enRiesgo =
    useMemo(() => {

      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 6 &&
          materia.promedio < 7
      ).length

    }, [materiasEvaluadas])


  // ==================================================
  // EXCELENCIA
  // ==================================================

  const excelencia =
    useMemo(() => {

      return materiasEvaluadas.filter(
        materia =>
          materia.promedio >= 9
      ).length

    }, [materiasEvaluadas])


  // ==================================================
  // LOADING
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


  // ==================================================
  // ERROR
  // ==================================================

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

      {/* HEADER */}

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
          ESTADÍSTICAS
      ============================================ */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* PROMEDIO */}

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

          value={
            promedioGeneral !== null
              ? promedioGeneral.toFixed(2)
              : '—'
          }

          valueColor={
            promedioGeneral !== null
              ? gradeColor(
                  promedioGeneral
                )
              : '#8FA0AF'
          }
        />


        {/* APROBADAS */}

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


        {/* RIESGO */}

        <StatCard

          icon={
            <IconAlert
              size={22}
              style={{
                color: '#f59e0b',
              }}
            />
          }

          label="En riesgo"

          value={enRiesgo}

          valueColor="#f59e0b"
        />


        {/* EXCELENCIA */}

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


      {/* ============================================
          TABLA
      ============================================ */}

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

            {/* ========================================
                ENCABEZADO
            ======================================== */}

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
                ].map(
                  parcial => (

                    <th
                      key={parcial}

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


            {/* ========================================
                CUERPO
            ======================================== */}

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

                    onMouseEnter={
                      e => {
                        e.currentTarget
                          .style
                          .background =
                          '#F4F7FA'
                      }
                    }

                    onMouseLeave={
                      e => {
                        e.currentTarget
                          .style
                          .background =
                          'transparent'
                      }
                    }
                  >

                    {/* MATERIA */}

                    <td
                      className="px-4 py-4 font-semibold"

                      style={{
                        color:
                          '#0F1E2B',
                      }}
                    >
                      {materia.nombre}
                    </td>


                    {/* DOCENTE */}

                    <td
                      className="px-4 py-4 text-xs"

                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      {materia.docente}
                    </td>


                    {/* PARCIALES */}

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


                    {/* PROMEDIO */}

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


                    {/* ESTADO */}

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


              {/* SIN MATERIAS */}

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
                    No hay materias disponibles para este alumno.
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