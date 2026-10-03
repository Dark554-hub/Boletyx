import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  IconSpeaker,
  IconInfo,
  IconAlert,
  IconCalendar,
} from '../Icons'


const TIPO_CONFIG = {
  importante: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '#fecaca',
    label: 'Importante',
    Icon: IconAlert,
  },

  evento: {
    color: '#16a34a',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Evento',
    Icon: IconCalendar,
  },

  reunion: {
    color: '#ca8a04',
    background: '#fefce8',
    border: '#fde68a',
    label: 'Reunión',
    Icon: IconInfo,
  },
}


const ESTILOS = `
.avisos-page {
  --aviso-blue: #203A50;
  --aviso-text: #172B3A;
  --aviso-text-2: #647889;
  --aviso-text-3: #8FA0AF;
  --aviso-border: #DCE5EA;

  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px 50px;
}


/* HEADER */

.avisos-header {
  margin-bottom: 22px;
}

.avisos-header h1 {
  margin: 0 0 5px;

  color: var(--aviso-text);

  font-size: 24px;
  font-weight: 700;
}

.avisos-header p {
  margin: 0;

  color: var(--aviso-text-2);

  font-size: 14px;
}


/* ESTADÍSTICAS */

.avisos-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 24px;
}

.avisos-stat {
  display: flex;
  align-items: center;

  gap: 14px;

  min-height: 105px;

  padding: 18px;

  background: #fff;

  border: 1px solid var(--aviso-border);
  border-radius: 14px;

  box-shadow: 0 2px 5px rgba(32,58,80,.03);
}

.avisos-stat-icon {
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
}

.avisos-stat-value {
  color: var(--aviso-text);

  font-size: 25px;
  font-weight: 800;

  line-height: 1;
}

.avisos-stat-label {
  margin-top: 6px;

  color: var(--aviso-text-3);

  font-size: 12px;
}


/* LISTA */

.avisos-list {
  display: flex;
  flex-direction: column;

  gap: 12px;
}


/* AVISO */

.avisos-card {
  position: relative;

  overflow: hidden;

  padding: 18px 20px;

  background: #fff;

  border: 1px solid var(--aviso-border);
  border-left: 4px solid var(--aviso-blue);

  border-radius: 12px;

  box-shadow: 0 2px 5px rgba(32,58,80,.025);

  transition:
    transform .15s,
    box-shadow .15s;
}

.avisos-card:hover {
  transform: translateY(-1px);

  box-shadow: 0 5px 14px rgba(32,58,80,.07);
}

.avisos-card-top {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 16px;
}

.avisos-title-wrap {
  display: flex;
  align-items: center;

  gap: 10px;

  min-width: 0;
}

.avisos-icon {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.avisos-title {
  color: var(--aviso-text);

  font-size: 15px;
  font-weight: 700;
}


/* PILL */

.avisos-pill {
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;

  padding: 5px 10px;

  border: 1px solid;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: .03em;
}


/* CUERPO */

.avisos-body {
  margin-top: 9px;
  margin-left: 26px;

  max-width: 950px;

  color: var(--aviso-text-2);

  font-size: 13px;
  line-height: 1.6;
}

.avisos-date {
  margin-top: 10px;
  margin-left: 26px;

  color: var(--aviso-text-3);

  font-size: 11px;
}


/* ESTADOS */

.avisos-message {
  padding: 32px 20px;

  background: #fff;

  border: 1px solid var(--aviso-border);
  border-radius: 14px;

  color: var(--aviso-text-2);

  font-size: 14px;

  text-align: center;
}

.avisos-error {
  display: flex;
  align-items: center;

  gap: 8px;

  margin-bottom: 18px;

  padding: 12px 16px;

  color: #991b1b;

  background: #fee2e2;

  border: 1px solid #fecaca;
  border-radius: 10px;

  font-size: 13px;
  font-weight: 600;
}


/* RESPONSIVE */

@media (max-width: 900px) {
  .avisos-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .avisos-page {
    padding: 18px 12px 35px;
  }

  .avisos-card-top {
    flex-direction: column;
  }

  .avisos-body,
  .avisos-date {
    margin-left: 0;
  }
}
`


