import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Card, Pill } from '../UI'
import { IconCalendar, IconClock } from '../Icons'

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
]

const ORDEN_DIAS = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
}

export default function HorarioTutor({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hijo, setHijo] = useState(null)
  const [horarios, setHorarios] = useState([])

  useEffect(() => {
    cargarHorario()
  }, [user?.id])

  const cargarHorario = async () => {
    if (!user?.id) {
      setError('No se encontró la información del tutor.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Obtener alumno vinculado al tutor
      const {
        data: relacion,
        error: relacionError,
      } = await supabase
        .from('tutor_alumnos')
        .select(`
          alumno_id,
          alumnos (
            id,
            perfil_id,
            matricula,
            semestre,
            grupo,
            turno,
            perfiles (
              nombre,
              apellido
            )
          )
        `)
        .eq('tutor_id', user.id)
        .limit(1)
        .maybeSingle()

      if (relacionError) {
        throw relacionError
      }

      if (!relacion?.alumnos) {
        setError(
          'No se encontró un alumno vinculado a este tutor.'
        )
        return
      }

      const alumno = relacion.alumnos

      // 2. Obtener inscripción y grupo actual
      const {
        data: inscripcion,
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
            ciclo_escolar
          )
        `)
        .eq('alumno_id', alumno.id)
        .limit(1)
        .maybeSingle()

      if (inscripcionError) {
        throw inscripcionError
      }

      if (!inscripcion?.grupo_id) {
        setError(
          'El alumno todavía no tiene un grupo asignado.'
        )
        return
      }

      const grupo = inscripcion.grupos

      const nombreCompleto = [
        alumno.perfiles?.nombre,
        alumno.perfiles?.apellido,
      ]
        .filter(Boolean)
        .join(' ')

      setHijo({
        id: alumno.id,
        nombre: nombreCompleto || 'Alumno',
        matricula: alumno.matricula || '—',
        grupo: grupo?.nombre || alumno.grupo || '—',
        turno: grupo?.turno || alumno.turno || '—',
        semestre:
          grupo?.semestre ||
          alumno.semestre ||
          '—',
        ciclo:
          grupo?.ciclo_escolar ||
          '2026-2027',
      })

      // 3. Obtener las materias pertenecientes al grupo
      const {
        data: grupoMaterias,
        error: grupoMateriasError,
      } = await supabase
        .from('grupo_materias')
        .select('id')
        .eq('grupo_id', inscripcion.grupo_id)

      if (grupoMateriasError) {
        throw grupoMateriasError
      }

      const grupoMateriaIds = (grupoMaterias || [])
        .map((item) => item.id)

      if (grupoMateriaIds.length === 0) {
        setHorarios([])
        return
      }

      // 4. Obtener horario real de las materias del grupo
      const {
        data: horarioData,
        error: horarioError,
      } = await supabase
        .from('horarios')
        .select(`
          id,
          dia,
          hora_inicio,
          hora_fin,
          aula,
          grupo_materia_id,
          grupo_materias (
            id,
            materias (
              id,
              nombre
            )
          )
        `)
        .in('grupo_materia_id', grupoMateriaIds)

      if (horarioError) {
        throw horarioError
      }

      const horarioReal = (horarioData || [])
        .map((item) => ({
          id: item.id,
          dia: item.dia,
          horaInicio: normalizarHora(item.hora_inicio),
          horaFin: normalizarHora(item.hora_fin),
          aula: item.aula || '—',
          materia:
            item.grupo_materias?.materias?.nombre ||
            'Materia',
        }))
        .sort((a, b) => {
          const diaA = ORDEN_DIAS[a.dia] || 99
          const diaB = ORDEN_DIAS[b.dia] || 99

          if (diaA !== diaB) {
            return diaA - diaB
          }

          return a.horaInicio.localeCompare(
            b.horaInicio
          )
        })

      setHorarios(horarioReal)
    } catch (err) {
      console.error('ERROR HORARIO TUTOR:', err)

      setError(
        'No fue posible cargar el horario del alumno.'
      )

      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  // Todas las franjas horarias existentes
  const horas = useMemo(() => {
    const mapa = new Map()

    horarios.forEach((item) => {
      const clave = `${item.horaInicio}-${item.horaFin}`

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          inicio: item.horaInicio,
          fin: item.horaFin,
        })
      }
    })

    return Array.from(mapa.values()).sort(
      (a, b) => a.inicio.localeCompare(b.inicio)
    )
  }, [horarios])

  // Permite encontrar rápidamente una clase
  const horarioPorCelda = useMemo(() => {
    const mapa = {}

    horarios.forEach((item) => {
      const clave =
        `${item.dia}-${item.horaInicio}-${item.horaFin}`

      mapa[clave] = item
    })

    return mapa
  }, [horarios])

  const today = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ][new Date().getDay()]

  const clasesHoy = horarios.filter(
    (item) => item.dia === today
  )

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#8FA0AF' }}
      >
        Cargando horario...
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl text-sm"
        style={{
          color: '#dc2626',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
        }}
      >
        {error}
      </div>
    )
  }

  if (!hijo) {
    return (
      <p
        className="p-6 text-sm"
        style={{ color: '#8FA0AF' }}
      >
        No se encontró el alumno vinculado.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Horario de ${
          hijo.nombre.split(' ')[0]
        }`}
        subtitle={`Grupo ${hijo.grupo} · Turno ${
          hijo.turno
        } · Ciclo escolar ${hijo.ciclo}`}
        action={
          <Pill variant="mint">
            {hijo.grupo}
          </Pill>
        }
      />

      {/* Clases de hoy */}
      {DIAS.includes(today) && (
        <div
          className="flex items-start gap-4 p-4 rounded-2xl border"
          style={{
            background: 'rgba(32,58,80,.04)',
            borderColor: '#DDE4ED',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(32,58,80,.08)',
            }}
          >
            <IconCalendar
              size={18}
              style={{ color: '#203A50' }}
            />
          </div>

          <div>
            <p
              className="text-[13px] font-bold"
              style={{ color: '#203A50' }}
            >
              Hoy — {today}
            </p>

            {clasesHoy.length > 0 ? (
              <div
                className="text-[12px] mt-1 space-y-1"
                style={{ color: '#506070' }}
              >
                {clasesHoy.map((clase) => (
                  <p key={clase.id}>
                    {clase.horaInicio}–
                    {clase.horaFin} ·{' '}
                    {clase.materia} · Aula{' '}
                    {clase.aula}
                  </p>
                ))}
              </div>
            ) : (
              <p
                className="text-[12px] mt-0.5"
                style={{ color: '#506070' }}
              >
                No hay clases registradas para hoy.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Horario */}
      <Card className="overflow-hidden">
        {horarios.length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: '#8FA0AF' }}
          >
            No hay horario registrado para este grupo.
          </div>
        ) : (
          <>
            {/* Encabezados */}
            <div
              className="grid text-[11px] font-black uppercase tracking-wider"
              style={{
                gridTemplateColumns:
                  '90px repeat(5,minmax(120px,1fr))',
                background: '#152938',
                color: 'rgba(255,255,255,.55)',
                borderBottom:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div className="flex items-center justify-center py-3">
                <IconClock
                  size={13}
                  style={{
                    color:
                      'rgba(255,255,255,.4)',
                  }}
                />
              </div>

              {DIAS.map((dia) => (
                <div
                  key={dia}
                  className="py-3 text-center"
                  style={{
                    color:
                      dia === today
                        ? '#CEEEC3'
                        : undefined,
                    fontWeight:
                      dia === today
                        ? 800
                        : undefined,
                  }}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Filas */}
            <div className="overflow-x-auto">
              {horas.map((hora) => (
                <div
                  key={`${hora.inicio}-${hora.fin}`}
                  className="grid border-b"
                  style={{
                    gridTemplateColumns:
                      '90px repeat(5,minmax(120px,1fr))',
                    borderColor: '#EBF0F5',
                  }}
                >
                  <div
                    className="flex flex-col items-center justify-center text-[11px] font-bold py-3 border-r"
                    style={{
                      color: '#8FA0AF',
                      borderColor: '#EBF0F5',
                      background: '#F4F7FA',
                    }}
                  >
                    <span>{hora.inicio}</span>

                    <span
                      style={{
                        fontSize: '9px',
                        opacity: 0.7,
                      }}
                    >
                      {hora.fin}
                    </span>
                  </div>

                  {DIAS.map((dia) => {
                    const clave =
                      `${dia}-${hora.inicio}-${hora.fin}`

                    const clase =
                      horarioPorCelda[clave]

                    return (
                      <div
                        key={clave}
                        className="min-h-[70px] py-3 px-2 text-center border-r flex flex-col items-center justify-center"
                        style={{
                          borderColor: '#EBF0F5',
                          background:
                            dia === today
                              ? 'rgba(206,238,195,.12)'
                              : undefined,
                        }}
                      >
                        {clase ? (
                          <>
                            <span
                              className="text-[12px] font-bold"
                              style={{
                                color: '#203A50',
                              }}
                            >
                              {clase.materia}
                            </span>

                            <span
                              className="text-[10px] mt-1"
                              style={{
                                color: '#8FA0AF',
                              }}
                            >
                              Aula {clase.aula}
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              color: '#C0CAC2',
                            }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Datos del alumno */}
            <div
              className="flex flex-wrap gap-2 px-5 py-4 border-t"
              style={{
                borderColor: '#EBF0F5',
              }}
            >
              <Pill variant="blue">
                Matrícula {hijo.matricula}
              </Pill>

              <Pill variant="mint">
                Grupo {hijo.grupo}
              </Pill>

              <Pill variant="blue">
                Turno {hijo.turno}
              </Pill>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function normalizarHora(hora) {
  if (!hora) {
    return ''
  }

  return String(hora).slice(0, 5)
}