import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  BtnPrimary,
  InfoGrid,
  Pill,
} from '../UI'

export default function PagosAspirante({ user }) {
  const [aspirante, setAspirante] = useState(null)
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPagos()
  }, [user?.id])

  async function cargarPagos() {
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

      const {
        data: aspiranteData,
        error: aspiranteError,
      } = await supabase
        .from('aspirantes')
        .select(`
          id,
          folio
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
        return
      }

      setAspirante(aspiranteData)

      const {
        data: pagosData,
        error: pagosError,
      } = await supabase
        .from('aspirante_pagos')
        .select(`
          id,
          concepto,
          monto,
          fecha_vencimiento,
          estado,
          referencia,
          fecha_pago,
          created_at
        `)
        .eq(
          'aspirante_id',
          aspiranteData.id
        )
        .order('id', {
          ascending: false,
        })

      if (pagosError) {
        throw pagosError
      }

      setPagos(pagosData || [])
    } catch (err) {
      console.error(
        'ERROR PAGOS ASPIRANTE:',
        err
      )

      setError(
        err?.message ||
          'No se pudieron cargar los pagos.'
      )
    } finally {
      setLoading(false)
    }
  }

  function formatearMonto(monto) {
    const numero = Number(monto)

    if (Number.isNaN(numero)) {
      return '—'
    }

    return numero.toLocaleString(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN',
      }
    )
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return '—'
    }

    const [anio, mes, dia] =
      fecha.split('-').map(Number)

    if (!anio || !mes || !dia) {
      return fecha
    }

    return new Date(
      anio,
      mes - 1,
      dia
    ).toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  function estadoVariant(estado) {
    if (estado === 'Pagado') {
      return 'success'
    }

    if (
      estado === 'Pendiente' ||
      estado === 'En proceso'
    ) {
      return 'warning'
    }

    return 'default'
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando pagos...
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Pagos"
        subtitle={
          aspirante
            ? `Expediente ${aspirante.folio} · Pagos del proceso de admisión`
            : 'Pagos del proceso de admisión'
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

      {!error && pagos.length === 0 && (
        <Card>
          <div
            className="p-10 text-center text-sm"
            style={{
              color: '#506070',
            }}
          >
            No hay pagos asignados a este
            expediente.
          </div>
        </Card>
      )}

      {pagos.map((pago) => (
        <Card key={pago.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <CardTitle>
                {pago.concepto}
              </CardTitle>

              <Pill
                variant={estadoVariant(
                  pago.estado
                )}
              >
                {pago.estado}
              </Pill>
            </div>
          </CardHeader>

          <CardBody className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <InfoGrid
              fields={[
                {
                  label: 'Concepto',
                  value: pago.concepto,
                },
                {
                  label: 'Monto',
                  value: formatearMonto(
                    pago.monto
                  ),
                },
                {
                  label: 'Vencimiento',
                  value: formatearFecha(
                    pago.fecha_vencimiento
                  ),
                },
                {
                  label: 'Referencia',
                  value:
                    pago.referencia ||
                    '—',
                },
              ]}
            />

            {pago.estado ===
            'Pagado' ? (
              <BtnPrimary disabled>
                Pago realizado
              </BtnPrimary>
            ) : (
              <BtnPrimary disabled>
                Pago pendiente
              </BtnPrimary>
            )}
          </CardBody>
        </Card>
      ))}

      <Card>
        <div
          className="p-4 text-xs"
          style={{
            background: '#F8FAFC',
            color: '#506070',
          }}
        >
          El pago en línea todavía no está
          habilitado. Esta pantalla consulta el
          estado y la referencia registrados por
          la institución.
        </div>
      </Card>
    </div>
  )
}