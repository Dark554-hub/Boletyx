import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../../lib/supabase'



import {

  IconUsers,

  IconGrade,

  IconCalendar,

  IconCheck,

} from '../Icons'



const ESTILOS = `

.dd-page {

  --dd-azul: #203A50;

  --dd-celeste-palido: #CCE0E6;

  --dd-border: #e3eaee;

  --dd-text: #203A50;

  --dd-text-2: #5b7083;

  --dd-text-3: #8D9194;

  --dd-tile: #f3f7f9;



  max-width: 1152px;

  margin: 0 auto;

  padding: 32px 24px 48px;

  color: var(--dd-text);

}



.dd-hero {

  display: flex;

  align-items: center;

  gap: 18px;

  padding: 24px 28px;

  margin-bottom: 18px;

  border-radius: 18px;

  color: #fff;

  background: linear-gradient(135deg, #1a3145 0%, #203A50 100%);

  box-shadow: 0 6px 20px rgba(32, 58, 80, .18);

}



.dd-avatar {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 56px;

  height: 56px;

  flex-shrink: 0;

  border-radius: 14px;

  font-size: 18px;

  font-weight: 800;

  background: rgba(255,255,255,.12);

  border: 1px solid rgba(255,255,255,.22);

}



.dd-hero-info {

  flex: 1;

  min-width: 0;

}



.dd-hero-name {

  font-size: 22px;

  font-weight: 800;

  line-height: 1.2;

}



.dd-hero-sub {

  font-size: 13px;

  margin-top: 3px;

  color: rgba(255,255,255,.75);

}



.dd-hero-badge {

  display: inline-block;

  margin-top: 10px;

  padding: 3px 10px;

  border-radius: 999px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: .4px;

  text-transform: uppercase;

  background: rgba(255,255,255,.14);

}



.dd-hero-actions {

  display: flex;

  align-items: center;

  gap: 16px;

  flex-shrink: 0;

}



.dd-hero-big {

  text-align: right;

}



.dd-hero-big strong {

  display: block;

  font-size: 44px;

  font-weight: 800;

  line-height: 1;

}



.dd-hero-big span {

  display: block;

  margin-top: 4px;

  font-size: 12px;

  color: rgba(255,255,255,.7);

}



.dd-edit-btn {

  border: 1px solid rgba(255,255,255,.28);

  background: rgba(255,255,255,.12);

  color: #fff;

  padding: 9px 14px;

  border-radius: 10px;

  font-size: 12px;

  font-weight: 700;

  cursor: pointer;

}



.dd-edit-btn:hover {

  background: rgba(255,255,255,.20);

}



.dd-stats {

  display: grid;

  grid-template-columns: repeat(4, minmax(0,1fr));

  gap: 14px;

  margin-bottom: 18px;

}



.dd-stat {

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 18px 20px;

  background: #fff;

  border: 1px solid var(--dd-border);

  border-radius: 16px;

}



.dd-stat-icon {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 42px;

  height: 42px;

  flex-shrink: 0;

  border-radius: 50%;

}



.dd-stat-value {

  font-size: 24px;

  font-weight: 800;

  line-height: 1.1;

}



.dd-stat-value.sm {

  font-size: 17px;

}



.dd-stat-label {

  margin-top: 3px;

  font-size: 12px;

  color: var(--dd-text-3);

}



.dd-card {

  margin-bottom: 18px;

  background: #fff;

  border: 1px solid var(--dd-border);

  border-radius: 16px;

  overflow: hidden;

}



.dd-card-head {

  padding: 18px 24px;

  border-bottom: 1px solid var(--dd-border);

}



.dd-card-title {

  font-size: 15px;

  font-weight: 700;

}



.dd-card-sub {

  margin-top: 2px;

  font-size: 12px;

  color: var(--dd-text-3);

}



.dd-table-wrap {

  overflow-x: auto;

}



.dd-table {

  width: 100%;

  border-collapse: collapse;

  font-size: 14px;

}



.dd-table th {

  padding: 12px 24px;

  text-align: left;

  font-size: 12px;

  font-weight: 700;

  color: var(--dd-azul);

  background: var(--dd-celeste-palido);

  white-space: nowrap;

}



.dd-table td {

  padding: 14px 24px;

  border-top: 1px solid var(--dd-border);

}



.dd-table tbody tr:hover {

  background: #f3f7f9;

}



.dd-center {

  text-align: center !important;

}



.dd-group {

  font-weight: 700;

}



.dd-pill {

  display: inline-block;

  padding: 3px 10px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 600;

  color: #1d4e89;

  background: #e3eefa;

}



.dd-count {

  display: inline-block;

  min-width: 32px;

  padding: 3px 10px;

  border-radius: 999px;

  font-weight: 700;

  background: var(--dd-tile);

}



.dd-empty {

  padding: 28px;

  text-align: center;

  color: var(--dd-text-3);

  font-size: 14px;

}



.dd-info {

  display: grid;

  grid-template-columns: repeat(4,minmax(0,1fr));

  gap: 12px;

  padding: 22px 24px 26px;

}



.dd-field {

  padding: 14px 16px;

  background: var(--dd-tile);

  border-radius: 14px;

  min-width: 0;

}



.dd-field-label {

  margin-bottom: 4px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: .5px;

  text-transform: uppercase;

  color: var(--dd-text-3);

}



.dd-field-value {

  font-size: 14px;

  font-weight: 500;

  overflow-wrap: anywhere;

}



.dd-message {

  padding: 14px 18px;

  margin-bottom: 18px;

  border-radius: 14px;

  font-size: 13px;

  font-weight: 600;

}



.dd-error {

  color: #991b1b;

  background: #fee2e2;

  border: 1px solid #fecaca;

}



.dd-success {

  color: #166534;

  background: #dcfce7;

  border: 1px solid #86efac;

}



.dd-loading {

  padding: 40px;

  text-align: center;

  color: #5b7083;

}



/* MODAL */



.dd-modal-backdrop {

  position: fixed;

  inset: 0;

  z-index: 100;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background: rgba(15,30,43,.58);

  backdrop-filter: blur(3px);

}



.dd-modal {

  width: 100%;

  max-width: 520px;

  background: #fff;

  border-radius: 18px;

  box-shadow: 0 22px 60px rgba(0,0,0,.22);

  overflow: hidden;

}



.dd-modal-head {

  padding: 20px 24px;

  border-bottom: 1px solid var(--dd-border);

}



.dd-modal-title {

  font-size: 17px;

  font-weight: 800;

}



.dd-modal-sub {

  margin-top: 3px;

  font-size: 12px;

  color: var(--dd-text-3);

}



.dd-modal-body {

  padding: 24px;

}



.dd-form-group {

  margin-bottom: 16px;

}



.dd-form-label {

  display: block;

  margin-bottom: 7px;

  font-size: 11px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: .5px;

  color: var(--dd-text-3);

}



.dd-input {

  width: 100%;

  padding: 10px 12px;

  border: 1px solid #DDE4ED;

  border-radius: 10px;

  outline: none;

  font-size: 14px;

  color: #203A50;

}



.dd-input:focus {

  border-color: #203A50;

}



.dd-input[disabled] {

  background: #f3f7f9;

  color: #8D9194;

  cursor: not-allowed;

}



.dd-modal-actions {

  display: flex;

  justify-content: flex-end;

  gap: 10px;

  margin-top: 22px;

}



.dd-btn-secondary,

.dd-btn-primary {

  padding: 9px 15px;

  border-radius: 10px;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

}



.dd-btn-secondary {

  color: #506070;

  background: #fff;

  border: 1px solid #DDE4ED;

}



.dd-btn-primary {

  color: #fff;

  background: #203A50;

  border: 1px solid #203A50;

}



.dd-btn-primary:disabled {

  opacity: .55;

  cursor: not-allowed;

}



@media (max-width: 1000px) {

  .dd-stats,

  .dd-info {

    grid-template-columns: repeat(2,minmax(0,1fr));

  }

}



@media (max-width: 560px) {

  .dd-page {

    padding: 16px 12px 32px;

  }



  .dd-hero {

    flex-wrap: wrap;

    padding: 20px;

  }



  .dd-hero-actions {

    width: 100%;

    justify-content: space-between;

  }



  .dd-hero-big {

    text-align: left;

  }



  .dd-stats,

  .dd-info {

    grid-template-columns: 1fr;

  }



  .dd-table th,

  .dd-table td {

    padding: 12px 16px;

  }

}

`



