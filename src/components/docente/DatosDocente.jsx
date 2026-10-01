import { GRUPOS_DOCENTE } from '../../data/mockData'
import { IconUsers, IconGrade, IconCalendar, IconCheck } from '../Icons'

export default function DatosDocente({ user }) {
  const grupos = GRUPOS_DOCENTE[user.id] || []
  const totalAlumnos = grupos.reduce((a, g) => a + g.alumnos.length, 0)

  return (
    <div className="fade-in">
      <div className="datos-hero">
        <div className="avatar lg">{user.avatar}</div>
        <div className="datos-hero-info">
          <div className="datos-hero-name">{user.nombre}</div>
          <div className="datos-hero-sub">Docente &middot; {user.especialidad}</div>
          <div className="datos-hero-mat">Clave: {user.matricula}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{grupos.length}</div>
          <div style={{ fontSize: 12, opacity: .65, marginTop: 4 }}>Grupos activos</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(32,58,80,.07)' }}>
            <IconUsers size={22} style={{ color: 'var(--azul-profundo)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalAlumnos}</div>
            <div className="stat-label">Total de alumnos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,.08)' }}>
            <IconGrade size={22} style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#16a34a' }}>{grupos.length}</div>
            <div className="stat-label">Grupos asignados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,.08)' }}>
            <IconCheck size={22} style={{ color: '#2563eb' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 16 }}>{user.especialidad}</div>
            <div className="stat-label">Especialidad</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,.08)' }}>
            <IconCalendar size={22} style={{ color: '#ca8a04' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 16 }}>Matutino</div>
            <div className="stat-label">Turno</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, marginTop: 8 }}>
        <div className="card-header">
          <div className="card-title">Grupos a cargo</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Grupo</th><th>Materia</th><th>Turno</th>
                  <th style={{ textAlign: 'center' }}>Alumnos</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 700 }}>{g.grupo}</td>
                    <td>{g.materia}</td>
                    <td><span className="pill pill-blue">{g.turno}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{g.alumnos.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Información del Docente</div>
        </div>
        <div className="card-body">
          <div className="datos-grid">
            {[
              { label: 'Nombre completo',      value: user.nombre },
              { label: 'Clave docente',         value: user.matricula },
              { label: 'Correo institucional',  value: user.email },
              { label: 'Especialidad',          value: user.especialidad },
              { label: 'Turno',                 value: 'Matutino' },
              { label: 'Ciclo escolar',         value: '2026–2027' },
              { label: 'Plantel',               value: 'Preparatoria Boletyx' },
              { label: 'Estatus',               value: 'Activo' },
            ].map(f => (
              <div className="datos-field" key={f.label}>
                <div className="datos-field-label">{f.label}</div>
                <div className="datos-field-value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
