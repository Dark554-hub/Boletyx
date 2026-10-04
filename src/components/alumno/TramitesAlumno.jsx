import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  Pill,
  BtnPrimary,
  BtnOutline,
} from '../UI'

import {
  IconDoc,
  IconDownload,
  IconCheckCircle,
  IconClock,
  IconSend,
  IconXCircle,
  IconPlus,
} from '../Icons'


// ==================================================
// ESTADOS DE LOS TRÁMITES
// ==================================================

const STATUS = {
  Listo: {
    variant: 'success',
    Icon: IconCheckCircle,
  },

  'En proceso': {
    variant: 'warning',
    Icon: IconClock,
  },

  Pendiente: {
    variant: 'default',
    Icon: IconClock,
  },

  Rechazado: {
    variant: 'default',
    Icon: IconXCircle,
  },
}


// ==================================================
// DESCRIPCIONES
// ==================================================

const DESCRIPCIONES = {
  'Constancia de Estudios':
    'Documento oficial que acredita que actualmente estás inscrito en la institución.',

  'Credencial Escolar':
    'Solicitud de expedición o reposición de la credencial escolar.',

  'Certificado Parcial':
    'Documento que acredita las materias y calificaciones cursadas hasta el momento.',

  'Carta de Buena Conducta':
    'Documento institucional que acredita la conducta escolar del alumno.',

  'Historial Académico':
    'Consulta oficial del historial de materias y calificaciones registradas.',
}


// ==================================================
// COMPONENTE
// ==================================================

