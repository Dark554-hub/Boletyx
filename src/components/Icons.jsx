// ── Boletyx Logo ──────────────────────────────────────────
// Usa la imagen y diseño oficial de Boletyx
export function BoletyxLogo({ size = 36, showText = true, dark = false }) {
  const textColor = dark ? '#203A50' : '#ffffff'

  return (
    <div className="flex items-center gap-2.5">
      {/* Mark */}
      <div
        style={{
          width: size, height: size,
          background: '#ffffff',
          borderRadius: Math.max(6, Math.round(size * 0.22)),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 14px rgba(206,238,195,.35)',
          border: '1.5px solid rgba(32,58,80,0.12)',
          overflow: 'hidden',
          padding: size * 0.08,
        }}
      >
        <img
          src="/logo.png"
          alt="Boletyx"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {showText && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: size * 0.58,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Boletyx
        </span>
      )}
    </div>
  )
}

// ── Logo Mark — libro con B ───────────────────────────────
export function BoletyxMark({ size = 32, color = '#203A50' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base del libro — páginas abiertas */}
      {/* Página izquierda */}
      <path
        d="M50 80 C50 80 18 68 14 42 L14 22 C14 22 28 18 50 20"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lomo del libro */}
      <line x1="50" y1="20" x2="50" y2="80" stroke={color} strokeWidth="7" strokeLinecap="round" />
      {/* Portada superior izquierda */}
      <path
        d="M14 22 C14 22 26 14 50 16"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Portada superior derecha */}
      <path
        d="M86 22 C86 22 74 14 50 16"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Página derecha — forma "B" */}
      {/* Curva superior de la B */}
      <path
        d="M50 28 C62 26 74 30 74 40 C74 50 62 52 50 50"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Curva inferior de la B */}
      <path
        d="M50 50 C64 48 78 53 78 64 C78 75 64 78 50 76"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Contorno exterior derecho */}
      <path
        d="M86 22 C90 35 90 55 86 70 L50 80"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ── SVG Icons (thin line, 24×24 viewBox) ─────────────────
const Ico = ({ size = 18, children, className = '', ...p }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...p}
  >
    {children}
  </svg>
)

export const IconUser        = (p) => <Ico {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></Ico>
export const IconGrade       = (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h7M7 16h5"/></Ico>
export const IconCalendar    = (p) => <Ico {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Ico>
export const IconDoc         = (p) => <Ico {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ico>
export const IconCheck       = (p) => <Ico {...p}><polyline points="20 6 9 17 4 12"/></Ico>
export const IconChart       = (p) => <Ico {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ico>
export const IconBell        = (p) => <Ico {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ico>
export const IconLogout      = (p) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>
export const IconMenu        = (p) => <Ico {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Ico>
export const IconChevLeft    = (p) => <Ico {...p}><polyline points="15 18 9 12 15 6"/></Ico>
export const IconChevRight   = (p) => <Ico {...p}><polyline points="9 18 15 12 9 6"/></Ico>
export const IconDownload    = (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>
export const IconEdit        = (p) => <Ico {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ico>
export const IconSave        = (p) => <Ico {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Ico>
export const IconSchool      = (p) => <Ico {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Ico>
export const IconStar        = (p) => <Ico {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ico>
export const IconAlert       = (p) => <Ico {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ico>
export const IconClock       = (p) => <Ico {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>
export const IconUsers       = (p) => <Ico {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>
export const IconSpeaker     = (p) => <Ico {...p}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></Ico>
export const IconEye         = (p) => <Ico {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Ico>
export const IconEyeOff      = (p) => <Ico {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Ico>
export const IconMail        = (p) => <Ico {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ico>
export const IconLock        = (p) => <Ico {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ico>
export const IconArrowRight  = (p) => <Ico {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>
export const IconArrowLeft   = (p) => <Ico {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ico>
export const IconXCircle     = (p) => <Ico {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Ico>
export const IconCheckCircle = (p) => <Ico {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ico>
export const IconSend        = (p) => <Ico {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Ico>
export const IconInfo        = (p) => <Ico {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ico>
export const IconPlus        = (p) => <Ico {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>
export const IconX           = (p) => <Ico {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>
export const IconHome        = (p) => <Ico {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>
export const IconFolder      = (p) => <Ico {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Ico>

