import { useState } from 'react'
import { AVISOS } from '../data/mockData'
import { IconBell, IconMenu } from './Icons'

export default function Topbar({ title, user, onMenuClick }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="h-16 flex items-center px-6 gap-4 shrink-0"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #DDE4ED',
        boxShadow: '0 1px 4px rgba(32,58,80,.04)',
      }}
    >
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg cursor-pointer border-none"
        style={{ background: '#F4F7FA', color: '#506070' }}>
        <IconMenu size={18} />
      </button>

      <h2 className="flex-1 text-base font-bold" style={{ color: '#203A50' }}>
        {title}
      </h2>

      <div className="flex items-center gap-2.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border transition-all duration-150"
            style={{ background: '#F4F7FA', borderColor: '#DDE4ED', color: '#506070' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#203A50'; e.currentTarget.style.color = '#203A50' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDE4ED'; e.currentTarget.style.color = '#506070' }}
          >
            <IconBell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#ef4444', border: '2px solid #fff' }} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in"
                style={{ borderColor: '#DDE4ED', boxShadow: '0 8px 36px rgba(32,58,80,.16)' }}>
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: '#DDE4ED' }}>
                  <IconBell size={14} style={{ color: '#203A50' }} />
                  <span className="text-sm font-bold" style={{ color: '#0F1E2B' }}>Avisos recientes</span>
                </div>
                {AVISOS.slice(0, 4).map(a => (
                  <div key={a.id} className="px-4 py-3 border-b cursor-pointer transition-colors"
                    style={{ borderColor: '#DDE4ED' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F7FA'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#0F1E2B' }}>{a.titulo}</p>
                    <p className="text-[11px]" style={{ color: '#8FA0AF' }}>{a.fecha}</p>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-center">
                  <button className="text-xs font-bold cursor-pointer border-none"
                    style={{ background: 'none', color: '#203A50', fontFamily: 'inherit' }}
                    onClick={() => setOpen(false)}>
                    Ver todos los avisos
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
          style={{
            background: 'linear-gradient(135deg,#203A50,#203A55)',
            border: '2px solid #DDE4ED',
          }}
          title={user.nombre}
        >
          {user.avatar}
        </div>
      </div>
    </header>
  )
}
