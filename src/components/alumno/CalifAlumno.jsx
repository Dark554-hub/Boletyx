import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardBody, CardTitle, CardSubtitle, StatCard,
         PageHeader, Pill, GradeBar, TR, TD, ProfileHero, InfoGrid } from '../UI'
import { IconGrade, IconStar, IconAlert, IconCheck } from '../Icons'

function gradeColor(p) {
  if (p >= 9) return '#16a34a'
  if (p >= 7) return '#ca8a04'
  return '#dc2626'
}

function GradeState({ p }) {
  if (p >= 9) return <Pill variant="success">Excelente</Pill>
  if (p >= 6) return <Pill variant="warning">Regular</Pill>
  return <Pill variant="danger">Reprobado</Pill>
}

export default function CalifAlumno({ user }) {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarCalificaciones = async () => {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('inscripciones')
        .select(`
          id,
          grupos (
            id,
            nombre,
            materias (
              id,
              nombre
            ),
            docentes (
              id,
              perfiles (
                nombre,
                apellido
              )
            )
          ),
          calificaciones (
            parcial_1,
            parcial_2,
            parcial_3,
            promedio
          )
        `)
        .eq('alumno_id', user.alumno_id)

      if (error) {
        console.error(error)
        setError('No se pudieron cargar las calificaciones.')
        setLoading(false)
        return
      }

      const materiasFormateadas = (data || []).map(inscripcion => {
        const calificacion = Array.isArray(inscripcion.calificaciones)
      ? inscripcion.calificaciones[0]
        : inscripcion.calificaciones

        const p1 = Number(calificacion?.parcial_1 ?? 0)
        const p2 = Number(calificacion?.parcial_2 ?? 0)
        const p3 = Number(calificacion?.parcial_3 ?? 0)

        return {
          id: inscripcion.id,
          nombre: inscripcion.grupos?.materias?.nombre || 'Sin materia',

          docente: inscripcion.grupos?.docentes?.perfiles
            ? `${inscripcion.grupos.docentes.perfiles.nombre} ${inscripcion.grupos.docentes.perfiles.apellido}`
            : 'Sin docente',

          calificaciones: [
            p1,
            p2,
            p3,
          ],

          promedio: (p1 + p2 + p3) / 3,
        }
      })

      setMaterias(materiasFormateadas)
      setLoading(false)
    }

    cargarCalificaciones()
  }, [user.alumno_id])

  const promedio = materias.length
    ? (
        materias.reduce((a, m) => a + m.promedio, 0) /
        materias.length
      ).toFixed(2)
    : '0.00'

  if (loading) {
    return <div>Cargando calificaciones...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calificaciones"
        subtitle={`${user.semestre || ''}° Semestre · Ciclo escolar 2026–2027`}
        action={<Pill variant="blue">1er Parcial</Pill>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<IconGrade size={22} style={{ color: '#203A50' }} />}
          label="Promedio general"
          value={promedio}
          valueColor={gradeColor(Number(promedio))}
        />

        <StatCard
          icon={<IconCheck size={22} style={{ color: '#16a34a' }} />}
          label="Aprobadas"
          value={materias.filter(m => m.promedio >= 6).length}
          valueColor="#16a34a"
        />

        <StatCard
          icon={<IconAlert size={22} style={{ color: '#dc2626' }} />}
          label="En riesgo"
          value={materias.filter(m => m.promedio < 6).length}
          valueColor="#dc2626"
        />

        <StatCard
          icon={<IconStar size={22} style={{ color: '#ca8a04' }} />}
          label="Excelencia"
          value={materias.filter(m => m.promedio >= 9).length}
          valueColor="#ca8a04"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Detalle por materia</CardTitle>
            <CardSubtitle>Parciales P1 · P2 · P3</CardSubtitle>
          </div>
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
                {[
                  'Materia',
                  'Docente',
                  'P1',
                  'P2',
                  'P3',
                  'Promedio',
                  'Estado',
                ].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#8FA0AF' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {materias.map(m => (
                <tr
                  key={m.id}
                  className="border-b transition-colors"
                  style={{ borderColor: '#DDE4ED' }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = '#F4F7FA')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: '#0F1E2B' }}
                  >
                    {m.nombre}
                  </td>

                  <td
                    className="px-4 py-3 text-[12px]"
                    style={{ color: '#8FA0AF' }}
                  >
                    {m.docente}
                  </td>

                  {m.calificaciones.map((c, j) => (
                    <td
                      key={j}
                      className="px-4 py-3 text-center font-bold tabular-nums"
                      style={{ color: gradeColor(c) }}
                    >
                      {c}
                    </td>
                  ))}

                  <td className="px-4 py-3 min-w-[120px]">
                    <GradeBar value={m.promedio} />
                  </td>

                  <td className="px-4 py-3">
                    <GradeState p={m.promedio} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}