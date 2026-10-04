import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  InfoGrid,
  StatCard,
  GradeBar,
} from '../UI'

import {
  IconCheck,
  IconAlert,
  IconDoc,
  IconCalendar,
} from '../Icons'

export default function DatosAspirante({ user }) {
  const [aspirante, setAspirante] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [pago, setPago] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [user?.id])

  async function cargarDatos() {
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
      // 1. EXPEDIENTE DEL ASPIRANTE
      // ==========================================

      const {
        data: aspiranteData,
        error: aspiranteError,
      } = await supabase
        .from('aspirantes')
        .select(`
          id,
          perfil_id,
          folio,
          estado,
          fecha_examen,
          created_at,
          updated_at
        `)
        .eq('perfil_id', user.id)
        .maybeSingle()

      if (aspiranteError) {
        throw aspiranteError
      }

      if (!aspiranteData) {
        setError(
          'No se encontró un expediente de admisión para este aspirante.'
        )
        setLoading(false)
        return
      }

      setAspirante(aspiranteData)

      // ==========================================
      // 2. DOCUMENTOS
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
          fecha_subida
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

      // ==========================================
      // 3. FICHA DE PAGO
      // ==========================================

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
          fecha_pago
        `)
        .eq(
          'aspirante_id',
          aspiranteData.id
        )
        .order('id', {
          ascending: false,
        })
        .limit(1)

      if (pagosError) {
        throw pagosError
      }

      setPago(
        pagosData?.[0] || null
      )
    } catch (err) {
      console.error(
        'ERROR DATOS ASPIRANTE:',
        err
      )

      setError(
        err?.message ||
          'No se pudo cargar el proceso de admisión.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CÁLCULOS
  // ==========================================

  const totalDocumentos =
    documentos.length

  const documentosEntregados =
    documentos.filter(
      documento =>
        documento.estado !== 'Pendiente'
    ).length

  const porcentajeDocumentos =
    totalDocumentos > 0
      ? Math.round(
          (documentosEntregados /
            totalDocumentos) *
            100
        )
      : 0

  const pagoRealizado =
    pago?.estado === 'Pagado'

  const porcentajePago =
    pagoRealizado ? 100 : 0

  function formatearFecha(fecha) {
    if (!fecha) {
      return 'Por definir'
    }

    const partes =
      fecha.split('-')

    if (partes.length !== 3) {
      return fecha
    }

    const [anio, mes, dia] =
      partes.map(Number)

    const date =
      new Date(anio, mes - 1, dia)

    return date.toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  function nombreCompleto() {
    return [
      user?.nombre,
      user?.apellido,
    ]
      .filter(Boolean)
      .join(' ')
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando proceso de admisión...
      </div>
    )
  }

  // ==========================================
  // ERROR SIN EXPEDIENTE
  // ==========================================

  if (error && !aspirante) {
    return (
      <div className="space-y-5 animate-fade-up">
        <PageHeader
          title="Módulo de Aspirantes"
          subtitle="Consulta tu proceso de admisión"
        />

        <Card>
          <div
            className="p-6 flex items-center gap-3 text-sm"
            style={{
              color: '#991b1b',
              background: '#fee2e2',
            }}
          >
            <IconAlert size={18} />
            {error}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Módulo de Aspirantes"
        subtitle="Consulta tu proceso de admisión"
      />

      {/* ======================================
          RESUMEN
      ====================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <IconDoc
              size={22}
              style={{
                color: '#16a34a',
              }}
            />
          }
          label="Docs. Entregados"
          value={`${documentosEntregados} / ${totalDocumentos}`}
          valueColor="#16a34a"
        />

        <StatCard
          icon={
            <IconAlert
              size={22}
              style={{
                color:
                  pagoRealizado
                    ? '#16a34a'
                    : '#ca8a04',
              }}
            />
          }
          label="Ficha de Pago"
          value={
            pago?.estado ||
            'Sin ficha'
          }
          valueColor={
            pagoRealizado
              ? '#16a34a'
              : '#ca8a04'
          }
        />

        <StatCard
          icon={
            <IconCalendar
              size={22}
              style={{
                color: '#3b82f6',
              }}
            />
          }
          label="Fecha Examen"
          value={formatearFecha(
            aspirante?.fecha_examen
          )}
        />

        <StatCard
          icon={
            <IconCheck
              size={22}
              style={{
                color: '#203A50',
              }}
            />
          }
          label="Estado Global"
          value={
            aspirante?.estado || '—'
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ====================================
            PROGRESO
        ==================================== */}

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>
              Progreso de Admisión
            </CardTitle>
          </CardHeader>

          <div className="p-6 space-y-4">

            {/* Registro */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span
                  style={{
                    color: '#506070',
                  }}
                >
                  Registro y Creación de Perfil
                </span>

                <span>100%</span>
              </div>

              <GradeBar
                value={10}
                max={10}
              />
            </div>

            {/* Documentos */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span
                  style={{
                    color: '#506070',
                  }}
                >
                  Entrega de Documentos
                </span>

                <span>
                  {porcentajeDocumentos}%
                </span>
              </div>

              <GradeBar
                value={
                  porcentajeDocumentos /
                  10
                }
                max={10}
              />
            </div>

            {/* Pago */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span
                  style={{
                    color: '#506070',
                  }}
                >
                  Pago de Ficha
                </span>

                <span>
                  {porcentajePago}%
                </span>
              </div>

              <GradeBar
                value={
                  porcentajePago / 10
                }
                max={10}
              />
            </div>
          </div>
        </Card>

        {/* ====================================
            INFORMACIÓN
        ==================================== */}

        <Card>
          <CardHeader>
            <CardTitle>
              Información del Aspirante
            </CardTitle>
          </CardHeader>

          <div className="p-6">
            <InfoGrid
              fields={[
                {
                  label:
                    'Nombre Completo',
                  value:
                    nombreCompleto() ||
                    '—',
                },
                {
                  label: 'Correo',
                  value:
                    user?.email || '—',
                },
                {
                  label:
                    'Folio Asignado',
                  value:
                    aspirante?.folio ||
                    '—',
                },
                {
                  label: 'Estado',
                  value:
                    aspirante?.estado ||
                    '—',
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}