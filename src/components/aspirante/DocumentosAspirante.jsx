import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  PageHeader,
  Card,
  DataTable,
  BtnPrimary,
  Pill,
} from '../UI'

export default function DocumentosAspirante({ user }) {
  const [aspirante, setAspirante] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDocumentos()
  }, [user?.id])

  async function cargarDocumentos() {
    if (!user?.id) {
      setError(
        'No se encontró la información del aspirante.'
      )
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // ==========================================
      // 1. OBTENER EXPEDIENTE DEL ASPIRANTE
      // ==========================================

      const {
        data: aspiranteData,
        error: aspiranteError,
      } = await supabase
        .from('aspirantes')
        .select(`
          id,
          folio,
          estado
        `)
        .eq('perfil_id', user.id)
        .maybeSingle()

      if (aspiranteError) {
        throw aspiranteError
      }

      if (!aspiranteData) {
        setError(
          'No se encontró un expediente de admisión.'
        )
        setDocumentos([])
        return
      }

      setAspirante(aspiranteData)

      // ==========================================
      // 2. OBTENER DOCUMENTOS
      // ==========================================

      const {
        data: documentosData,
        error: documentosError,
      } = await supabase
        .from('aspirante_documentos')
        .select(`
          id,
          tipo,
          estado,
          archivo_url,
          observaciones,
          fecha_subida,
          created_at,
          updated_at
        `)
        .eq(
          'aspirante_id',
          aspiranteData.id
        )
        .order('id', {
          ascending: true,
        })

      if (documentosError) {
        throw documentosError
      }

      setDocumentos(
        documentosData || []
      )
    } catch (err) {
      console.error(
        'ERROR DOCUMENTOS ASPIRANTE:',
        err
      )

      setError(
        err?.message ||
          'No se pudieron cargar los documentos.'
      )
    } finally {
      setLoading(false)
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return '—'
    }

    const date = new Date(fecha)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
  }

  function obtenerPill(estado) {
    switch (estado) {
      case 'Aprobado':
        return (
          <Pill variant="success">
            Aprobado
          </Pill>
        )

      case 'En revisión':
        return (
          <Pill variant="warning">
            En revisión
          </Pill>
        )

      case 'Rechazado':
        return (
          <Pill variant="default">
            Rechazado
          </Pill>
        )

      default:
        return (
          <Pill variant="warning">
            Pendiente
          </Pill>
        )
    }
  }

  function obtenerAccion(documento) {
    if (documento.estado === 'Aprobado') {
      return (
        <BtnPrimary disabled>
          Aprobado
        </BtnPrimary>
      )
    }

    if (documento.estado === 'En revisión') {
      return (
        <BtnPrimary disabled>
          En revisión
        </BtnPrimary>
      )
    }

    if (documento.archivo_url) {
      return (
        <BtnPrimary disabled>
          Subido
        </BtnPrimary>
      )
    }

    return (
      <BtnPrimary disabled>
        Subir PDF
      </BtnPrimary>
    )
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando documentos...
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Documentos Requeridos"
        subtitle={
          aspirante
            ? `Expediente ${aspirante.folio} · Documentos necesarios para tu admisión`
            : 'Documentos necesarios para tu admisión'
        }
      />

      {error && (
        <div
          className="px-4 py-3 rounded-xl border text-sm font-medium"
          style={{
            background: '#fee2e2',
            borderColor: '#fecaca',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {!error && documentos.length === 0 && (
        <Card>
          <div
            className="p-10 text-center"
            style={{
              color: '#506070',
            }}
          >
            <p className="font-semibold">
              No hay documentos requeridos.
            </p>

            <p
              className="text-xs mt-1"
              style={{
                color: '#8FA0AF',
              }}
            >
              Cuando se asignen documentos a tu
              expediente aparecerán aquí.
            </p>
          </div>
        </Card>
      )}

      {documentos.length > 0 && (
        <Card>
          <DataTable
            headers={[
              'Documento',
              'Estado',
              'Última actualización',
              'Acción',
            ]}
            rows={documentos.map(
              (documento) => (
                <tr
                  key={documento.id}
                  className="border-b last:border-b-0"
                  style={{
                    borderColor: '#DDE4ED',
                  }}
                >
                  <td className="px-4 py-3">
                    <div
                      className="font-semibold text-sm"
                      style={{
                        color: '#0F1E2B',
                      }}
                    >
                      {documento.tipo}
                    </div>

                    {documento.observaciones && (
                      <div
                        className="text-[11px] mt-1"
                        style={{
                          color: '#8FA0AF',
                        }}
                      >
                        {documento.observaciones}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {obtenerPill(
                      documento.estado
                    )}
                  </td>

                  <td
                    className="px-4 py-3 text-sm"
                    style={{
                      color: '#506070',
                    }}
                  >
                    {formatearFecha(
                      documento.fecha_subida ||
                        documento.updated_at
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {obtenerAccion(
                      documento
                    )}
                  </td>
                </tr>
              )
            )}
          />
        </Card>
      )}

      <Card>
        <div
          className="p-4 text-xs"
          style={{
            background: '#F8FAFC',
            color: '#506070',
          }}
        >
          Los documentos aprobados ya fueron
          validados por la institución. La carga
          de archivos PDF se habilitará cuando
          configuremos el almacenamiento seguro
          de documentos.
        </div>
      </Card>
    </div>
  )
}