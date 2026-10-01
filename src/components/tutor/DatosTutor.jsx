import { USERS, MATERIAS_ALUMNO } from '../../data/mockData'
import { Card, CardHeader, CardTitle, CardSubtitle, StatCard, Pill, ProfileHero, InfoGrid } from '../UI'
import { IconGrade, IconCheck, IconAlert } from '../Icons'

export default function DatosTutor({ user }) {
  const hijo = USERS.find(u => u.id === user.hijosIds?.[0])
  if (!hijo) return <p className="p-6 text-sm" style={{ color: '#8FA0AF' }}>No se encontró información del alumno.</p>

  const materias = MATERIAS_ALUMNO[hijo.id] || []
  const promedio = (materias.reduce((a, m) => a + m.promedio, 0) / (materias.length || 1)).toFixed(2)

  return (
    <div className="space-y-5">
      {/* Tutor hero */}
      <ProfileHero
        avatar={user.avatar}
        name={user.nombre}
        sub="Tutor Legal / Padre de Familia"
        tag={user.email}
      />

      {/* Child info card */}
      <Card style={{ border: '1.5px solid #203A50' }}>
        <CardHeader>
          <div>
            <CardTitle>Información del Alumno Tutorado</CardTitle>
            <CardSubtitle>Seguimiento académico directo de tu hijo/a</CardSubtitle>
          </div>
          <Pill variant="blue">Ciclo 2026–2027</Pill>
        </CardHeader>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #203A50, #203A55)' }}
            >
              {hijo.avatar}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xl font-extrabold" style={{ color: '#0F1E2B' }}>{hijo.nombre}</div>
              <div className="text-sm font-medium mt-0.5" style={{ color: '#506070' }}>
                {hijo.grupo} · {hijo.turno} · {hijo.semestre}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#8FA0AF' }}>
                Matrícula: {hijo.matricula}
              </div>
            </div>
            <div className="text-right pl-4">
              <div className="text-3xl font-black" style={{ color: '#203A50' }}>{promedio}</div>
              <div className="text-[11px] font-semibold" style={{ color: '#8FA0AF' }}>Promedio actual</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              icon={<IconGrade size={20} style={{ color: '#203A50' }} />}
              label="Materias"
              value={materias.length}
            />
            <StatCard
              icon={<IconCheck size={20} style={{ color: '#16a34a' }} />}
              label="Aprobadas"
              value={materias.filter(m => m.promedio >= 6).length}
              valueColor="#16a34a"
            />
            <StatCard
              icon={<IconAlert size={20} style={{ color: '#dc2626' }} />}
              label="En riesgo"
              value={materias.filter(m => m.promedio < 7).length}
              valueColor="#dc2626"
            />
          </div>

          <InfoGrid fields={[
            { label: 'Nombre del Alumno', value: hijo.nombre },
            { label: 'Matrícula',         value: hijo.matricula },
            { label: 'Correo Institucional', value: hijo.email },
            { label: 'Grupo asignado',    value: hijo.grupo },
            { label: 'Turno',             value: hijo.turno },
            { label: 'Semestre',          value: hijo.semestre },
            { label: 'Plantel',           value: 'Preparatoria Boletyx' },
            { label: 'Ciclo Escolar',     value: '2026–2027' },
          ]} />
        </div>
      </Card>

      {/* Tutor info */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Datos de Contacto del Tutor</CardTitle>
            <CardSubtitle>Información registrada en el expediente escolar</CardSubtitle>
          </div>
        </CardHeader>
        <div className="p-6">
          <InfoGrid fields={[
            { label: 'Nombre del Tutor', value: user.nombre },
            { label: 'Correo Electrónico', value: user.email },
            { label: 'Parentesco', value: 'Padre / Tutor Legal' },
            { label: 'Teléfono de Contacto', value: '+52 55 4123 8900' },
          ]} />
        </div>
      </Card>
    </div>
  )
}
