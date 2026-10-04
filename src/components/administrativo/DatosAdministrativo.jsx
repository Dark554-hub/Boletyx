import { PageHeader, Card, CardHeader, CardTitle, InfoGrid } from '../UI'

export default function DatosAdministrativo({ user }) {
  return (
    <div className="space-y-5">
      <PageHeader title="Módulo Administrativo" subtitle="Gestión de trámites y expedientes" />
      <Card>
        <CardHeader>
          <CardTitle>Información del Personal</CardTitle>
        </CardHeader>
        <div className="p-6">
          <InfoGrid fields={[
            { label: 'Nombre', value: user.nombre },
            { label: 'Correo', value: user.email },
            { label: 'Departamento', value: 'Control Escolar' },
          ]} />
        </div>
      </Card>
    </div>
  )
}
