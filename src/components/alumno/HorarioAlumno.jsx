import { HORARIO_ALUMNO, HORAS } from '../../data/mockData'
import { PageHeader, Card } from '../UI'
import { IconCalendar, IconClock, IconChevLeft, IconChevRight } from '../Icons'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const CELL_CLASS = {
  'Matemáticas':      'cell-mat',
  'Química':          'cell-qui',
  'Historia':         'cell-his',
  'Historia Universal':'cell-his',
  'Inglés':           'cell-ing',
  'Física':           'cell-fis',
  'Español':          'cell-esp',
  'Ed. Física':       'cell-edf',
}

export default function HorarioAlumno({ user }) {
  const horario = HORARIO_ALUMNO[user.id] || {}
  const today   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()]

  return (
    <div className="space-y-5">
      <PageHeader title="Horario de Clases"
        subtitle={`Grupo ${user.grupo} · Turno ${user.turno} · Ciclo 2026–2027`} />

      {/* Today banner */}
      {DIAS.includes(today) && (
        <div className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{ background: 'rgba(32,58,80,.04)', borderColor: '#DDE4ED' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(32,58,80,.08)' }}>
            <IconCalendar size={18} style={{ color: '#203A50' }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: '#203A50' }}>Hoy — {today}</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#506070' }}>
              {(horario[today] || []).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Schedule grid */}
      <Card className="overflow-hidden">
        {/* Headers */}
        <div className="grid text-[11px] font-black uppercase tracking-wider"
          style={{
            gridTemplateColumns: '70px repeat(5,1fr)',
            background: '#152938', color: 'rgba(255,255,255,.55)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}>
          <div className="flex items-center justify-center py-3">
            <IconClock size={13} style={{ color: 'rgba(255,255,255,.4)' }} />
          </div>
          {DIAS.map(d => (
            <div key={d} className="py-3 text-center"
              style={{ color: d === today ? '#CEEEC3' : undefined }}>
              {d}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div>
          {HORAS.map((hora, hIdx) => (
            <div key={hora} className="grid border-b" style={{ gridTemplateColumns: '70px repeat(5,1fr)', borderColor: '#EBF0F5' }}>
              <div className="flex items-center justify-center text-[11px] font-bold py-3 border-r"
                style={{ color: '#8FA0AF', borderColor: '#EBF0F5', background: '#F4F7FA' }}>
                {hora}
              </div>
              {DIAS.map(dia => {
                const materia = (horario[dia] || [])[hIdx] || ''
                return (
                  <div key={dia}
                    className={`py-3 px-2 text-center text-[12px] font-semibold border-r transition-opacity ${CELL_CLASS[materia] || ''}`}
                    style={{ borderColor: '#EBF0F5' }}>
                    {materia || <span style={{ color: '#C0CAC2' }}>—</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 px-5 py-4 border-t" style={{ borderColor: '#EBF0F5' }}>
          {Object.entries(CELL_CLASS).slice(0, 6).map(([name, cls]) => (
            <span key={name} className={`px-3 py-1 rounded-lg text-[11px] font-semibold ${cls}`}>{name}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}
