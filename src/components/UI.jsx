// ── Shared Tailwind UI primitives ────────────────────────

/** Card wrapper */
export function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`bg-white rounded-2xl border ${className}`}
      style={{ borderColor: '#DDE4ED', boxShadow: '0 1px 4px rgba(32,58,80,.06)', ...style }}
    >
      {children}
    </div>
  )
}

/** Card header row */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b ${className}`}
      style={{ borderColor: '#DDE4ED' }}>
      {children}
    </div>
  )
}

/** Card body padding */
export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}

/** Section heading inside card */
export function CardTitle({ children }) {
  return <h3 className="text-[15px] font-bold leading-tight" style={{ color: '#0F1E2B' }}>{children}</h3>
}

export function CardSubtitle({ children }) {
  return <p className="text-[12px] mt-0.5" style={{ color: '#8FA0AF' }}>{children}</p>
}

/** Stat card */
export function StatCard({ icon, label, value, valueColor }) {
  return (
    <div className="bg-white rounded-2xl border flex items-center gap-4 p-5"
      style={{ borderColor: '#DDE4ED', boxShadow: '0 1px 4px rgba(32,58,80,.06)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(32,58,80,.06)' }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black leading-tight" style={{ color: valueColor || '#203A50' }}>{value}</div>
        <div className="text-[12px] font-medium mt-0.5" style={{ color: '#8FA0AF' }}>{label}</div>
      </div>
    </div>
  )
}

/** Page section header */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black leading-tight" style={{ color: '#0F1E2B', letterSpacing: '-0.04em' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: '#506070' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Pill badge */
export function Pill({ children, variant = 'default' }) {
  const styles = {
    default: { background: '#EBF0F5', color: '#506070' },
    success: { background: '#dcfce7', color: '#166534' },
    warning: { background: '#fef3c7', color: '#92400e' },
    danger:  { background: '#fee2e2', color: '#991b1b' },
    blue:    { background: 'rgba(32,58,80,.10)', color: '#203A50' },
    mint:    { background: 'rgba(206,238,195,.3)', color: '#1e6b3e' },
  }
  const s = styles[variant] || styles.default
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={s}>
      {children}
    </span>
  )
}

/** Grade progress bar */
export function GradeBar({ value, max = 10 }) {
  const pct = (value / max) * 100
  const color = value >= 9 ? '#16a34a' : value >= 7 ? '#ca8a04' : '#dc2626'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#EBF0F5' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[13px] font-black tabular-nums min-w-[32px]" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  )
}

/** Table wrapper */
export function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr style={{ background: '#F4F7FA', borderBottom: '1px solid #DDE4ED' }}>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider"
                style={{ color: '#8FA0AF', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

/** Table row */
export function TR({ children, striped = false, style = {} }) {
  return (
    <tr className="border-b transition-colors"
      style={{
        borderColor: '#DDE4ED',
        background: striped ? 'rgba(244,247,250,.5)' : 'transparent',
        ...style
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F4F7FA'}
      onMouseLeave={e => e.currentTarget.style.background = striped ? 'rgba(244,247,250,.5)' : 'transparent'}
    >
      {children}
    </tr>
  )
}

/** Table cell */
export function TD({ children, className = '', style = {} }) {
  return <td className={`px-4 py-3 ${className}`} style={{ color: '#0F1E2B', ...style }}>{children}</td>
}

/** Primary button */
export function BtnPrimary({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white
        transition-all duration-150 cursor-pointer border-none
        hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: 'linear-gradient(135deg,#203A50,#203A55)',
        boxShadow: '0 2px 8px rgba(32,58,80,.2)',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

/** Outline button */
export function BtnOutline({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
        border transition-all duration-150 cursor-pointer ${className}`}
      style={{
        background: 'transparent', color: '#203A50',
        borderColor: '#DDE4ED', fontFamily: 'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#203A50'; e.currentTarget.style.background = 'rgba(32,58,80,.04)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDE4ED'; e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

/** Hero profile banner */
export function ProfileHero({ avatar, name, sub, tag, right }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-6 rounded-2xl mb-6 border"
      style={{
        background: 'linear-gradient(135deg,#152938 0%,#203A50 100%)',
        borderColor: 'rgba(206,238,195,.15)',
      }}>
      {/* Avatar */}
      <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 mx-auto sm:mx-0"
        style={{ background: 'rgba(206,238,195,.18)', color: '#CEEEC3', border: '2px solid rgba(206,238,195,.25)' }}>
        {avatar}
      </div>
      <div className="flex-1 min-w-0 w-full">
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight truncate"
          style={{ letterSpacing: '-0.04em' }}>
          {name}
        </h2>
        <p className="text-[13px] mt-1 sm:mt-0.5 truncate whitespace-normal sm:whitespace-nowrap" style={{ color: 'rgba(255,255,255,.6)' }}>{sub}</p>
        {tag && (
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ background: 'rgba(206,238,195,.18)', color: '#CEEEC3' }}>
            {tag}
          </span>
        )}
      </div>
      {right && <div className="shrink-0 mt-3 sm:mt-0">{right}</div>}
    </div>
  )
}

/** Info grid (label/value pairs) */
export function InfoGrid({ fields }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {fields.map(f => (
        <div key={f.label} className="rounded-xl p-4" style={{ background: '#F4F7FA' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#8FA0AF' }}>{f.label}</p>
          <p className="text-[14px] font-semibold truncate" style={{ color: '#0F1E2B' }}>{f.value}</p>
        </div>
      ))}
    </div>
  )
}

/** Announcement card */
export function AvisoCard({ titulo, cuerpo, fecha, tipo, Icon }) {
  const palette = {
    importante: { border: '#ef4444', icon: '#dc2626', bg: 'rgba(239,68,68,.04)' },
    evento:     { border: '#22c55e', icon: '#16a34a', bg: 'rgba(34,197,94,.04)' },
    reunion:    { border: '#f59e0b', icon: '#ca8a04', bg: 'rgba(245,158,11,.04)' },
  }
  const p = palette[tipo] || palette.importante
  return (
    <div className="rounded-2xl border-l-4 border p-5 mb-3 transition-all"
      style={{
        borderLeftColor: p.border, borderColor: '#DDE4ED',
        background: p.bg,
      }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span style={{ color: p.icon }}><Icon size={15} /></span>
          <span className="text-[14px] font-bold" style={{ color: '#0F1E2B' }}>{titulo}</span>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: `${p.border}18`, color: p.icon }}>
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed pl-6" style={{ color: '#506070' }}>{cuerpo}</p>
      <p className="text-[11px] mt-2 pl-6 font-medium" style={{ color: '#8FA0AF' }}>Publicado: {fecha}</p>
    </div>
  )
}
