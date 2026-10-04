import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar  from '../components/Topbar'

// ── Alumno views
import DatosAlumno      from '../components/alumno/DatosAlumno'
import HorarioAlumno    from '../components/alumno/HorarioAlumno'
import TramitesAlumno   from '../components/alumno/TramitesAlumno'
import CalendarioAlumno from '../components/alumno/CalendarioAlumno'
import CalifAlumno      from '../components/alumno/CalifAlumno'

// ── Docente views
import DatosDocente      from '../components/docente/DatosDocente'
import CalifDocente      from '../components/docente/CalifDocente'
import AsistenciaDocente from '../components/docente/AsistenciaDocente'
import ReportesDocente   from '../components/docente/ReportesDocente'
import AvisosDocente     from '../components/docente/AvisosDocente'

// ── Tutor views
import DatosTutor      from '../components/tutor/DatosTutor'
import HorarioTutor    from '../components/tutor/HorarioTutor'
import CalifTutor      from '../components/tutor/CalifTutor'
import CalendarioTutor from '../components/tutor/CalendarioTutor'
import TramitesTutor   from '../components/tutor/TramitesTutor'

// ── Nuevos módulos
import DatosAspirante from '../components/aspirante/DatosAspirante'
import DatosAdministrativo from '../components/administrativo/DatosAdministrativo'
import DatosCoordinador from '../components/coordinador/DatosCoordinador'

const NAV_ALUMNO  = [
  { id: 'datos',      label: 'Mi Perfil' },
  { id: 'calif',      label: 'Calificaciones' },
  { id: 'horario',    label: 'Horario' },
  { id: 'tramites',   label: 'Trámites' },
  { id: 'calendario', label: 'Calendario' },
]
const NAV_DOCENTE = [
  { id: 'datos',      label: 'Mi Perfil' },
  { id: 'calif',      label: 'Calificaciones' },
  { id: 'asistencia', label: 'Asistencia' },
  { id: 'reportes',   label: 'Reportes' },
  { id: 'avisos',     label: 'Avisos' },
]
const NAV_TUTOR = [
  { id: 'datos',      label: 'Mi Perfil' },
  { id: 'calif',      label: 'Calificaciones' },
  { id: 'horario',    label: 'Horario' },
  { id: 'tramites',   label: 'Trámites' },
  { id: 'calendario', label: 'Calendario' },
]
const NAV_ASPIRANTE = [
  { id: 'datos', label: 'Proceso de Admisión' },
]
const NAV_ADMINISTRATIVO = [
  { id: 'datos', label: 'Gestión Administrativa' },
]
const NAV_COORDINADOR = [
  { id: 'datos', label: 'Supervisión' },
]
const NAV_MAP = { 
  alumno: NAV_ALUMNO, 
  docente: NAV_DOCENTE, 
  tutor: NAV_TUTOR,
  aspirante: NAV_ASPIRANTE,
  administrativo: NAV_ADMINISTRATIVO,
  coordinador: NAV_COORDINADOR
}

const SECTION_TITLES = {
  datos: 'Mi Perfil', calif: 'Calificaciones', horario: 'Horario de Clases',
  tramites: 'Trámites Escolares', calendario: 'Calendario Escolar',
  asistencia: 'Asistencia', reportes: 'Reportes', avisos: 'Avisos Institucionales',
}

function renderView(role, activeSection, user) {
  if (role === 'alumno') {
    if (activeSection === 'datos')      return <DatosAlumno user={user} />
    if (activeSection === 'calif')      return <CalifAlumno user={user} />
    if (activeSection === 'horario')    return <HorarioAlumno user={user} />
    if (activeSection === 'tramites')   return <TramitesAlumno />
    if (activeSection === 'calendario') return <CalendarioAlumno />
    return <DatosAlumno user={user} />
  }
  if (role === 'docente') {
    if (activeSection === 'datos')      return <DatosDocente user={user} />
    if (activeSection === 'calif')      return <CalifDocente user={user} />
    if (activeSection === 'asistencia') return <AsistenciaDocente user={user} />
    if (activeSection === 'reportes')   return <ReportesDocente user={user} />
    if (activeSection === 'avisos')     return <AvisosDocente />
    return <DatosDocente user={user} />
  }
  if (role === 'tutor') {
    if (activeSection === 'datos')      return <DatosTutor user={user} />
    if (activeSection === 'calif')      return <CalifTutor user={user} />
    if (activeSection === 'horario')    return <HorarioTutor user={user} />
    if (activeSection === 'tramites')   return <TramitesTutor />
    if (activeSection === 'calendario') return <CalendarioTutor />
    return <DatosTutor user={user} />
  }
  if (role === 'aspirante') {
    return <DatosAspirante user={user} />
  }
  if (role === 'administrativo') {
    return <DatosAdministrativo user={user} />
  }
  if (role === 'coordinador') {
    return <DatosCoordinador user={user} />
  }
}

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('datos')
  const [collapsed, setCollapsed]         = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)

  const navItems = NAV_MAP[user.role]

  return (
    <div className="flex h-svh overflow-hidden" style={{ background: '#F4F7FA' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(15,30,43,.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless mobileOpen */}
      <div className={[
        'fixed lg:static z-50 h-full transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>
        <Sidebar
          user={user}
          navItems={navItems}
          active={activeSection}
          onNav={(id) => { setActiveSection(id); setMobileOpen(false) }}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          onLogout={onLogout}
        />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar
          title={SECTION_TITLES[activeSection] || 'Dashboard'}
          user={user}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />

        <main
          key={activeSection}
          className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-up"
        >
          <div className="max-w-6xl mx-auto">
            {renderView(user.role, activeSection, user)}
          </div>
        </main>
      </div>
    </div>
  )
}