export default function DatosDocente({ user }) {

  const [docente, setDocente] = useState(null)

  const [asignaciones, setAsignaciones] = useState([])



  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)



  const [error, setError] = useState('')

  const [mensaje, setMensaje] = useState('')



  const [modalAbierto, setModalAbierto] = useState(false)



  const [form, setForm] = useState({

    nombre: '',

    apellido: '',

    especialidad: '',

  })



  useEffect(() => {

    cargarDatos()

  }, [user?.docente_id])



  // ==================================================

  // CARGAR DATOS

  // ==================================================



  const cargarDatos = async () => {

    if (!user?.docente_id) {

      setError(

        'No se encontró el identificador del docente.'

      )

      setLoading(false)

      return

    }



    setLoading(true)

    setError('')



    try {

      const [

        docenteResponse,

        asignacionesResponse,

      ] = await Promise.all([

        supabase

          .from('docentes')

          .select(`

            id,

            perfil_id,

            numero_empleado,

            especialidad,



            perfiles (

              nombre,

              apellido

            )

          `)

          .eq('id', user.docente_id)

          .single(),



        supabase

          .from('grupo_materias')

          .select(`

            id,

            grupo_id,

            materia_id,



            grupos (

              id,

              nombre,

              semestre,

              turno,

              ciclo_escolar,



              inscripciones (

                id,

                alumno_id

              )

            ),



            materias (

              id,

              nombre

            )

          `)

          .eq(

            'docente_id',

            user.docente_id

          )

          .order('id'),

      ])



      if (docenteResponse.error) {

        throw docenteResponse.error

      }



      if (asignacionesResponse.error) {

        throw asignacionesResponse.error

      }



      setDocente(docenteResponse.data)



      setAsignaciones(

        asignacionesResponse.data || []

      )

    } catch (err) {

      console.error(

        'Error cargando datos del docente:',

        err

      )



      setError(

        err?.message ||

          'No se pudieron cargar los datos del docente.'

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



  const capitalizar = texto => {

    if (!texto) return '—'



    return (

      texto.charAt(0).toUpperCase() +

      texto.slice(1)

    )

  }



  // ==================================================

  // PERFIL

  // ==================================================



  const perfil =

    obtenerRelacion(

      docente?.perfiles

    )



  const nombreCompleto =

    perfil

      ? `${perfil.nombre} ${perfil.apellido}`

      : `${user?.nombre || ''} ${

          user?.apellido || ''

        }`.trim() ||

        'Docente'



  const numeroEmpleado =

    docente?.numero_empleado ||

    user?.numero_empleado ||

    '—'



  const especialidad =

    docente?.especialidad ||

    user?.especialidad ||

    '—'



  const iniciales =

    nombreCompleto

      .split(' ')

      .filter(Boolean)

      .slice(0, 2)

      .map(parte =>

        parte

          .charAt(0)

          .toUpperCase()

      )

      .join('')



  // ==================================================

  // ASIGNACIONES

  // ==================================================



  const grupos =

    useMemo(() => {

      return asignaciones.map(

        asignacion => {

          const grupo =

            obtenerRelacion(

              asignacion.grupos

            )



          const materia =

            obtenerRelacion(

              asignacion.materias

            )



          return {

            id:

              asignacion.id,



            grupoId:

              grupo?.id ?? null,



            grupo:

              grupo?.nombre ||

              'Sin grupo',



            materia:

              materia?.nombre ||

              'Sin materia',



            semestre:

              grupo?.semestre ??

              '—',



            turno:

              grupo?.turno ||

              null,



            ciclo:

              grupo?.ciclo_escolar ||

              '—',



            alumnos:

              grupo?.inscripciones ||

              [],

          }

        }

      )

    }, [asignaciones])



  // ==================================================

  // ESTADÍSTICAS

  // ==================================================



  const totalAlumnos =

    useMemo(() => {

      const ids =

        new Set()



      grupos.forEach(grupo => {

        grupo.alumnos.forEach(

          inscripcion => {

            if (

              inscripcion?.alumno_id !=

              null

            ) {

              ids.add(

                String(

                  inscripcion.alumno_id

                )

              )

            }

          }

        )

      })



      return ids.size

    }, [grupos])



  const totalGrupos =

    useMemo(() => {

      return new Set(

        grupos

          .map(

            grupo =>

              grupo.grupoId

          )

          .filter(

            id => id != null

          )

      ).size

    }, [grupos])



  const totalMaterias =

    useMemo(() => {

      return new Set(

        grupos

          .map(

            grupo =>

              grupo.materia

          )

          .filter(Boolean)

      ).size

    }, [grupos])



  const turnos =

    useMemo(() => {

      return [

        ...new Set(

          grupos

            .map(

              grupo =>

                grupo.turno

            )

            .filter(Boolean)

        ),

      ]

    }, [grupos])



  const turnoGeneral =

    turnos.length === 0

      ? 'Sin asignar'

      : turnos.length === 1

        ? capitalizar(

            turnos[0]

          )

        : 'Mixto'



  const ciclos =

    useMemo(() => {

      return [

        ...new Set(

          grupos

            .map(

              grupo =>

                grupo.ciclo

            )

            .filter(

              ciclo =>

                ciclo &&

                ciclo !== '—'

            )

        ),

      ]

    }, [grupos])



  const cicloGeneral =

    ciclos.length === 0

      ? 'Sin asignar'

      : ciclos.length === 1

        ? ciclos[0]

        : 'Varios ciclos'



  // ==================================================

  // ABRIR MODAL

  // ==================================================



  const abrirModal = () => {

    setError('')

    setMensaje('')



    setForm({

      nombre:

        perfil?.nombre || '',



      apellido:

        perfil?.apellido || '',



      especialidad:

        docente?.especialidad ||

        '',

    })



    setModalAbierto(true)

  }



  // ==================================================

  // GUARDAR PERFIL

  // ==================================================



  const guardarPerfil =

    async e => {

      e.preventDefault()



      setError('')

      setMensaje('')



      const nombre =

        form.nombre.trim()



      const apellido =

        form.apellido.trim()



      const nuevaEspecialidad =

        form.especialidad.trim()



      if (

        !nombre ||

        !apellido ||

        !nuevaEspecialidad

      ) {

        setError(

          'Completa nombre, apellido y especialidad.'

        )

        return

      }



      setSaving(true)



      try {

        // ------------------------------------------

        // PERFIL

        // ------------------------------------------



        const {

          error: perfilError,

        } = await supabase

          .from('perfiles')

          .update({

            nombre,

            apellido,

          })

          .eq(

            'id',

            docente.perfil_id

          )



        if (perfilError) {

          throw perfilError

        }



        // ------------------------------------------

        // DATOS PROFESIONALES

        // ------------------------------------------



        const {

          error: docenteError,

        } = await supabase

          .from('docentes')

          .update({

            especialidad:

              nuevaEspecialidad,

          })

          .eq(

            'id',

            docente.id

          )



        if (docenteError) {

          throw docenteError

        }



        setModalAbierto(false)



        setMensaje(

          'Datos actualizados correctamente.'

        )



        await cargarDatos()

        window.dispatchEvent(
          new CustomEvent(
            'boletyx:perfil-actualizado',
            {
              detail: {
                nombre,
                apellido,
                especialidad:
                  nuevaEspecialidad,
              },
            }
          )
        )

      } catch (err) {

        console.error(

          'Error actualizando perfil docente:',

          err

        )



        setError(

          err?.message ||

            'No se pudieron actualizar los datos.'

        )

      } finally {

        setSaving(false)

      }

    }



  // ==================================================

  // STATS

  // ==================================================



  const stats = [

    {

      Icon: IconUsers,

      bg: '#eef2f5',

      color: '#203A50',

      value: totalAlumnos,

      label: 'Alumnos únicos',

    },



    {

      Icon: IconGrade,

      bg: '#e8f6ee',

      color: '#16a34a',

      value: totalGrupos,

      label: 'Grupos asignados',

      valueColor: '#16a34a',

    },



    {

      Icon: IconCheck,

      bg: '#e8f0fc',

      color: '#2563eb',

      value: totalMaterias,

      label: 'Materias asignadas',

    },



    {

      Icon: IconCalendar,

      bg: '#fdf3e2',

      color: '#ca8a04',

      value: turnoGeneral,

      label: 'Turno',

      small: true,

    },

  ]



  const info = [

    {

      label:

        'Nombre completo',

      value:

        nombreCompleto,

    },



    {

      label:

        'N.º empleado',

      value:

        numeroEmpleado,

    },



    {

      label:

        'Correo institucional',

      value:

        user?.email || '—',

    },



    {

      label:

        'Especialidad',

      value:

        especialidad,

    },



    {

      label:

        'Turno',

      value:

        turnoGeneral,

    },



    {

      label:

        'Ciclo escolar',

      value:

        cicloGeneral,

    },



    {

      label:

        'Grupos asignados',

      value:

        totalGrupos,

    },



    {

      label:

        'Estado en el sistema',

      value:

        'Registrado',

    },

  ]



  if (loading) {

    return (

      <>

        <style>{ESTILOS}</style>



        <div className="dd-page">

          <div className="dd-card">

            <div className="dd-loading">

              Cargando información del docente...

            </div>

          </div>

        </div>

      </>

    )

  }



  return (

    <>

      <style>{ESTILOS}</style>



      <div className="dd-page fade-in">

        {/* MENSAJES */}



        {mensaje && (

          <div className="dd-message dd-success">

            {mensaje}

          </div>

        )}



        {error && (

          <div className="dd-message dd-error">

            {error}

          </div>

        )}



        {/* HERO */}



        <div className="dd-hero">

          <div className="dd-avatar">

            {iniciales || 'D'}

          </div>



          <div className="dd-hero-info">

            <div className="dd-hero-name">

              {nombreCompleto}

            </div>



            <div className="dd-hero-sub">

              Docente ·{' '}

              {especialidad} ·{' '}

              {turnoGeneral}

            </div>



            <span className="dd-hero-badge">

              N.º empleado:{' '}

              {numeroEmpleado}

            </span>

          </div>



          <div className="dd-hero-actions">

            <button

              type="button"

              className="dd-edit-btn"

              onClick={

                abrirModal

              }

            >

              Editar mis datos

            </button>



            <div className="dd-hero-big">

              <strong>

                {totalGrupos}

              </strong>



              <span>

                Grupos activos

              </span>

            </div>

          </div>

        </div>



        {/* STATS */}



        <div className="dd-stats">

          {stats.map(

            ({

              Icon,

              bg,

              color,

              value,

              label,

              small,

              valueColor,

            }) => (

              <div

                className="dd-stat"

                key={label}

              >

                <div

                  className="dd-stat-icon"

                  style={{

                    background: bg,

                  }}

                >

                  <Icon

                    size={20}

                    style={{

                      color,

                    }}

                  />

                </div>



                <div>

                  <div

                    className={`dd-stat-value${

                      small

                        ? ' sm'

                        : ''

                    }`}

                    style={

                      valueColor

                        ? {

                            color:

                              valueColor,

                          }

                        : undefined

                    }

                  >

                    {value}

                  </div>



                  <div className="dd-stat-label">

                    {label}

                  </div>

                </div>

              </div>

            )

          )}

        </div>



        {/* ASIGNACIONES */}



        <div className="dd-card">

          <div className="dd-card-head">

            <div className="dd-card-title">

              Asignaciones académicas

            </div>



            <div className="dd-card-sub">

              {totalGrupos}{' '}

              grupos ·{' '}

              {totalMaterias}{' '}

              materias ·{' '}

              {totalAlumnos}{' '}

              alumnos únicos

            </div>

          </div>



          <div className="dd-table-wrap">

            {grupos.length ===

            0 ? (

              <div className="dd-empty">

                Aún no tienes materias o grupos asignados.

              </div>

            ) : (

              <table className="dd-table">

                <thead>

                  <tr>

                    <th>Grupo</th>

                    <th>

                      Materia

                    </th>

                    <th>

                      Semestre

                    </th>

                    <th>Turno</th>

                    <th>Ciclo</th>

                    <th className="dd-center">

                      Alumnos

                    </th>

                  </tr>

                </thead>



                <tbody>

                  {grupos.map(

                    grupo => (

                      <tr

                        key={

                          grupo.id

                        }

                      >

                        <td className="dd-group">

                          {

                            grupo.grupo

                          }

                        </td>



                        <td>

                          {

                            grupo.materia

                          }

                        </td>



                        <td>

                          {

                            grupo.semestre

                          }

                        </td>



                        <td>

                          <span className="dd-pill">

                            {capitalizar(

                              grupo.turno

                            )}

                          </span>

                        </td>



                        <td>

                          {

                            grupo.ciclo

                          }

                        </td>



                        <td className="dd-center">

                          <span className="dd-count">

                            {

                              grupo

                                .alumnos

                                .length

                            }

                          </span>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>



        {/* INFORMACIÓN */}



        <div className="dd-card">

          <div className="dd-card-head">

            <div className="dd-card-title">

              Información del docente

            </div>



            <div className="dd-card-sub">

              Datos obtenidos directamente desde Supabase

            </div>

          </div>



          <div className="dd-info">

            {info.map(

              campo => (

                <div

                  className="dd-field"

                  key={

                    campo.label

                  }

                >

                  <div className="dd-field-label">

                    {

                      campo.label

                    }

                  </div>



                  <div className="dd-field-value">

                    {

                      campo.value

                    }

                  </div>

                </div>

              )

            )}

          </div>

        </div>

      </div>



      {/* ==================================================

          MODAL EDITAR

      ================================================== */}



      {modalAbierto && (

        <div

          className="dd-modal-backdrop"

          onClick={() => {

            if (!saving) {

              setModalAbierto(false)

            }

          }}

        >

          <div

            className="dd-modal"

            onClick={e =>

              e.stopPropagation()

            }

          >

            <div className="dd-modal-head">

              <div className="dd-modal-title">

                Editar mis datos

              </div>



              <div className="dd-modal-sub">

                Actualiza tu información personal y profesional

              </div>

            </div>



            <form

              className="dd-modal-body"

              onSubmit={

                guardarPerfil

              }

            >

              <div className="dd-form-group">

                <label className="dd-form-label">

                  Nombre

                </label>



                <input

                  className="dd-input"

                  value={

                    form.nombre

                  }

                  onChange={e =>

                    setForm(

                      actual => ({

                        ...actual,

                        nombre:

                          e.target

                            .value,

                      })

                    )

                  }

                />

              </div>



              <div className="dd-form-group">

                <label className="dd-form-label">

                  Apellido

                </label>



                <input

                  className="dd-input"

                  value={

                    form.apellido

                  }

                  onChange={e =>

                    setForm(

                      actual => ({

                        ...actual,

                        apellido:

                          e.target

                            .value,

                      })

                    )

                  }

                />

              </div>



              <div className="dd-form-group">

                <label className="dd-form-label">

                  Especialidad

                </label>



                <input

                  className="dd-input"

                  value={

                    form.especialidad

                  }

                  onChange={e =>

                    setForm(

                      actual => ({

                        ...actual,

                        especialidad:

                          e.target

                            .value,

                      })

                    )

                  }

                />

              </div>



              <div className="dd-form-group">

                <label className="dd-form-label">

                  Correo institucional

                </label>



                <input

                  className="dd-input"

                  value={

                    user?.email ||

                    ''

                  }

                  disabled

                />

              </div>



              <div className="dd-form-group">

                <label className="dd-form-label">

                  N.º empleado

                </label>



                <input

                  className="dd-input"

                  value={

                    numeroEmpleado

                  }

                  disabled

                />

              </div>



              <div className="dd-modal-actions">

                <button

                  type="button"

                  className="dd-btn-secondary"

                  disabled={

                    saving

                  }

                  onClick={() =>

                    setModalAbierto(

                      false

                    )

                  }

                >

                  Cancelar

                </button>



                <button

                  type="submit"

                  className="dd-btn-primary"

                  disabled={

                    saving

                  }

                >

                  {saving

                    ? 'Guardando...'

                    : 'Guardar cambios'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>

  )

}