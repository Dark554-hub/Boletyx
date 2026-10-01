import { BoletyxLogo, IconUser, IconGrade, IconCalendar, IconDoc,
         IconCheck, IconChart, IconSpeaker, IconHome,
         IconLogout, IconChevLeft, IconChevRight } from './Icons'

const ROLE_LABELS = { alumno: 'Alumno', docente: 'Docente', tutor: 'Tutor / Padre' }

const SECTION_ICONS = {
  datos:      IconUser,
  calif:      IconGrade,
  horario:    IconCalendar,
  tramites:   IconDoc,
  calendario: IconCalendar,
  asistencia: IconCheck,
  reportes:   IconChart,
  avisos:     IconSpeaker,
}

export default function Sidebar({ user, navItems, active, onNav, collapsed, onCollapse, onLogout }) {

  return (
    <aside
      className={[
        'flex flex-col h-full transition-all duration-200 overflow-hidden shrink-0 sidebar-pattern',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      ].join(' ')}
      style={{ background: '#152938', borderRight: '1px solid rgba(255,255,255,.06)' }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        <BoletyxLogo size={34} showText={!collapsed} />
      </div>

      {/* ── Profile ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#203A55,#CEEEC3)', border: '2px solid rgba(206,238,195,.25)' }}
        >
          {user.avatar}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-[13px] font-semibold truncate leading-tight">{user.nombre}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#CEEEC3' }}>
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-2 mb-1" style={{ color: 'rgba(255,255,255,.28)' }}>
            Menú principal
          </p>
        )}
        {navItems.map(item => {
          const Icon = SECTION_ICONS[item.id] || IconHome
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : ''}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sm font-medium',
                'transition-all duration-150 cursor-pointer border-none relative',
                isActive
                  ? 'text-[#CEEEC3]'
                  : 'hover:text-white',
              ].join(' ')}
              style={{
                background: isActive ? 'rgba(206,238,195,.18)' : 'transparent',
                color: isActive ? '#CEEEC3' : 'rgba(255,255,255,.6)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(206,238,195,.10)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full" style={{ background: '#CEEEC3' }} />
              )}
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="px-2 pb-3 pt-2 border-t flex flex-col gap-0.5" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        <button
          onClick={onCollapse}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium cursor-pointer border-none transition-all duration-150"
          style={{ background: 'transparent', color: 'rgba(255,255,255,.45)', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.45)' }}
        >
          {collapsed ? <IconChevRight size={16} /> : <IconChevLeft size={16} />}
          {!collapsed && <span>Colapsar</span>}
        </button>

        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium cursor-pointer border-none transition-all duration-150"
          style={{ background: 'transparent', color: '#ff8080', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <IconLogout size={16} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
