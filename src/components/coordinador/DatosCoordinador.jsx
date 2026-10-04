import { PageHeader, Card, CardHeader, CardTitle, InfoGrid } from '../UI'

export default function DatosCoordinador({ user }) {
  return (
    <div className="space-y-5">
      <PageHeader title="Módulo de Jefes/Coordinadores" subtitle="Supervisión académica" />
      <Card>
        <CardHeader>
          <CardTitle>Información del Coordinador</CardTitle>
        </CardHeader>
        <div className="p-6">
          <InfoGrid fields={[
            { label: 'Nombre', value: user.nombre },
            { label: 'Correo', value: user.email },
            { label: 'Área', value: 'Coordinación General' },
          ]} />
        </div>
      </Card>
    </div>
  )
}
