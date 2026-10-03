import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  Pill,
  DataTable,
  TR,
  TD,
  BtnPrimary,
} from '../UI'

export default function CiclosAdmin() {
  const [ciclos, setCiclos] = useState([])

  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarCiclos()
  }, [])

  // ==================================================
  // CARGAR CICLOS
  // ==================================================

  const cargarCiclos = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error: queryError } =
        await supabase
          .from('ciclos_escolares')
          .select(`
            id,
            nombre,
            fecha_inicio,
            fecha_fin,
            activo,
            created_at
          `)
          .order('nombre', {
            ascending: false,
          })

      if (queryError) {
        throw queryError
      }

      setCiclos(data || [])
    } catch (err) {
      console.error(
        'Error cargando ciclos:',
        err
      )

      setError(
        err?.message ||
        'No se pudieron cargar los ciclos escolares.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==================================================
  // CREAR CICLO
  // ==================================================

  const crearCiclo = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError(
        'Escribe el nombre del ciclo escolar.'
      )
      return
    }

    // Formato esperado:
    // 2026-2027

    const formatoCiclo =
      /^\d{4}-\d{4}$/

    if (
      !formatoCiclo.test(
        nombre.trim()
      )
    ) {
      setError(
        'El ciclo debe tener formato 2026-2027.'
      )
      return
    }

    const [
      inicio,
      fin,
    ] = nombre
      .trim()
      .split('-')
      .map(Number)

    if (fin !== inicio + 1) {
      setError(
        'El segundo año debe ser consecutivo. Ejemplo: 2026-2027.'
      )
      return
    }

    if (
      fechaInicio &&
      fechaFin &&
      new Date(fechaFin) <=
        new Date(fechaInicio)
    ) {
      setError(
        'La fecha final debe ser posterior a la fecha inicial.'
      )
      return
    }

    setSaving(true)

    try {
      const {
        error: insertError,
      } = await supabase
        .from('ciclos_escolares')
        .insert({
          nombre:
            nombre.trim(),

          fecha_inicio:
            fechaInicio ||
            null,

          fecha_fin:
            fechaFin ||
            null,

          activo: false,
        })

      if (insertError) {
        throw insertError
      }

      setNombre('')
      setFechaInicio('')
      setFechaFin('')

      setMensaje(
        'Ciclo escolar creado correctamente.'
      )

      await cargarCiclos()
    } catch (err) {
      console.error(
        'Error creando ciclo:',
        err
      )

      if (
        err?.code === '23505'
      ) {
        setError(
          'Ese ciclo escolar ya existe.'
        )
      } else {
        setError(
          err?.message ||
          'No se pudo crear el ciclo escolar.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // ACTIVAR CICLO
  // ==================================================

  const activarCiclo = async ciclo => {
    if (ciclo.activo) {
      return
    }

    const confirmar =
      window.confirm(
        `¿Deseas establecer ${ciclo.nombre} como ciclo escolar activo?`
      )

    if (!confirmar) {
      return
    }

    setError('')
    setMensaje('')
    setSaving(true)

    try {
      const {
        error: rpcError,
      } = await supabase.rpc(
        'activar_ciclo_escolar',
        {
          _ciclo_id:
            ciclo.id,
        }
      )

      if (rpcError) {
        throw rpcError
      }

      setMensaje(
        `${ciclo.nombre} ahora es el ciclo escolar activo.`
      )

      await cargarCiclos()
    } catch (err) {
      console.error(
        'Error activando ciclo:',
        err
      )

      setError(
        err?.message ||
        'No se pudo cambiar el ciclo activo.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==================================================
  // ELIMINAR CICLO
  // ==================================================

  const eliminarCiclo = async ciclo => {
    if (ciclo.activo) {
      setError(
        'No puedes eliminar el ciclo escolar activo.'
      )
      return
    }

    const confirmar =
      window.confirm(
        `¿Deseas eliminar el ciclo ${ciclo.nombre}?`
      )

    if (!confirmar) {
      return
    }

    setError('')
    setMensaje('')

    try {
      const {
        error: deleteError,
      } = await supabase
        .from('ciclos_escolares')
        .delete()
        .eq('id', ciclo.id)

      if (deleteError) {
        throw deleteError
      }

      setMensaje(
        'Ciclo escolar eliminado correctamente.'
      )

      await cargarCiclos()
    } catch (err) {
      console.error(
        'Error eliminando ciclo:',
        err
      )

      if (
        err?.code === '23503'
      ) {
        setError(
          'No puedes eliminar este ciclo porque tiene grupos relacionados.'
        )
      } else {
        setError(
          err?.message ||
          'No se pudo eliminar el ciclo escolar.'
        )
      }
    }
  }

  const formatearFecha = fecha => {
    if (!fecha) {
      return '—'
    }

    return new Date(
      `${fecha}T00:00:00`
    ).toLocaleDateString(
      'es-MX'
    )
  }

  if (loading) {
    return (
      <Card>
        <div
          className="p-6 text-sm"
          style={{
            color: '#506070',
          }}
        >
          Cargando ciclos escolares...
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* MENSAJE */}

      {mensaje && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background:
              '#dcfce7',
            border:
              '1px solid #86efac',
            color:
              '#166534',
          }}
        >
          {mensaje}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background:
              '#fee2e2',
            border:
              '1px solid #fca5a5',
            color:
              '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      {/* NUEVO CICLO */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Ciclos escolares
            </CardTitle>

            <CardSubtitle>
              Crea y administra los periodos académicos del sistema
            </CardSubtitle>
          </div>

          <Pill variant="blue">
            {ciclos.length} ciclos
          </Pill>
        </CardHeader>

        <form
          onSubmit={crearCiclo}
          className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs font-bold mb-2">
              Ciclo
            </label>

            <input
              value={nombre}
              onChange={e =>
                setNombre(
                  e.target.value
                )
              }
              placeholder="2027-2028"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">
              Fecha de inicio
            </label>

            <input
              type="date"
              value={fechaInicio}
              onChange={e =>
                setFechaInicio(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">
              Fecha final
            </label>

            <input
              type="date"
              value={fechaFin}
              onChange={e =>
                setFechaFin(
                  e.target.value
                )
              }
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{
                border:
                  '1px solid #DDE4ED',
              }}
            />
          </div>

          <div className="flex items-end">
            <BtnPrimary
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Crear ciclo'}
            </BtnPrimary>
          </div>
        </form>
      </Card>

      {/* LISTADO */}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Ciclos registrados
            </CardTitle>

            <CardSubtitle>
              Solo puede existir un ciclo activo al mismo tiempo
            </CardSubtitle>
          </div>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Ciclo',
            'Inicio',
            'Fin',
            'Estado',
            'Acciones',
          ]}
          rows={
            <>
              {ciclos.map(
                (
                  ciclo,
                  index
                ) => (
                  <TR
                    key={
                      ciclo.id
                    }
                  >
                    <TD>
                      {index + 1}
                    </TD>

                    <TD className="font-semibold">
                      {
                        ciclo.nombre
                      }
                    </TD>

                    <TD>
                      {formatearFecha(
                        ciclo.fecha_inicio
                      )}
                    </TD>

                    <TD>
                      {formatearFecha(
                        ciclo.fecha_fin
                      )}
                    </TD>

                    <TD>
                      <Pill
                        variant={
                          ciclo.activo
                            ? 'success'
                            : 'default'
                        }
                      >
                        {ciclo.activo
                          ? 'Activo'
                          : 'Inactivo'}
                      </Pill>
                    </TD>

                    <TD>
                      <div className="flex flex-wrap gap-2">
                        {!ciclo.activo && (
                          <button
                            type="button"
                            onClick={() =>
                              activarCiclo(
                                ciclo
                              )
                            }
                            className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                            style={{
                              background:
                                '#EFF6FF',
                              border:
                                '1px solid #BFDBFE',
                              color:
                                '#1E40AF',
                            }}
                          >
                            Marcar activo
                          </button>
                        )}

                        {!ciclo.activo && (
                          <button
                            type="button"
                            onClick={() =>
                              eliminarCiclo(
                                ciclo
                              )
                            }
                            className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
                            style={{
                              background:
                                '#fee2e2',
                              border:
                                '1px solid #fecaca',
                              color:
                                '#991b1b',
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </TD>
                  </TR>
                )
              )}

              {ciclos.length ===
                0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color:
                        '#8FA0AF',
                    }}
                  >
                    No hay ciclos escolares registrados.
                  </td>
                </tr>
              )}
            </>
          }
        />
      </Card>
    </div>
  )
}