export default function TramitesAlumno({ user }) {
  const [tramites, setTramites] = useState([])

  const [showForm, setShowForm] =
    useState(false)

  const [sent, setSent] =
    useState(null)

  const [tipo, setTipo] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')


  // ==================================================
  // CARGAR AL INICIAR
  // ==================================================

  useEffect(() => {
    cargarTramites()
  }, [user?.alumno_id])


  // ==================================================
  // CARGAR TRÁMITES DEL ALUMNO
  // ==================================================

  async function cargarTramites() {
    if (!user?.alumno_id) {
      setError(
        'No se encontró la información del alumno.'
      )

      setLoading(false)
      return
    }


    try {
      setLoading(true)
      setError('')


      const {
        data,
        error: tramitesError,
      } = await supabase
        .from('tramites')
        .select(`
          id,
          alumno_id,
          tipo,
          descripcion,
          estado,
          fecha_solicitud,
          fecha_resolucion,
          observaciones,
          archivo_url,
          created_at,
          updated_at
        `)
        .eq(
          'alumno_id',
          user.alumno_id
        )
        .order(
          'fecha_solicitud',
          {
            ascending: false,
          }
        )


      if (tramitesError) {
        throw tramitesError
      }


      setTramites(
        data || []
      )

    } catch (err) {
      console.error(
        'Error cargando trámites:',
        err
      )


      setError(
        err?.message ||
        'No se pudieron cargar los trámites.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ==================================================
  // ENVIAR NUEVA SOLICITUD
  // ==================================================

  async function handleSend(e) {
    e.preventDefault()

    setError('')
    setSent(null)


    if (!user?.alumno_id) {
      setError(
        'No se encontró la información del alumno.'
      )

      return
    }


    if (!tipo) {
      setError(
        'Selecciona un tipo de trámite.'
      )

      return
    }


    try {
      setSaving(true)


      const descripcion =
        DESCRIPCIONES[tipo] || null


      const {
        error: insertError,
      } = await supabase
        .from('tramites')
        .insert({
          alumno_id:
            Number(user.alumno_id),

          tipo,

          descripcion,

          estado:
            'Pendiente',
        })


      if (insertError) {
        throw insertError
      }


      const tramiteEnviado =
        tipo


      setTipo('')
      setShowForm(false)

      setSent(
        tramiteEnviado
      )


      await cargarTramites()

    } catch (err) {
      console.error(
        'Error enviando trámite:',
        err
      )


      setError(
        err?.message ||
        'No se pudo enviar la solicitud.'
      )

    } finally {
      setSaving(false)
    }
  }


  // ==================================================
  // CANCELAR FORMULARIO
  // ==================================================

  function cancelarFormulario() {
    setShowForm(false)
    setTipo('')
    setError('')
  }


  // ==================================================
  // FORMATEAR FECHA
  // ==================================================

  function formatearFecha(fecha) {
    if (!fecha) {
      return '—'
    }


    const date =
      new Date(fecha)


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—'
    }


    return date.toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }


  // ==================================================
  // DESCARGAR DOCUMENTO
  // ==================================================

  function descargarDocumento(
    archivoUrl
  ) {
    if (!archivoUrl) {
      return
    }


    window.open(
      archivoUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{
          color: '#506070',
        }}
      >
        Cargando trámites...
      </div>
    )
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-5">

      {/* ==================================================
          HEADER
      ================================================== */}

      <PageHeader
        title="Trámites Escolares"
        subtitle="Consulta y solicita documentos institucionales"
        action={
          <BtnPrimary
            onClick={() => {
              setShowForm(true)
              setError('')
              setSent(null)
            }}
          >
            <IconPlus size={14} />

            Nueva solicitud
          </BtnPrimary>
        }
      />


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{
            background:
              '#fee2e2',

            borderColor:
              '#fecaca',

            color:
              '#991b1b',
          }}
        >
          <IconXCircle
            size={16}
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError('')
            }
            className="ml-auto cursor-pointer border-none"
            style={{
              background:
                'none',

              color:
                '#991b1b',
            }}
          >
            <IconXCircle
              size={16}
            />
          </button>
        </div>
      )}


      {/* ==================================================
          SOLICITUD ENVIADA
      ================================================== */}

      {sent && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{
            background:
              '#dcfce7',

            borderColor:
              '#86efac',

            color:
              '#166534',
          }}
        >
          <IconCheckCircle
            size={16}
          />

          <span>
            Solicitud de{' '}

            <strong>
              {sent}
            </strong>

            {' '}enviada correctamente.
            Recibirás una notificación
            cuando esté lista.
          </span>


          <button
            type="button"
            onClick={() =>
              setSent(null)
            }
            className="ml-auto cursor-pointer border-none"
            style={{
              background:
                'none',

              color:
                '#16a34a',
            }}
          >
            <IconXCircle
              size={16}
            />
          </button>
        </div>
      )}


      {/* ==================================================
          NUEVA SOLICITUD
      ================================================== */}

      {showForm && (
        <Card
          className="border-[#203A50]"
          style={{
            borderColor:
              '#203A50',

            borderWidth:
              1.5,
          }}
        >

          <CardHeader>

            <div>
              <CardTitle>
                Nueva solicitud de trámite
              </CardTitle>
            </div>

          </CardHeader>


          <div className="p-6">

            <form
              onSubmit={
                handleSend
              }
              className="space-y-4"
            >

              <div>

                <label
                  className="block text-[11px] font-black uppercase tracking-wider mb-1.5"
                  style={{
                    color:
                      '#506070',
                  }}
                >
                  Tipo de documento
                </label>


                <select
                  value={tipo}
                  onChange={e =>
                    setTipo(
                      e.target.value
                    )
                  }
                  required
                  disabled={
                    saving
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer disabled:opacity-60"
                  style={{
                    border:
                      '1.5px solid #DDE4ED',

                    background:
                      '#F4F7FA',

                    color:
                      '#0F1E2B',

                    fontFamily:
                      'inherit',
                  }}
                >

                  <option value="">
                    Selecciona un trámite…
                  </option>

                  <option value="Constancia de Estudios">
                    Constancia de Estudios
                  </option>

                  <option value="Credencial Escolar">
                    Credencial Escolar
                  </option>

                  <option value="Certificado Parcial">
                    Certificado Parcial
                  </option>

                  <option value="Carta de Buena Conducta">
                    Carta de Buena Conducta
                  </option>

                  <option value="Historial Académico">
                    Historial Académico
                  </option>

                </select>

              </div>


              {tipo && (
                <div
                  className="px-4 py-3 rounded-xl text-xs"
                  style={{
                    background:
                      '#F4F7FA',

                    border:
                      '1px solid #DDE4ED',

                    color:
                      '#506070',
                  }}
                >
                  {
                    DESCRIPCIONES[
                      tipo
                    ]
                  }
                </div>
              )}


              <div className="flex gap-2.5">

                <BtnPrimary
                  type="submit"
                  disabled={
                    saving ||
                    !tipo
                  }
                >
                  <IconSend
                    size={14}
                  />

                  {saving
                    ? 'Enviando...'
                    : 'Enviar solicitud'}
                </BtnPrimary>


                <BtnOutline
                  type="button"
                  onClick={
                    cancelarFormulario
                  }
                  disabled={
                    saving
                  }
                >
                  Cancelar
                </BtnOutline>

              </div>

            </form>

          </div>

        </Card>
      )}


      {/* ==================================================
          SIN TRÁMITES
      ================================================== */}

      {tramites.length === 0 && (
        <Card>

          <div
            className="p-10 text-center"
          >

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background:
                  'rgba(32,58,80,.06)',
              }}
            >
              <IconDoc
                size={25}
                style={{
                  color:
                    '#203A50',
                }}
              />
            </div>


            <h3
              className="text-[14px] font-bold"
              style={{
                color:
                  '#0F1E2B',
              }}
            >
              No tienes trámites
            </h3>


            <p
              className="text-[12px] mt-1"
              style={{
                color:
                  '#8FA0AF',
              }}
            >
              Tus solicitudes aparecerán
              aquí cuando realices un
              trámite escolar.
            </p>

          </div>

        </Card>
      )}


      {/* ==================================================
          TRÁMITES
      ================================================== */}

      {tramites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {tramites.map(
            tramite => {

              const cfg =
                STATUS[
                  tramite.estado
                ] ||
                STATUS.Pendiente


              const StatusIcon =
                cfg.Icon


              return (
                <Card
                  key={
                    tramite.id
                  }
                  className="flex flex-col p-6 gap-4 transition-all hover:-translate-y-0.5"
                  style={{
                    boxShadow:
                      '0 1px 4px rgba(32,58,80,.06)',
                  }}
                >

                  {/* ICONO */}

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        'rgba(32,58,80,.06)',
                    }}
                  >
                    <IconDoc
                      size={22}
                      style={{
                        color:
                          '#203A50',
                      }}
                    />
                  </div>


                  {/* INFORMACIÓN */}

                  <div className="flex-1">

                    <h3
                      className="text-[14px] font-bold mb-1"
                      style={{
                        color:
                          '#0F1E2B',
                      }}
                    >
                      {tramite.tipo}
                    </h3>


                    <p
                      className="text-[12px] leading-relaxed"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      {tramite.descripcion ||
                        DESCRIPCIONES[
                          tramite.tipo
                        ] ||
                        'Solicitud de trámite escolar.'}
                    </p>

                  </div>


                  {/* ESTADO Y FECHA */}

                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{
                      borderColor:
                        '#EBF0F5',
                    }}
                  >

                    <Pill
                      variant={
                        cfg.variant
                      }
                    >
                      <StatusIcon
                        size={11}
                      />

                      {tramite.estado}
                    </Pill>


                    <span
                      className="text-[11px]"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      {formatearFecha(
                        tramite.fecha_solicitud
                      )}
                    </span>

                  </div>


                  {/* OBSERVACIONES */}

                  {tramite.observaciones && (
                    <div
                      className="px-3 py-2.5 rounded-xl text-[11px]"
                      style={{
                        background:
                          '#F8FAFC',

                        border:
                          '1px solid #EBF0F5',

                        color:
                          '#506070',
                      }}
                    >
                      <strong>
                        Observaciones:
                      </strong>{' '}

                      {
                        tramite.observaciones
                      }
                    </div>
                  )}


                  {/* DESCARGAR */}

                  {tramite.estado ===
                    'Listo' && (
                    <BtnOutline
                      type="button"
                      className="w-full justify-center"
                      disabled={
                        !tramite.archivo_url
                      }
                      onClick={() =>
                        descargarDocumento(
                          tramite.archivo_url
                        )
                      }
                    >
                      <IconDownload
                        size={14}
                      />

                      {tramite.archivo_url
                        ? 'Descargar'
                        : 'Documento pendiente'}
                    </BtnOutline>
                  )}

                </Card>
              )
            }
          )}

        </div>
      )}

    </div>
  )
}