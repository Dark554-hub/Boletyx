import { useEffect, useState } from 'react'
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

function gradeColor(p) {
  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  return '#dc2626'
}

function calcularPromedio(p1, p2, p3) {
  const valores = [p1, p2, p3]
    .map(Number)
    .filter(n => !Number.isNaN(n))

  if (valores.length === 0) return 0

  return valores.reduce((a, b) => a + b, 0) / valores.length
}

export default function CalifDocente({ user }) {
  const [grupos, setGrupos] = useState([])
  const [activeGrupo, setActiveGrupo] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarGrupos = async () => {
      if (!user?.docente_id) {
        setError('No se encontró el identificador del docente.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('grupos')
        .select(`
          id,
          nombre,
          ciclo_escolar,

          materias (
            id,
            nombre
          ),

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
              parcial_1,
              parcial_2,
              parcial_3,
              promedio
            )
          )
        `)
        .eq('docente_id', user.docente_id)
        .order('id')

      if (queryError) {
        console.error(queryError)
        setError('No se pudieron cargar los grupos del docente.')
        setLoading(false)
        return
      }

      const gruposFormateados = (data || []).map(g => ({
        id: g.id,
        grupo: g.nombre,
        materia: g.materias?.nombre || 'Sin materia',
        ciclo: g.ciclo_escolar || 'Sin ciclo',

        alumnos: (g.inscripciones || []).map(inscripcion => {
          const calificacion = Array.isArray(inscripcion.calificaciones)
            ? inscripcion.calificaciones[0]
            : inscripcion.calificaciones

          const p1 = Number(calificacion?.parcial_1 ?? 0)
          const p2 = Number(calificacion?.parcial_2 ?? 0)
          const p3 = Number(calificacion?.parcial_3 ?? 0)

          const promedio =
            calificacion?.promedio != null
              ? Number(calificacion.promedio)
              : calcularPromedio(p1, p2, p3)

          const perfil = inscripcion.alumnos?.perfiles

          return {
            id: inscripcion.alumnos?.id,
            inscripcion_id: inscripcion.id,
            calificacion_id: calificacion?.id ?? null,

            nombre: perfil
              ? `${perfil.nombre} ${perfil.apellido}`
              : 'Alumno sin nombre',

            matricula:
              inscripcion.alumnos?.matricula || 'Sin matrícula',

            p1,
            p2,
            p3,
            promedio,
          }
        }),
      }))

      setGrupos(gruposFormateados)

      if (gruposFormateados.length > 0) {
        setActiveGrupo(gruposFormateados[0].id)
      }

      setLoading(false)
    }

    cargarGrupos()
  }, [user?.docente_id])

  const grupo =
    grupos.find(g => g.id === activeGrupo) || grupos[0]

  const actualizarCalificacionLocal = (alumnoId, campo, valor) => {
    let numero = Number(valor)

    if (Number.isNaN(numero)) numero = 0

    numero = Math.max(0, Math.min(10, numero))

    setGrupos(prev =>
      prev.map(g => ({
        ...g,

        alumnos: g.alumnos.map(al => {
          if (al.id !== alumnoId) return al

          const actualizado = {
            ...al,
            [campo]: numero,
          }

          actualizado.promedio = calcularPromedio(
            actualizado.p1,
            actualizado.p2,
            actualizado.p3
          )

          return actualizado
        }),
      }))
    )
  }

  const handleSave = async () => {
    if (!grupo) return

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      for (const alumno of grupo.alumnos) {
        const datos = {
          inscripcion_id: alumno.inscripcion_id,
          parcial_1: alumno.p1,
          parcial_2: alumno.p2,
          parcial_3: alumno.p3,
          promedio: Number(alumno.promedio.toFixed(2)),
          updated_at: new Date().toISOString(),
        }

        let query

        if (alumno.calificacion_id) {
          query = supabase
            .from('calificaciones')
            .update(datos)
            .eq('id', alumno.calificacion_id)
        } else {
          query = supabase
            .from('calificaciones')
            .insert(datos)
        }

        const { error: saveError } = await query

        if (saveError) throw saveError
      }

      setSaved(true)
      setEditingId(null)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al guardar las calificaciones.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm" style={{ color: '#506070' }}>
        Cargando grupos...
      </div>
    )
  }

  if (error && grupos.length === 0) {
    return (
      <div className="p-6 text-sm" style={{ color: '#dc2626' }}>
        {error}
      </div>
    )
  }

  if (!grupo) {
    return (
      <div className="p-6 text-sm" style={{ color: '#506070' }}>
        Sin grupos asignados.
      </div>
    )
  }

  const promGrupo =
    grupo.alumnos.length > 0
      ? (
          grupo.alumnos.reduce(
            (total, alumno) => total + alumno.promedio,
            0
          ) / grupo.alumnos.length
        ).toFixed(1)
      : '0.0'

  const aprobados = grupo.alumnos.filter(
    alumno => alumno.promedio >= 6
  ).length

  const enRiesgo = grupo.alumnos.length - aprobados

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calificaciones"
        subtitle="Captura y consulta las calificaciones de tus grupos"
        action={
          <Pill variant="blue">
            Ciclo {grupo.ciclo}
          </Pill>
        }
      />

      {/* Selector de grupos */}
      <div className="flex flex-wrap gap-2">
        {grupos.map(g => (
          <button
            key={g.id}
            onClick={() => {
              setActiveGrupo(g.id)
              setEditingId(null)
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
            style={{
              border:
                activeGrupo === g.id
                  ? '1.5px solid #203A50'
                  : '1.5px solid #DDE4ED',

              background:
                activeGrupo === g.id
                  ? '#203A50'
                  : '#FFFFFF',

              color:
                activeGrupo === g.id
                  ? '#FFFFFF'
                  : '#506070',
            }}
          >
            {g.grupo} · {g.materia}
          </button>
        ))}
      </div>

      {/* Mensaje guardado */}
      {saved && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
          }}
        >
          <IconCheck size={16} />
          Calificaciones guardadas correctamente.
        </div>
      )}

      {/* Error */}
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

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <IconUsers
              size={22}
              style={{ color: '#203A50' }}
            />
          }
          label="Alumnos"
          value={grupo.alumnos.length}
        />

        <StatCard
          icon={
            <IconGrade
              size={22}
              style={{
                color: gradeColor(Number(promGrupo)),
              }}
            />
          }
          label="Promedio del grupo"
          value={promGrupo}
          valueColor={gradeColor(Number(promGrupo))}
        />

        <StatCard
          icon={
            <IconCheck
              size={22}
              style={{ color: '#16a34a' }}
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
              style={{ color: '#dc2626' }}
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
              {grupo.grupo} — {grupo.materia}
            </CardTitle>

            <CardSubtitle>
              Parciales P1 · P2 · P3
            </CardSubtitle>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
            style={{
              background: '#203A50',
              border: 'none',
            }}
          >
            <IconSave size={15} />

            {saving
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                style={{
                  background: '#F4F7FA',
                  borderBottom: '1px solid #DDE4ED',
                }}
              >
                <th
                  className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    width: '55px',
                  }}
                >
                  #
                </th>

                <th
                  className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '190px',
                  }}
                >
                  Alumno
                </th>

                <th
                  className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '140px',
                  }}
                >
                  Matrícula
                </th>

                {['P1', 'P2', 'P3'].map(p => (
                  <th
                    key={p}
                    className="px-3 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                    style={{
                      color: '#8FA0AF',
                      width: '90px',
                      minWidth: '90px',
                      borderLeft: '1px solid #DDE4ED',
                    }}
                  >
                    {p}
                  </th>
                ))}

                <th
                  className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-left"
                  style={{
                    color: '#8FA0AF',
                    minWidth: '200px',
                    borderLeft: '1px solid #DDE4ED',
                  }}
                >
                  Promedio
                </th>

                <th
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                  style={{
                    color: '#8FA0AF',
                    width: '150px',
                    minWidth: '150px',
                    borderLeft: '1px solid #DDE4ED',
                  }}
                >
                  Estado
                </th>

                <th
                  className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-center"
                  style={{
                    width: '140px',
                    minWidth: '140px',
                    borderLeft: '1px solid #DDE4ED',
                    color: '#8FA0AF',
                  }}
                >
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {grupo.alumnos.map((al, idx) => (
                <tr
                  key={al.id}
                  className="border-b transition-colors"
                  style={{
                    borderColor: '#DDE4ED',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = '#F4F7FA')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {/* Número */}
                  <td
                    className="px-4 py-4"
                    style={{
                      color: '#8FA0AF',
                      fontSize: 12,
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Alumno */}
                  <td
                    className="px-4 py-4 font-semibold"
                    style={{
                      color: '#0F1E2B',
                    }}
                  >
                    {al.nombre}
                  </td>

                  {/* Matrícula */}
                  <td
                    className="px-4 py-4 text-xs"
                    style={{
                      color: '#8FA0AF',
                    }}
                  >
                    {al.matricula}
                  </td>

                  {/* P1, P2 y P3 */}
                  {['p1', 'p2', 'p3'].map(p => (
                    <td
                      key={p}
                      className="px-3 py-4 text-center"
                      style={{
                        width: '90px',
                        minWidth: '90px',
                        borderLeft: '1px solid #DDE4ED',
                      }}
                    >
                      {editingId === al.id ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={al[p]}
                          onChange={e =>
                            actualizarCalificacionLocal(
                              al.id,
                              p,
                              e.target.value
                            )
                          }
                          className="w-16 text-center px-2 py-1.5 rounded-lg outline-none font-bold"
                          style={{
                            border: '1.5px solid #203A50',
                            color: '#0F1E2B',
                            background: '#FFFFFF',
                          }}
                        />
                      ) : (
                        <span
                          className="font-bold tabular-nums"
                          style={{
                            color: gradeColor(al[p]),
                          }}
                        >
                          {al[p]}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Promedio */}
                  <td
                    className="px-5 py-4"
                    style={{
                      minWidth: '200px',
                      borderLeft: '1px solid #DDE4ED',
                    }}
                  >
                    <GradeBar value={al.promedio} />
                  </td>

                  {/* Estado */}
                  <td
                    className="px-4 py-4 text-center"
                    style={{
                      minWidth: '150px',
                      borderLeft: '1px solid #DDE4ED',
                    }}
                  >
                    <Pill
                      variant={
                        al.promedio >= 6
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {al.promedio >= 6
                        ? 'Aprobado'
                        : 'Reprobado'}
                    </Pill>
                  </td>

                  {/* Editar */}
                  <td
                    className="px-4 py-4"
                    style={{
                      minWidth: '140px',
                      borderLeft: '1px solid #DDE4ED',
                    }}
                  >
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setEditingId(
                            editingId === al.id
                              ? null
                              : al.id
                          )
                        }
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                        style={{
                          background: '#F4F7FA',
                          border: '1px solid #DDE4ED',
                          color: '#203A50',
                        }}
                      >
                        <IconEdit size={13} />

                        {editingId === al.id
                          ? 'Listo'
                          : 'Editar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {grupo.alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-sm"
                    style={{
                      color: '#8FA0AF',
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
  )
}