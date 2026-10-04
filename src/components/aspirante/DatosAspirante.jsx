import { PageHeader, Card, CardHeader, CardTitle, InfoGrid } from '../UI'

export default function DatosAspirante({ user }) {
  return (
    <div className="space-y-5">
      <PageHeader title="Módulo de Aspirantes" subtitle="Consulta de proceso de admisión" />
      <Card>
        <CardHeader>
          <CardTitle>Información del Aspirante</CardTitle>
        </CardHeader>
        <div className="p-6">
          <InfoGrid fields={[
            { label: 'Nombre', value: user.nombre },
            { label: 'Correo', value: user.email },
            { label: 'Estado', value: 'En proceso de revisión' },
          ]} />
        </div>
      </Card>
    </div>
  )
}
