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
  {
    id: 'aspirante',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="11" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
    name: 'Aspirante',
    desc: 'Consulta tu proceso de admisión y resultados',
  },
  {
    id: 'administrativo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    name: 'Administrativo',
    desc: 'Gestiona trámites, pagos y expedientes',
  },
  {
    id: 'coordinador',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    name: 'Jefes/Coordinadores',
    desc: 'Supervisa el área académica y administrativa',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-4xl px-2">
        {ROLES.map((role) => {
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={[
                'group flex flex-col items-center text-center px-6 py-8 rounded-3xl border cursor-pointer',
                'transition-all duration-300 ease-out backdrop-blur-sm text-left',
                'border-white/10 hover:border-[#CEEEC3]/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,.4)]',
              ].join(' ')}
              style={{
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Icon circle */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 bg-white/8 group-hover:bg-[#CEEEC3]/20 group-hover:text-[#CEEEC3]"
                style={{ color: 'rgba(255,255,255,0.65)' }}
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
    </div>
  )
}
