import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  StatCard,
  Pill,
  ProfileHero,
  InfoGrid,
} from '../UI'
import {
  IconGrade,
  IconCheck,
  IconAlert,
} from '../Icons'

export default function DatosTutor({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hijo, setHijo] = useState(null)
  const [materias, setMaterias] = useState([])
  const [parentesco, setParentesco] = useState('Tutor Legal')

  useEffect(() => {
    cargarDatos()
  }, [user?.id])

  const cargarDatos = async () => {
    if (!user?.id) {
      setError('No se encontró la información del tutor.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Buscar el alumno vinculado al tutor
      const { data: relacion, error: relacionError } = await supabase
        .from('tutor_alumnos')
        .select(`
          alumno_id,
          parentesco,
          alumnos (
            id,
            perfil_id,
            matricula,
            semestre,
            grupo,
            turno,
            area_id,
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
        setError('No se encontró un alumno vinculado a este tutor.')
        setHijo(null)
        setMaterias([])
        return
      }

      const alumno = relacion.alumnos

      setParentesco(relacion.parentesco || 'Tutor Legal')

      // 2. Buscar correo del alumno en Authentication no es accesible
      // directamente desde el cliente, así que usamos sus datos públicos.
      const nombreCompleto = [
        alumno.perfiles?.nombre,
        alumno.perfiles?.apellido,
      ]
        .filter(Boolean)
        .join(' ')

      // 3. Buscar inscripción actual del alumno
      const { data: inscripcion, error: inscripcionError } = await supabase
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

      setHijo({
        id: alumno.id,
        perfil_id: alumno.perfil_id,
        nombre: nombreCompleto || 'Alumno',
        matricula: alumno.matricula || '—',
        semestre: grupo?.semestre
          ? `${grupo.semestre}° semestre`
          : alumno.semestre
            ? `${alumno.semestre}° semestre`
            : '—',
        grupo: grupo?.nombre || alumno.grupo || '—',
        turno: grupo?.turno || alumno.turno || '—',
        ciclo: grupo?.ciclo_escolar || '2026-2027',
        avatar: obtenerIniciales(
          alumno.perfiles?.nombre,
          alumno.perfiles?.apellido
        ),
      })

      // Si no tiene inscripción todavía, no podemos buscar calificaciones
      if (!inscripcion?.id) {
        setMaterias([])
        return
      }

      // 4. Obtener calificaciones reales
      const { data: calificaciones, error: calificacionesError } =
        await supabase
          .from('calificaciones')
          .select(`
            id,
            parcial_1,
            parcial_2,
            parcial_3,
            promedio,
            grupo_materias (
              id,
              materias (
                id,
                nombre
              )
            )
          `)
          .eq('inscripcion_id', inscripcion.id)

      if (calificacionesError) {
        throw calificacionesError
      }

      const materiasReales = (calificaciones || [])
        .map((calificacion) => {
          const materia = calificacion.grupo_materias?.materias

          if (!materia) {
            return null
          }

          const parciales = [
            convertirNumero(calificacion.parcial_1),
            convertirNumero(calificacion.parcial_2),
            convertirNumero(calificacion.parcial_3),
          ]

          const capturadas = parciales.filter(
            (valor) => valor !== null
          )

          let promedio = convertirNumero(calificacion.promedio)

          if (promedio === null && capturadas.length > 0) {
            promedio =
              capturadas.reduce((total, valor) => total + valor, 0) /
              capturadas.length
          }

          return {
            id: materia.id,
            nombre: materia.nombre,
            promedio,
          }
        })
        .filter(Boolean)

      setMaterias(materiasReales)
    } catch (err) {
      console.error('ERROR DATOS TUTOR:', err)
      setError('No fue posible cargar la información del alumno.')
      setHijo(null)
      setMaterias([])
    } finally {
      setLoading(false)
    }
  }

  const materiasEvaluadas = materias.filter(
    (materia) => materia.promedio !== null
  )

  const promedio =
    materiasEvaluadas.length > 0
      ? (
          materiasEvaluadas.reduce(
            (total, materia) => total + materia.promedio,
            0
          ) / materiasEvaluadas.length
        ).toFixed(2)
      : '—'

  const aprobadas = materiasEvaluadas.filter(
    (materia) => materia.promedio >= 6
  ).length

  const enRiesgo = materiasEvaluadas.filter(
    (materia) => materia.promedio < 7
  ).length

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#8FA0AF' }}
      >
        Cargando información del alumno...
      </div>
    )
  }

  if (error || !hijo) {
    return (
      <div
        className="p-6 rounded-2xl text-sm"
        style={{
          color: '#dc2626',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
        }}
      >
        {error || 'No se encontró información del alumno.'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Tutor */}
      <ProfileHero
        avatar={obtenerIniciales(user.nombre, user.apellido)}
        name={[user.nombre, user.apellido].filter(Boolean).join(' ')}
        sub="Tutor Legal / Padre de Familia"
        tag={user.email}
      />

      {/* Alumno */}
      <Card style={{ border: '1.5px solid #203A50' }}>
        <CardHeader>
          <div>
            <CardTitle>
              Información del Alumno Tutorado
            </CardTitle>

            <CardSubtitle>
              Seguimiento académico del alumno vinculado
            </CardSubtitle>
          </div>

          <Pill variant="blue">
            Ciclo {hijo.ciclo}
          </Pill>
        </CardHeader>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, #203A50, #203A55)',
              }}
            >
              {hijo.avatar}
            </div>

            <div className="flex-1 min-w-[200px]">
              <div
                className="text-xl font-extrabold"
                style={{ color: '#0F1E2B' }}
              >
                {hijo.nombre}
              </div>

              <div
                className="text-sm font-medium mt-0.5"
                style={{ color: '#506070' }}
              >
                {hijo.grupo} · {hijo.turno} · {hijo.semestre}
              </div>

              <div
                className="text-xs mt-0.5"
                style={{ color: '#8FA0AF' }}
              >
                Matrícula: {hijo.matricula}
              </div>
            </div>

            <div className="text-right pl-4">
              <div
                className="text-3xl font-black"
                style={{ color: '#203A50' }}
              >
                {promedio}
              </div>

              <div
                className="text-[11px] font-semibold"
                style={{ color: '#8FA0AF' }}
              >
                Promedio actual
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              icon={
                <IconGrade
                  size={20}
                  style={{ color: '#203A50' }}
                />
              }
              label="Materias evaluadas"
              value={materiasEvaluadas.length}
            />

            <StatCard
              icon={
                <IconCheck
                  size={20}
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
                  size={20}
                  style={{ color: '#dc2626' }}
                />
              }
              label="En riesgo"
              value={enRiesgo}
              valueColor="#dc2626"
            />
          </div>

          <InfoGrid
            fields={[
              {
                label: 'Nombre del Alumno',
                value: hijo.nombre,
              },
              {
                label: 'Matrícula',
                value: hijo.matricula,
              },
              {
                label: 'Grupo asignado',
                value: hijo.grupo,
              },
              {
                label: 'Turno',
                value: hijo.turno,
              },
              {
                label: 'Semestre',
                value: hijo.semestre,
              },
              {
                label: 'Plantel',
                value: 'Preparatoria Boletyx',
              },
              {
                label: 'Ciclo Escolar',
                value: hijo.ciclo,
              },
            ]}
          />
        </div>
      </Card>

      {/* Información Tutor */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Datos de Contacto del Tutor
            </CardTitle>

            <CardSubtitle>
              Información registrada en el expediente escolar
            </CardSubtitle>
          </div>
        </CardHeader>

        <div className="p-6">
          <InfoGrid
            fields={[
              {
                label: 'Nombre del Tutor',
                value: [user.nombre, user.apellido]
                  .filter(Boolean)
                  .join(' '),
              },
              {
                label: 'Correo Electrónico',
                value: user.email,
              },
              {
                label: 'Parentesco',
                value: parentesco,
              },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}

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

function obtenerIniciales(nombre, apellido) {
  const inicialNombre =
    nombre?.trim()?.charAt(0)?.toUpperCase() || ''

  const inicialApellido =
    apellido?.trim()?.charAt(0)?.toUpperCase() || ''

  return `${inicialNombre}${inicialApellido}` || 'A'
}