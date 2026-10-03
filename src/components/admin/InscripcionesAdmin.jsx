import { useEffect, useMemo, useState } from 'react'
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
  BtnPrimary,
} from '../UI'

export default function InscripcionesAdmin() {
  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [inscripciones, setInscripciones] = useState([])

  const [alumnoId, setAlumnoId] = useState('')
  const [grupoId, setGrupoId] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        alumnosResponse,
        gruposResponse,
        inscripcionesResponse,
      ] = await Promise.all([
        supabase
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
            )
          `)
          .order('id'),

        supabase
          .from('grupos')
          .select(`
            id,
            nombre,
            ciclo_escolar,
            semestre,
            turno,

            grupo_materias (
              id,

              materias (
                nombre
              )
            )
          `)
          .order('nombre'),

        supabase
          .from('inscripciones')
          .select(`
            id,
            alumno_id,
            grupo_id,

            alumnos (
              id,
              matricula,
              semestre,
              turno,

              perfiles (
                nombre,
                apellido
              )
            ),

            grupos (
              id,
              nombre,
              ciclo_escolar,
              semestre,
              turno,

              grupo_materias (
                id,

                materias (
                  nombre
                )
              )
            )
          `)
          .order('id'),
      ])

      if (alumnosResponse.error) {
        throw alumnosResponse.error
      }

      if (gruposResponse.error) {
        throw gruposResponse.error
      }

      if (inscripcionesResponse.error) {
        throw inscripcionesResponse.error
      }

      setAlumnos(alumnosResponse.data || [])
      setGrupos(gruposResponse.data || [])
      setInscripciones(inscripcionesResponse.data || [])
    } catch (err) {
      console.error(
        'Error cargando inscripciones:',
        err
      )

      setError(
        'No se pudieron cargar las inscripciones.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==================================================
  // ALUMNO SELECCIONADO
  // ==================================================

  const alumnoSeleccionado = useMemo(() => {
    if (!alumnoId) return null

    return alumnos.find(
      alumno =>
        String(alumno.id) === String(alumnoId)
    )
  }, [alumnoId, alumnos])

  // ==================================================
  // GRUPOS COMPATIBLES
  // ==================================================
  //
  // Si conocemos el semestre del alumno:
  // únicamente mostramos grupos de ese semestre.
  //
  // Si conocemos también el turno:
  // mostramos grupos del mismo turno.
  //
  // Si un grupo todavía tiene turno NULL,
  // lo dejamos disponible temporalmente.
  // ==================================================

  const gruposDisponibles = useMemo(() => {
    if (!alumnoSeleccionado) {
      return grupos
    }

    return grupos.filter(grupo => {
      const mismoSemestre =
        grupo.semestre == null ||
        alumnoSeleccionado.semestre == null ||
        Number(grupo.semestre) ===
          Number(alumnoSeleccionado.semestre)

      const mismoTurno =
        !grupo.turno ||
        !alumnoSeleccionado.turno ||
        grupo.turno.toLowerCase() ===
          alumnoSeleccionado.turno.toLowerCase()

      return mismoSemestre && mismoTurno
    })
  }, [grupos, alumnoSeleccionado])

  // ==================================================
  // INSCRIPCIONES EXISTENTES
  // ==================================================

  const inscripcionesExistentes = useMemo(() => {
    return new Set(
      inscripciones.map(
        inscripcion =>
          `${inscripcion.alumno_id}-${inscripcion.grupo_id}`
      )
    )
  }, [inscripciones])

  // ==================================================
  // REGISTRAR INSCRIPCIÓN
  // ==================================================

  const registrarInscripcion = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    if (!alumnoId || !grupoId) {
      setError(
        'Selecciona un alumno y un grupo.'
      )
      return
    }

    const llave =
      `${alumnoId}-${grupoId}`

    if (
      inscripcionesExistentes.has(llave)
    ) {
      setError(
        'El alumno ya está inscrito en este grupo.'
      )
      return
    }

    setSaving(true)

    try {
      const { error: insertError } =
        await supabase
          .from('inscripciones')
          .insert({
            alumno_id: Number(alumnoId),
            grupo_id: Number(grupoId),
          })

      if (insertError) {
        throw insertError
      }

      setMensaje(
        'Inscripción registrada correctamente.'
      )

      setAlumnoId('')
      setGrupoId('')

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error registrando inscripción:',
        err
      )

      if (err?.code === '23505') {
        setError(
          'El alumno ya está inscrito en este grupo.'
        )
      } else {
        setError(
          'No se pudo registrar la inscripción.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // ELIMINAR INSCRIPCIÓN
  // ==================================================

  const eliminarInscripcion = async id => {
    const confirmar = window.confirm(
      '¿Deseas eliminar esta inscripción?'
    )

    if (!confirmar) return

    setError('')
    setMensaje('')

    try {
      const { error: deleteError } =
        await supabase
          .from('inscripciones')
          .delete()
          .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setMensaje(
        'Inscripción eliminada correctamente.'
      )

      await cargarDatos()
    } catch (err) {
      console.error(
        'Error eliminando inscripción:',
        err
      )

      setError(
        'No se pudo eliminar la inscripción.'
      )
    }
  }

  // ==================================================
  // HELPERS
  // ==================================================

  const obtenerPerfil = alumno => {
    if (!alumno) return null

    return Array.isArray(alumno.perfiles)
      ? alumno.perfiles[0]
      : alumno.perfiles
  }

  const obtenerMaterias = grupo => {
    if (!grupo?.grupo_materias) {
      return []
    }

    return grupo.grupo_materias
      .map(asignacion => {
        const materia = Array.isArray(
          asignacion.materias
        )
          ? asignacion.materias[0]
          : asignacion.materias

        return materia?.nombre
      })
      .filter(Boolean)
  }

  const formatearTurno = turno => {
    if (!turno) return 'Sin turno'

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
        Cargando inscripciones...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inscripciones"
        subtitle="Asigna alumnos a sus grupos académicos"
        action={
          <Pill variant="blue">
            {inscripciones.length}{' '}
            inscripciones
          </Pill>
        }
      />

      {/* MENSAJE */}
      {mensaje && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#dcfce7',
            border:
              '1px solid #86efac',
            color: '#166534',
          }}
        >
          {mensaje}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border:
              '1px solid #fca5a5',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================
          NUEVA INSCRIPCIÓN
      ================================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Nueva inscripción
            </CardTitle>

            <CardSubtitle>
              Asigna un alumno a un grupo escolar
            </CardSubtitle>
          </div>
        </CardHeader>

        <form
          onSubmit={registrarInscripcion}
          className="p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ALUMNO */}
            <div>
              <label
                className="block text-[11px] font-black uppercase tracking-wider mb-2"
                style={{
                  color: '#8FA0AF',
                }}
              >
                Alumno
              </label>

              <select
                value={alumnoId}
                onChange={e => {
                  setAlumnoId(
                    e.target.value
                  )

                  // Al cambiar de alumno,
                  // limpiamos grupo seleccionado.
                  setGrupoId('')
                }}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{
                  border:
                    '1px solid #DDE4ED',
                  background:
                    '#FFFFFF',
                  color:
                    '#0F1E2B',
                }}
              >
                <option value="">
                  Selecciona un alumno
                </option>

                {alumnos.map(alumno => {
                  const perfil =
                    obtenerPerfil(alumno)

                  const nombre = perfil
                    ? `${perfil.nombre} ${perfil.apellido}`
                    : 'Sin nombre'

                  return (
                    <option
                      key={alumno.id}
                      value={alumno.id}
                    >
                      {alumno.matricula}
                      {' · '}
                      {nombre}
                      {' · '}
                      Sem. {alumno.semestre}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* GRUPO */}
            <div>
              <label
                className="block text-[11px] font-black uppercase tracking-wider mb-2"
                style={{
                  color: '#8FA0AF',
                }}
              >
                Grupo
              </label>

              <select
                value={grupoId}
                onChange={e =>
                  setGrupoId(
                    e.target.value
                  )
                }
                disabled={!alumnoId}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm disabled:opacity-50"
                style={{
                  border:
                    '1px solid #DDE4ED',
                  background:
                    '#FFFFFF',
                  color:
                    '#0F1E2B',
                }}
              >
                <option value="">
                  {alumnoId
                    ? 'Selecciona un grupo'
                    : 'Primero selecciona un alumno'}
                </option>

                {gruposDisponibles.map(
                  grupo => {
                    const materias =
                      obtenerMaterias(grupo)

                    return (
                      <option
                        key={grupo.id}
                        value={grupo.id}
                      >
                        {grupo.nombre}
                        {' · '}
                        Sem.{' '}
                        {grupo.semestre ??
                          '—'}
                        {' · '}
                        {formatearTurno(
                          grupo.turno
                        )}
                        {' · '}
                        {grupo.ciclo_escolar ||
                          'Sin ciclo'}
                      </option>
                    )
                  }
                )}
              </select>
            </div>
          </div>

          {/* DATOS DEL ALUMNO */}
          {alumnoSeleccionado && (
            <div
              className="mt-4 px-4 py-3 rounded-xl text-xs"
              style={{
                background:
                  '#F4F7FA',
                border:
                  '1px solid #DDE4ED',
                color:
                  '#506070',
              }}
            >
              Semestre del alumno:{' '}
              <strong>
                {alumnoSeleccionado.semestre ??
                  '—'}
              </strong>
              {' · '}
              Turno:{' '}
              <strong>
                {formatearTurno(
                  alumnoSeleccionado.turno
                )}
              </strong>
              {' · '}
              Grupos compatibles:{' '}
              <strong>
                {gruposDisponibles.length}
              </strong>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <BtnPrimary
              type="submit"
              disabled={
                saving ||
                !alumnoId ||
                !grupoId
              }
            >
              {saving
                ? 'Inscribiendo...'
                : 'Registrar inscripción'}
            </BtnPrimary>
          </div>
        </form>
      </Card>

      {/* ==================================================
          INSCRIPCIONES ACTUALES
      ================================================== */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Inscripciones actuales
            </CardTitle>

            <CardSubtitle>
              Cada alumno aparece una vez por grupo,
              independientemente de las materias
            </CardSubtitle>
          </div>

          <Pill variant="mint">
            {inscripciones.length}
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Alumno',
            'Matrícula',
            'Grupo',
            'Semestre',
            'Turno',
            'Materias',
            'Ciclo',
            'Acción',
          ]}
          rows={
            <>
              {inscripciones.map(
                (
                  inscripcion,
                  index
                ) => {
                  const alumno =
                    Array.isArray(
                      inscripcion.alumnos
                    )
                      ? inscripcion
                          .alumnos[0]
                      : inscripcion.alumnos

                  const perfil =
                    obtenerPerfil(alumno)

                  const grupo =
                    Array.isArray(
                      inscripcion.grupos
                    )
                      ? inscripcion
                          .grupos[0]
                      : inscripcion.grupos

                  const materias =
                    obtenerMaterias(grupo)

                  const nombreAlumno =
                    perfil
                      ? `${perfil.nombre} ${perfil.apellido}`
                      : 'Sin nombre'

                  return (
                    <TR
                      key={
                        inscripcion.id
                      }
                    >
                      <TD
                        style={{
                          color:
                            '#8FA0AF',
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </TD>

                      <TD className="font-semibold">
                        {nombreAlumno}
                      </TD>

                      <TD>
                        {alumno?.matricula ||
                          '—'}
                      </TD>

                      <TD>
                        <Pill variant="blue">
                          {grupo?.nombre ||
                            '—'}
                        </Pill>
                      </TD>

                      <TD>
                        {grupo?.semestre ??
                          '—'}
                      </TD>

                      <TD>
                        {formatearTurno(
                          grupo?.turno
                        )}
                      </TD>

                      <TD>
                        {materias.length >
                        0
                          ? `${materias.length} materias`
                          : 'Sin materias'}
                      </TD>

                      <TD>
                        {grupo?.ciclo_escolar ||
                          '—'}
                      </TD>

                      <TD>
                        <button
                          type="button"
                          onClick={() =>
                            eliminarInscripcion(
                              inscripcion.id
                            )
                          }
                          className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                          style={{
                            background:
                              '#fee2e2',
                            color:
                              '#991b1b',
                            border:
                              '1px solid #fecaca',
                          }}
                        >
                          Eliminar
                        </button>
                      </TD>
                    </TR>
                  )
                }
              )}

              {inscripciones.length ===
                0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    No hay inscripciones registradas.
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