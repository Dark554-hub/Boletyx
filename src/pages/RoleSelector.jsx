import { useState } from 'react'
import { BoletyxLogo } from '../components/Icons'

const ROLES = [
  {
    id: 'alumno',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    name: 'Alumno',
    desc: 'Consulta calificaciones, horario, trámites y eventos escolares',
  },
  {
    id: 'docente',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    name: 'Docente',
    desc: 'Gestiona calificaciones, asistencia y reportes de tus grupos',
  },
  {
    id: 'tutor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    name: 'Tutor',
    desc: 'Supervisa el desempeño académico de tu hijo/a',
  },
]

export default function RoleSelector({ onSelect }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-svh flex flex-col items-center justify-center relative overflow-hidden px-5 py-12"
      style={{ background: 'linear-gradient(145deg, #152938 0%, #203A50 45%, #1a3040 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #CEEEC3, transparent)' }} />
      <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #203A55, transparent)' }} />

      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-14 animate-fade-up">
        <BoletyxLogo size={68} showText={false} />
        <h1 className="text-4xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.04em' }}>
          Boletyx
        </h1>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase"
          style={{ color: 'rgba(255,255,255,0.42)' }}>
          Sistema de Control Escolar
        </p>
      </div>

      {/* Prompt */}
      <p className="text-base font-medium mb-8 text-center"
        style={{ color: 'rgba(255,255,255,0.75)' }}>
        ¿Cómo deseas ingresar?
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {ROLES.map((role) => {
          const isSelected = selected === role.id
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={[
                'group flex flex-col items-center text-center px-6 py-8 rounded-3xl border cursor-pointer',
                'transition-all duration-200 ease-out backdrop-blur-sm text-left',
                isSelected
                  ? 'border-[#CEEEC3] shadow-[0_0_0_2px_#CEEEC3,0_16px_48px_rgba(0,0,0,.3)]'
                  : 'border-white/10 hover:border-[#CEEEC3]/40 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,.3)]',
              ].join(' ')}
              style={{
                background: isSelected ? 'rgba(206,238,195,0.12)' : 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Icon circle */}
              <div className={[
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200',
                isSelected ? 'bg-[#CEEEC3]/20' : 'bg-white/8 group-hover:bg-white/12',
              ].join(' ')}
                style={{ color: isSelected ? '#CEEEC3' : 'rgba(255,255,255,0.65)' }}
              >
                {role.icon}
              </div>
              <p className="text-lg font-bold text-white mb-2">{role.name}</p>
              <p className="text-[13px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.46)' }}>
                {role.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        disabled={!selected}
        onClick={() => onSelect(selected)}
        className={[
          'mt-10 inline-flex items-center gap-2.5 px-10 py-3.5 rounded-xl text-sm font-bold',
          'transition-all duration-200',
          selected
            ? 'bg-[#CEEEC3] text-[#203A50] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(206,238,195,.35)] cursor-pointer'
            : 'bg-[#CEEEC3]/30 text-[#203A50]/50 cursor-not-allowed',
        ].join(' ')}
      >
        Continuar
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  )
}
