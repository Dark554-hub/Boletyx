import { PageHeader, Card, CardHeader, CardTitle, InfoGrid, StatCard, BtnPrimary } from '../UI'
import { IconChart, IconUser, IconAlert, IconCalendar } from '../Icons'

export default function DatosCoordinador({ user }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader 
        title="Coordinación Académica" 
        subtitle="Supervisión global y analítica escolar" 
        action={<BtnPrimary>Generar Reporte Global</BtnPrimary>}
      />
      
      {/* Resumen de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IconUser size={22} style={{ color: '#3b82f6' }} />} label="Docentes Activos" value="48" />
        <StatCard icon={<IconChart size={22} style={{ color: '#16a34a' }} />} label="Promedio General" value="8.4" valueColor="#16a34a" />
        <StatCard icon={<IconAlert size={22} style={{ color: '#dc2626' }} />} label="Alumnos en Riesgo" value="23" valueColor="#dc2626" />
        <StatCard icon={<IconCalendar size={22} style={{ color: '#8b5cf6' }} />} label="Aulas Asignadas" value="100%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil del Coordinador</CardTitle>
          </CardHeader>
          <div className="p-6">
            <InfoGrid fields={[
              { label: 'Nombre', value: user.nombre },
              { label: 'Correo', value: user.email },
              { label: 'Área', value: 'Dirección Académica' },
              { label: 'Sede', value: 'Plantel Principal' },
            ]} />
          </div>
        </Card>

        {/* Resumen Rapido */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Actual</CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="flex flex-col border-l-4 border-green-500 pl-4 py-1">
              <span className="text-sm font-bold" style={{ color: '#0F1E2B' }}>Evaluación Docente Completada</span>
              <span className="text-xs text-gray-500">95% de los docentes han capturado calificaciones del 1er parcial.</span>
            </div>
            <div className="flex flex-col border-l-4 border-yellow-500 pl-4 py-1">
              <span className="text-sm font-bold" style={{ color: '#0F1E2B' }}>Revisión de Temarios</span>
              <span className="text-xs text-gray-500">4 materias pendientes de aprobación para el próximo semestre.</span>
            </div>
            <div className="flex flex-col border-l-4 border-blue-500 pl-4 py-1">
              <span className="text-sm font-bold" style={{ color: '#0F1E2B' }}>Asamblea General</span>
              <span className="text-xs text-gray-500">Programada para el 15 de Noviembre en el Auditorio A.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
