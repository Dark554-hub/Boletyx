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
  BtnPrimary,
  BtnOutline,
} from '../UI'

import {
  IconUsers,
  IconPlus,
} from '../Icons'


const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  semestre: '1',
  turno: 'matutino',
  area_id: '',
}


export default function AlumnosAdmin() {
  const [alumnos, setAlumnos] = useState([])
  const [areas, setAreas] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState(FORM_INICIAL)


  useEffect(() => {
    cargarDatos()
  }, [])


  // ==================================================
  // CARGAR ALUMNOS Y ÁREAS
  // ==================================================

  const cargarDatos = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        alumnosResponse,
        areasResponse,
      ] = await Promise.all([

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
          .order('id'),

        supabase
          .from('areas')
          .select(`
            id,
            nombre
          `)
          .neq('nombre', 'Tronco Común')
          .order('id'),
      ])


      if (alumnosResponse.error) {
        throw alumnosResponse.error
      }

      if (areasResponse.error) {
        throw areasResponse.error
      }


      setAlumnos(
        alumnosResponse.data || []
      )

      setAreas(
        areasResponse.data || []
      )

    } catch (err) {
      console.error(
        'Error al cargar alumnos:',
        err
      )

      setError(
        err?.message ||
        'No se pudieron cargar los alumnos.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ==================================================
  // ACTUALIZAR FORMULARIO
  // ==================================================

  const actualizarCampo = e => {
    const { name, value } = e.target


    // ================================================
    // CAMBIO DE SEMESTRE
    // ================================================

    if (name === 'semestre') {
      const nuevoSemestre =
        Number(value)


      setForm(prev => ({
        ...prev,

        semestre: value,

        area_id:
          nuevoSemestre >= 3
            ? prev.area_id
            : '',

        turno:
          nuevoSemestre < 3
            ? 'matutino'
            : prev.turno,
      }))

      return
    }


    // ================================================
    // CAMBIO DE ÁREA
    // ================================================

    if (name === 'area_id') {
      const areaSeleccionada =
        areas.find(
          area =>
            String(area.id) ===
            String(value)
        )


      const nombreArea =
        areaSeleccionada?.nombre || ''


      let nuevoTurno =
        form.turno


      // Matemáticas siempre en la mañana
      if (
        nombreArea ===
        'Matemáticas e Ingenierías'
      ) {
        nuevoTurno =
          'matutino'
      }


      // Biológicas siempre en la tarde
      else if (
        nombreArea ===
        'Ciencias Biológicas y de la Salud'
      ) {
        nuevoTurno =
          'vespertino'
      }


      // Sociales puede usar ambos.
      // Matutino queda como opción inicial.
      else if (
        nombreArea ===
        'Ciencias Sociales y Humanidades'
      ) {
        nuevoTurno =
          'matutino'
      }


      setForm(prev => ({
        ...prev,

        area_id:
          value,

        turno:
          nuevoTurno,
      }))

      return
    }


    // ================================================
    // RESTO DE CAMPOS
    // ================================================

    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }


  // ==================================================
  // CERRAR MODAL
  // ==================================================

  const cerrarModal = () => {
    if (guardando) return

    setModalAbierto(false)
    setForm(FORM_INICIAL)
    setError('')
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


    return obtenerRelacion(
      inscripciones[0]?.grupos
    )
  }


  const obtenerAreaGrupo = grupo => {
    if (!grupo) return null

    return obtenerRelacion(
      grupo.areas
    )
  }


  const obtenerAreaSeleccionada = () => {
    return areas.find(
      area =>
        String(area.id) ===
        String(form.area_id)
    ) || null
  }


  const formatearTurno = turno => {
    if (!turno) {
      return 'Sin turno'
    }

    return (
      turno.charAt(0).toUpperCase() +
      turno.slice(1)
    )
  }


  // ==================================================
  // REGISTRAR ALUMNO
  // ==================================================

  const registrarAlumno = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')


    const nombre =
      form.nombre.trim()

    const apellido =
      form.apellido.trim()

    const email =
      form.email
        .trim()
        .toLowerCase()

    const semestre =
      Number(form.semestre)


    // ================================================
    // VALIDACIONES GENERALES
    // ================================================

    if (
      !nombre ||
      !apellido ||
      !email ||
      !form.password
    ) {
      setError(
        'Completa todos los campos obligatorios.'
      )

      return
    }


    if (form.password.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      )

      return
    }


    if (
      ![1, 3, 5].includes(semestre)
    ) {
      setError(
        'Selecciona un semestre válido.'
      )

      return
    }


    // ================================================
    // VALIDAR ÁREA
    // ================================================

    if (
      semestre >= 3 &&
      !form.area_id
    ) {
      setError(
        'Selecciona el área académica del alumno.'
      )

      return
    }


    // ================================================
    // VALIDAR TURNO SEGÚN ÁREA
    // ================================================

    if (semestre >= 3) {
      const areaSeleccionada =
        obtenerAreaSeleccionada()


      if (!areaSeleccionada) {
        setError(
          'El área académica seleccionada no es válida.'
        )

        return
      }


      if (
        areaSeleccionada.nombre ===
          'Matemáticas e Ingenierías' &&
        form.turno !== 'matutino'
      ) {
        setError(
          'Matemáticas e Ingenierías corresponde al turno matutino.'
        )

        return
      }


      if (
        areaSeleccionada.nombre ===
          'Ciencias Biológicas y de la Salud' &&
        form.turno !== 'vespertino'
      ) {
        setError(
          'Ciencias Biológicas y de la Salud corresponde al turno vespertino.'
        )

        return
      }


      if (
        areaSeleccionada.nombre ===
          'Ciencias Sociales y Humanidades' &&
        form.turno !== 'matutino' &&
        form.turno !== 'vespertino'
      ) {
        setError(
          'Selecciona un turno válido.'
        )

        return
      }
    }


    setGuardando(true)


    try {
      const {
        data,
        error: functionError,
      } =
        await supabase.functions.invoke(
          'crear-alumno',
          {
            body: {
              nombre,
              apellido,
              email,

              password:
                form.password,

              semestre,

              turno:
                form.turno,

              area_id:
                semestre >= 3
                  ? Number(
                      form.area_id
                    )
                  : null,
            },
          }
        )


      if (functionError) {
        throw functionError
      }


      if (!data?.success) {
        throw new Error(
          data?.error ||
          'No se pudo registrar el alumno.'
        )
      }


      setMensaje(
        `Alumno registrado correctamente. Matrícula: ${data.matricula}`
      )


      setModalAbierto(false)
      setForm(FORM_INICIAL)


      await cargarDatos()

    } catch (err) {
      console.error(
        'Error registrando alumno:',
        err
      )


      setError(
        err?.message ||
        'Ocurrió un error al registrar el alumno.'
      )

    } finally {
      setGuardando(false)
    }
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
        Cargando alumnos...
      </div>
    )
  }


  // ==================================================
  // DATOS DEL ÁREA SELECCIONADA
  // ==================================================

  const areaSeleccionada =
    obtenerAreaSeleccionada()

  const nombreAreaSeleccionada =
    areaSeleccionada?.nombre || ''

  const esMatematicas =
    nombreAreaSeleccionada ===
    'Matemáticas e Ingenierías'

  const esBiologicas =
    nombreAreaSeleccionada ===
    'Ciencias Biológicas y de la Salud'

  const esSociales =
    nombreAreaSeleccionada ===
    'Ciencias Sociales y Humanidades'


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-6">

      <PageHeader
        title="Alumnos"
        subtitle="Consulta y administra los alumnos registrados"
        action={
          <BtnPrimary
            onClick={() => {
              setError('')
              setMensaje('')
              setForm(FORM_INICIAL)
              setModalAbierto(true)
            }}
          >
            <IconPlus size={15} />

            Nuevo alumno
          </BtnPrimary>
        }
      />


      {/* MENSAJE */}

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


      {/* ERROR GENERAL */}

      {error && !modalAbierto && (
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
              Alumnos registrados
            </CardTitle>

            <CardSubtitle>
              Información obtenida directamente desde Supabase
            </CardSubtitle>

          </div>


          <Pill variant="blue">
            {alumnos.length}{' '}
            {alumnos.length === 1
              ? 'alumno'
              : 'alumnos'}
          </Pill>

        </CardHeader>


        <DataTable
          headers={[
            '#',
            'Alumno',
            'Matrícula',
            'Semestre',
            'Grupo',
            'Área',
            'Turno',
          ]}
          rows={
            <>

              {alumnos.map(
                (alumno, index) => {

                  const perfil =
                    obtenerPerfil(alumno)


                  const nombreCompleto =
                    perfil
                      ? `${perfil.nombre} ${perfil.apellido}`
                      : 'Sin nombre'


                  const grupoActual =
                    obtenerGrupoActual(
                      alumno
                    )


                  const areaAlumno =
                    obtenerAreaAlumno(
                      alumno
                    )


                  const areaGrupo =
                    obtenerAreaGrupo(
                      grupoActual
                    )


                  const area =
                    areaGrupo?.nombre ??
                    areaAlumno?.nombre ??
                    null


                  const grupo =
                    grupoActual?.nombre ??
                    null


                  const turno =
                    grupoActual?.turno ??
                    alumno.turno


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


                      <TD className="font-semibold">

                        <div className="flex items-center gap-3">

                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background:
                                'rgba(32,58,80,.07)',

                              color:
                                '#203A50',
                            }}
                          >
                            <IconUsers
                              size={16}
                            />
                          </div>


                          <span>
                            {nombreCompleto}
                          </span>

                        </div>

                      </TD>


                      <TD>

                        <span
                          className="font-semibold tabular-nums"
                          style={{
                            color:
                              '#203A50',
                          }}
                        >
                          {alumno.matricula ||
                            'Sin matrícula'}
                        </span>

                      </TD>


                      <TD>
                        {alumno.semestre ??
                          '—'}
                      </TD>


                      <TD>

                        {grupo ? (
                          <Pill variant="default">
                            {grupo}
                          </Pill>
                        ) : (
                          <span
                            style={{
                              color:
                                '#8FA0AF',
                            }}
                          >
                            Sin grupo
                          </span>
                        )}

                      </TD>


                      <TD>

                        {area ? (
                          <span
                            className="font-medium"
                            style={{
                              color:
                                '#203A50',
                            }}
                          >
                            {area}
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                '#8FA0AF',
                            }}
                          >
                            {Number(
                              alumno.semestre
                            ) < 3
                              ? 'No aplica'
                              : 'Sin área'}
                          </span>
                        )}

                      </TD>


                      <TD>

                        <Pill variant="default">
                          {formatearTurno(
                            turno
                          )}
                        </Pill>

                      </TD>

                    </TR>
                  )
                }
              )}


              {alumnos.length === 0 && (
                <tr>

                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    No hay alumnos registrados.
                  </td>

                </tr>
              )}

            </>
          }
        />

      </Card>


      {/* MODAL NUEVO ALUMNO */}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background:
              'rgba(15,30,43,.55)',

            backdropFilter:
              'blur(3px)',
          }}
        >

          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background:
                '#FFFFFF',

              border:
                '1px solid #DDE4ED',

              boxShadow:
                '0 24px 70px rgba(15,30,43,.25)',
            }}
          >

            {/* HEADER MODAL */}

            <div
              className="flex items-start justify-between gap-4 px-6 py-5 border-b"
              style={{
                borderColor:
                  '#DDE4ED',
              }}
            >

              <div>

                <h2
                  className="text-lg font-black"
                  style={{
                    color:
                      '#0F1E2B',
                  }}
                >
                  Registrar nuevo alumno
                </h2>


                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      '#8FA0AF',
                  }}
                >
                  Se creará su cuenta, perfil y registro escolar.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  cerrarModal
                }
                disabled={
                  guardando
                }
                className="w-9 h-9 rounded-xl text-lg cursor-pointer"
                style={{
                  background:
                    '#F4F7FA',

                  border:
                    '1px solid #DDE4ED',

                  color:
                    '#506070',
                }}
              >
                ×
              </button>

            </div>


            {/* FORMULARIO */}

            <form
              onSubmit={
                registrarAlumno
              }
            >

              <div className="p-6 space-y-5">


                {/* ERROR MODAL */}

                {error && (
                  <div
                    className="px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background:
                        '#fee2e2',

                      border:
                        '1px solid #fca5a5',

                      color:
                        '#991b1b',
                    }}
                  >
                    {error}
                  </div>
                )}


                {/* NOMBRE / APELLIDO */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Campo
                    label="Nombre"
                    name="nombre"
                    value={
                      form.nombre
                    }
                    onChange={
                      actualizarCampo
                    }
                    placeholder="Ej. Emilio"
                    required
                  />


                  <Campo
                    label="Apellido"
                    name="apellido"
                    value={
                      form.apellido
                    }
                    onChange={
                      actualizarCampo
                    }
                    placeholder="Ej. García"
                    required
                  />

                </div>


                {/* CORREO */}

                <Campo
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={
                    actualizarCampo
                  }
                  placeholder="alumno@boletyx.edu"
                  required
                />


                {/* CONTRASEÑA */}

                <Campo
                  label="Contraseña temporal"
                  name="password"
                  type="password"
                  value={
                    form.password
                  }
                  onChange={
                    actualizarCampo
                  }
                  placeholder="Mínimo 6 caracteres"
                  required
                />


                {/* SEMESTRE */}

                <div>

                  <label
                    className="block text-[11px] font-black uppercase tracking-wider mb-2"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    Semestre
                  </label>


                  <select
                    name="semestre"
                    value={
                      form.semestre
                    }
                    onChange={
                      actualizarCampo
                    }
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      border:
                        '1px solid #DDE4ED',

                      color:
                        '#0F1E2B',

                      background:
                        '#FFFFFF',
                    }}
                  >

                    {[1, 3, 5].map(
                      n => (
                        <option
                          key={n}
                          value={n}
                        >
                          {n}
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* ÁREA ACADÉMICA */}

                {Number(form.semestre) >= 3 && (
                  <div>

                    <label
                      className="block text-[11px] font-black uppercase tracking-wider mb-2"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      Área académica

                      <span
                        style={{
                          color:
                            '#dc2626',
                        }}
                      >
                        {' '}*
                      </span>

                    </label>


                    <select
                      name="area_id"
                      value={
                        form.area_id
                      }
                      onChange={
                        actualizarCampo
                      }
                      required
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{
                        border:
                          '1px solid #DDE4ED',

                        color:
                          '#0F1E2B',

                        background:
                          '#FFFFFF',
                      }}
                    >

                      <option value="">
                        Selecciona un área académica
                      </option>


                      {areas.map(area => (
                        <option
                          key={area.id}
                          value={area.id}
                        >
                          {area.nombre}
                        </option>
                      ))}

                    </select>


                    <p
                      className="text-xs mt-2"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      El área determina qué grupos, materias y turno estarán disponibles para el alumno.
                    </p>

                  </div>
                )}


                {/* TURNO */}

                <div>

                  <label
                    className="block text-[11px] font-black uppercase tracking-wider mb-2"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    Turno
                  </label>


                  {/* SEMESTRES 1 Y 2 */}

                  {Number(form.semestre) < 3 && (
                    <select
                      name="turno"
                      value={
                        form.turno
                      }
                      onChange={
                        actualizarCampo
                      }
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{
                        border:
                          '1px solid #DDE4ED',

                        color:
                          '#0F1E2B',

                        background:
                          '#FFFFFF',
                      }}
                    >

                      <option value="matutino">
                        Matutino
                      </option>

                      <option value="vespertino">
                        Vespertino
                      </option>

                    </select>
                  )}


                  {/* SIN ÁREA SELECCIONADA */}

                  {Number(form.semestre) >= 3 &&
                    !form.area_id && (
                      <div
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{
                          border:
                            '1px solid #DDE4ED',

                          color:
                            '#8FA0AF',

                          background:
                            '#F4F7FA',
                        }}
                      >
                        Primero selecciona un área
                      </div>
                    )}


                  {/* MATEMÁTICAS */}

                  {Number(form.semestre) >= 3 &&
                    esMatematicas && (
                      <div
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold"
                        style={{
                          border:
                            '1px solid #DDE4ED',

                          color:
                            '#506070',

                          background:
                            '#F4F7FA',
                        }}
                      >
                        Matutino
                      </div>
                    )}


                  {/* BIOLÓGICAS */}

                  {Number(form.semestre) >= 3 &&
                    esBiologicas && (
                      <div
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold"
                        style={{
                          border:
                            '1px solid #DDE4ED',

                          color:
                            '#506070',

                          background:
                            '#F4F7FA',
                        }}
                      >
                        Vespertino
                      </div>
                    )}


                  {/* SOCIALES */}

                  {Number(form.semestre) >= 3 &&
                    esSociales && (
                      <select
                        name="turno"
                        value={
                          form.turno
                        }
                        onChange={
                          actualizarCampo
                        }
                        className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                        style={{
                          border:
                            '1px solid #DDE4ED',

                          color:
                            '#0F1E2B',

                          background:
                            '#FFFFFF',
                        }}
                      >

                        <option value="matutino">
                          Matutino
                        </option>

                        <option value="vespertino">
                          Vespertino
                        </option>

                      </select>
                    )}


                  {/* EXPLICACIÓN */}

                  {Number(form.semestre) >= 3 &&
                    form.area_id && (
                      <p
                        className="text-xs mt-2"
                        style={{
                          color:
                            '#8FA0AF',
                        }}
                      >
                        {esSociales
                          ? 'Ciencias Sociales y Humanidades está disponible en ambos turnos.'
                          : 'El turno se asigna automáticamente según el área académica.'}
                      </p>
                    )}

                </div>


                {/* AVISO */}

                <div
                  className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                  style={{
                    background:
                      '#F4F7FA',

                    color:
                      '#506070',

                    border:
                      '1px solid #DDE4ED',
                  }}
                >

                  <strong>
                    Matrícula:
                  </strong>{' '}

                  será generada automáticamente por el sistema.

                  <br />

                  <strong>
                    Grupo:
                  </strong>{' '}

                  se asignará después desde el módulo de Inscripciones.


                  {Number(form.semestre) < 3 && (
                    <>
                      <br />

                      <strong>
                        Área académica:
                      </strong>{' '}

                      no aplica para este semestre.
                    </>
                  )}


                  {Number(form.semestre) >= 3 &&
                    esMatematicas && (
                      <>
                        <br />

                        <strong>
                          Turno:
                        </strong>{' '}

                        Matemáticas e Ingenierías se asigna al turno matutino.
                      </>
                    )}


                  {Number(form.semestre) >= 3 &&
                    esBiologicas && (
                      <>
                        <br />

                        <strong>
                          Turno:
                        </strong>{' '}

                        Ciencias Biológicas y de la Salud se asigna al turno vespertino.
                      </>
                    )}

                </div>

              </div>


              {/* BOTONES */}

              <div
                className="flex justify-end gap-3 px-6 py-4 border-t"
                style={{
                  borderColor:
                    '#DDE4ED',

                  background:
                    '#FAFBFC',
                }}
              >

                <BtnOutline
                  type="button"
                  onClick={
                    cerrarModal
                  }
                >
                  Cancelar
                </BtnOutline>


                <BtnPrimary
                  type="submit"
                  disabled={
                    guardando
                  }
                >
                  {guardando
                    ? 'Registrando...'
                    : 'Registrar alumno'}
                </BtnPrimary>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}


// ==================================================
// CAMPO DE TEXTO
// ==================================================

function Campo({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}) {
  return (
    <div>

      <label
        className="block text-[11px] font-black uppercase tracking-wider mb-2"
        style={{
          color:
            '#8FA0AF',
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color:
                '#dc2626',
            }}
          >
            {' '}*
          </span>
        )}
      </label>


      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
        style={{
          border:
            '1px solid #DDE4ED',

          color:
            '#0F1E2B',

          background:
            '#FFFFFF',
        }}
      />

    </div>
  )
}