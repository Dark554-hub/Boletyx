import { USERS, MATERIAS_ALUMNO } from '../../data/mockData'
import { Card, CardHeader, CardTitle, CardSubtitle, StatCard, PageHeader, Pill, GradeBar } from '../UI'
import { IconGrade, IconCheck, IconAlert, IconStar } from '../Icons'

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

export default function CalifTutor({ user }) {
  const hijo = USERS.find(u => u.id === user.hijosIds?.[0])
  if (!hijo) return <p className="p-6 text-sm" style={{ color: '#8FA0AF' }}>No se encontró el alumno vinculado.</p>

  const materias = MATERIAS_ALUMNO[hijo.id] || []
  const promedio = (materias.reduce((a, m) => a + m.promedio, 0) / (materias.length || 1)).toFixed(2)

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Calificaciones de ${hijo.nombre.split(' ')[0]}`}
        subtitle={`${hijo.grupo} · ${hijo.semestre} · Ciclo escolar 2026–2027`}
        action={<Pill variant="mint">Alumno tutorado</Pill>}
      />

      {/* Stat Cards */}
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
          value={materias.filter(m => m.promedio < 7).length}
          valueColor="#dc2626"
        />
        <StatCard
          icon={<IconStar size={22} style={{ color: '#ca8a04' }} />}
          label="En excelencia"
          value={materias.filter(m => m.promedio >= 9).length}
          valueColor="#ca8a04"
        />
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Detalle por materia — {hijo.nombre}</CardTitle>
            <CardSubtitle>Evaluaciones parciales P1 · P2 · P3 · P4</CardSubtitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#F4F7FA', borderBottom: '1px solid #DDE4ED' }}>
                {['Materia', 'Docente', 'P1', 'P2', 'P3', 'P4', 'Promedio', 'Estado'].map(h => (
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
              {materias.map((m) => (
                <tr
                  key={m.id}
                  className="border-b transition-colors"
                  style={{ borderColor: '#DDE4ED' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F4F7FA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: '#0F1E2B' }}>{m.nombre}</td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: '#8FA0AF' }}>{m.docente}</td>
                  {m.calificaciones.map((c, j) => (
                    <td key={j} className="px-4 py-3 text-center font-bold tabular-nums" style={{ color: gradeColor(c) }}>
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
