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
                ciclo_escolar
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
        'No se pudieron cargar las matrículas.'
      )
    } finally {
      setLoading(false)
    }
  }

  const obtenerPerfil = alumno => {
    if (!alumno?.perfiles) return null

    return Array.isArray(alumno.perfiles)
      ? alumno.perfiles[0]
      : alumno.perfiles
  }

  const obtenerGrupoActual = alumno => {
    const inscripciones =
      alumno?.inscripciones || []

    if (inscripciones.length === 0) {
      return null
    }

    const inscripcion =
      inscripciones[0]

    return Array.isArray(inscripcion.grupos)
      ? inscripcion.grupos[0]
      : inscripcion.grupos
  }

  const formatearTurno = turno => {
    if (!turno) return '—'

    return (
      turno.charAt(0).toUpperCase() +
      turno.slice(1)
    )
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#506070' }}
      >
        Cargando matrículas...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrículas"
        subtitle="Consulta las matrículas asignadas a los alumnos"
        action={
          <Pill variant="blue">
            {alumnos.length} matrículas
          </Pill>
        }
      />

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
            'Turno',
            'Ciclo',
          ]}
          rows={
            <>
              {alumnos.map((alumno, index) => {
                const perfil =
                  obtenerPerfil(alumno)

                const grupoActual =
                  obtenerGrupoActual(alumno)

                const nombreCompleto = perfil
                  ? `${perfil.nombre} ${perfil.apellido}`
                  : 'Sin nombre'

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
                  'Sin inscripción'

                return (
                  <TR key={alumno.id}>
                    <TD
                      style={{
                        color: '#8FA0AF',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </TD>

                    <TD>
                      <span
                        className="font-bold tabular-nums"
                        style={{
                          color: '#203A50',
                        }}
                      >
                        {alumno.matricula || '—'}
                      </span>
                    </TD>

                    <TD className="font-semibold">
                      {nombreCompleto}
                    </TD>

                    <TD>
                      {semestre}
                    </TD>

                    <TD>
                      <Pill variant="default">
                        {grupo}
                      </Pill>
                    </TD>

                    <TD>
                      {formatearTurno(turno)}
                    </TD>

                    <TD>
                      {grupoActual ? (
                        <Pill variant="blue">
                          {ciclo}
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
              })}

              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
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