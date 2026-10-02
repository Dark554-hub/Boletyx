import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { BoletyxLogo, IconMail, IconLock, IconEye, IconEyeOff, IconArrowLeft, IconXCircle } from '../components/Icons'

const ROLE_LABELS = {
  alumno: 'Alumno',
  docente: 'Docente',
  admin: 'Administrador',
}

export default function Login({ role, onLogin, onBack }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  // 1. Iniciar sesión con Supabase Authentication
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

  if (authError) {
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
    await supabase.auth.signOut()
    setError('No se encontró el perfil de este usuario.')
    return
  }

  // 3. Comprobar que seleccionó el rol correcto
  if (perfil.rol !== role) {
    await supabase.auth.signOut()
    setError(`Esta cuenta pertenece al rol ${perfil.rol}.`)
    return
  }

  let datosRol = {}

if (perfil.rol === 'alumno') {
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('*')
    .eq('perfil_id', authData.user.id)
    .single()

  if (alumnoError || !alumno) {
    await supabase.auth.signOut()
    setError('No se encontraron los datos académicos del alumno.')
    return
  }

  datosRol = {
  alumno_id: alumno.id,
  matricula: alumno.matricula,
  semestre: alumno.semestre,
  grupo: alumno.grupo,
  turno: alumno.turno,
}
}

if (perfil.rol === 'docente') {
  const { data: docente, error: docenteError } = await supabase
    .from('docentes')
    .select('*')
    .eq('perfil_id', authData.user.id)
    .single()

  if (docenteError || !docente) {
    await supabase.auth.signOut()
    setError('No se encontraron los datos del docente.')
    return
  }

  datosRol = {
    docente_id: docente.id,
    numero_empleado: docente.numero_empleado,
    especialidad: docente.especialidad,
  }
}

const user = {
  id: perfil.id,
  nombre: perfil.nombre,
  apellido: perfil.apellido,
  role: perfil.rol,
  email: authData.user.email,

  ...datosRol,
}

  onLogin(user)
}

  return (
    <div
      className="min-h-svh flex items-center justify-center p-5"
      style={{ background: 'linear-gradient(145deg, #152938 0%, #203A50 45%, #1a3040 100%)' }}
    >
      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-10 animate-fade-up">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <BoletyxLogo size={52} showText dark />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
            style={{ background: 'rgba(32,58,80,.07)', color: '#203A50' }}>
            Acceso {ROLE_LABELS[role]}
          </span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ color: '#0F1E2B' }}>Bienvenido de vuelta</h2>
        <p className="text-sm mb-7" style={{ color: '#506070' }}>Ingresa tus credenciales para continuar</p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-5"
            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            <IconXCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#506070' }}>
              Correo institucional
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8FA0AF' }}>
                <IconMail size={15} />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="usuario@boletyx.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #DDE4ED',
                  background: '#F4F7FA',
                  color: '#0F1E2B',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#203A50'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(32,58,80,.08)' }}
                onBlur={e => { e.target.style.borderColor = '#DDE4ED'; e.target.style.background = '#F4F7FA'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#506070' }}>
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8FA0AF' }}>
                <IconLock size={15} />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #DDE4ED',
                  background: '#F4F7FA',
                  color: '#0F1E2B',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#203A50'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(32,58,80,.08)' }}
                onBlur={e => { e.target.style.borderColor = '#DDE4ED'; e.target.style.background = '#F4F7FA'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center"
                style={{ color: '#8FA0AF', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer mt-1"
            style={{
              background: 'linear-gradient(135deg,#203A50,#203A55)',
              boxShadow: '0 4px 16px rgba(32,58,80,.25)',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            Iniciar sesión
          </button>
        </form>

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 w-full mt-4 text-xs font-semibold cursor-pointer transition-colors"
          style={{ background: 'none', border: 'none', color: '#8FA0AF', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.color = '#203A50'}
          onMouseLeave={e => e.currentTarget.style.color = '#8FA0AF'}
        >
          <IconArrowLeft size={13} /> Cambiar rol
        </button>
      </div>
    </div>
  )
}
