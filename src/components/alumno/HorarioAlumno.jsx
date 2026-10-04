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






function seleccionarInscripcionActual(inscripciones, semestreActual) {
  const lista = (inscripciones || []).filter(
    inscripcion => inscripcion?.grupos
  )

  if (lista.length === 0) {
    return null
  }

  const semestre = Number(semestreActual)

  const candidatas = Number.isFinite(semestre)
    ? lista.filter(
        inscripcion =>
          Number(inscripcion.grupos?.semestre) === semestre
      )
    : lista

  const base =
    candidatas.length > 0
      ? candidatas
      : lista

  return [...base].sort((a, b) => {
    const cicloA = String(a.grupos?.ciclo_escolar || '')
    const cicloB = String(b.grupos?.ciclo_escolar || '')

    const comparacionCiclo =
      cicloB.localeCompare(cicloA, 'es', { numeric: true })

    if (comparacionCiclo !== 0) {
      return comparacionCiclo
    }

    return Number(b.id || 0) - Number(a.id || 0)
  })[0]
}

export default function HorarioAlumno({ user }) {

  const [grupo, setGrupo] = useState(null)

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

  }, [user?.alumno_id])





  async function cargarHorario() {

    if (!user?.alumno_id) {

      setError('No se encontró la información del alumno.')

      setLoading(false)

      return

    }



    try {

      setLoading(true)

      setError('')





      /*

       * 1. Buscar la inscripción real del alumno.

       *

       * alumno

       *   ↓

       * inscripción

       *   ↓

       * grupo

       *

       * Ahora el grupo también incluye area_id

       * y la información del área.

       */

      const { data: inscripciones, error: inscripcionError } =

        await supabase

          .from('inscripciones')

          .select(`

            id,

            grupos (

              id,

              nombre,

              semestre,

              turno,

              ciclo_escolar,

              area_id,

              areas (

                id,

                nombre

              )

            )

          `)

          .eq('alumno_id', user.alumno_id)





      if (inscripcionError) {

        throw inscripcionError

      }





      if (!inscripciones || inscripciones.length === 0) {

        throw new Error(

          'El alumno todavía no tiene un grupo asignado.'

        )

      }





      const inscripcion =
        seleccionarInscripcionActual(
          inscripciones,
          user?.semestre
        )

      const grupoActual =
        inscripcion?.grupos





      if (!grupoActual) {

        throw new Error(

          'No se encontró el grupo de la inscripción.'

        )

      }





      setGrupo(grupoActual)





      /*

       * 2. Obtener las materias asignadas al grupo.

       *

       * grupo

       *   ↓

       * grupo_materias

       *   ↓

       * materias

       *

       * También obtenemos area_id de cada materia.

       */

      const { data: asignaciones, error: asignacionesError } =

        await supabase

          .from('grupo_materias')

          .select(`

            id,

            materia_id,

            materias (

              id,

              nombre,

              area_id

            )

          `)

          .eq('grupo_id', grupoActual.id)





      if (asignacionesError) {

        throw asignacionesError

      }





      /*

       * 3. Filtrar únicamente las materias que

       * pertenecen al área actual del grupo.

       *

       * Esto evita que relaciones antiguas de

       * Tronco Común entren al horario.

       */

      const asignacionesValidas =

        (asignaciones || []).filter(asignacion => {

          if (!asignacion.materias) {

            return false

          }



          return (

            Number(asignacion.materias.area_id) ===

            Number(grupoActual.area_id)

          )

        })





      if (asignacionesValidas.length === 0) {

        setHorario({})

        return

      }





      /*

       * 4. Buscar únicamente horarios relacionados

       * con las asignaciones correctas del grupo.

       */

      const idsAsignaciones =

        asignacionesValidas.map(asignacion => asignacion.id)





      const { data: horarioData, error: horarioError } =

        await supabase

          .from('horarios')

          .select(`

            id,

            grupo_materia_id,

            dia,

            hora_inicio,

            hora_fin,

            aula

          `)

          .in('grupo_materia_id', idsAsignaciones)

          .order('hora_inicio', { ascending: true })





      if (horarioError) {

        throw horarioError

      }





      /*

       * 5. Relacionar grupo_materia_id con

       * el nombre de la materia.

       */

      const materiasPorAsignacion = {}





      asignacionesValidas.forEach(asignacion => {

        materiasPorAsignacion[asignacion.id] =

          asignacion.materias?.nombre || 'Sin materia'

      })





      /*

       * 6. Crear la estructura utilizada

       * por la tabla visual.

       */

      const horarioOrganizado = {}





      DIAS.forEach(dia => {

        horarioOrganizado[dia] = {}

      })





      ;(horarioData || []).forEach(clase => {

        if (!DIAS.includes(clase.dia)) {

          return

        }





        const hora = clase.hora_inicio?.slice(0, 5)





        if (!hora) {

          return

        }





        horarioOrganizado[clase.dia][hora] = {

          materia:

            materiasPorAsignacion[clase.grupo_materia_id] ||

            'Sin materia',



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

        <p

          className="font-semibold"

          style={{ color: '#B42318' }}

        >

          {error}

        </p>

      </div>

    )

  }





  const HORAS =

    grupo?.turno?.toLowerCase() === 'vespertino'

      ? HORAS_VESPERTINO

      : HORAS_MATUTINO





  const totalClases = Object.values(horario)

    .reduce(

      (total, dia) =>

        total + Object.keys(dia || {}).length,

      0

    )





  return (

    <div className="space-y-5">





      <PageHeader

        title="Horario de Clases"

        subtitle={

          `Semestre ${grupo?.semestre} · Grupo ${grupo?.nombre} · Turno ${grupo?.turno}`

        }

      />





      {/* Área académica */}

      {grupo?.areas?.nombre && (

        <div

          className="px-4 py-3 rounded-2xl border"

          style={{

            background: '#F8FAFC',

            borderColor: '#DDE4ED'

          }}

        >

          <p

            className="text-[11px] font-bold uppercase tracking-wide"

            style={{ color: '#8FA0AF' }}

          >

            Área académica

          </p>



          <p

            className="text-[14px] font-bold mt-1"

            style={{ color: '#203A50' }}

          >

            {grupo.areas.nombre}

          </p>

        </div>

      )}





      {totalClases === 0 && (

        <div

          className="p-4 rounded-2xl border"

          style={{

            background: '#F8FAFC',

            borderColor: '#DDE4ED',

            color: '#506070'

          }}

        >

          No hay un horario registrado para este grupo.

        </div>

      )}





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