import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  DataTable,
  TR,
  TD,
  PageHeader,
  Pill,
  BtnPrimary,
  BtnOutline,
} from '../UI'

import {
  IconUsers,
  IconPlus,
} from '../Icons'

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  semestre: '1',
  grupo: '',
  turno: 'matutino',
}

export default function AlumnosAdmin() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await supabase
      .from('alumnos')
      .select(`
        id,
        matricula,
        semestre,
        grupo,
        turno,
        perfiles (
          nombre,
          apellido
        )
      `)
      .order('id')

    if (queryError) {
      console.error('Error al cargar alumnos:', queryError)
      setError('No se pudieron cargar los alumnos.')
      setLoading(false)
      return
    }

    setAlumnos(data || [])
    setLoading(false)
  }

  const actualizarCampo = e => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const cerrarModal = () => {
    if (guardando) return

    setModalAbierto(false)
    setForm(FORM_INICIAL)
    setError('')
  }

  const registrarAlumno = async e => {
    e.preventDefault()

    setError('')
    setMensaje('')

    const nombre = form.nombre.trim()
    const apellido = form.apellido.trim()
    const email = form.email.trim().toLowerCase()
    const grupo = form.grupo.trim()

    if (!nombre || !apellido || !email || !form.password) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setGuardando(true)

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke('crear-alumno', {
          body: {
            nombre,
            apellido,
            email,
            password: form.password,
            semestre: Number(form.semestre),
            grupo,
            turno: form.turno,
          },
        })

      if (functionError) {
        throw functionError
      }

      if (!data?.success) {
        throw new Error(
          data?.error || 'No se pudo registrar el alumno.'
        )
      }

      setMensaje(
        `Alumno registrado correctamente. Matrícula: ${data.matricula}`
      )

      setModalAbierto(false)
      setForm(FORM_INICIAL)

      await cargarAlumnos()
    } catch (err) {
      console.error('Error registrando alumno:', err)

      setError(
        err?.message ||
          'Ocurrió un error al registrar el alumno.'
      )
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div
        className="p-6 text-sm"
        style={{ color: '#506070' }}
      >
        Cargando alumnos...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumnos"
        subtitle="Consulta y administra los alumnos registrados"
        action={
          <BtnPrimary
            onClick={() => {
              setError('')
              setMensaje('')
              setModalAbierto(true)
            }}
          >
            <IconPlus size={15} />
            Nuevo alumno
          </BtnPrimary>
        }
      />

      {mensaje && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
          }}
        >
          {mensaje}
        </div>
      )}

      {error && !modalAbierto && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              Alumnos registrados
            </CardTitle>

            <CardSubtitle>
              Información obtenida directamente desde Supabase
            </CardSubtitle>
          </div>

          <Pill variant="blue">
            {alumnos.length} alumnos
          </Pill>
        </CardHeader>

        <DataTable
          headers={[
            '#',
            'Alumno',
            'Matrícula',
            'Semestre',
            'Grupo',
            'Turno',
          ]}
          rows={
            <>
              {alumnos.map((alumno, index) => {
                const perfil = Array.isArray(alumno.perfiles)
                  ? alumno.perfiles[0]
                  : alumno.perfiles

                const nombreCompleto = perfil
                  ? `${perfil.nombre} ${perfil.apellido}`
                  : 'Sin nombre'

                return (
                  <TR key={alumno.id}>
                    <TD
                      style={{
                        color: '#8FA0AF',
                        fontSize: 12,
                      }}
                    >
                      {index + 1}
                    </TD>

                    <TD className="font-semibold">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'rgba(32,58,80,.07)',
                            color: '#203A50',
                          }}
                        >
                          <IconUsers size={16} />
                        </div>

                        <span>
                          {nombreCompleto}
                        </span>
                      </div>
                    </TD>

                    <TD>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: '#203A50' }}
                      >
                        {alumno.matricula || 'Sin matrícula'}
                      </span>
                    </TD>

                    <TD>
                      {alumno.semestre ?? '—'}
                    </TD>

                    <TD>
                      {alumno.grupo || '—'}
                    </TD>

                    <TD>
                      <Pill variant="default">
                        {alumno.turno || 'Sin turno'}
                      </Pill>
                    </TD>
                  </TR>
                )
              })}

              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-sm"
                    style={{
                      color: '#8FA0AF',
                    }}
                  >
                    No hay alumnos registrados.
                  </td>
                </tr>
              )}
            </>
          }
        />
      </Card>

      {/* MODAL NUEVO ALUMNO */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(15,30,43,.55)',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: '1px solid #DDE4ED',
              boxShadow:
                '0 24px 70px rgba(15,30,43,.25)',
            }}
          >
            <div
              className="flex items-start justify-between gap-4 px-6 py-5 border-b"
              style={{
                borderColor: '#DDE4ED',
              }}
            >
              <div>
                <h2
                  className="text-lg font-black"
                  style={{
                    color: '#0F1E2B',
                  }}
                >
                  Registrar nuevo alumno
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color: '#8FA0AF',
                  }}
                >
                  Se creará su cuenta, perfil y registro escolar.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                className="w-9 h-9 rounded-xl text-lg cursor-pointer"
                style={{
                  background: '#F4F7FA',
                  border: '1px solid #DDE4ED',
                  color: '#506070',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={registrarAlumno}>
              <div className="p-6 space-y-5">
                {error && (
                  <div
                    className="px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Campo
                    label="Nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={actualizarCampo}
                    placeholder="Ej. Emilio"
                    required
                  />

                  <Campo
                    label="Apellido"
                    name="apellido"
                    value={form.apellido}
                    onChange={actualizarCampo}
                    placeholder="Ej. García"
                    required
                  />
                </div>

                <Campo
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={actualizarCampo}
                  placeholder="alumno@boletyx.edu"
                  required
                />

                <Campo
                  label="Contraseña temporal"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={actualizarCampo}
                  placeholder="Mínimo 6 caracteres"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-[11px] font-black uppercase tracking-wider mb-2"
                      style={{ color: '#8FA0AF' }}
                    >
                      Semestre
                    </label>

                    <select
                      name="semestre"
                      value={form.semestre}
                      onChange={actualizarCampo}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{
                        border: '1px solid #DDE4ED',
                        color: '#0F1E2B',
                        background: '#FFFFFF',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Campo
                    label="Grupo"
                    name="grupo"
                    value={form.grupo}
                    onChange={actualizarCampo}
                    placeholder="Ej. A"
                  />

                  <div>
                    <label
                      className="block text-[11px] font-black uppercase tracking-wider mb-2"
                      style={{ color: '#8FA0AF' }}
                    >
                      Turno
                    </label>

                    <select
                      name="turno"
                      value={form.turno}
                      onChange={actualizarCampo}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                      style={{
                        border: '1px solid #DDE4ED',
                        color: '#0F1E2B',
                        background: '#FFFFFF',
                      }}
                    >
                      <option value="matutino">
                        Matutino
                      </option>

                      <option value="vespertino">
                        Vespertino
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                  style={{
                    background: '#F4F7FA',
                    color: '#506070',
                    border: '1px solid #DDE4ED',
                  }}
                >
                  La matrícula será generada automáticamente
                  por el sistema.
                </div>
              </div>

              <div
                className="flex justify-end gap-3 px-6 py-4 border-t"
                style={{
                  borderColor: '#DDE4ED',
                  background: '#FAFBFC',
                }}
              >
                <BtnOutline
                  type="button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </BtnOutline>

                <BtnPrimary
                  type="submit"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Registrando...'
                    : 'Registrar alumno'}
                </BtnPrimary>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}) {
  return (
    <div>
      <label
        className="block text-[11px] font-black uppercase tracking-wider mb-2"
        style={{
          color: '#8FA0AF',
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#dc2626' }}> *</span>
        )}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
        style={{
          border: '1px solid #DDE4ED',
          color: '#0F1E2B',
          background: '#FFFFFF',
        }}
      />
    </div>
  )
}