export default function AvisosDocente() {

  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ==================================================
  // CARGAR AVISOS
  // ==================================================

  useEffect(() => {
    cargarAvisos()
  }, [])


  async function cargarAvisos() {
    try {
      setLoading(true)
      setError('')


      const {
        data,
        error: avisosError,
      } = await supabase
        .from('avisos')
        .select(`
          id,
          titulo,
          cuerpo,
          tipo,
          fecha_publicacion,
          fecha_inicio,
          fecha_fin,
          activo
        `)
        .order(
          'fecha_publicacion',
          {
            ascending: false,
          }
        )


      if (avisosError) {
        throw avisosError
      }


      setAvisos(data || [])

    } catch (err) {

      console.error(
        'Error cargando avisos:',
        err
      )


      setAvisos([])


      setError(
        err?.message ||
        'No se pudieron cargar los avisos institucionales.'
      )

    } finally {
      setLoading(false)
    }
  }


  // ==================================================
  // CONTADORES
  // ==================================================

  const importantes = useMemo(() => {
    return avisos.filter(
      aviso =>
        aviso.tipo === 'importante'
    ).length
  }, [avisos])


  const eventos = useMemo(() => {
    return avisos.filter(
      aviso =>
        aviso.tipo === 'evento'
    ).length
  }, [avisos])


  // ==================================================
  // FORMATEAR FECHA
  // ==================================================

  function formatearFecha(fecha) {
    if (!fecha) {
      return '—'
    }


    const date = new Date(fecha)


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
        month: 'long',
        year: 'numeric',
      }
    )
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <>
      <style>{ESTILOS}</style>


      <div className="avisos-page fade-in">

        {/* HEADER */}

        <div className="avisos-header">

          <h1>
            Avisos Institucionales
          </h1>

          <p>
            Comunicados oficiales de la administración escolar
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="avisos-error">

            <IconAlert size={16} />

            {error}

          </div>
        )}


        {/* ESTADÍSTICAS */}

        <div className="avisos-stats">

          {/* TOTAL */}

          <div className="avisos-stat">

            <div
              className="avisos-stat-icon"
              style={{
                background:
                  'rgba(32,58,80,.07)',
              }}
            >

              <IconSpeaker
                size={22}
                style={{
                  color: '#203A50',
                }}
              />

            </div>


            <div>

              <div className="avisos-stat-value">
                {loading
                  ? '...'
                  : avisos.length}
              </div>

              <div className="avisos-stat-label">
                Avisos activos
              </div>

            </div>

          </div>


          {/* IMPORTANTES */}

          <div className="avisos-stat">

            <div
              className="avisos-stat-icon"
              style={{
                background:
                  'rgba(239,68,68,.08)',
              }}
            >

              <IconAlert
                size={22}
                style={{
                  color: '#dc2626',
                }}
              />

            </div>


            <div>

              <div
                className="avisos-stat-value"
                style={{
                  color: '#dc2626',
                }}
              >
                {loading
                  ? '...'
                  : importantes}
              </div>

              <div className="avisos-stat-label">
                Importantes
              </div>

            </div>

          </div>


          {/* EVENTOS */}

          <div className="avisos-stat">

            <div
              className="avisos-stat-icon"
              style={{
                background:
                  'rgba(34,197,94,.08)',
              }}
            >

              <IconCalendar
                size={22}
                style={{
                  color: '#16a34a',
                }}
              />

            </div>


            <div>

              <div
                className="avisos-stat-value"
                style={{
                  color: '#16a34a',
                }}
              >
                {loading
                  ? '...'
                  : eventos}
              </div>

              <div className="avisos-stat-label">
                Eventos
              </div>

            </div>

          </div>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="avisos-message">
            Cargando avisos institucionales...
          </div>
        )}


        {/* SIN AVISOS */}

        {!loading &&
          !error &&
          avisos.length === 0 && (

            <div className="avisos-message">

              No hay avisos institucionales activos.

            </div>

          )}


        {/* LISTA */}

        {!loading &&
          avisos.length > 0 && (

            <div className="avisos-list">

              {avisos.map(aviso => {

                const cfg =
                  TIPO_CONFIG[
                    aviso.tipo
                  ] ||
                  TIPO_CONFIG.importante


                const TipoIcon =
                  cfg.Icon


                return (

                  <div
                    key={aviso.id}
                    className="avisos-card"
                    style={{
                      borderLeftColor:
                        cfg.color,
                    }}
                  >

                    <div className="avisos-card-top">

                      <div className="avisos-title-wrap">

                        <div
                          className="avisos-icon"
                          style={{
                            color:
                              cfg.color,
                          }}
                        >

                          <TipoIcon
                            size={17}
                          />

                        </div>


                        <div className="avisos-title">
                          {aviso.titulo}
                        </div>

                      </div>


                      <span
                        className="avisos-pill"
                        style={{
                          color:
                            cfg.color,

                          background:
                            cfg.background,

                          borderColor:
                            cfg.border,
                        }}
                      >
                        {cfg.label}
                      </span>

                    </div>


                    <div className="avisos-body">
                      {aviso.cuerpo}
                    </div>


                    <div className="avisos-date">

                      Publicado:{' '}

                      {formatearFecha(
                        aviso.fecha_publicacion
                      )}

                    </div>

                  </div>

                )
              })}

            </div>

          )}

      </div>
    </>
  )
}