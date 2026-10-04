import { PageHeader, Card, DataTable, Pill, BtnOutline, BtnPrimary } from '../UI'

export default function InscripcionesAdmin() {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Gestión de Inscripciones" subtitle="Administración de nuevos aspirantes y validación de documentos" />
      <Card>
        <DataTable
          headers={['Folio', 'Nombre del Aspirante', 'Documentos', 'Examen', 'Acciones']}
          rows={[
            <tr key="1" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 text-sm font-mono">ASP-1029</td>
              <td className="px-4 py-3 text-sm font-semibold">Carlos Ramírez Torres</td>
              <td className="px-4 py-3"><Pill variant="success">Completos</Pill></td>
              <td className="px-4 py-3 text-sm">85 / 100</td>
              <td className="px-4 py-3 flex gap-2">
                <BtnPrimary>Aprobar</BtnPrimary>
                <BtnOutline>Rechazar</BtnOutline>
              </td>
            </tr>,
            <tr key="2" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 text-sm font-mono">ASP-1030</td>
              <td className="px-4 py-3 text-sm font-semibold">Ana Beltrán López</td>
              <td className="px-4 py-3"><Pill variant="warning">Falta CURP</Pill></td>
              <td className="px-4 py-3 text-sm">92 / 100</td>
              <td className="px-4 py-3 flex gap-2">
                <BtnPrimary disabled>Aprobar</BtnPrimary>
                <BtnOutline>Notificar</BtnOutline>
              </td>
            </tr>
          ]}
        />
      </Card>
    </div>
  )
}
