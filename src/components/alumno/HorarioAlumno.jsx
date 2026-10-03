import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Card } from '../UI'
import { IconCalendar, IconClock } from '../Icons'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const HORAS_MATUTINO = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00'
]

const HORAS_VESPERTINO = [
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00'
]

function claseMateria(nombre = '') {
  if (nombre.includes('Matemáticas')) return 'cell-mat'
  if (nombre.includes('Química')) return 'cell-qui'
  if (nombre.includes('Historia')) return 'cell-his'
  if (nombre.includes('Inglés')) return 'cell-ing'
  if (nombre.includes('Física')) return 'cell-fis'
  if (nombre.includes('Español')) return 'cell-esp'

  return ''
}

export default function HorarioAlumno({ user }) {

  const [alumno, setAlumno] = useState(null)
  const [horario, setHorario] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ][new Date().getDay()]

  useEffect(() => {
    cargarHorario()
  }, [user?.id])

  async function cargarHorario() {

    if (!user?.id) {
      setError('No se encontró el usuario.')
      setLoading(false)
      return
    }

    try {

      setLoading(true)
      setError('')

      // 1. Obtener los datos escolares del alumno
      const { data: alumnoData, error: alumnoError } = await supabase
        .from('alumnos')
        .select(`
          id,
          perfil_id,
          matricula,
          semestre,
          grupo,
          turno,
          area_id
        `)
        .eq('perfil_id', user.id)
        .single()

      if (alumnoError) {
        throw alumnoError
      }

      if (!alumnoData) {
        throw new Error('No existe información del alumno.')
      }

      setAlumno(alumnoData)

      // 2. Determinar el área que corresponde
      let areaId = alumnoData.area_id

      // 1.º y 2.º siempre utilizan Tronco Común
      if (alumnoData.semestre <= 2) {

        const { data: troncoComun, error: areaError } = await supabase
          .from('areas')
          .select('id')
          .eq('nombre', 'Tronco Común')
          .single()

        if (areaError) {
          throw areaError
        }

        areaId = troncoComun.id
      }

      if (!areaId) {
        throw new Error(
          'El alumno no tiene un área académica asignada.'
        )
      }

      // 3. Buscar únicamente el horario que le corresponde
      const { data: horarioData, error: horarioError } = await supabase
        .from('horarios')
        .select(`
          id,
          semestre,
          grupo,
          turno,
          dia,
          hora_inicio,
          hora_fin,
          aula,
          materia:materias!inner (
            id,
            nombre,
            semestre,
            area_id
          )
        `)
        .eq('semestre', alumnoData.semestre)
        .eq('grupo', alumnoData.grupo)
        .eq('turno', alumnoData.turno)
        .eq('materias.area_id', areaId)
        .order('hora_inicio', { ascending: true })

      if (horarioError) {
        throw horarioError
      }

      // 4. Convertir los registros de Supabase
      // a una estructura fácil de mostrar
      const horarioOrganizado = {}

      DIAS.forEach(dia => {
        horarioOrganizado[dia] = {}
      })

      horarioData.forEach(clase => {

        const hora = clase.hora_inicio.slice(0, 5)

        horarioOrganizado[clase.dia][hora] = {
          materia: clase.materia?.nombre || 'Sin materia',
          aula: clase.aula || 'Sin aula',
          horaInicio: clase.hora_inicio,
          horaFin: clase.hora_fin
        }

      })

      setHorario(horarioOrganizado)

    } catch (err) {

      console.error('Error al cargar horario:', err)

      setError(
        err.message || 'No se pudo cargar el horario.'
      )

    } finally {

      setLoading(false)

    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p style={{ color: '#506070' }}>
          Cargando horario...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="font-semibold" style={{ color: '#B42318' }}>
          {error}
        </p>
      </div>
    )
  }

  const HORAS =
    alumno?.turno === 'vespertino'
      ? HORAS_VESPERTINO
      : HORAS_MATUTINO

  return (
    <div className="space-y-5">

      <PageHeader
        title="Horario de Clases"
        subtitle={
          `Semestre ${alumno.semestre} · Grupo ${alumno.grupo} · Turno ${alumno.turno}`
        }
      />

      {/* Clases de hoy */}

      {DIAS.includes(today) && (

        <div
          className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{
            background: 'rgba(32,58,80,.04)',
            borderColor: '#DDE4ED'
          }}
        >

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(32,58,80,.08)'
            }}
          >

            <IconCalendar
              size={18}
              style={{ color: '#203A50' }}
            />

          </div>

          <div>

            <p
              className="text-[13px] font-bold"
              style={{ color: '#203A50' }}
            >
              Hoy — {today}
            </p>

            <p
              className="text-[12px] mt-0.5"
              style={{ color: '#506070' }}
            >

              {Object.values(horario[today] || {}).length > 0

                ? Object.values(horario[today])
                    .map(clase => clase.materia)
                    .join(' · ')

                : 'No hay clases registradas'
              }

            </p>

          </div>

        </div>

      )}

      {/* Horario */}

      <Card className="overflow-hidden">

        {/* Encabezado */}

        <div
          className="grid text-[11px] font-black uppercase tracking-wider"
          style={{
            gridTemplateColumns: '70px repeat(5,1fr)',
            background: '#152938',
            color: 'rgba(255,255,255,.55)',
            borderBottom: '1px solid rgba(255,255,255,.08)'
          }}
        >

          <div className="flex items-center justify-center py-3">

            <IconClock
              size={13}
              style={{
                color: 'rgba(255,255,255,.4)'
              }}
            />

          </div>

          {DIAS.map(dia => (

            <div
              key={dia}
              className="py-3 text-center"
              style={{
                color:
                  dia === today
                    ? '#CEEEC3'
                    : undefined
              }}
            >
              {dia}
            </div>

          ))}

        </div>

        {/* Filas */}

        <div>

          {HORAS.map(hora => (

            <div
              key={hora}
              className="grid border-b"
              style={{
                gridTemplateColumns: '70px repeat(5,1fr)',
                borderColor: '#EBF0F5'
              }}
            >

              <div
                className="flex items-center justify-center text-[11px] font-bold py-3 border-r"
                style={{
                  color: '#8FA0AF',
                  borderColor: '#EBF0F5',
                  background: '#F4F7FA'
                }}
              >
                {hora}
              </div>

              {DIAS.map(dia => {

                const clase = horario[dia]?.[hora]

                return (

                  <div
                    key={dia}
                    className={`
                      py-3 px-2
                      text-center
                      text-[12px]
                      font-semibold
                      border-r
                      transition-opacity
                      ${claseMateria(clase?.materia)}
                    `}
                    style={{
                      borderColor: '#EBF0F5'
                    }}
                  >

                    {clase ? (

                      <>
                        <div>
                          {clase.materia}
                        </div>

                        <div
                          className="text-[10px] mt-1 opacity-60"
                        >
                          {clase.aula}
                        </div>
                      </>

                    ) : (

                      <span
                        style={{
                          color: '#C0CAC2'
                        }}
                      >
                        —
                      </span>

                    )}

                  </div>

                )

              })}

            </div>

          ))}

        </div>

      </Card>

    </div>
  )
}