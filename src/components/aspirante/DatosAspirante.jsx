import { PageHeader, Card, CardHeader, CardTitle, InfoGrid, StatCard, GradeBar, Pill } from '../UI'
import { IconCheck, IconAlert, IconDoc, IconCalendar } from '../Icons'

export default function DatosAspirante({ user }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Módulo de Aspirantes" subtitle="Consulta tu proceso de admisión" />
      
      {/* Progreso */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IconDoc size={22} style={{ color: '#16a34a' }} />} label="Docs. Entregados" value="2 / 3" valueColor="#16a34a" />
        <StatCard icon={<IconAlert size={22} style={{ color: '#ca8a04' }} />} label="Ficha de Pago" value="Pendiente" valueColor="#ca8a04" />
        <StatCard icon={<IconCalendar size={22} style={{ color: '#3b82f6' }} />} label="Fecha Examen" value="15 Oct" />
        <StatCard icon={<IconCheck size={22} style={{ color: '#203A50' }} />} label="Estado Global" value="En revisión" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Progreso de Admisión</CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1"><span style={{color: '#506070'}}>Registro y Creación de Perfil</span><span>100%</span></div>
              <GradeBar value={10} max={10} />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1"><span style={{color: '#506070'}}>Entrega de Documentos</span><span>66%</span></div>
              <GradeBar value={6.6} max={10} />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1"><span style={{color: '#506070'}}>Pago de Ficha</span><span>0%</span></div>
              <GradeBar value={0} max={10} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Aspirante</CardTitle>
          </CardHeader>
          <div className="p-6">
            <InfoGrid fields={[
              { label: 'Nombre Completo', value: user.nombre },
              { label: 'Correo', value: user.email },
              { label: 'Folio Asignado', value: 'ASP-1029' },
              { label: 'Estado', value: 'En revisión' },
            ]} />
          </div>
        </Card>
      </div>
    </div>
  )
}
