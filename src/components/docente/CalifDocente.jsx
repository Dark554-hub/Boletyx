import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  StatCard,
  PageHeader,
  Pill,
  GradeBar,
} from '../UI'

import {
  IconUsers,
  IconGrade,
  IconCheck,
  IconAlert,
  IconSave,
  IconEdit,
} from '../Icons'

function gradeColor(promedio) {
  if (promedio >= 9) return '#16a34a'
  if (promedio >= 7) return '#ca8a04'
  return '#dc2626'
}

function normalizarParcial(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return ''
  }

  const numero = Number(valor)

  return Number.isFinite(numero) ? numero : ''
}

function calcularPromedio(p1, p2, p3) {
  const valores = [p1, p2, p3]
    .filter(
      valor =>
        valor !== '' &&
        valor !== null &&
        valor !== undefined
    )
    .map(Number)
    .filter(Number.isFinite)

  if (valores.length === 0) {
    return null
  }

  return (
    valores.reduce(
      (total, valor) => total + valor,
      0
    ) / valores.length
  )
}

function validarParcial(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return true
  }

  const numero = Number(valor)

  return (
    Number.isFinite(numero) &&
    numero >= 0 &&
    numero <= 10
  )
}

function textoParcial(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return 'Sin captura'
  }

  return Number(valor).toFixed(1)
}

const MODAL_STYLES = `
.calif-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 30, 43, .58);
  backdrop-filter: blur(3px);
}

.calif-modal {
  width: 100%;
  max-width: 560px;
  overflow: hidden;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, .24);
}

.calif-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid #DDE4ED;
}

.calif-modal-title {
  color: #0F1E2B;
  font-size: 17px;
  font-weight: 800;
}

.calif-modal-subtitle {
  margin-top: 3px;
  color: #8FA0AF;
  font-size: 12px;
}

.calif-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #506070;
  background: #F4F7FA;
  border: 1px solid #DDE4ED;
  border-radius: 9px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.calif-modal-body {
  padding: 22px;
}

.calif-modal-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.calif-info-box {
  padding: 11px 12px;
  background: #F4F7FA;
  border: 1px solid #E4EBEF;
  border-radius: 11px;
}

.calif-info-label {
  margin-bottom: 3px;
  color: #8FA0AF;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.calif-info-value {
  color: #203A50;
  font-size: 13px;
  font-weight: 700;
}

.calif-input-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.calif-field label {
  display: block;
  margin-bottom: 6px;
  color: #506070;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.calif-input {
  width: 100%;
  padding: 10px 11px;
  color: #0F1E2B;
  background: #fff;
  border: 1.5px solid #DDE4ED;
  border-radius: 10px;
  outline: none;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.calif-input:focus {
  border-color: #203A50;
  box-shadow: 0 0 0 3px rgba(32, 58, 80, .08);
}

.calif-help {
  margin-top: 7px;
  color: #8FA0AF;
  font-size: 11px;
}

.calif-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 20px;
  padding: 15px 16px;
  background: #F8FAFB;
  border: 1px solid #DDE4ED;
  border-radius: 12px;
}

.calif-preview-label {
  color: #506070;
  font-size: 12px;
  font-weight: 700;
}

.calif-preview-value {
  margin-top: 2px;
  font-size: 24px;
  font-weight: 900;
}

.calif-modal-error {
  margin-top: 16px;
  padding: 10px 12px;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.calif-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.calif-btn-secondary,
.calif-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 15px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.calif-btn-secondary {
  color: #506070;
  background: #fff;
  border: 1px solid #DDE4ED;
}

.calif-btn-primary {
  color: #fff;
  background: #203A50;
  border: 1px solid #203A50;
}

.calif-btn-secondary:disabled,
.calif-btn-primary:disabled {
  opacity: .55;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .calif-input-grid,
  .calif-modal-info {
    grid-template-columns: 1fr;
  }

  .calif-modal-actions {
    flex-direction: column-reverse;
  }

  .calif-btn-secondary,
  .calif-btn-primary {
    width: 100%;
  }
}
`

