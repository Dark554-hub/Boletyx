import { PageHeader, Card, CardHeader, CardTitle, CardBody, BtnPrimary, InfoGrid } from '../UI'

export default function PagosAspirante() {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Pagos" subtitle="Pago de ficha de examen e inscripción" />
      <Card>
        <CardHeader>
          <CardTitle>Ficha de Admisión 2026</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <InfoGrid fields={[
            { label: 'Concepto', value: 'Ficha de Examen de Admisión' },
            { label: 'Monto', value: '$ 500.00 MXN' },
            { label: 'Vencimiento', value: '30 de Octubre, 2026' },
            { label: 'Estado', value: 'Pendiente de Pago' },
          ]} />
          <BtnPrimary>Pagar en línea</BtnPrimary>
        </CardBody>
      </Card>
    </div>
  )
}
