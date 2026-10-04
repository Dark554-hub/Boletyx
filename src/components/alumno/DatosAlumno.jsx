import { useEffect, useMemo, useState } from 'react'



import { supabase } from '../../lib/supabase'



import {

  StatCard,

  ProfileHero,

  InfoGrid,

  Card,

  CardHeader,

  CardTitle,

} from '../UI'



import {

  IconGrade,

  IconStar,

  IconAlert,

  IconCheck,

} from '../Icons'






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

export default function DatosAlumno({ user }) {

  const [materias, setMaterias] = useState([])

  const [grupo, setGrupo] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')





  // ==================================================

  // CARGAR DATOS ACADÉMICOS

  // ==================================================



  useEffect(() => {

    if (!user?.alumno_id) {

      setMaterias([])

      setGrupo(null)

      setLoading(false)

      setError('No se encontró la información del alumno.')

      return

    }



    cargarDatosAcademicos()

  }, [user?.alumno_id])





  async function cargarDatosAcademicos() {

    try {

      setLoading(true)

      setError('')



      // ================================================

      // 1. OBTENER INSCRIPCIÓN Y GRUPO REAL

      // ================================================



      const {

        data: inscripciones,

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

            ciclo_escolar,

            area_id,

            areas (

              id,

              nombre

            )

          )

        `)

        .eq('alumno_id', Number(user.alumno_id))

        





      const inscripcion =
        seleccionarInscripcionActual(
          inscripciones,
          user?.semestre
        )

      if (inscripcionError) {

        throw inscripcionError

      }





      if (!inscripcion) {

        setMaterias([])

        setGrupo(null)



        setError(

          'El alumno todavía no tiene un grupo asignado.'

        )



        return

      }





      setGrupo(inscripcion.grupos || null)





      // ================================================

      // 2. OBTENER CALIFICACIONES REALES

      // ================================================



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

            grupo_id,

            materia_id,

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





      // ================================================

      // 3. NORMALIZAR DATOS

      // ================================================



      const materiasNormalizadas = (calificaciones || [])

        .filter(calificacion => {

          /*

            Nos aseguramos de mostrar únicamente

            calificaciones pertenecientes al grupo

            actual del alumno.

          */



          const grupoMateria =

            calificacion.grupo_materias



          if (!grupoMateria) {

            return false

          }



          return (

            Number(grupoMateria.grupo_id) ===

            Number(inscripcion.grupo_id)

          )

        })

        .map(calificacion => ({

          id: calificacion.id,



          grupo_materia_id:

            calificacion.grupo_materia_id,



          materia_id:

            calificacion.grupo_materias?.materia_id,



          nombre:

            calificacion.grupo_materias?.materias?.nombre ||

            'Materia',



          parcial_1:

            calificacion.parcial_1,



          parcial_2:

            calificacion.parcial_2,



          parcial_3:

            calificacion.parcial_3,



          promedio:

            calificacion.promedio,

        }))





      setMaterias(materiasNormalizadas)



    } catch (err) {

      console.error(

        'Error cargando datos académicos:',

        err

      )



      setMaterias([])

      setGrupo(null)



      setError(

        err?.message ||

        'No se pudieron cargar los datos académicos.'

      )



    } finally {

      setLoading(false)

    }

  }





  // ==================================================

  // PROMEDIOS VÁLIDOS

  // ==================================================



  const promediosValidos = useMemo(() => {

    return materias

      .map(materia => Number(materia.promedio))

      .filter(promedio => Number.isFinite(promedio))

  }, [materias])





  // ==================================================

  // PROMEDIO GENERAL

  // ==================================================



  const promedio = useMemo(() => {

    if (promediosValidos.length === 0) {

      return '—'

    }



    const suma = promediosValidos.reduce(

      (total, promedioMateria) =>

        total + promedioMateria,

      0

    )



    return (

      suma / promediosValidos.length

    ).toFixed(1)



  }, [promediosValidos])





  // ==================================================

  // EXCELENCIA

  // ==================================================



  const enExcelencia = useMemo(() => {

    return promediosValidos.filter(

      promedioMateria =>

        promedioMateria >= 9

    ).length

  }, [promediosValidos])





  // ==================================================

  // EN RIESGO

  // ==================================================



  const enRiesgo = useMemo(() => {

    return promediosValidos.filter(

      promedioMateria =>

        promedioMateria < 7

    ).length

  }, [promediosValidos])





  // ==================================================

  // DATOS VISUALES DEL GRUPO

  // ==================================================



  const grupoNombre =

    grupo?.nombre ||

    user?.grupo ||

    'Sin grupo'





  const turno =

    grupo?.turno ||

    user?.turno ||

    'Sin turno'





  const semestre =

    grupo?.semestre ??

    user?.semestre ??

    '—'





  const cicloEscolar =

    grupo?.ciclo_escolar ||

    '2026–2027'





  // ==================================================

  // RENDER

  // ==================================================



  return (

    <div className="space-y-5">



      {/* ============================================

          HERO

      ============================================= */}



      <ProfileHero

        avatar={user.avatar}

        name={user.nombre}

        sub={`${grupoNombre} · ${turno} · ${semestre}`}

        tag={`Matrícula: ${user.matricula}`}

        right={

          <div className="text-right">



            <div className="text-4xl font-black text-white leading-none">

              {loading ? '...' : promedio}

            </div>



            <div

              className="text-[11px] mt-1"

              style={{

                color: 'rgba(255,255,255,.5)',

              }}

            >

              Promedio

            </div>



          </div>

        }

      />





      {/* ============================================

          ERROR

      ============================================= */}



      {error && (

        <div

          style={{

            padding: '12px 16px',

            borderRadius: 10,

            border: '1px solid #fecaca',

            background: '#fee2e2',

            color: '#991b1b',

            fontSize: 13,

          }}

        >

          {error}

        </div>

      )}





      {/* ============================================

          ESTADÍSTICAS

      ============================================= */}



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

          label="Materias"

          value={

            loading

              ? '...'

              : materias.length

          }

        />





        <StatCard

          icon={

            <IconStar

              size={22}

              style={{

                color: '#16a34a',

              }}

            />

          }

          label="Excelencia"

          value={

            loading

              ? '...'

              : enExcelencia

          }

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

          value={

            loading

              ? '...'

              : enRiesgo

          }

          valueColor="#dc2626"

        />





        <StatCard

          icon={

            <IconCheck

              size={22}

              style={{

                color: '#3b82f6',

              }}

            />

          }

          label="Semestre"

          value={semestre}

        />



      </div>





      {/* ============================================

          INFORMACIÓN PERSONAL

      ============================================= */}



      <Card>



        <CardHeader>



          <div>



            <CardTitle>

              Información Personal

            </CardTitle>



            <p

              className="text-[12px] mt-0.5"

              style={{

                color: '#8FA0AF',

              }}

            >

              Datos registrados en el sistema

            </p>



          </div>



        </CardHeader>





        <div className="p-6">



          <InfoGrid

            fields={[

              {

                label: 'Nombre completo',

                value:

                  user.nombre ||

                  '—',

              },



              {

                label: 'Matrícula',

                value:

                  user.matricula ||

                  '—',

              },



              {

                label: 'Correo institucional',

                value:

                  user.email ||

                  '—',

              },



              {

                label: 'Grupo',

                value:

                  loading

                    ? 'Cargando...'

                    : grupoNombre,

              },



              {

                label: 'Turno',

                value:

                  loading

                    ? 'Cargando...'

                    : turno,

              },



              {

                label: 'Semestre',

                value:

                  semestre,

              },



              {

                label: 'Ciclo escolar',

                value:

                  cicloEscolar,

              },



              {

                label: 'Plantel',

                value:

                  'Preparatoria Boletyx',

              },

            ]}

          />



        </div>



      </Card>



    </div>

  )

}