export default function CalifDocente({ user }) {
  const [asignaciones, setAsignaciones] = useState([])
  const [activeAsignacion, setActiveAsignacion] =
    useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [modalAlumno, setModalAlumno] = useState(null)

  const [formNotas, setFormNotas] = useState({
    p1: '',
    p2: '',
    p3: '',
  })

  const [modalError, setModalError] = useState('')

  useEffect(() => {
    const cargarAsignaciones = async () => {
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
        const {
          data,
          error: queryError,
        } = await supabase
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

                alumnos (
                  id,
                  matricula,

                  perfiles (
                    nombre,
                    apellido
                  )
                ),

                calificaciones (
                  id,
                  grupo_materia_id,
                  parcial_1,
                  parcial_2,
                  parcial_3,
                  promedio
                )
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
          .order('id')

        if (queryError) {
          throw queryError
        }

        const asignacionesFormateadas = (
          data || []
        ).map(asignacion => {
          const grupo = Array.isArray(
            asignacion.grupos
          )
            ? asignacion.grupos[0]
            : asignacion.grupos

          const materia = Array.isArray(
            asignacion.materias
          )
            ? asignacion.materias[0]
            : asignacion.materias

          const alumnos = (
            grupo?.inscripciones || []
          ).map(inscripcion => {
            const alumno = Array.isArray(
              inscripcion.alumnos
            )
              ? inscripcion.alumnos[0]
              : inscripcion.alumnos

            const perfil = Array.isArray(
              alumno?.perfiles
            )
              ? alumno.perfiles[0]
              : alumno?.perfiles

            const calificaciones =
              inscripcion.calificaciones ||
              []

            const calificacion =
              calificaciones.find(
                item =>
                  Number(
                    item.grupo_materia_id
                  ) ===
                  Number(asignacion.id)
              )

            const p1 = normalizarParcial(
              calificacion?.parcial_1
            )

            const p2 = normalizarParcial(
              calificacion?.parcial_2
            )

            const p3 = normalizarParcial(
              calificacion?.parcial_3
            )

            const promedioCalculado =
              calcularPromedio(
                p1,
                p2,
                p3
              )

            const promedioBD =
              calificacion?.promedio

            const promedio =
              promedioBD !== null &&
              promedioBD !== undefined &&
              promedioBD !== ''
                ? Number(promedioBD)
                : promedioCalculado

            return {
              id: alumno?.id,

              inscripcion_id:
                inscripcion.id,

              calificacion_id:
                calificacion?.id ??
                null,

              grupo_materia_id:
                asignacion.id,

              nombre: perfil
                ? `${perfil.nombre} ${perfil.apellido}`
                : 'Alumno sin nombre',

              matricula:
                alumno?.matricula ||
                'Sin matrícula',

              p1,
              p2,
              p3,

              promedio:
                Number.isFinite(
                  promedio
                )
                  ? promedio
                  : null,
            }
          })

          return {
            id: asignacion.id,

            grupo_id:
              asignacion.grupo_id,

            materia_id:
              asignacion.materia_id,

            grupo:
              grupo?.nombre ||
              'Sin grupo',

            semestre:
              grupo?.semestre ??
              null,

            turno:
              grupo?.turno ||
              null,

            ciclo:
              grupo?.ciclo_escolar ||
              'Sin ciclo',

            materia:
              materia?.nombre ||
              'Sin materia',

            alumnos,
          }
        })

        setAsignaciones(
          asignacionesFormateadas
        )

        if (
          asignacionesFormateadas.length >
          0
        ) {
          setActiveAsignacion(
            asignacionesFormateadas[0]
              .id
          )
        }
      } catch (err) {
        console.error(
          'Error cargando asignaciones del docente:',
          err
        )

        setError(
          'No se pudieron cargar los grupos y materias del docente.'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarAsignaciones()
  }, [user?.docente_id])

  const asignacion =
    asignaciones.find(
      item =>
        item.id ===
        activeAsignacion
    ) || asignaciones[0]

  const promedioModal = useMemo(
    () =>
      calcularPromedio(
        formNotas.p1,
        formNotas.p2,
        formNotas.p3
      ),
    [
      formNotas.p1,
      formNotas.p2,
      formNotas.p3,
    ]
  )

  const abrirModal = alumno => {
    setSaved(false)
    setError('')
    setModalError('')

    setFormNotas({
      p1:
        alumno.p1 === null ||
        alumno.p1 === undefined
          ? ''
          : alumno.p1,

      p2:
        alumno.p2 === null ||
        alumno.p2 === undefined
          ? ''
          : alumno.p2,

      p3:
        alumno.p3 === null ||
        alumno.p3 === undefined
          ? ''
          : alumno.p3,
    })

    setModalAlumno(alumno)
  }

  const cerrarModal = () => {
    if (saving) {
      return
    }

    setModalAlumno(null)
    setModalError('')
  }

  const cambiarNota = (
    campo,
    valor
  ) => {
    if (valor === '') {
      setFormNotas(actual => ({
        ...actual,
        [campo]: '',
      }))

      return
    }

    // Evita letras y valores no numéricos.
    const numero = Number(valor)

    if (!Number.isFinite(numero)) {
      return
    }

    setFormNotas(actual => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const actualizarAlumnoLocal = (
    alumnoId,
    cambios
  ) => {
    setAsignaciones(prev =>
      prev.map(item => {
        if (
          item.id !==
          asignacion?.id
        ) {
          return item
        }

        return {
          ...item,

          alumnos: item.alumnos.map(
            alumno =>
              alumno.id === alumnoId
                ? {
                    ...alumno,
                    ...cambios,
                  }
                : alumno
          ),
        }
      })
    )
  }

  const guardarAlumno = async e => {
    e.preventDefault()

    if (
      !modalAlumno ||
      !asignacion
    ) {
      return
    }

    setModalError('')
    setError('')
    setSaved(false)

    const {
      p1,
      p2,
      p3,
    } = formNotas

    if (
      !validarParcial(p1) ||
      !validarParcial(p2) ||
      !validarParcial(p3)
    ) {
      setModalError(
        'Cada parcial debe estar entre 0 y 10. También puedes dejarlo vacío como "Sin captura".'
      )

      return
    }

    const promedio =
      calcularPromedio(
        p1,
        p2,
        p3
      )

    const datos = {
      inscripcion_id:
        modalAlumno.inscripcion_id,

      grupo_materia_id:
        modalAlumno.grupo_materia_id,

      parcial_1:
        p1 === ''
          ? null
          : Number(p1),

      parcial_2:
        p2 === ''
          ? null
          : Number(p2),

      parcial_3:
        p3 === ''
          ? null
          : Number(p3),

      promedio:
        promedio === null
          ? null
          : Number(
              promedio.toFixed(2)
            ),

      updated_at:
        new Date().toISOString(),
    }

    setSaving(true)

    try {
      let calificacionId =
        modalAlumno.calificacion_id

      if (
        modalAlumno.calificacion_id
      ) {
        const {
          error: updateError,
        } = await supabase
          .from('calificaciones')
          .update(datos)
          .eq(
            'id',
            modalAlumno.calificacion_id
          )

        if (updateError) {
          throw updateError
        }
      } else {
        const {
          data: creada,
          error: insertError,
        } = await supabase
          .from('calificaciones')
          .insert(datos)
          .select('id')
          .single()

        if (insertError) {
          throw insertError
        }

        calificacionId =
          creada?.id ?? null
      }

      actualizarAlumnoLocal(
        modalAlumno.id,
        {
          calificacion_id:
            calificacionId,

          p1:
            p1 === ''
              ? ''
              : Number(p1),

          p2:
            p2 === ''
              ? ''
              : Number(p2),

          p3:
            p3 === ''
              ? ''
              : Number(p3),

          promedio,
        }
      )

      setModalAlumno(null)
      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error(
        'Error guardando la calificación:',
        err
      )

      setModalError(
        err?.message ||
          'No se pudo guardar la calificación.'
      )
    } finally {
      setSaving(false)
    }
  }

  const formatearTurno = turno => {
    if (!turno) {
      return 'Sin turno'
    }

    return (
      turno
        .charAt(0)
        .toUpperCase() +
      turno.slice(1)
    )
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando grupos...
      </div>
    )
  }

  if (
    error &&
    asignaciones.length === 0
  ) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#dc2626',
        }}
      >
        {error}
      </div>
    )
  }

  if (!asignacion) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        No tienes materias asignadas.
      </div>
    )
  }

  const alumnosConPromedio =
    asignacion.alumnos.filter(
      alumno =>
        Number.isFinite(
          alumno.promedio
        )
    )

  const promGrupo =
    alumnosConPromedio.length > 0
      ? (
          alumnosConPromedio.reduce(
            (
              total,
              alumno
            ) =>
              total +
              alumno.promedio,
            0
          ) /
          alumnosConPromedio.length
        ).toFixed(1)
      : '—'

  const aprobados =
    alumnosConPromedio.filter(
      alumno =>
        alumno.promedio >= 6
    ).length

  const enRiesgo =
    alumnosConPromedio.filter(
      alumno =>
        alumno.promedio < 6
    ).length

  return (
    <>
      <style>
        {MODAL_STYLES}
      </style>

      <div className="space-y-5">
        <PageHeader
          title="Calificaciones"
          subtitle="Captura y consulta las calificaciones de tus materias"
          action={
            <Pill variant="blue">
              Ciclo{' '}
              {asignacion.ciclo}
            </Pill>
          }
        />

        {/* Selector de asignaciones */}
        <div className="flex flex-wrap gap-2">
          {asignaciones.map(
            item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveAsignacion(
                    item.id
                  )
                  setModalAlumno(
                    null
                  )
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                style={{
                  border:
                    activeAsignacion ===
                    item.id
                      ? '1.5px solid #203A50'
                      : '1.5px solid #DDE4ED',

                  background:
                    activeAsignacion ===
                    item.id
                      ? '#203A50'
                      : '#FFFFFF',

                  color:
                    activeAsignacion ===
                    item.id
                      ? '#FFFFFF'
                      : '#506070',
                }}
              >
                {item.grupo} ·{' '}
                {item.materia}
              </button>
            )
          )}
        </div>

        {/* Información */}
        <div
          className="px-4 py-3 rounded-xl text-xs"
          style={{
            background: '#F4F7FA',
            border:
              '1px solid #DDE4ED',
            color: '#506070',
          }}
        >
          Grupo{' '}
          <strong>
            {asignacion.grupo}
          </strong>
          {' · '}
          Semestre{' '}
          <strong>
            {asignacion.semestre ??
              '—'}
          </strong>
          {' · '}
          Turno{' '}
          <strong>
            {formatearTurno(
              asignacion.turno
            )}
          </strong>
          {' · '}
          Materia{' '}
          <strong>
            {asignacion.materia}
          </strong>
        </div>

        {saved && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: '#dcfce7',
              border:
                '1px solid #86efac',
              color: '#166534',
            }}
          >
            <IconCheck size={16} />

            Calificación guardada correctamente.
          </div>
        )}

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

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={
              <IconUsers
                size={22}
                style={{
                  color: '#203A50',
                }}
              />
            }
            label="Alumnos"
            value={
              asignacion.alumnos
                .length
            }
          />

          <StatCard
            icon={
              <IconGrade
                size={22}
                style={{
                  color:
                    promGrupo === '—'
                      ? '#8FA0AF'
                      : gradeColor(
                          Number(
                            promGrupo
                          )
                        ),
                }}
              />
            }
            label="Promedio del grupo"
            value={promGrupo}
            valueColor={
              promGrupo === '—'
                ? '#8FA0AF'
                : gradeColor(
                    Number(
                      promGrupo
                    )
                  )
            }
          />

          <StatCard
            icon={
              <IconCheck
                size={22}
                style={{
                  color: '#16a34a',
                }}
              />
            }
            label="Aprobados"
            value={aprobados}
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
            value={enRiesgo}
            valueColor="#dc2626"
          />
        </div>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                {asignacion.grupo}
                {' — '}
                {
                  asignacion.materia
                }
              </CardTitle>

              <CardSubtitle>
                Parciales P1 · P2 · P3
              </CardSubtitle>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  style={{
                    background:
                      '#F4F7FA',
                    borderBottom:
                      '1px solid #DDE4ED',
                  }}
                >
                  <th
                    className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                    style={{
                      color:
                        '#8FA0AF',
                      width: '55px',
                    }}
                  >
                    #
                  </th>

                  <th
                    className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                    style={{
                      color:
                        '#8FA0AF',
                      minWidth:
                        '190px',
                    }}
                  >
                    Alumno
                  </th>

                  <th
                    className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                    style={{
                      color:
                        '#8FA0AF',
                      minWidth:
                        '140px',
                    }}
                  >
                    Matrícula
                  </th>

                  {[
                    'P1',
                    'P2',
                    'P3',
                  ].map(parcial => (
                    <th
                      key={parcial}
                      className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                      style={{
                        color:
                          '#8FA0AF',
                        width:
                          '100px',
                        minWidth:
                          '100px',
                        borderLeft:
                          '1px solid #DDE4ED',
                      }}
                    >
                      {parcial}
                    </th>
                  ))}

                  <th
                    className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-left"
                    style={{
                      color:
                        '#8FA0AF',
                      minWidth:
                        '200px',
                      borderLeft:
                        '1px solid #DDE4ED',
                    }}
                  >
                    Promedio
                  </th>

                  <th
                    className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                    style={{
                      color:
                        '#8FA0AF',
                      width:
                        '150px',
                      minWidth:
                        '150px',
                      borderLeft:
                        '1px solid #DDE4ED',
                    }}
                  >
                    Estado
                  </th>

                  <th
                    className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                    style={{
                      color:
                        '#8FA0AF',
                      width:
                        '160px',
                      minWidth:
                        '160px',
                      borderLeft:
                        '1px solid #DDE4ED',
                    }}
                  >
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {asignacion.alumnos.map(
                  (alumno, idx) => {
                    const tienePromedio =
                      Number.isFinite(
                        alumno.promedio
                      )

                    return (
                      <tr
                        key={`${asignacion.id}-${alumno.id}`}
                        className="border-b transition-colors"
                        style={{
                          borderColor:
                            '#DDE4ED',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background =
                            '#F4F7FA'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background =
                            'transparent'
                        }}
                      >
                        <td
                          className="px-4 py-4"
                          style={{
                            color:
                              '#8FA0AF',
                            fontSize:
                              12,
                          }}
                        >
                          {idx + 1}
                        </td>

                        <td
                          className="px-4 py-4 font-semibold"
                          style={{
                            color:
                              '#0F1E2B',
                          }}
                        >
                          {
                            alumno.nombre
                          }
                        </td>

                        <td
                          className="px-4 py-4 text-xs"
                          style={{
                            color:
                              '#8FA0AF',
                          }}
                        >
                          {
                            alumno.matricula
                          }
                        </td>

                        {[
                          'p1',
                          'p2',
                          'p3',
                        ].map(
                          parcial => (
                            <td
                              key={
                                parcial
                              }
                              className="px-3 py-4 text-center"
                              style={{
                                width:
                                  '100px',
                                minWidth:
                                  '100px',
                                borderLeft:
                                  '1px solid #DDE4ED',
                              }}
                            >
                              {alumno[
                                parcial
                              ] ===
                                '' ||
                              alumno[
                                parcial
                              ] ===
                                null ||
                              alumno[
                                parcial
                              ] ===
                                undefined ? (
                                <span
                                  style={{
                                    color:
                                      '#8FA0AF',
                                    fontSize:
                                      11,
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Sin
                                  captura
                                </span>
                              ) : (
                                <span
                                  className="font-bold tabular-nums"
                                  style={{
                                    color:
                                      gradeColor(
                                        Number(
                                          alumno[
                                            parcial
                                          ]
                                        )
                                      ),
                                  }}
                                >
                                  {textoParcial(
                                    alumno[
                                      parcial
                                    ]
                                  )}
                                </span>
                              )}
                            </td>
                          )
                        )}

                        <td
                          className="px-5 py-4"
                          style={{
                            minWidth:
                              '200px',
                            borderLeft:
                              '1px solid #DDE4ED',
                          }}
                        >
                          {tienePromedio ? (
                            <GradeBar
                              value={
                                alumno.promedio
                              }
                            />
                          ) : (
                            <span
                              style={{
                                color:
                                  '#8FA0AF',
                                fontSize:
                                  12,
                              }}
                            >
                              Sin captura
                            </span>
                          )}
                        </td>

                        <td
                          className="px-4 py-4 text-center"
                          style={{
                            minWidth:
                              '150px',
                            borderLeft:
                              '1px solid #DDE4ED',
                          }}
                        >
                          {tienePromedio ? (
                            <Pill
                              variant={
                                alumno.promedio >=
                                6
                                  ? 'success'
                                  : 'danger'
                              }
                            >
                              {alumno.promedio >=
                              6
                                ? 'Aprobado'
                                : 'Reprobado'}
                            </Pill>
                          ) : (
                            <Pill variant="blue">
                              Pendiente
                            </Pill>
                          )}
                        </td>

                        <td
                          className="px-4 py-4"
                          style={{
                            minWidth:
                              '160px',
                            borderLeft:
                              '1px solid #DDE4ED',
                          }}
                        >
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                abrirModal(
                                  alumno
                                )
                              }
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                              style={{
                                background:
                                  '#F4F7FA',
                                border:
                                  '1px solid #DDE4ED',
                                color:
                                  '#203A50',
                              }}
                            >
                              <IconEdit
                                size={13}
                              />

                              Modificar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                )}

                {asignacion.alumnos
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-sm"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      No hay alumnos inscritos en este grupo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODAL */}
      {modalAlumno && (
        <div
          className="calif-modal-backdrop"
          onClick={cerrarModal}
        >
          <div
            className="calif-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="calif-modal-head">
              <div>
                <div className="calif-modal-title">
                  Modificar calificaciones
                </div>

                <div className="calif-modal-subtitle">
                  Ingresa una calificación de 0 a 10 o deja el campo vacío si todavía no se ha capturado.
                </div>
              </div>

              <button
                type="button"
                className="calif-modal-close"
                onClick={cerrarModal}
                disabled={saving}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form
              className="calif-modal-body"
              onSubmit={
                guardarAlumno
              }
            >
              <div className="calif-modal-info">
                <div className="calif-info-box">
                  <div className="calif-info-label">
                    Alumno
                  </div>

                  <div className="calif-info-value">
                    {
                      modalAlumno.nombre
                    }
                  </div>
                </div>

                <div className="calif-info-box">
                  <div className="calif-info-label">
                    Matrícula
                  </div>

                  <div className="calif-info-value">
                    {
                      modalAlumno.matricula
                    }
                  </div>
                </div>

                <div className="calif-info-box">
                  <div className="calif-info-label">
                    Grupo
                  </div>

                  <div className="calif-info-value">
                    {
                      asignacion.grupo
                    }
                  </div>
                </div>

                <div className="calif-info-box">
                  <div className="calif-info-label">
                    Materia
                  </div>

                  <div className="calif-info-value">
                    {
                      asignacion.materia
                    }
                  </div>
                </div>
              </div>

              <div className="calif-input-grid">
                {[
                  {
                    campo: 'p1',
                    label: 'Parcial 1',
                  },
                  {
                    campo: 'p2',
                    label: 'Parcial 2',
                  },
                  {
                    campo: 'p3',
                    label: 'Parcial 3',
                  },
                ].map(item => (
                  <div
                    className="calif-field"
                    key={
                      item.campo
                    }
                  >
                    <label>
                      {item.label}
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="calif-input"
                      placeholder="—"
                      value={
                        formNotas[
                          item.campo
                        ]
                      }
                      onChange={e =>
                        cambiarNota(
                          item.campo,
                          e.target
                            .value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="calif-help">
                Un parcial vacío se guardará como “Sin captura” y no se contará para el promedio.
              </div>

              <div className="calif-preview">
                <div>
                  <div className="calif-preview-label">
                    Promedio en tiempo real
                  </div>

                  <div
                    className="calif-preview-value"
                    style={{
                      color:
                        promedioModal ===
                        null
                          ? '#8FA0AF'
                          : gradeColor(
                              promedioModal
                            ),
                    }}
                  >
                    {promedioModal ===
                    null
                      ? '—'
                      : promedioModal.toFixed(
                          1
                        )}
                  </div>
                </div>

                {promedioModal ===
                null ? (
                  <Pill variant="blue">
                    Pendiente
                  </Pill>
                ) : (
                  <Pill
                    variant={
                      promedioModal >=
                      6
                        ? 'success'
                        : 'danger'
                    }
                  >
                    {promedioModal >=
                    6
                      ? 'Aprobado'
                      : 'Reprobado'}
                  </Pill>
                )}
              </div>

              {modalError && (
                <div className="calif-modal-error">
                  {modalError}
                </div>
              )}

              <div className="calif-modal-actions">
                <button
                  type="button"
                  className="calif-btn-secondary"
                  onClick={cerrarModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="calif-btn-primary"
                  disabled={saving}
                >
                  <IconSave
                    size={15}
                  />

                  {saving
                    ? 'Guardando...'
                    : 'Guardar calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
