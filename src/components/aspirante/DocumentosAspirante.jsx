import { PageHeader, Card, DataTable, BtnPrimary, Pill } from '../UI'

export default function DocumentosAspirante() {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Documentos Requeridos" subtitle="Sube los documentos necesarios para tu admisión" />
      <Card>
        <DataTable
          headers={['Documento', 'Estado', 'Última actualización', 'Acción']}
          rows={[
            <tr key="1" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 font-semibold text-sm">Acta de Nacimiento</td>
              <td className="px-4 py-3"><Pill variant="success">Aprobado</Pill></td>
              <td className="px-4 py-3 text-sm text-gray-500">12/09/2026</td>
              <td className="px-4 py-3"><BtnPrimary disabled>Subido</BtnPrimary></td>
            </tr>,
            <tr key="2" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 font-semibold text-sm">Certificado de Secundaria</td>
              <td className="px-4 py-3"><Pill variant="warning">Pendiente</Pill></td>
              <td className="px-4 py-3 text-sm text-gray-500">-</td>
              <td className="px-4 py-3"><BtnPrimary>Subir PDF</BtnPrimary></td>
            </tr>,
            <tr key="3">
              <td className="px-4 py-3 font-semibold text-sm">CURP</td>
              <td className="px-4 py-3"><Pill variant="warning">Pendiente</Pill></td>
              <td className="px-4 py-3 text-sm text-gray-500">-</td>
              <td className="px-4 py-3"><BtnPrimary>Subir PDF</BtnPrimary></td>
            </tr>
          ]}
        />
      </Card>
    </div>
  )
}
