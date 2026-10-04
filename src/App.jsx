import { useEffect, useState } from 'react'

import RoleSelector from './pages/RoleSelector'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

import { supabase } from './lib/supabase'


export default function App() {
  const [screen, setScreen] =
    useState('loading')
  // 'loading' | 'role' | 'login' | 'dashboard'

  const [selectedRole, setSelectedRole] =
    useState(null)

  const [user, setUser] =
    useState(null)


  // ==================================================
  // RECONSTRUIR USUARIO DESDE SUPABASE
  // ==================================================

  async function construirUsuario(authUser) {
    if (!authUser?.id) {
      return null
    }

    const {
      data: perfil,
      error: perfilError,
    } = await supabase
      .from('perfiles')
      .select(`
        id,
        nombre,
        apellido,
        rol
      `)
      .eq('id', authUser.id)
      .maybeSingle()

    if (perfilError) {
      throw perfilError
    }

    if (!perfil) {
      return null
    }

    let datosRol = {}


    // ─────────────────────────────
    // ALUMNO
    // ─────────────────────────────

    if (perfil.rol === 'alumno') {
      const {
        data: alumno,
        error: alumnoError,
      } = await supabase
        .from('alumnos')
        .select(`
          id,
          matricula,
          semestre,
          grupo,
          turno,
          area_id
        `)
        .eq(
          'perfil_id',
          authUser.id
        )
        .maybeSingle()

      if (alumnoError) {
        throw alumnoError
      }

      if (!alumno) {
        return null
      }

      datosRol = {
        alumno_id:
          alumno.id,

        matricula:
          alumno.matricula,

        semestre:
          alumno.semestre,

        grupo:
          alumno.grupo,

        turno:
          alumno.turno,

        area_id:
          alumno.area_id,
      }
    }


    // ─────────────────────────────
    // DOCENTE
    // ─────────────────────────────

    if (perfil.rol === 'docente') {
      const {
        data: docente,
        error: docenteError,
      } = await supabase
        .from('docentes')
        .select(`
          id,
          numero_empleado,
          especialidad
        `)
        .eq(
          'perfil_id',
          authUser.id
        )
        .maybeSingle()

      if (docenteError) {
        throw docenteError
      }

      if (!docente) {
        return null
      }

      datosRol = {
        docente_id:
          docente.id,

        numero_empleado:
          docente.numero_empleado,

        especialidad:
          docente.especialidad,
      }
    }


    // ─────────────────────────────
    // USUARIO FINAL
    // ─────────────────────────────

    const nombreCompleto = [
      perfil.nombre,
      perfil.apellido,
    ]
      .filter(Boolean)
      .join(' ')
      .trim()

    const avatar = [
      perfil.nombre,
      perfil.apellido,
    ]
      .filter(Boolean)
      .slice(0, 2)
      .map(
        parte =>
          parte
            .charAt(0)
            .toUpperCase()
      )
      .join('')

    return {
      id:
        perfil.id,

      nombre:
        perfil.nombre,

      apellido:
        perfil.apellido,

      nombreCompleto:
        nombreCompleto ||
        perfil.nombre ||
        'Usuario',

      avatar:
        avatar || 'U',

      role:
        perfil.rol,

      email:
        authUser.email,

      ...datosRol,
    }
  }


  // ==================================================
  // RECUPERAR SESIÓN AL ABRIR / RECARGAR
  // ==================================================

  useEffect(() => {
    let activo = true

    async function recuperarSesion() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession()

        if (error) {
          throw error
        }

        const authUser =
          data?.session?.user

        if (!authUser) {
          if (!activo) return

          setUser(null)
          setSelectedRole(null)
          setScreen('role')

          return
        }

        const usuario =
          await construirUsuario(
            authUser
          )

        if (!activo) return

        if (!usuario) {
          await supabase.auth.signOut()

          setUser(null)
          setSelectedRole(null)
          setScreen('role')

          return
        }

        setUser(usuario)
        setSelectedRole(
          usuario.role
        )
        setScreen('dashboard')
      } catch (err) {
        console.error(
          'Error recuperando sesión:',
          err
        )

        if (!activo) return

        setUser(null)
        setSelectedRole(null)
        setScreen('role')
      }
    }

    recuperarSesion()

    return () => {
      activo = false
    }
  }, [])


  // ==================================================
  // NAVEGACIÓN
  // ==================================================

  const handleRoleSelected =
    role => {
      setSelectedRole(role)
      setScreen('login')
    }


  const handleLogin =
    userData => {
      setUser(userData)

      setSelectedRole(
        userData?.role ||
        selectedRole
      )

      setScreen('dashboard')
    }


  const handleLogout =
    async () => {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error(
          'Error cerrando sesión:',
          err
        )
      } finally {
        setUser(null)
        setSelectedRole(null)
        setScreen('role')
      }
    }


  const handleBack =
    async () => {
      /*
        Si el usuario vuelve desde Login al
        selector de rol, todavía no existe
        sesión autenticada.

        No hacemos signOut aquí para evitar
        tocar una sesión válida restaurada.
      */

      setScreen('role')
      setSelectedRole(null)
    }


  // ==================================================
  // PANTALLA DE CARGA
  // ==================================================

  if (screen === 'loading') {
    return (
      <div
        className="min-h-svh flex items-center justify-center"
        style={{
          background:
            '#F4F7FA',
          color:
            '#506070',
          fontFamily:
            'inherit',
        }}
      >
        <div className="text-sm font-semibold">
          Cargando sesión...
        </div>
      </div>
    )
  }


  // ==================================================
  // PANTALLAS
  // ==================================================

  if (screen === 'role') {
    return (
      <RoleSelector
        onSelect={
          handleRoleSelected
        }
      />
    )
  }


  if (screen === 'login') {
    return (
      <Login
        role={
          selectedRole
        }
        onLogin={
          handleLogin
        }
        onBack={
          handleBack
        }
      />
    )
  }


  if (
    screen === 'dashboard' &&
    user
  ) {
    return (
      <Dashboard
        user={user}
        onLogout={
          handleLogout
        }
      />
    )
  }


  return null
}
