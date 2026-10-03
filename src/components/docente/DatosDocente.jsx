import { GRUPOS_DOCENTE } from '../../data/mockData'
import { IconUsers, IconGrade, IconCalendar, IconCheck } from '../Icons'

/* ── Estilos del perfil docente (paleta Boletyx) ───────────────────── */
const ESTILOS = `
.dd-page {
  --dd-azul: #203A50;
  --dd-celeste-palido: #CCE0E6;
  --dd-border: #e3eaee;
  --dd-text: #203A50;
  --dd-text-2: #5b7083;
  --dd-text-3: #8D9194;
  --dd-tile: #f3f7f9;

  max-width: 1152px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  color: var(--dd-text);
}

/* Encabezado con datos del docente */
.dd-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 28px;
  margin-bottom: 18px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(135deg, #1a3145 0%, #203A50 100%);
  box-shadow: 0 6px 20px rgba(32, 58, 80, .18);
}
.dd-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 800;
  background: rgba(255, 255, 255, .12);
  border: 1px solid rgba(255, 255, 255, .22);
}
.dd-hero-info { flex: 1; min-width: 0; }
.dd-hero-name { font-size: 22px; font-weight: 800; line-height: 1.2; }
.dd-hero-sub { font-size: 13px; margin-top: 3px; color: rgba(255, 255, 255, .75); }
.dd-hero-badge {
  display: inline-block;
  margin-top: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, .14);
}
.dd-hero-big { text-align: right; flex-shrink: 0; }
.dd-hero-big strong { display: block; font-size: 44px; font-weight: 800; line-height: 1; }
.dd-hero-big span { display: block; margin-top: 4px; font-size: 12px; color: rgba(255, 255, 255, .7); }

/* Tarjetas de estadísticas */
.dd-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.dd-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--dd-border);
  border-radius: 16px;
}
.dd-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
}
.dd-stat-value { font-size: 24px; font-weight: 800; line-height: 1.1; }
.dd-stat-value.sm { font-size: 17px; }
.dd-stat-label { margin-top: 3px; font-size: 12px; color: var(--dd-text-3); }

/* Tarjetas */
.dd-card {
  margin-bottom: 18px;
  background: #fff;
  border: 1px solid var(--dd-border);
  border-radius: 16px;
  overflow: hidden;
}
.dd-card-head { padding: 18px 24px; border-bottom: 1px solid var(--dd-border); }
.dd-card-title { font-size: 15px; font-weight: 700; }
.dd-card-sub { margin-top: 2px; font-size: 12px; color: var(--dd-text-3); }

/* Tabla de grupos */
.dd-table-wrap { overflow-x: auto; }
.dd-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.dd-table th {
  padding: 12px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--dd-azul);
  background: var(--dd-celeste-palido);
  white-space: nowrap;
}
.dd-table td { padding: 14px 24px; border-top: 1px solid var(--dd-border); }
.dd-table tbody tr:hover { background: #f3f7f9; }
.dd-center { text-align: center !important; }
.dd-group { font-weight: 700; }
.dd-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1d4e89;
  background: #e3eefa;
}
.dd-count {
  display: inline-block;
  min-width: 32px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  background: var(--dd-tile);
}
.dd-empty { padding: 28px; text-align: center; color: var(--dd-text-3); font-size: 14px; }

/* Información personal */
.dd-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 22px 24px 26px;
}
.dd-field { padding: 14px 16px; background: var(--dd-tile); border-radius: 14px; min-width: 0; }
.dd-field-label {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: var(--dd-text-3);
}
.dd-field-value { font-size: 14px; font-weight: 500; overflow-wrap: anywhere; }

@media (max-width: 1000px) {
  .dd-stats, .dd-info { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .dd-page { padding: 16px 12px 32px; }
  .dd-hero { flex-wrap: wrap; padding: 20px; }
  .dd-hero-big { text-align: left; width: 100%; }
  .dd-stats, .dd-info { grid-template-columns: 1fr; }
  .dd-table th, .dd-table td { padding: 12px 16px; }
}
`

export default function DatosDocente({ user }) {
  const grupos = GRUPOS_DOCENTE[user.id] || []
  const totalAlumnos = grupos.reduce((a, g) => a + g.alumnos.length, 0)
  const turno = user.turno || 'Matutino'

  const stats = [
    { Icon: IconUsers,    bg: '#eef2f5', color: '#203A50', value: totalAlumnos,        label: 'Total de alumnos' },
    { Icon: IconGrade,    bg: '#e8f6ee', color: '#16a34a', value: grupos.length,       label: 'Grupos asignados', valueColor: '#16a34a' },
    { Icon: IconCheck,    bg: '#e8f0fc', color: '#2563eb', value: user.especialidad,   label: 'Especialidad', small: true },
    { Icon: IconCalendar, bg: '#fdf3e2', color: '#ca8a04', value: turno,               label: 'Turno', small: true },
  ]

  const info = [
    { label: 'Nombre completo',     value: user.nombre },
    { label: 'Clave docente',       value: user.matricula },
    { label: 'Correo institucional', value: user.email },
    { label: 'Especialidad',        value: user.especialidad },
    { label: 'Turno',               value: turno },
    { label: 'Ciclo escolar',       value: '2026–2027' },
    { label: 'Plantel',             value: 'Preparatoria Boletyx' },
    { label: 'Estatus',             value: 'Activo' },
  ]

  return (
    <>
      <style>{ESTILOS}</style>
      <div className="dd-page fade-in">
        {/* Encabezado */}
        <div className="dd-hero">
          <div className="dd-avatar">{user.avatar}</div>
          <div className="dd-hero-info">
            <div className="dd-hero-name">{user.nombre}</div>
            <div className="dd-hero-sub">Docente · {user.especialidad} · {turno}</div>
            <span className="dd-hero-badge">Clave: {user.matricula}</span>
          </div>
          <div className="dd-hero-big">
            <strong>{grupos.length}</strong>
            <span>Grupos activos</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="dd-stats">
          {stats.map(({ Icon, bg, color, value, label, small, valueColor }) => (
            <div className="dd-stat" key={label}>
              <div className="dd-stat-icon" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className={`dd-stat-value${small ? ' sm' : ''}`} style={valueColor ? { color: valueColor } : undefined}>
                  {value}
                </div>
                <div className="dd-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grupos a cargo */}
        <div className="dd-card">
          <div className="dd-card-head">
            <div className="dd-card-title">Grupos a cargo</div>
            <div className="dd-card-sub">
              {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'} · {totalAlumnos} alumnos en total
            </div>
          </div>
          <div className="dd-table-wrap">
            {grupos.length === 0 ? (
              <div className="dd-empty">Aún no tienes grupos asignados</div>
            ) : (
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Materia</th>
                    <th>Turno</th>
                    <th className="dd-center">Alumnos</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map(g => (
                    <tr key={g.id}>
                      <td className="dd-group">{g.grupo}</td>
                      <td>{g.materia}</td>
                      <td><span className="dd-pill">{g.turno}</span></td>
                      <td className="dd-center"><span className="dd-count">{g.alumnos.length}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Información del docente */}
        <div className="dd-card">
          <div className="dd-card-head">
            <div className="dd-card-title">Información del docente</div>
            <div className="dd-card-sub">Datos registrados en el sistema</div>
          </div>
          <div className="dd-info">
            {info.map(f => (
              <div className="dd-field" key={f.label}>
                <div className="dd-field-label">{f.label}</div>
                <div className="dd-field-value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
