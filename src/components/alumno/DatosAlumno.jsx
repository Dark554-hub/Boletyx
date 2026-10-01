import { MATERIAS_ALUMNO } from '../../data/mockData'
import { StatCard, PageHeader, ProfileHero, InfoGrid, Card, CardHeader, CardBody, CardTitle } from '../UI'
import { IconGrade, IconStar, IconAlert, IconCheck } from '../Icons'

export default function DatosAlumno({ user }) {
  const materias       = MATERIAS_ALUMNO[user.id] || []
  const promedio       = (materias.reduce((a, m) => a + m.promedio, 0) / materias.length).toFixed(1)
  const enRiesgo       = materias.filter(m => m.promedio < 7).length
  const enExcelencia   = materias.filter(m => m.promedio >= 9).length

  return (
    <div className="space-y-5">
      {/* Hero */}
      <ProfileHero
        avatar={user.avatar}
        name={user.nombre}
        sub={`${user.grupo} · ${user.turno} · ${user.semestre}`}
        tag={`Matrícula: ${user.matricula}`}
        right={
          <div className="text-right">
            <div className="text-4xl font-black text-white leading-none">{promedio}</div>
            <div className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>Promedio</div>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<IconGrade size={22} style={{ color: '#203A50' }} />} label="Materias" value={materias.length} />
        <StatCard icon={<IconStar size={22} style={{ color: '#16a34a' }} />} label="Excelencia" value={enExcelencia} valueColor="#16a34a" />
        <StatCard icon={<IconAlert size={22} style={{ color: '#dc2626' }} />} label="En riesgo" value={enRiesgo} valueColor="#dc2626" />
        <StatCard icon={<IconCheck size={22} style={{ color: '#3b82f6' }} />} label="Semestre" value={user.semestre} />
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Información Personal</CardTitle>
            <p className="text-[12px] mt-0.5" style={{ color: '#8FA0AF' }}>Datos registrados en el sistema</p>
          </div>
        </CardHeader>
        <div className="p-6">
          <InfoGrid fields={[
            { label: 'Nombre completo',      value: user.nombre },
            { label: 'Matrícula',            value: user.matricula },
            { label: 'Correo institucional', value: user.email },
            { label: 'Grupo',                value: user.grupo },
            { label: 'Turno',                value: user.turno },
            { label: 'Semestre',             value: user.semestre },
            { label: 'Ciclo escolar',        value: '2026–2027' },
            { label: 'Plantel',              value: 'Preparatoria Boletyx' },
          ]} />
        </div>
      </Card>
    </div>
  )
}
