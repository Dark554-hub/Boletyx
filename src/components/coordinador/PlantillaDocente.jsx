import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  DataTable,
  Pill,
  TR,
  TD,
} from '../UI'

export default function PlantillaDocente() {
  const [docentes, setDocentes] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    cargarDocentes()
  }, [])

  // ==================================================
  // CARGAR DOCENTES
  // ==================================================

  const cargarDocentes = async () => {
    setLoading(true)
    setError('')

    try {
      const {
        data,
        error: queryError,
      } = await supabase
        .from('docentes')
        .select(`
          id,
          numero_empleado,
          especialidad,

          perfiles (
            nombre,
            apellido
          ),

          grupo_materias (
            id,

            materias (
              id,
              nombre
            ),

            grupos (
              id,
              nombre,
              semestre,
              turno,
              ciclo_escolar
            )
          )
        `)
        .order('id')

      if (queryError) {
        throw queryError
      }

      setDocentes(data || [])
    } catch (err) {
      console.error(
        'Error cargando plantilla docente:',
        err
      )

      setError(
        err?.message ||
          'No se pudo cargar la plantilla docente.'
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

  const obtenerNombreDocente = docente => {
    const perfil =
      obtenerRelacion(
        docente.perfiles
      )

    if (!perfil) {
      return 'Docente sin nombre'
    }

    return `${perfil.nombre} ${perfil.apellido}`
  }

  const obtenerGrupos = docente => {
    const nombres = new Set()

    ;(
      docente.grupo_materias ||
      []
    ).forEach(asignacion => {
      const grupo =
        obtenerRelacion(
          asignacion.grupos
        )

      if (grupo?.nombre) {
        nombres.add(
          grupo.nombre
        )
      }
    })

    return Array.from(nombres)
  }

  const obtenerMaterias = docente => {
    const nombres = new Set()

    ;(
      docente.grupo_materias ||
      []
    ).forEach(asignacion => {
      const materia =
        obtenerRelacion(
          asignacion.materias
        )

      if (materia?.nombre) {
        nombres.add(
          materia.nombre
        )
      }
    })

    return Array.from(nombres)
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando plantilla docente...
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Plantilla Docente"
        subtitle="Supervisión de profesores, materias y grupos asignados"
        action={
          <Pill variant="blue">
            {docentes.length}{' '}
            docentes
          </Pill>
        }
      />

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border:
              '1px solid #fecaca',
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
              Docentes registrados
            </CardTitle>

            <CardSubtitle>
              Datos obtenidos directamente desde Supabase
            </CardSubtitle>
          </div>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Docente',
            'N.º empleado',
            'Especialidad',
            'Materias',
            'Grupos asignados',
            'Estado',
          ]}
          rows={
            <>
              {docentes.map(
                (
                  docente,
                  index
                ) => {
                  const grupos =
                    obtenerGrupos(
                      docente
                    )

                  const materias =
                    obtenerMaterias(
                      docente
                    )

                  return (
                    <TR
                      key={
                        docente.id
                      }
                    >
                      <TD>
                        {index + 1}
                      </TD>

                      <TD className="font-semibold">
                        {obtenerNombreDocente(
                          docente
                        )}
                      </TD>

                      <TD>
                        {docente.numero_empleado ||
                          '—'}
                      </TD>

                      <TD>
                        {docente.especialidad ||
                          '—'}
                      </TD>

                      <TD>
                        {materias.length >
                        0 ? (
                          <div className="flex flex-wrap gap-1">
                            {materias.map(
                              materia => (
                                <Pill
                                  key={
                                    materia
                                  }
                                  variant="blue"
                                >
                                  {
                                    materia
                                  }
                                </Pill>
                              )
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              color:
                                '#8FA0AF',
                            }}
                          >
                            Sin materias
                          </span>
                        )}
                      </TD>

                      <TD>
                        {grupos.length >
                        0 ? (
                          <div className="flex flex-wrap gap-1">
                            {grupos.map(
                              grupo => (
                                <Pill
                                  key={
                                    grupo
                                  }
                                  variant="default"
                                >
                                  {
                                    grupo
                                  }
                                </Pill>
                              )
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              color:
                                '#8FA0AF',
                            }}
                          >
                            Sin grupos
                          </span>
                        )}
                      </TD>

                      <TD>
                        <Pill variant="success">
                          Activo
                        </Pill>
                      </TD>
                    </TR>
                  )
                }
              )}

              {docentes.length ===
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
                    No hay docentes registrados.
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