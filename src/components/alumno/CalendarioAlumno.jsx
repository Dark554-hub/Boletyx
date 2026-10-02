import { useState, useMemo } from 'react'
import { EVENTOS_CALENDARIO } from '../../data/mockData'
import { IconChevLeft, IconChevRight } from '../Icons'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

const TIPO_COLORS = {
  examen:         '#e74c3c',
  entrega:        '#f39c12',
  evento:         '#27ae60',
  festivo:        '#8e44ad',
  administrativo: '#203A50',
}

const TIPO_LABELS = {
  examen:         'Examen',
  entrega:        'Entrega',
  evento:         'Evento escolar',
  festivo:        'Día festivo',
  administrativo: 'Administrativo',
}

/* ── Estilos del calendario (paleta Boletyx) ───────────────────────── */
const ESTILOS = `
/* Calendario del alumno
   Usa tus variables globales si existen (--border, --azul-profundo, etc.)
   y define valores de respaldo para que se vea bien aunque falten. */

.cal-page {
  /* Paleta Boletyx (medida de la imagen de referencia) */
  --pal-azul-profundo: #203A50;
  --pal-celeste-palido: #CCE0E6;
  --pal-azul-acero: #7995AB;
  --pal-gris-claro: #E9E9E9;
  --pal-gris-medio: #8D9194;
  --pal-celeste: #96BBCF;

  --cal-border: #d9e3e8;                 /* celeste pálido atenuado */
  --cal-azul: var(--pal-azul-profundo);
  --cal-text: var(--pal-azul-profundo);
  --cal-text-2: #4d6578;                 /* azul profundo aclarado: contraste AA sobre blanco */
  --cal-text-3: var(--pal-gris-medio);
  --cal-surface: #fff;
  --cal-muted: #f3f7f9;                  /* tinte muy suave de celeste pálido */
  --cal-hover: #e8f1f4;
  --cal-accent: var(--pal-celeste);

  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

/* Encabezado */
.cal-page .page-header { margin-bottom: 24px; }
.cal-page .page-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--cal-text);
}
.cal-page .page-header p {
  margin: 0;
  font-size: 14px;
  color: var(--cal-text-2);
}

/* Layout principal */
.cal-page .calendar-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

/* Tarjetas */
.cal-page .card {
  background: var(--cal-surface);
  border: 1px solid var(--cal-border);
  border-radius: 12px;
}
.cal-page .card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--cal-border);
}
.cal-page .card-title { font-size: 15px; font-weight: 700; color: var(--cal-text); }
.cal-page .card-subtitle { font-size: 12px; color: var(--cal-text-2); margin-top: 2px; }
.cal-page .card-body { padding: 16px 20px; }

/* Navegación de mes */
.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--cal-border);
}
.cal-nav-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--cal-text);
  flex: 1;
  text-align: center;
}
.cal-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--cal-border);
  background: var(--cal-surface);
  border-radius: 8px;
  color: var(--cal-text-2);
  cursor: pointer;
  transition: background .15s, color .15s;
}
.cal-nav-btn:hover { background: var(--cal-hover); color: var(--cal-azul); border-color: var(--cal-accent); }
.cal-today-btn {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--cal-border);
  background: var(--cal-surface);
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--cal-azul);
  cursor: pointer;
}
.cal-today-btn:hover { background: var(--cal-hover); border-color: var(--cal-accent); }

/* Cuadrícula del mes */
.cal-month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.cal-day-header {
  padding: 10px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--cal-azul);
  background: var(--pal-celeste-palido);
  border-bottom: 1px solid var(--cal-border);
}

.cal-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  min-height: 104px;
  padding: 8px 6px 6px;
  margin: 0;
  border: 0;
  border-right: 1px solid var(--cal-border);
  border-bottom: 1px solid var(--cal-border);
  background: var(--cal-surface);
  font: inherit;
  text-align: left;
  color: var(--cal-text);
  cursor: pointer;
  overflow: hidden;
}
.cal-day:nth-child(7n + 7) { border-right: 0; }   /* última columna: sábado */
.cal-day:hover { background: var(--cal-hover); }
.cal-day:focus-visible { outline: 2px solid var(--cal-azul); outline-offset: -2px; }
.cal-day.empty { background: var(--cal-muted); cursor: default; }
.cal-day.empty:hover { background: var(--cal-muted); }
.cal-day.selected { background: var(--cal-hover); box-shadow: inset 0 0 0 2px var(--cal-azul); }

.cal-day-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-left: 2px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 50%;
  color: var(--cal-text-2);
}
.cal-day.today .cal-day-num {
  background: var(--cal-azul);
  color: #fff;
}

/* Etiqueta de evento dentro del día */
.cal-event-dot {
  display: block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cal-more { font-size: 11px; color: var(--cal-text-3); padding-left: 4px; }

/* Panel lateral */
.cal-event-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--cal-border);
}
.cal-event-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: 0; }
.cal-event-bullet { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.cal-event-title { font-size: 13px; font-weight: 600; color: var(--cal-text); margin-bottom: 2px; }
.cal-event-date { font-size: 12px; color: var(--cal-text-2); text-transform: capitalize; }
.cal-empty { text-align: center; color: var(--cal-text-3); font-size: 14px; padding: 24px 0; }

/* Leyenda */
.cal-legend-title { font-size: 12px; font-weight: 700; color: var(--cal-text-2); margin-bottom: 12px; }
.cal-legend-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cal-legend-item:last-child { margin-bottom: 0; }
.cal-legend-item span { font-size: 13px; color: var(--cal-text-2); }

/* Tablet: el panel pasa debajo */
@media (max-width: 980px) {
  .cal-page .calendar-grid { grid-template-columns: 1fr; }
}

/* Móvil: los eventos se vuelven puntos */
@media (max-width: 640px) {
  .cal-page { padding: 16px 12px 32px; }
  .cal-day { min-height: 56px; align-items: center; padding: 6px 2px; }
  .cal-day-num { margin-left: 0; }
  .cal-day-events { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; }
  .cal-event-dot {
    width: 7px; height: 7px; padding: 0; border-radius: 50%;
    font-size: 0; /* oculta el texto */
  }
  .cal-more { display: none; }
}
`

