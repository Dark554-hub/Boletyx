import { PageHeader, Card, DataTable, Pill, BtnOutline } from '../UI'

export default function PlantillaDocente() {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Plantilla Docente" subtitle="Supervisión de profesores y grupos asignados" />
      <Card>
        <DataTable
          headers={['Docente', 'Especialidad', 'Grupos Asignados', 'Estado', 'Acciones']}
          rows={[
            <tr key="1" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 text-sm font-semibold">Prof. Roberto Hernández Luna</td>
              <td className="px-4 py-3 text-sm text-gray-600">Matemáticas</td>
              <td className="px-4 py-3 text-sm">3°A, 3°B</td>
              <td className="px-4 py-3"><Pill variant="success">Activo</Pill></td>
              <td className="px-4 py-3"><BtnOutline>Ver Detalles</BtnOutline></td>
            </tr>,
            <tr key="2" className="border-b" style={{ borderColor: '#DDE4ED' }}>
              <td className="px-4 py-3 text-sm font-semibold">Prof. Ana Ramírez Torres</td>
              <td className="px-4 py-3 text-sm text-gray-600">Química</td>
              <td className="px-4 py-3 text-sm">3°A, 3°B</td>
              <td className="px-4 py-3"><Pill variant="success">Activo</Pill></td>
              <td className="px-4 py-3"><BtnOutline>Ver Detalles</BtnOutline></td>
            </tr>,
            <tr key="3">
              <td className="px-4 py-3 text-sm font-semibold">Prof. Luis Morales</td>
              <td className="px-4 py-3 text-sm text-gray-600">Historia Universal</td>
              <td className="px-4 py-3 text-sm">1°A, 1°B</td>
              <td className="px-4 py-3"><Pill variant="warning">Permiso</Pill></td>
              <td className="px-4 py-3"><BtnOutline>Ver Detalles</BtnOutline></td>
            </tr>
          ]}
        />
      </Card>
    </div>
  )
}
