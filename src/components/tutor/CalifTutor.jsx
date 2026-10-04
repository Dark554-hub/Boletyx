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
  IconCheck,
  IconAlert,
  IconStar,
} from '../Icons'

function convertirNumero(valor) {
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

function gradeColor(valor) {
  if (valor === null) return '#8FA0AF'
  if (valor >= 9) return '#16a34a'
  if (valor >= 7) return '#ca8a04'
  if (valor >= 6) return '#ea580c'
  return '#dc2626'
}

function GradeState({ promedio }) {
  if (promedio === null) {
    return <Pill variant="blue">Sin evaluar</Pill>
  }

  if (promedio >= 9) {
    return <Pill variant="success">Excelente</Pill>
  }

  if (promedio >= 7) {
    return <Pill variant="warning">Regular</Pill>
  }

  if (promedio >= 6) {
    return <Pill variant="warning">En riesgo</Pill>
  }

  return <Pill variant="danger">Reprobado</Pill>
}

function mostrarCalificacion(valor) {
  if (valor === null) {
    return '—'
  }

  return Number(valor).toFixed(1)
}

export default function CalifTutor({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hijo, setHijo] = useState(null)
  const [materias, setMaterias] = useState([])

  useEffect(() => {
    cargarCalificaciones()
  }, [user?.id])

  const cargarCalificaciones = async () => {
    if (!user?.id) {
      setError('No se encontró la información del tutor.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Buscar alumno vinculado al tutor
      const {
        data: relacion,
        error: relacionError,
      } = await supabase
        .from('tutor_alumnos')
        .select(`
          alumno_id,
          alumnos (
            id,
            perfil_id,
            matricula,
            semestre,
            grupo,
            turno,
            perfiles (
              nombre,
              apellido
            )
          )
        `)
        .eq('tutor_id', user.id)
        .limit(1)
        .maybeSingle()

      if (relacionError) {
        throw relacionError
      }

      if (!relacion?.alumnos) {
        setError(
          'No se encontró un alumno vinculado a este tutor.'
        )
        return
      }

      const alumno = relacion.alumnos

      // 2. Obtener inscripción y grupo real
      const {
        data: inscripcion,
        error: inscripcionError,
      } = await supabase
        .from('inscripciones')
        .select(`
          id,
          grupo_id,
          grupos (
            id,
            nombre,
            semestre,
            turno,
            ciclo_escolar
          )
        `)
        .eq('alumno_id', alumno.id)
        .limit(1)
        .maybeSingle()

      if (inscripcionError) {
        throw inscripcionError
      }

      const grupo = inscripcion?.grupos || null

      const nombreCompleto = [
        alumno.perfiles?.nombre,
        alumno.perfiles?.apellido,
      ]
        .filter(Boolean)
        .join(' ')

      setHijo({
        id: alumno.id,
        nombre: nombreCompleto || 'Alumno',
        matricula: alumno.matricula || '—',
        grupo: grupo?.nombre || alumno.grupo || '—',
        turno: grupo?.turno || alumno.turno || '—',
        semestre:
          grupo?.semestre ||
          alumno.semestre ||
          '—',
        ciclo:
          grupo?.ciclo_escolar ||
          '2026-2027',
      })

      if (!inscripcion?.id) {
        setMaterias([])
        return
      }

      // 3. Obtener calificaciones reales
      const {
        data: calificaciones,
        error: calificacionesError,
      } = await supabase
        .from('calificaciones')
        .select(`
          id,
          parcial_1,
          parcial_2,
          parcial_3,
          promedio,
          grupo_materia_id,
          grupo_materias (
            id,
            materia_id,
            docente_id,
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
        `)
        .eq('inscripcion_id', inscripcion.id)

      if (calificacionesError) {
        throw calificacionesError
      }

      const materiasReales = (calificaciones || [])
        .map((calificacion) => {
          const grupoMateria =
            calificacion.grupo_materias

          const materia =
            grupoMateria?.materias

          if (!materia) {
            return null
          }

          const parcial1 =
            convertirNumero(calificacion.parcial_1)

          const parcial2 =
            convertirNumero(calificacion.parcial_2)

          const parcial3 =
            convertirNumero(calificacion.parcial_3)

          const parciales = [
            parcial1,
            parcial2,
            parcial3,
          ]

          const capturadas = parciales.filter(
            (valor) => valor !== null
          )

          let promedio =
            convertirNumero(calificacion.promedio)

          if (
            promedio === null &&
            capturadas.length > 0
          ) {
            promedio =
              capturadas.reduce(
                (total, valor) => total + valor,
                0
              ) / capturadas.length
          }

          const perfilDocente =
            grupoMateria?.docentes?.perfiles

          const docente = perfilDocente
            ? [
                perfilDocente.nombre,
                perfilDocente.apellido,
              ]
                .filter(Boolean)
                .join(' ')
            : 'Sin asignar'

          return {
            id: calificacion.id,
            materia: materia.nombre,
            docente,
            parcial1,
            parcial2,
            parcial3,
            promedio,
          }
        })
        .filter(Boolean)

      setMaterias(materiasReales)
    } catch (err) {
      console.error(
        'ERROR CALIFICACIONES TUTOR:',
        err
      )

      setError(
        'No fue posible cargar las calificaciones del alumno.'
      )

      setMaterias([])
    } finally {
      setLoading(false)
    }
  }

  const materiasEvaluadas = materias.filter(
    (materia) => materia.promedio !== null
  )

  const promedioGeneral =
    materiasEvaluadas.length > 0
      ? materiasEvaluadas.reduce(
          (total, materia) =>
            total + materia.promedio,
          0
        ) / materiasEvaluadas.length
      : null

  const aprobadas = materiasEvaluadas.filter(
    (materia) => materia.promedio >= 6
  ).length

  const enRiesgo = materiasEvaluadas.filter(
    (materia) => materia.promedio < 7
  ).length

  const excelencia = materiasEvaluadas.filter(
    (materia) => materia.promedio >= 9
  ).length

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#8FA0AF' }}
      >
        Cargando calificaciones...
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl text-sm"
        style={{
          color: '#dc2626',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
        }}
      >
        {error}
      </div>
    )
  }

  if (!hijo) {
    return (
      <p
        className="p-6 text-sm"
        style={{ color: '#8FA0AF' }}
      >
        No se encontró el alumno vinculado.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Calificaciones de ${
          hijo.nombre.split(' ')[0]
        }`}
        subtitle={`${hijo.grupo} · ${
          hijo.semestre
        }° semestre · Ciclo escolar ${
          hijo.ciclo
        }`}
        action={
          <Pill variant="mint">
            Alumno tutorado
          </Pill>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <IconGrade
              size={22}
              style={{ color: '#203A50' }}
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
              ? gradeColor(promedioGeneral)
              : '#8FA0AF'
          }
        />

        <StatCard
          icon={
            <IconCheck
              size={22}
              style={{ color: '#16a34a' }}
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
              style={{ color: '#dc2626' }}
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
              style={{ color: '#ca8a04' }}
            />
          }
          label="En excelencia"
          value={excelencia}
          valueColor="#ca8a04"
        />
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Detalle por materia — {hijo.nombre}
            </CardTitle>

            <CardSubtitle>
              Evaluaciones parciales P1 · P2 · P3
            </CardSubtitle>
          </div>
        </CardHeader>

        {materias.length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: '#8FA0AF' }}
          >
            Todavía no hay calificaciones registradas
            para este alumno.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  style={{
                    background: '#F4F7FA',
                    borderBottom:
                      '1px solid #DDE4ED',
                  }}
                >
                  {[
                    'Materia',
                    'Docente',
                    'P1',
                    'P2',
                    'P3',
                    'Promedio',
                    'Estado',
                  ].map((titulo) => (
                    <th
                      key={titulo}
                      className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                      style={{
                        color: '#8FA0AF',
                      }}
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {materias.map((materia) => (
                  <tr
                    key={materia.id}
                    className="border-b transition-colors"
                    style={{
                      borderColor: '#DDE4ED',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        '#F4F7FA'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        'transparent'
                    }}
                  >
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{
                        color: '#0F1E2B',
                      }}
                    >
                      {materia.materia}
                    </td>

                    <td
                      className="px-4 py-3 text-[12px]"
                      style={{
                        color: '#8FA0AF',
                      }}
                    >
                      {materia.docente}
                    </td>

                    {[
                      materia.parcial1,
                      materia.parcial2,
                      materia.parcial3,
                    ].map((calificacion, index) => (
                      <td
                        key={index}
                        className="px-4 py-3 text-center font-bold tabular-nums"
                        style={{
                          color:
                            gradeColor(calificacion),
                        }}
                      >
                        {mostrarCalificacion(
                          calificacion
                        )}
                      </td>
                    ))}

                    <td className="px-4 py-3 min-w-[120px]">
                      {materia.promedio !== null ? (
                        <GradeBar
                          value={materia.promedio}
                        />
                      ) : (
                        <span
                          className="text-sm"
                          style={{
                            color: '#8FA0AF',
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <GradeState
                        promedio={materia.promedio}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}