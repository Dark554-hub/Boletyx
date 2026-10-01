import { AVISOS } from '../../data/mockData'
import { IconSpeaker, IconInfo, IconAlert, IconCalendar } from '../Icons'

const TIPO_CONFIG = {
  importante: { pill: 'pill pill-danger',   color: 'var(--azul-profundo)', Icon: IconAlert },
  evento:     { pill: 'pill pill-success',  color: '#22c55e',              Icon: IconCalendar },
  reunion:    { pill: 'pill pill-warning',  color: '#f59e0b',              Icon: IconInfo },
}

export default function AvisosDocente() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Avisos Institucionales</h1>
        <p>Comunicados oficiales de la administración escolar</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(32,58,80,.07)' }}>
            <IconSpeaker size={22} style={{ color: 'var(--azul-profundo)' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{AVISOS.length}</div>
            <div className="stat-label">Avisos activos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,.08)' }}>
            <IconAlert size={22} style={{ color: '#dc2626' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#dc2626' }}>
              {AVISOS.filter(a => a.tipo === 'importante').length}
            </div>
            <div className="stat-label">Importantes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,.08)' }}>
            <IconCalendar size={22} style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {AVISOS.filter(a => a.tipo === 'evento').length}
            </div>
            <div className="stat-label">Eventos</div>
          </div>
        </div>
      </div>

      <div>
        {AVISOS.map(a => {
          const cfg = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.importante
          return (
            <div
              key={a.id}
              className={`aviso-card ${a.tipo}`}
              style={{ borderLeftColor: cfg.color }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: cfg.color, flexShrink: 0 }}>
                    <cfg.Icon size={16} />
                  </div>
                  <div className="aviso-title">{a.titulo}</div>
                </div>
                <span className={cfg.pill} style={{ flexShrink: 0 }}>
                  {a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)}
                </span>
              </div>
              <div className="aviso-body" style={{ marginTop: 8, marginLeft: 26 }}>{a.cuerpo}</div>
              <div className="aviso-date" style={{ marginLeft: 26 }}>Publicado: {a.fecha}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
