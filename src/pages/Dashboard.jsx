import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

// ── Alumno views
import DatosAlumno from '../components/alumno/DatosAlumno'
import HorarioAlumno from '../components/alumno/HorarioAlumno'
import TramitesAlumno from '../components/alumno/TramitesAlumno'
import CalendarioAlumno from '../components/alumno/CalendarioAlumno'
import CalifAlumno from '../components/alumno/CalifAlumno'

// ── Docente views
import DatosDocente from '../components/docente/DatosDocente'
import CalifDocente from '../components/docente/CalifDocente'
import AsistenciaDocente from '../components/docente/AsistenciaDocente'
import ReportesDocente from '../components/docente/ReportesDocente'
import AvisosDocente from '../components/docente/AvisosDocente'

// ── Administrador views
import DatosAdmin from '../components/admin/DatosAdmin'
import AlumnosAdmin from '../components/admin/AlumnosAdmin'
import InscripcionesAdmin from '../components/admin/InscripcionesAdmin'
import MatriculasAdmin from '../components/admin/MatriculasAdmin'
import AcademicoAdmin from '../components/admin/AcademicoAdmin'

// ── Tutor views
import DatosTutor from '../components/tutor/DatosTutor'
import CalifTutor from '../components/tutor/CalifTutor'
import HorarioTutor from '../components/tutor/HorarioTutor'
import TramitesTutor from '../components/tutor/TramitesTutor'
import CalendarioTutor from '../components/tutor/CalendarioTutor'

// ── Aspirante views
import DatosAspirante from '../components/aspirante/DatosAspirante'
import DocumentosAspirante from '../components/aspirante/DocumentosAspirante'
import PagosAspirante from '../components/aspirante/PagosAspirante'

// ── Coordinador views
import DatosCoordinador from '../components/coordinador/DatosCoordinador'
import PlantillaDocente from '../components/coordinador/PlantillaDocente'

// ======================================================
// NAVEGACIÓN
// ======================================================

const NAV_ALUMNO = [
  { id: 'datos', label: 'Mi Perfil' },
  { id: 'calif', label: 'Calificaciones' },
  { id: 'horario', label: 'Horario' },
  { id: 'tramites', label: 'Trámites' },
  { id: 'calendario', label: 'Calendario' },
]

const NAV_DOCENTE = [
  { id: 'datos', label: 'Mi Perfil' },
  { id: 'calif', label: 'Calificaciones' },
  { id: 'asistencia', label: 'Asistencia' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'avisos', label: 'Avisos' },
]

const NAV_ADMIN = [
  { id: 'datos', label: 'Panel' },
  { id: 'alumnos', label: 'Alumnos' },
  { id: 'inscripciones', label: 'Inscripciones' },
  { id: 'academico', label: 'Académico' },
  { id: 'matriculas', label: 'Matrículas' },
]

const NAV_TUTOR = [
  { id: 'datos', label: 'Mi Perfil' },
  { id: 'calif', label: 'Calificaciones' },
  { id: 'horario', label: 'Horario' },
  { id: 'tramites', label: 'Trámites' },
  { id: 'calendario', label: 'Calendario' },
]

const NAV_ASPIRANTE = [
  { id: 'datos', label: 'Proceso de Admisión' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'pagos', label: 'Pagos' },
]

const NAV_COORDINADOR = [
  {
    id: 'datos',
    label: 'Coordinación Académica',
  },
  {
    id: 'plantilla',
    label: 'Plantilla Docente',
  },
]

const NAV_MAP = {
  alumno: NAV_ALUMNO,
  docente: NAV_DOCENTE,
  admin: NAV_ADMIN,
  tutor: NAV_TUTOR,
  aspirante: NAV_ASPIRANTE,
  coordinador: NAV_COORDINADOR,
}

// ======================================================
// TÍTULOS
// ======================================================

const SECTION_TITLES = {
  datos: 'Mi Perfil',
  calif: 'Calificaciones',
  horario: 'Horario de Clases',
  tramites: 'Trámites Escolares',
  calendario: 'Calendario Escolar',
  asistencia: 'Asistencia',
  reportes: 'Reportes',
  avisos: 'Avisos Institucionales',
  academico: 'Gestión Académica',
  alumnos: 'Alumnos',
  matriculas: 'Matrículas',
  inscripciones: 'Inscripciones',
  documentos: 'Documentos',
  pagos: 'Pagos',
  plantilla: 'Plantilla Docente',
}

// ======================================================
// VISTAS
// ======================================================

