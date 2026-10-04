import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  PageHeader,
  Card,
  Pill,
  BtnOutline,
} from '../UI'
import {
  IconDoc,
  IconDownload,
  IconCheckCircle,
  IconClock,
  IconXCircle,
} from '../Icons'

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

const DESCRIPCIONES = {
  'Constancia de Estudios':
    'Documento oficial que acredita que el alumno actualmente está inscrito en la institución.',

  'Credencial Escolar':
    'Solicitud de expedición o reposición de la credencial escolar.',

  'Certificado Parcial':
    'Documento que acredita las materias y calificaciones cursadas hasta el momento.',

  'Carta de Buena Conducta':
    'Documento institucional que acredita la conducta escolar del alumno.',

  'Historial Académico':
    'Consulta oficial del historial de materias y calificaciones registradas.',
}

export default function TramitesTutor({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hijo, setHijo] = useState(null)
  const [tramites, setTramites] = useState([])

  useEffect(() => {
    cargarTramites()
  }, [user?.id])

  async function cargarTramites() {
    if (!user?.id) {
      setError('No se encontró la información del tutor.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // 1. Buscar alumno vinculado al tutor
      const {
        data: relacion,
        error: relacionError,
      } = await supabase
        .from('tutor_alumnos')
        .select(`
          alumno_id,
          parentesco,
          alumnos (
            id,
            perfil_id,
            matricula,
            semestre,
            grupo,
            turno,
            perfiles (
              nombre,
              apellido
            )
          )
        `)
        .eq('tutor_id', user.id)
        .limit(1)
        .maybeSingle()

      if (relacionError) {
        throw relacionError
      }

      if (!relacion?.alumnos) {
        setError(
          'No se encontró un alumno vinculado a este tutor.'
        )
        setTramites([])
        return
      }

      const alumno = relacion.alumnos

      const nombreCompleto = [
        alumno.perfiles?.nombre,
        alumno.perfiles?.apellido,
      ]
        .filter(Boolean)
        .join(' ')

      setHijo({
        id: alumno.id,
        nombre: nombreCompleto || 'Alumno',
        matricula: alumno.matricula || '—',
        semestre: alumno.semestre || '—',
        grupo: alumno.grupo || '—',
        turno: alumno.turno || '—',
        parentesco:
          relacion.parentesco ||
          'Tutor legal',
      })

      // 2. Consultar trámites del alumno
      const {
        data: tramitesData,
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
        .eq('alumno_id', alumno.id)
        .order('fecha_solicitud', {
          ascending: false,
        })

      if (tramitesError) {
        throw tramitesError
      }

      setTramites(tramitesData || [])
    } catch (err) {
      console.error(
        'ERROR TRÁMITES TUTOR:',
        err
      )

      setError(
        err?.message ||
          'No se pudieron cargar los trámites del alumno.'
      )

      setTramites([])
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
        month: 'short',
        year: 'numeric',
      }
    )
  }

  function descargarDocumento(archivoUrl) {
    if (!archivoUrl) {
      return
    }

    window.open(
      archivoUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#506070' }}
      >
        Cargando trámites...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          hijo
            ? `Trámites de ${
                hijo.nombre.split(' ')[0]
              }`
            : 'Trámites Escolares'
        }
        subtitle={
          hijo
            ? `Consulta las solicitudes escolares de ${hijo.nombre}`
            : 'Consulta las solicitudes escolares del alumno tutorado'
        }
        action={
          hijo ? (
            <Pill variant="mint">
              Alumno tutorado
            </Pill>
          ) : null
        }
      />

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{
            background: '#fee2e2',
            borderColor: '#fecaca',
            color: '#991b1b',
          }}
        >
          <IconXCircle size={16} />

          <span>{error}</span>
        </div>
      )}

      {/* Información del alumno */}
      {hijo && (
        <Card>
          <div className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                className="text-[11px] font-black uppercase tracking-wider mb-1"
                style={{ color: '#8FA0AF' }}
              >
                Alumno tutorado
              </p>

              <h3
                className="text-[16px] font-bold"
                style={{ color: '#0F1E2B' }}
              >
                {hijo.nombre}
              </h3>

              <p
                className="text-[12px] mt-1"
                style={{ color: '#506070' }}
              >
                Matrícula {hijo.matricula}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill variant="blue">
                {hijo.grupo}
              </Pill>

              <Pill variant="mint">
                {hijo.turno}
              </Pill>

              <Pill variant="blue">
                {hijo.semestre}° semestre
              </Pill>
            </div>
          </div>
        </Card>
      )}

      {/* Sin trámites */}
      {!error &&
        hijo &&
        tramites.length === 0 && (
          <Card>
            <div className="p-10 text-center">
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
                    color: '#203A50',
                  }}
                />
              </div>

              <h3
                className="text-[14px] font-bold"
                style={{
                  color: '#0F1E2B',
                }}
              >
                No hay trámites registrados
              </h3>

              <p
                className="text-[12px] mt-1"
                style={{
                  color: '#8FA0AF',
                }}
              >
                Las solicitudes realizadas por
                el alumno aparecerán aquí.
              </p>
            </div>
          </Card>
        )}

      {/* Trámites */}
      {tramites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tramites.map((tramite) => {
            const cfg =
              STATUS[tramite.estado] ||
              STATUS.Pendiente

            const StatusIcon = cfg.Icon

            return (
              <Card
                key={tramite.id}
                className="flex flex-col p-6 gap-4 transition-all hover:-translate-y-0.5"
                style={{
                  boxShadow:
                    '0 1px 4px rgba(32,58,80,.06)',
                }}
              >
                {/* Icono */}
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
                      color: '#203A50',
                    }}
                  />
                </div>

                {/* Información */}
                <div className="flex-1">
                  <h3
                    className="text-[14px] font-bold mb-1"
                    style={{
                      color: '#0F1E2B',
                    }}
                  >
                    {tramite.tipo}
                  </h3>

                  <p
                    className="text-[12px] leading-relaxed"
                    style={{
                      color: '#8FA0AF',
                    }}
                  >
                    {tramite.descripcion ||
                      DESCRIPCIONES[
                        tramite.tipo
                      ] ||
                      'Solicitud de trámite escolar.'}
                  </p>
                </div>

                {/* Estado */}
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{
                    borderColor:
                      '#EBF0F5',
                  }}
                >
                  <Pill
                    variant={cfg.variant}
                  >
                    <StatusIcon size={11} />
                    {tramite.estado}
                  </Pill>

                  <span
                    className="text-[11px]"
                    style={{
                      color: '#8FA0AF',
                    }}
                  >
                    {formatearFecha(
                      tramite.fecha_solicitud
                    )}
                  </span>
                </div>

                {/* Fecha de resolución */}
                {tramite.fecha_resolucion && (
                  <div
                    className="text-[11px]"
                    style={{
                      color: '#506070',
                    }}
                  >
                    Resuelto:{' '}
                    {formatearFecha(
                      tramite.fecha_resolucion
                    )}
                  </div>
                )}

                {/* Observaciones */}
                {tramite.observaciones && (
                  <div
                    className="px-3 py-2.5 rounded-xl text-[11px]"
                    style={{
                      background: '#F8FAFC',
                      border:
                        '1px solid #EBF0F5',
                      color: '#506070',
                    }}
                  >
                    <strong>
                      Observaciones:
                    </strong>{' '}
                    {tramite.observaciones}
                  </div>
                )}

                {/* Descargar */}
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
          })}
        </div>
      )}
    </div>
  )
}