const colorDe = (ev) => ev.color || TIPO_COLORS[ev.tipo] || '#203A50'

export default function CalendarioAlumno() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year

  // Eventos del mes visible, agrupados por día y ordenados por fecha
  const { eventsByDay, monthEvents } = useMemo(() => {
    const byDay = {}
    const list = []
    EVENTOS_CALENDARIO.forEach(ev => {
      const d = new Date(ev.fecha + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        ;(byDay[day] ||= []).push(ev)
        list.push({ ...ev, _day: day })
      }
    })
    list.sort((a, b) => a._day - b._day)
    return { eventsByDay: byDay, monthEvents: list }
  }, [year, month])

  const changeMonth = (delta) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelected(null)
  }

  const goToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setSelected(null)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedEvents = selected ? (eventsByDay[selected] || []) : []
  const listed = selected ? selectedEvents : monthEvents

  return (
    <>
    <style>{ESTILOS}</style>
    <div className="cal-page fade-in">
      <div className="page-header">
        <h1>Calendario escolar</h1>
        <p>Exámenes, eventos y fechas importantes del ciclo 2026–2027</p>
      </div>

      <div className="calendar-grid">
        {/* Calendario */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
              <IconChevLeft size={16} />
            </button>
            <div className="cal-nav-title">{MONTH_NAMES[month]} {year}</div>
            {!isCurrentMonth && (
              <button className="cal-today-btn" onClick={goToday}>Hoy</button>
            )}
            <button className="cal-nav-btn" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
              <IconChevRight size={16} />
            </button>
          </div>

          <div className="cal-month-grid">
            {DIAS_SEMANA.map(d => (
              <div className="cal-day-header" key={d}>{d}</div>
            ))}

            {cells.map((day, i) => {
              if (!day) return <div key={i} className="cal-day empty" aria-hidden="true" />

              const events = eventsByDay[day] || []
              const isToday = isCurrentMonth && day === now.getDate()
              const classes = ['cal-day', isToday && 'today', selected === day && 'selected']
                .filter(Boolean).join(' ')

              return (
                <button
                  key={i}
                  type="button"
                  className={classes}
                  onClick={() => setSelected(day === selected ? null : day)}
                  aria-pressed={selected === day}
                  aria-label={`${day} de ${MONTH_NAMES[month]}${events.length ? `, ${events.length} evento(s)` : ''}`}
                >
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-day-events">
                    {events.slice(0, 2).map(ev => (
                      <span
                        key={ev.id}
                        className="cal-event-dot"
                        style={{ background: colorDe(ev) }}
                        title={ev.titulo}
                      >
                        {ev.titulo}
                      </span>
                    ))}
                  </div>
                  {events.length > 2 && (
                    <span className="cal-more">+{events.length - 2} más</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {selected ? `${selected} de ${MONTH_NAMES[month]}` : `Eventos de ${MONTH_NAMES[month]}`}
              </div>
              <div className="card-subtitle">
                {listed.length} {listed.length === 1 ? 'evento' : 'eventos'}
                {selected ? ' este día' : ' este mes'}
              </div>
            </div>
            <div className="card-body">
              {listed.map(ev => (
                <div key={ev.id} className="cal-event-item">
                  <div className="cal-event-bullet" style={{ background: colorDe(ev) }} />
                  <div>
                    <div className="cal-event-title">{ev.titulo}</div>
                    <div className="cal-event-date">
                      {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {listed.length === 0 && (
                <div className="cal-empty">
                  {selected ? 'Sin eventos para este día' : 'Sin eventos este mes'}
                </div>
              )}
            </div>
          </div>

          {/* Leyenda */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-body">
              <div className="cal-legend-title">Tipos de evento</div>
              {Object.entries(TIPO_LABELS).map(([tipo, label]) => (
                <div key={tipo} className="cal-legend-item">
                  <div className="cal-event-bullet" style={{ background: TIPO_COLORS[tipo], marginTop: 0 }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