function renderView(
  role,
  activeSection,
  user
) {
  // ── Alumno
  if (role === 'alumno') {
    if (activeSection === 'datos') {
      return (
        <DatosAlumno user={user} />
      )
    }

    if (activeSection === 'calif') {
      return (
        <CalifAlumno user={user} />
      )
    }

    if (
      activeSection === 'horario'
    ) {
      return (
        <HorarioAlumno user={user} />
      )
    }

    if (
      activeSection === 'tramites'
    ) {
      return (
        <TramitesAlumno user={user} />
      )
    }

    if (
      activeSection ===
      'calendario'
    ) {
      return <CalendarioAlumno />
    }

    return (
      <DatosAlumno user={user} />
    )
  }

  // ── Docente
  if (role === 'docente') {
    if (activeSection === 'datos') {
      return (
        <DatosDocente user={user} />
      )
    }

    if (activeSection === 'calif') {
      return (
        <CalifDocente user={user} />
      )
    }

    if (
      activeSection ===
      'asistencia'
    ) {
      return (
        <AsistenciaDocente
          user={user}
        />
      )
    }

    if (
      activeSection === 'reportes'
    ) {
      return (
        <ReportesDocente
          user={user}
        />
      )
    }

    if (
      activeSection === 'avisos'
    ) {
      return <AvisosDocente />
    }

    return (
      <DatosDocente user={user} />
    )
  }

  // ── Administrador
  if (role === 'admin') {
    if (activeSection === 'datos') {
      return (
        <DatosAdmin user={user} />
      )
    }

    if (
      activeSection === 'alumnos'
    ) {
      return <AlumnosAdmin />
    }

    if (
      activeSection ===
      'inscripciones'
    ) {
      return <InscripcionesAdmin />
    }

    if (
      activeSection === 'academico'
    ) {
      return <AcademicoAdmin />
    }

    if (
      activeSection ===
      'matriculas'
    ) {
      return <MatriculasAdmin />
    }

    return (
      <DatosAdmin user={user} />
    )
  }

  // ── Tutor
  if (role === 'tutor') {
    if (activeSection === 'datos') {
      return (
        <DatosTutor user={user} />
      )
    }

    if (activeSection === 'calif') {
      return (
        <CalifTutor user={user} />
      )
    }

    if (
      activeSection === 'horario'
    ) {
      return (
        <HorarioTutor user={user} />
      )
    }

    if (
      activeSection === 'tramites'
    ) {
      return (
        <TramitesTutor user={user} />
      )
    }

    if (
      activeSection ===
      'calendario'
    ) {
      return <CalendarioTutor />
    }

    return (
      <DatosTutor user={user} />
    )
  }

  // ── Aspirante
  if (role === 'aspirante') {
    if (activeSection === 'datos') {
      return (
        <DatosAspirante
          user={user}
        />
      )
    }

    if (
      activeSection ===
      'documentos'
    ) {
      return (
        <DocumentosAspirante
          user={user}
        />
      )
    }

    if (
      activeSection === 'pagos'
    ) {
      return (
        <PagosAspirante
          user={user}
        />
      )
    }

    return (
      <DatosAspirante
        user={user}
      />
    )
  }

  // ── Coordinador
  if (role === 'coordinador') {
    if (activeSection === 'datos') {
      return (
        <DatosCoordinador
          user={user}
        />
      )
    }

    if (
      activeSection ===
      'plantilla'
    ) {
      return <PlantillaDocente />
    }

    return (
      <DatosCoordinador
        user={user}
      />
    )
  }

  return null
}

// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard({
  user,
  onLogout,
}) {
  const [
    activeSection,
    setActiveSection,
  ] = useState('datos')

  const [
    collapsed,
    setCollapsed,
  ] = useState(false)

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const navItems =
    NAV_MAP[user.role] || []

  // "datos" significa cosas distintas dependiendo
  // del rol, así que ajustamos el título del Topbar.
  const topbarTitle =
    user.role === 'aspirante' &&
    activeSection === 'datos'
      ? 'Proceso de Admisión'
      : user.role ===
            'coordinador' &&
          activeSection ===
            'datos'
        ? 'Coordinación Académica'
        : SECTION_TITLES[
            activeSection
          ] || 'Dashboard'

  return (
    <div
      className="flex h-svh overflow-hidden"
      style={{
        background:
          '#F4F7FA',
      }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            background:
              'rgba(15,30,43,.55)',
            backdropFilter:
              'blur(2px)',
          }}
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          'fixed lg:static z-50 h-full transition-transform duration-200',

          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <Sidebar
          user={user}
          navItems={navItems}
          active={activeSection}
          onNav={id => {
            setActiveSection(id)
            setMobileOpen(false)
          }}
          collapsed={collapsed}
          onCollapse={() =>
            setCollapsed(
              !collapsed
            )
          }
          onLogout={onLogout}
        />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar
          title={topbarTitle}
          user={user}
          onMenuClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
        />

        <main
          key={activeSection}
          className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-up"
        >
          <div className="max-w-6xl mx-auto">
            {renderView(
              user.role,
              activeSection,
              user
            )}
          </div>
        </main>
      </div>
    </div>
  )
}