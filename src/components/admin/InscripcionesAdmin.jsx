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


  // ==================================================
  // CARGAR DATOS
  // ==================================================

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        alumnosResponse,
        gruposResponse,
        inscripcionesResponse,
      ] = await Promise.all([

        // ----------------------------------------------
        // ALUMNOS
        // ----------------------------------------------

        supabase
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
            )
          `)
          .order('id'),


        // ----------------------------------------------
        // GRUPOS
        // ----------------------------------------------

        supabase
          .from('grupos')
          .select(`
            id,
            nombre,
            ciclo_escolar,
            semestre,
            turno,
            area_id,

            areas (
              id,
              nombre
            ),

            grupo_materias (
              id,

              materias (
                nombre,
                area_id
              )
            )
          `)
          .order('nombre'),


        // ----------------------------------------------
        // INSCRIPCIONES
        // ----------------------------------------------

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
              area_id,

              areas (
                id,
                nombre
              ),

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
              area_id,

              areas (
                id,
                nombre
              ),

              grupo_materias (
                id,

                materias (
                  nombre,
                  area_id
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
        err?.message ||
        'No se pudieron cargar las inscripciones.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ==================================================
  // HELPERS DE RELACIONES
  // ==================================================

  const obtenerRelacion = relacion => {
    if (!relacion) return null

    return Array.isArray(relacion)
      ? relacion[0]
      : relacion
  }


  const obtenerPerfil = alumno => {
    if (!alumno) return null

    return obtenerRelacion(alumno.perfiles)
  }


  const obtenerAreaAlumno = alumno => {
    if (!alumno) return null

    return obtenerRelacion(alumno.areas)
  }


  const obtenerAreaGrupo = grupo => {
    if (!grupo) return null

    return obtenerRelacion(grupo.areas)
  }


  // ==================================================
  // ALUMNO SELECCIONADO
  // ==================================================

  const alumnoSeleccionado = useMemo(() => {
    if (!alumnoId) return null

    return alumnos.find(
      alumno =>
        String(alumno.id) === String(alumnoId)
    ) || null

  }, [alumnoId, alumnos])


  // ==================================================
  // INSCRIPCIÓN ACTUAL DEL ALUMNO
  // ==================================================
  //
  // Regla:
  // cada alumno solamente puede pertenecer a un grupo.
  //
  // Si encontramos una inscripción cuyo alumno_id
  // coincide con el alumno seleccionado, consideramos
  // que ya tiene grupo asignado.
  //
  // ==================================================

  const inscripcionAlumno = useMemo(() => {
    if (!alumnoId) {
      return null
    }

    return (
      inscripciones.find(
        inscripcion =>
          String(inscripcion.alumno_id) ===
          String(alumnoId)
      ) || null
    )

  }, [alumnoId, inscripciones])


  // ==================================================
  // GRUPO SELECCIONADO
  // ==================================================

  const grupoSeleccionado = useMemo(() => {
    if (!grupoId) return null

    return grupos.find(
      grupo =>
        String(grupo.id) === String(grupoId)
    ) || null

  }, [grupoId, grupos])


  // ==================================================
  // GRUPOS COMPATIBLES
  // ==================================================
  //
  // Comprobamos:
  //
  // 1. Que el alumno NO tenga ya una inscripción.
  // 2. Semestre.
  // 3. Turno.
  // 4. Área académica.
  //
  // ==================================================

  const gruposDisponibles = useMemo(() => {
    if (!alumnoSeleccionado) {
      return []
    }


    // Si el alumno ya pertenece a un grupo,
    // no puede seleccionar otro.
    if (inscripcionAlumno) {
      return []
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


      /*
       * A partir de tercer semestre,
       * alumno y grupo deben pertenecer
       * a la misma área académica.
       */
      let mismaArea = true


      if (
        Number(alumnoSeleccionado.semestre) >= 3
      ) {
        mismaArea =
          alumnoSeleccionado.area_id != null &&
          grupo.area_id != null &&
          Number(alumnoSeleccionado.area_id) ===
            Number(grupo.area_id)
      }


      return (
        mismoSemestre &&
        mismoTurno &&
        mismaArea
      )
    })

  }, [
    grupos,
    alumnoSeleccionado,
    inscripcionAlumno,
  ])


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


    if (!alumnoSeleccionado) {
      setError(
        'No se encontró el alumno seleccionado.'
      )

      return
    }


    // ----------------------------------------------
    // VALIDAR QUE NO TENGA YA UN GRUPO
    // ----------------------------------------------

    if (inscripcionAlumno) {
      setError(
        'Este alumno ya tiene un grupo asignado. Elimina su inscripción actual antes de asignarle otro grupo.'
      )

      return
    }


    if (!grupoSeleccionado) {
      setError(
        'No se encontró el grupo seleccionado.'
      )

      return
    }


    // ----------------------------------------------
    // VALIDAR SEMESTRE
    // ----------------------------------------------

    if (
      alumnoSeleccionado.semestre != null &&
      grupoSeleccionado.semestre != null &&
      Number(alumnoSeleccionado.semestre) !==
        Number(grupoSeleccionado.semestre)
    ) {
      setError(
        'El grupo no corresponde al semestre del alumno.'
      )

      return
    }


    // ----------------------------------------------
    // VALIDAR TURNO
    // ----------------------------------------------

    if (
      alumnoSeleccionado.turno &&
      grupoSeleccionado.turno &&
      alumnoSeleccionado.turno.toLowerCase() !==
        grupoSeleccionado.turno.toLowerCase()
    ) {
      setError(
        'El grupo no corresponde al turno del alumno.'
      )

      return
    }


    // ----------------------------------------------
    // VALIDAR ÁREA
    // ----------------------------------------------

    if (
      Number(alumnoSeleccionado.semestre) >= 3
    ) {

      if (!alumnoSeleccionado.area_id) {
        setError(
          'El alumno no tiene un área académica asignada.'
        )

        return
      }


      if (!grupoSeleccionado.area_id) {
        setError(
          'El grupo no tiene un área académica asignada.'
        )

        return
      }


      if (
        Number(alumnoSeleccionado.area_id) !==
        Number(grupoSeleccionado.area_id)
      ) {
        setError(
          'El grupo no corresponde al área académica del alumno.'
        )

        return
      }
    }


    // ----------------------------------------------
    // GUARDAR INSCRIPCIÓN
    // ----------------------------------------------

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
          'Este alumno ya tiene un grupo asignado.'
        )

      } else {
        setError(
          err?.message ||
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
      '¿Deseas eliminar esta inscripción? El alumno quedará sin grupo asignado.'
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


      // Si estaba seleccionado el alumno cuya
      // inscripción eliminamos, limpiamos el grupo.
      setGrupoId('')


      await cargarDatos()

    } catch (err) {
      console.error(
        'Error eliminando inscripción:',
        err
      )


      setError(
        err?.message ||
        'No se pudo eliminar la inscripción.'
      )
    }
  }


  // ==================================================
  // MATERIAS DEL GRUPO
  // ==================================================

  const obtenerMaterias = grupo => {
    if (!grupo?.grupo_materias) {
      return []
    }


    return grupo.grupo_materias
      .map(asignacion => {
        const materia = obtenerRelacion(
          asignacion.materias
        )


        /*
         * Si el grupo tiene área, solamente
         * contamos las materias de esa área.
         *
         * De esta forma no contamos relaciones
         * antiguas que conservamos debido a
         * las calificaciones existentes.
         */
        if (
          grupo.area_id != null &&
          materia?.area_id != null &&
          Number(materia.area_id) !==
            Number(grupo.area_id)
        ) {
          return null
        }


        return materia?.nombre
      })
      .filter(Boolean)
  }


  // ==================================================
  // FORMATEAR TURNO
  // ==================================================

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


  // ==================================================
  // RENDER
  // ==================================================

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


      {/* ==================================================
          MENSAJE
      ================================================== */}

      {mensaje && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
          }}
        >
          {mensaje}
        </div>
      )}


      {/* ==================================================
          ERROR
      ================================================== */}

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

            {/* ==========================================
                ALUMNO
            ========================================== */}

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

                  setGrupoId('')
                  setError('')
                  setMensaje('')
                }}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{
                  border: '1px solid #DDE4ED',
                  background: '#FFFFFF',
                  color: '#0F1E2B',
                }}
              >

                <option value="">
                  Selecciona un alumno
                </option>


                {alumnos.map(alumno => {
                  const perfil =
                    obtenerPerfil(alumno)

                  const area =
                    obtenerAreaAlumno(alumno)


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
                      Sem. {alumno.semestre ?? '—'}

                      {Number(alumno.semestre) >= 3 &&
                        ` · ${area?.nombre || 'Sin área'}`
                      }
                    </option>
                  )
                })}

              </select>

            </div>


            {/* ==========================================
                GRUPO
            ========================================== */}

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
                onChange={e => {
                  setGrupoId(
                    e.target.value
                  )

                  setError('')
                  setMensaje('')
                }}
                disabled={
                  !alumnoId ||
                  Boolean(inscripcionAlumno)
                }
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm disabled:opacity-50"
                style={{
                  border: '1px solid #DDE4ED',
                  background: '#FFFFFF',
                  color: '#0F1E2B',
                }}
              >

                <option value="">
                  {!alumnoId
                    ? 'Primero selecciona un alumno'
                    : inscripcionAlumno
                      ? 'El alumno ya tiene un grupo asignado'
                      : 'Selecciona un grupo'}
                </option>


                {gruposDisponibles.map(
                  grupo => {
                    const area =
                      obtenerAreaGrupo(grupo)


                    return (
                      <option
                        key={grupo.id}
                        value={grupo.id}
                      >
                        {grupo.nombre}
                        {' · '}
                        Sem. {grupo.semestre ?? '—'}
                        {' · '}
                        {formatearTurno(
                          grupo.turno
                        )}
                        {' · '}
                        {area?.nombre ||
                          'Sin área'}
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


          {/* ==========================================
              DATOS DEL ALUMNO
          ========================================== */}

          {alumnoSeleccionado && (
            <div
              className="mt-4 px-4 py-3 rounded-xl text-xs"
              style={{
                background: '#F4F7FA',
                border: '1px solid #DDE4ED',
                color: '#506070',
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


              {Number(
                alumnoSeleccionado.semestre
              ) >= 3 && (
                <>
                  {' · '}

                  Área:{' '}

                  <strong>
                    {obtenerAreaAlumno(
                      alumnoSeleccionado
                    )?.nombre ||
                      'Sin área'}
                  </strong>
                </>
              )}


              {' · '}


              Grupos disponibles:{' '}

              <strong>
                {gruposDisponibles.length}
              </strong>

            </div>
          )}


          {/* ==========================================
              INSCRIPCIÓN ACTUAL
          ========================================== */}

          {alumnoSeleccionado &&
            inscripcionAlumno &&
            (() => {

              const grupoActual =
                obtenerRelacion(
                  inscripcionAlumno.grupos
                )


              const areaActual =
                obtenerAreaGrupo(
                  grupoActual
                )


              return (
                <div
                  className="mt-3 px-4 py-3 rounded-xl text-xs"
                  style={{
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    color: '#9A3412',
                  }}
                >

                  Este alumno ya está inscrito en el grupo{' '}

                  <strong>
                    {grupoActual?.nombre || '—'}
                  </strong>


                  {' · '}


                  {formatearTurno(
                    grupoActual?.turno
                  )}


                  {areaActual?.nombre && (
                    <>
                      {' · '}

                      <strong>
                        {areaActual.nombre}
                      </strong>
                    </>
                  )}


                  . Para cambiarlo de grupo, elimina primero
                  su inscripción actual.

                </div>
              )
            })()
          }


          {/* ==========================================
              GRUPO SELECCIONADO
          ========================================== */}

          {grupoSeleccionado &&
            !inscripcionAlumno && (
              <div
                className="mt-3 px-4 py-3 rounded-xl text-xs"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #DDE4ED',
                  color: '#506070',
                }}
              >

                Grupo seleccionado:{' '}

                <strong>
                  {grupoSeleccionado.nombre}
                </strong>


                {' · '}


                Área:{' '}

                <strong>
                  {obtenerAreaGrupo(
                    grupoSeleccionado
                  )?.nombre ||
                    'Sin área'}
                </strong>


                {' · '}


                Materias:{' '}

                <strong>
                  {obtenerMaterias(
                    grupoSeleccionado
                  ).length}
                </strong>

              </div>
            )}


          {/* ==========================================
              BOTÓN
          ========================================== */}

          <div className="mt-5 flex justify-end">

            <BtnPrimary
              type="submit"
              disabled={
                saving ||
                !alumnoId ||
                !grupoId ||
                Boolean(inscripcionAlumno)
              }
            >
              {saving
                ? 'Inscribiendo...'
                : inscripcionAlumno
                  ? 'Alumno ya inscrito'
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
              Cada alumno pertenece a un único grupo académico
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
            'Área',
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
                    obtenerRelacion(
                      inscripcion.alumnos
                    )


                  const perfil =
                    obtenerPerfil(alumno)


                  const grupo =
                    obtenerRelacion(
                      inscripcion.grupos
                    )


                  const area =
                    obtenerAreaGrupo(grupo)


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
                          color: '#8FA0AF',
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
                        {area?.nombre ||
                          '—'}
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
                        {materias.length > 0
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
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                          }}
                        >
                          Eliminar
                        </button>

                      </TD>

                    </TR>
                  )
                }
              )}


              {inscripciones.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color: '#8FA0AF',
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