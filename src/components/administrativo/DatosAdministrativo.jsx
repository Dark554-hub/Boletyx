import { PageHeader, Card, CardHeader, CardTitle, InfoGrid, StatCard, BtnOutline } from '../UI'
import { IconUser, IconDoc, IconCheck, IconAlert } from '../Icons'

export default function DatosAdministrativo({ user }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Panel Administrativo" subtitle="Gestión integral de control escolar" />
      
      {/* Resumen de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IconUser size={22} style={{ color: '#3b82f6' }} />} label="Total Alumnos" value="1,240" />
        <StatCard icon={<IconCheck size={22} style={{ color: '#16a34a' }} />} label="Inscripciones" value="142" valueColor="#16a34a" />
        <StatCard icon={<IconDoc size={22} style={{ color: '#8b5cf6' }} />} label="Trámites Activos" value="38" />
        <StatCard icon={<IconAlert size={22} style={{ color: '#dc2626' }} />} label="Pagos Pendientes" value="15" valueColor="#dc2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil Administrativo</CardTitle>
          </CardHeader>
          <div className="p-6">
            <InfoGrid fields={[
              { label: 'Nombre', value: user.nombre },
              { label: 'Correo', value: user.email },
              { label: 'Departamento', value: 'Control Escolar y Pagos' },
              { label: 'Turno', value: 'Matutino' },
            ]} />
          </div>
        </Card>

        {/* Tareas Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Pendientes</CardTitle>
          </CardHeader>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F4F7FA' }}>
              <div className="flex items-center gap-3">
                <IconDoc size={18} style={{ color: '#506070' }} />
                <span className="text-sm font-semibold" style={{ color: '#0F1E2B' }}>Revisar 12 actas de nacimiento</span>
              </div>
              <BtnOutline>Ir</BtnOutline>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F4F7FA' }}>
              <div className="flex items-center gap-3">
                <IconAlert size={18} style={{ color: '#dc2626' }} />
                <span className="text-sm font-semibold" style={{ color: '#0F1E2B' }}>Aprobar 5 fichas de pago</span>
              </div>
              <BtnOutline>Ir</BtnOutline>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F4F7FA' }}>
              <div className="flex items-center gap-3">
                <IconUser size={18} style={{ color: '#506070' }} />
                <span className="text-sm font-semibold" style={{ color: '#0F1E2B' }}>Emitir credenciales (Nuevo Ingreso)</span>
              </div>
              <BtnOutline>Ir</BtnOutline>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
