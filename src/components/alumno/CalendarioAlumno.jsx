import { useState } from 'react'
import { EVENTOS_CALENDARIO } from '../../data/mockData'
import { IconChevLeft, IconChevRight } from '../Icons'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

const TIPO_COLORS = {
  examen:        '#e74c3c',
  entrega:       '#f39c12',
  evento:        '#27ae60',
  festivo:       '#8e44ad',
  administrativo:'#203A50',
}

const TIPO_LABELS = {
  examen:        'Examen',
  entrega:       'Entrega',
  evento:        'Evento escolar',
  festivo:       'Día festivo',
  administrativo:'Administrativo',
}

export default function CalendarioAlumno() {
  const now = new Date()
  const [year, setYear]     = useState(now.getFullYear())
  const [month, setMonth]   = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const daysInMonth   = getDaysInMonth(year, month)
  const firstDay      = getFirstDayOfMonth(year, month)
  const today         = now.getDate()
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year

  const eventsByDay = {}
  EVENTOS_CALENDARIO.forEach(ev => {
    const d = new Date(ev.fecha + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(ev)
    }
  })

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedEvents = selected ? (eventsByDay[selected] || []) : []

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Calendario Escolar</h1>
        <p>Exámenes, eventos y fechas importantes del ciclo 2026–2027</p>
      </div>

      <div className="calendar-grid">
        {/* Calendar */}
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Month nav */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
            }}>
              <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={prevMonth}>
                <IconChevLeft size={16} />
              </button>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                {MONTH_NAMES[month]} {year}
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={nextMonth}>
                <IconChevRight size={16} />
              </button>
            </div>

            <div className="cal-month-grid">
              {DIAS_SEMANA.map(d => (
                <div className="cal-day-header" key={d}>{d}</div>
              ))}
              {cells.map((day, i) => (
                <div
                  key={i}
                  className={`cal-day${!day ? ' empty' : ''}${day && isCurrentMonth && day === today ? ' today' : ''}`}
                  onClick={() => day && setSelected(day === selected ? null : day)}
                  style={{ outline: day && selected === day ? '2px solid var(--azul-profundo)' : undefined, outlineOffset: -2 }}
                >
                  {day && (
                    <>
                      {isCurrentMonth && day === today
                        ? <div className="cal-day-num">{day}</div>
                        : <span className="cal-day-num">{day}</span>
                      }
                      {(eventsByDay[day] || []).slice(0, 2).map(ev => (
                        <span
                          key={ev.id}
                          className="cal-event-dot"
                          style={{ background: ev.color }}
                          title={ev.titulo}
                        >
                          {ev.titulo}
                        </span>
                      ))}
                      {(eventsByDay[day] || []).length > 2 && (
                        <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                          +{(eventsByDay[day] || []).length - 2} más
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events sidebar */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {selected
                    ? `${selected} de ${MONTH_NAMES[month]}`
                    : 'Próximos eventos'
                  }
                </div>
                <div className="card-subtitle">
                  {selected ? `${selectedEvents.length} evento(s) este día` : 'Este mes'}
                </div>
              </div>
            </div>
            <div className="card-body">
              {(selected ? selectedEvents : EVENTOS_CALENDARIO).map(ev => (
                <div key={ev.id} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  marginBottom: 16, paddingBottom: 16,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: ev.color, marginTop: 5, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {ev.titulo}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
              ))}
              {selected && selectedEvents.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 14, padding: '24px 0' }}>
                  Sin eventos para este día
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Leyenda
              </div>
              {Object.entries(TIPO_LABELS).map(([tipo, label]) => (
                <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: TIPO_COLORS[tipo], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
