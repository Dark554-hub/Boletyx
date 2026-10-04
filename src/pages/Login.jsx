import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BoletyxLogo,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
  IconXCircle,
} from '../components/Icons'

const ROLE_LABELS = {
  alumno: 'Alumno',
  docente: 'Docente',
  admin: 'Administrador',
  tutor: 'Tutor',
  aspirante: 'Aspirante',
  coordinador: 'Coordinador',
}

export default function Login({ role, onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Iniciar sesión con Supabase Authentication
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError || !authData?.user) {
        setError('Correo o contraseña incorrectos.')
        return
      }

      // 2. Obtener el perfil del usuario autenticado
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (perfilError || !perfil) {
        console.error('ERROR PERFIL:', perfilError)

        await supabase.auth.signOut()
        setError('No se encontró el perfil de este usuario.')
        return
      }

      // 3. Comprobar que seleccionó el rol correcto
      if (perfil.rol !== role) {
        await supabase.auth.signOut()

        const rolReal =
          ROLE_LABELS[perfil.rol] || perfil.rol

        setError(
          `Esta cuenta pertenece al rol ${rolReal}.`
        )

        return
      }

      let datosRol = {}

      // ─────────────────────────────
      // ALUMNO
      // ─────────────────────────────
      if (perfil.rol === 'alumno') {
        const { data: alumno, error: alumnoError } =
          await supabase
            .from('alumnos')
            .select('*')
            .eq('perfil_id', authData.user.id)
            .single()

        if (alumnoError || !alumno) {
          console.error('ERROR ALUMNO:', alumnoError)

          await supabase.auth.signOut()

          setError(
            'No se encontraron los datos académicos del alumno.'
          )

          return
        }

        datosRol = {
          alumno_id: alumno.id,
          matricula: alumno.matricula,
          semestre: alumno.semestre,
          grupo: alumno.grupo,
          turno: alumno.turno,
          area_id: alumno.area_id,
        }
      }

      // ─────────────────────────────
      // DOCENTE
      // ─────────────────────────────
      if (perfil.rol === 'docente') {
        const { data: docente, error: docenteError } =
          await supabase
            .from('docentes')
            .select('*')
            .eq('perfil_id', authData.user.id)
            .single()

        if (docenteError || !docente) {
          console.error('ERROR DOCENTE:', docenteError)

          await supabase.auth.signOut()

          setError(
            'No se encontraron los datos del docente.'
          )

          return
        }

        datosRol = {
          docente_id: docente.id,
          numero_empleado: docente.numero_empleado,
          especialidad: docente.especialidad,
        }
      }

      // ─────────────────────────────
      // ADMINISTRADOR
      // ─────────────────────────────
      //
      // El administrador actualmente obtiene la información
      // necesaria directamente desde "perfiles", por lo que
      // no necesitamos consultar otra tabla aquí.

      // ─────────────────────────────
      // TUTOR
      // ─────────────────────────────
      //
      // Por ahora el Tutor puede autenticarse utilizando:
      //
      // auth.users
      //      ↓
      // perfiles
      //
      // Más adelante agregaremos aquí la relación Tutor → Alumno
      // cuando definamos su estructura en Supabase.

      // ─────────────────────────────
      // ASPIRANTE
      // ─────────────────────────────
      //
      // Por ahora utiliza únicamente su perfil.
      // Después conectaremos sus datos de admisión.

      // ─────────────────────────────
      // COORDINADOR
      // ─────────────────────────────
      //
      // Por ahora utiliza únicamente su perfil.
      // Después conectaremos sus datos y permisos.

      // 4. Construir el usuario que utilizará la aplicación
      const user = {
        id: perfil.id,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        role: perfil.rol,
        email: authData.user.email,

        ...datosRol,
      }

      // 5. Entrar al Dashboard
      onLogin(user)
    } catch (err) {
      console.error('ERROR LOGIN:', err)

      setError(
        'Ocurrió un error al iniciar sesión. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-svh flex items-center justify-center p-5"
      style={{
        background:
          'linear-gradient(145deg, #152938 0%, #203A50 45%, #1a3040 100%)',
      }}
    >
      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-10 animate-fade-up">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <BoletyxLogo
            size={52}
            showText
            dark
          />

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
            style={{
              background: 'rgba(32,58,80,.07)',
              color: '#203A50',
            }}
          >
            Acceso {ROLE_LABELS[role] || role}
          </span>
        </div>

        <h2
          className="text-xl font-bold mb-1"
          style={{
            color: '#0F1E2B',
          }}
        >
          Bienvenido de vuelta
        </h2>

        <p
          className="text-sm mb-7"
          style={{
            color: '#506070',
          }}
        >
          Ingresa tus credenciales para continuar
        </p>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-5"
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
            }}
          >
            <IconXCircle size={15} />

            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Email */}
          <div>
            <label
              className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{
                color: '#506070',
              }}
            >
              Correo institucional
            </label>

            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{
                  color: '#8FA0AF',
                }}
              >
                <IconMail size={15} />
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                disabled={loading}
                placeholder="usuario@boletyx.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #DDE4ED',
                  background: '#F4F7FA',
                  color: '#0F1E2B',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    '#203A50'

                  e.target.style.background =
                    '#fff'

                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(32,58,80,.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    '#DDE4ED'

                  e.target.style.background =
                    '#F4F7FA'

                  e.target.style.boxShadow =
                    'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
              style={{
                color: '#506070',
              }}
            >
              Contraseña
            </label>

            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{
                  color: '#8FA0AF',
                }}
              >
                <IconLock size={15} />
              </span>

              <input
                type={
                  showPass
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #DDE4ED',
                  background: '#F4F7FA',
                  color: '#0F1E2B',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    '#203A50'

                  e.target.style.background =
                    '#fff'

                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(32,58,80,.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    '#DDE4ED'

                  e.target.style.background =
                    '#F4F7FA'

                  e.target.style.boxShadow =
                    'none'
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPass(!showPass)
                }
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center"
                style={{
                  color: '#8FA0AF',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={
                  showPass
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                {showPass ? (
                  <IconEyeOff size={15} />
                ) : (
                  <IconEye size={15} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 mt-1"
            style={{
              background:
                'linear-gradient(135deg,#203A50,#203A55)',
              boxShadow:
                '0 4px 16px rgba(32,58,80,.25)',
              border: 'none',
              fontFamily: 'inherit',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? 'Iniciando sesión...'
              : 'Iniciar sesión'}
          </button>
        </form>

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 w-full mt-4 text-xs font-semibold cursor-pointer transition-colors"
          style={{
            background: 'none',
            border: 'none',
            color: '#8FA0AF',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              '#203A50'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              '#8FA0AF'
          }}
        >
          <IconArrowLeft size={13} />

          Cambiar rol
        </button>
      </div>
    </div>
  )
}