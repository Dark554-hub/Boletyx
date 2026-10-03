import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  DataTable,
  TR,
  TD,
  PageHeader,
  Pill,
} from '../UI'


export default function MatriculasAdmin() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    cargarMatriculas()
  }, [])


  // ==================================================
  // CARGAR MATRÍCULAS
  // ==================================================

  const cargarMatriculas = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error: queryError } =
        await supabase
          .from('alumnos')
          .select(`
            id,
            matricula,
            semestre,
            grupo,
            turno,
            area_id,

            areas (
              id,
              nombre
            ),

            perfiles (
              nombre,
              apellido
            ),

            inscripciones (
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
            )
          `)
          .order('matricula')


      if (queryError) {
        throw queryError
      }


      setAlumnos(data || [])

    } catch (err) {
      console.error(
        'Error cargando matrículas:',
        err
      )

      setError(
        err?.message ||
        'No se pudieron cargar las matrículas.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ==================================================
  // HELPERS
  // ==================================================

  const obtenerRelacion = relacion => {
    if (!relacion) return null

    return Array.isArray(relacion)
      ? relacion[0]
      : relacion
  }


  const obtenerPerfil = alumno => {
    if (!alumno) return null

    return obtenerRelacion(
      alumno.perfiles
    )
  }


  const obtenerAreaAlumno = alumno => {
    if (!alumno) return null

    return obtenerRelacion(
      alumno.areas
    )
  }


  const obtenerGrupoActual = alumno => {
    const inscripciones =
      alumno?.inscripciones || []


    if (inscripciones.length === 0) {
      return null
    }


    const inscripcion =
      inscripciones[0]


    return obtenerRelacion(
      inscripcion.grupos
    )
  }


  const obtenerAreaGrupo = grupo => {
    if (!grupo) return null

    return obtenerRelacion(
      grupo.areas
    )
  }


  const formatearTurno = turno => {
    if (!turno) return '—'


    return (
      turno.charAt(0).toUpperCase() +
      turno.slice(1)
    )
  }


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
        Cargando matrículas...
      </div>
    )
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Matrículas"
        subtitle="Consulta las matrículas asignadas a los alumnos"
        action={
          <Pill variant="blue">
            {alumnos.length}{' '}
            {alumnos.length === 1
              ? 'matrícula'
              : 'matrículas'}
          </Pill>
        }
      />


      {/* ERROR */}

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}


      {/* TABLA */}

      <Card>

        <CardHeader>

          <div>

            <CardTitle>
              Matrículas asignadas
            </CardTitle>

            <CardSubtitle>
              Relación de alumnos y su información escolar actual
            </CardSubtitle>

          </div>


          <Pill variant="mint">
            {alumnos.length}
          </Pill>

        </CardHeader>


        <DataTable
          headers={[
            '#',
            'Matrícula',
            'Alumno',
            'Semestre',
            'Grupo',
            'Área',
            'Turno',
            'Ciclo',
          ]}
          rows={
            <>

              {alumnos.map(
                (alumno, index) => {

                  const perfil =
                    obtenerPerfil(alumno)


                  const grupoActual =
                    obtenerGrupoActual(alumno)


                  /*
                   * Si existe inscripción,
                   * usamos el área del grupo.
                   *
                   * Si todavía no existe inscripción,
                   * mostramos el área asignada
                   * directamente al alumno.
                   */
                  const areaAlumno =
                    obtenerAreaAlumno(alumno)


                  const areaGrupo =
                    obtenerAreaGrupo(
                      grupoActual
                    )


                  const area =
                    areaGrupo?.nombre ??
                    areaAlumno?.nombre ??
                    '—'


                  const nombreCompleto =
                    perfil
                      ? `${perfil.nombre} ${perfil.apellido}`
                      : 'Sin nombre'


                  /*
                   * La inscripción es la fuente
                   * principal para grupo, semestre
                   * y turno.
                   *
                   * Si aún no está inscrito,
                   * usamos los datos del alumno.
                   */
                  const semestre =
                    grupoActual?.semestre ??
                    alumno.semestre ??
                    '—'


                  const grupo =
                    grupoActual?.nombre ??
                    alumno.grupo ??
                    '—'


                  const turno =
                    grupoActual?.turno ??
                    alumno.turno


                  const ciclo =
                    grupoActual?.ciclo_escolar ??
                    null


                  return (
                    <TR key={alumno.id}>

                      {/* # */}

                      <TD
                        style={{
                          color: '#8FA0AF',
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </TD>


                      {/* MATRÍCULA */}

                      <TD>

                        <span
                          className="font-bold tabular-nums"
                          style={{
                            color: '#203A50',
                          }}
                        >
                          {alumno.matricula ||
                            '—'}
                        </span>

                      </TD>


                      {/* ALUMNO */}

                      <TD className="font-semibold">
                        {nombreCompleto}
                      </TD>


                      {/* SEMESTRE */}

                      <TD>
                        {semestre}
                      </TD>


                      {/* GRUPO */}

                      <TD>

                        {grupoActual ? (
                          <Pill variant="default">
                            {grupo}
                          </Pill>
                        ) : (
                          <span
                            style={{
                              color: '#8FA0AF',
                            }}
                          >
                            Sin grupo
                          </span>
                        )}

                      </TD>


                      {/* ÁREA */}

                      <TD>

                        {area !== '—' ? (
                          <span
                            className="font-medium"
                            style={{
                              color: '#203A50',
                            }}
                          >
                            {area}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#8FA0AF',
                            }}
                          >
                            Sin área
                          </span>
                        )}

                      </TD>


                      {/* TURNO */}

                      <TD>
                        {formatearTurno(
                          turno
                        )}
                      </TD>


                      {/* CICLO */}

                      <TD>

                        {grupoActual ? (
                          <Pill variant="blue">
                            {ciclo ||
                              'Sin ciclo'}
                          </Pill>
                        ) : (
                          <span
                            style={{
                              color: '#8FA0AF',
                            }}
                          >
                            Sin inscripción
                          </span>
                        )}

                      </TD>

                    </TR>
                  )
                }
              )}


              {/* SIN ALUMNOS */}

              {alumnos.length === 0 && (
                <tr>

                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color: '#8FA0AF',
                    }}
                  >
                    No hay matrículas registradas.
                  </td>

                </tr>
              )}

            </>
          }
        />

      </Card>

    </div>
  )
}