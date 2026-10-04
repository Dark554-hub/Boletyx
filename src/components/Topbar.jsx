import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { IconBell, IconMenu } from './Icons'

function formatearFecha(fecha) {
  if (!fecha) return '—'

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

function obtenerIniciales(nombre, apellido) {
  const primera =
    nombre?.trim()?.charAt(0) || ''

  const segunda =
    apellido?.trim()?.charAt(0) || ''

  const iniciales =
    `${primera}${segunda}`
      .toUpperCase()

  return iniciales || 'U'
}

export default function Topbar({
  title,
  user,
  onMenuClick,
}) {
  const [open, setOpen] = useState(false)

  const [avisos, setAvisos] = useState([])
  const [loadingAvisos, setLoadingAvisos] =
    useState(true)

  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    cargarAvisos()
  }, [])

  useEffect(() => {
    cargarPerfil()
  }, [user?.id, title])

  async function cargarAvisos() {
    try {
      setLoadingAvisos(true)

      const {
        data,
        error,
      } = await supabase
        .from('avisos')
        .select(`
          id,
          titulo,
          fecha_publicacion,
          activo
        `)
        .order(
          'fecha_publicacion',
          {
            ascending: false,
          }
        )
        .limit(4)

      if (error) {
        throw error
      }

      setAvisos(data || [])
    } catch (err) {
      console.error(
        'Error cargando avisos del Topbar:',
        err
      )

      setAvisos([])
    } finally {
      setLoadingAvisos(false)
    }
  }

  async function cargarPerfil() {
    try {
      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser()

      if (authError) {
        throw authError
      }

      const authUser =
        authData?.user

      if (!authUser?.id) {
        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('perfiles')
        .select(`
          id,
          nombre,
          apellido,
          rol
        `)
        .eq(
          'id',
          authUser.id
        )
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setPerfil(data)
      }
    } catch (err) {
      console.error(
        'Error cargando perfil del Topbar:',
        err
      )
    }
  }

  useEffect(() => {
    const actualizarPerfil = () => {
      cargarPerfil()
    }

    window.addEventListener(
      'boletyx:perfil-actualizado',
      actualizarPerfil
    )

    return () => {
      window.removeEventListener(
        'boletyx:perfil-actualizado',
        actualizarPerfil
      )
    }
  }, [])

  const nombreCompleto = useMemo(() => {
    if (perfil) {
      return [
        perfil.nombre,
        perfil.apellido,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()
    }

    return (
      user?.nombre ||
      'Usuario'
    )
  }, [
    perfil,
    user?.nombre,
  ])

  const avatar = useMemo(() => {
    if (perfil) {
      return obtenerIniciales(
        perfil.nombre,
        perfil.apellido
      )
    }

    return (
      user?.avatar ||
      obtenerIniciales(
        user?.nombre,
        ''
      )
    )
  }, [
    perfil,
    user?.avatar,
    user?.nombre,
  ])

  return (
    <header
      className="h-16 flex items-center px-6 gap-4 shrink-0"
      style={{
        background: '#ffffff',
        borderBottom:
          '1px solid #DDE4ED',
        boxShadow:
          '0 1px 4px rgba(32,58,80,.04)',
      }}
    >
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg cursor-pointer border-none"
        style={{
          background:
            '#F4F7FA',
          color: '#506070',
        }}
      >
        <IconMenu size={18} />
      </button>

      <h2
        className="flex-1 text-base font-bold"
        style={{
          color: '#203A50',
        }}
      >
        {title}
      </h2>

      <div className="flex items-center gap-2.5">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpen(!open)
            }
            className="relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border transition-all duration-150"
            style={{
              background:
                '#F4F7FA',
              borderColor:
                '#DDE4ED',
              color:
                '#506070',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor =
                '#203A50'
              e.currentTarget.style.color =
                '#203A50'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor =
                '#DDE4ED'
              e.currentTarget.style.color =
                '#506070'
            }}
            aria-label="Avisos recientes"
          >
            <IconBell size={16} />

            {avisos.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{
                  background:
                    '#ef4444',
                  border:
                    '2px solid #fff',
                }}
              />
            )}
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setOpen(false)
                }
              />

              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in"
                style={{
                  borderColor:
                    '#DDE4ED',
                  boxShadow:
                    '0 8px 36px rgba(32,58,80,.16)',
                }}
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-3.5 border-b"
                  style={{
                    borderColor:
                      '#DDE4ED',
                  }}
                >
                  <IconBell
                    size={14}
                    style={{
                      color:
                        '#203A50',
                    }}
                  />

                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        '#0F1E2B',
                    }}
                  >
                    Avisos recientes
                  </span>
                </div>

                {loadingAvisos && (
                  <div
                    className="px-4 py-6 text-center text-xs"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    Cargando avisos...
                  </div>
                )}

                {!loadingAvisos &&
                  avisos.length ===
                    0 && (
                    <div
                      className="px-4 py-6 text-center text-xs"
                      style={{
                        color:
                          '#8FA0AF',
                      }}
                    >
                      No hay avisos recientes.
                    </div>
                  )}

                {!loadingAvisos &&
                  avisos.map(
                    aviso => (
                      <div
                        key={
                          aviso.id
                        }
                        className="px-4 py-3 border-b transition-colors"
                        style={{
                          borderColor:
                            '#DDE4ED',
                        }}
                        onMouseEnter={e =>
                          e
                            .currentTarget
                            .style
                            .background =
                            '#F4F7FA'
                        }
                        onMouseLeave={e =>
                          e
                            .currentTarget
                            .style
                            .background =
                            '#fff'
                        }
                      >
                        <p
                          className="text-[13px] font-semibold mb-0.5"
                          style={{
                            color:
                              '#0F1E2B',
                          }}
                        >
                          {
                            aviso.titulo
                          }
                        </p>

                        <p
                          className="text-[11px]"
                          style={{
                            color:
                              '#8FA0AF',
                          }}
                        >
                          {formatearFecha(
                            aviso.fecha_publicacion
                          )}
                        </p>
                      </div>
                    )
                  )}

                <div className="px-4 py-2.5 text-center">
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    Últimos{' '}
                    {avisos.length}{' '}
                    aviso(s)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
          style={{
            background:
              'linear-gradient(135deg,#203A50,#203A55)',
            border:
              '2px solid #DDE4ED',
          }}
          title={nombreCompleto}
        >
          {avatar}
        </div>
      </div>
    </header>
  )
}
