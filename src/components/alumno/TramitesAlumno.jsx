import { useState } from 'react'
import { TRAMITES } from '../../data/mockData'
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, Pill, BtnPrimary, BtnOutline } from '../UI'
import { IconDoc, IconDownload, IconCheckCircle, IconClock, IconSend, IconXCircle, IconPlus } from '../Icons'

const STATUS = {
  'Listo':      { variant: 'success', Icon: IconCheckCircle },
  'En proceso': { variant: 'warning', Icon: IconClock },
  'Pendiente':  { variant: 'default', Icon: IconClock },
}

export default function TramitesAlumno() {
  const [showForm, setShowForm] = useState(false)
  const [sent, setSent]         = useState(null)
  const [tipo, setTipo]         = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    setSent(tipo); setShowForm(false); setTipo('')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Trámites Escolares" subtitle="Consulta y solicita documentos institucionales"
        action={
          <BtnPrimary onClick={() => setShowForm(true)}>
            <IconPlus size={14} /> Nueva solicitud
          </BtnPrimary>
        }
      />

      {/* Success banner */}
      {sent && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{ background: '#dcfce7', borderColor: '#86efac', color: '#166534' }}>
          <IconCheckCircle size={16} />
          Solicitud de <strong>{sent}</strong> enviada. Recibirás una notificación cuando esté lista.
          <button onClick={() => setSent(null)} className="ml-auto cursor-pointer border-none"
            style={{ background: 'none', color: '#16a34a' }}>
            <IconXCircle size={16} />
          </button>
        </div>
      )}

      {/* New request form */}
      {showForm && (
        <Card className="border-[#203A50]" style={{ borderColor: '#203A50', borderWidth: 1.5 }}>
          <CardHeader>
            <div><CardTitle>Nueva solicitud de trámite</CardTitle></div>
          </CardHeader>
          <div className="p-6">
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#506070' }}>
                  Tipo de documento
                </label>
                <select
                  value={tipo} onChange={e => setTipo(e.target.value)} required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                  style={{
                    border: '1.5px solid #DDE4ED', background: '#F4F7FA',
                    color: '#0F1E2B', fontFamily: 'inherit',
                  }}
                >
                  <option value="">Selecciona un trámite…</option>
                  <option>Constancia de Estudios</option>
                  <option>Credencial Escolar</option>
                  <option>Certificado Parcial</option>
                  <option>Carta de Buena Conducta</option>
                  <option>Historial Académico</option>
                </select>
              </div>
              <div className="flex gap-2.5">
                <BtnPrimary type="submit"><IconSend size={14} /> Enviar solicitud</BtnPrimary>
                <BtnOutline onClick={() => setShowForm(false)}>Cancelar</BtnOutline>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Tramites grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRAMITES.map(t => {
          const cfg = STATUS[t.estado] || STATUS['Pendiente']
          return (
            <Card key={t.id} className="flex flex-col p-6 gap-4 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: '0 1px 4px rgba(32,58,80,.06)' }}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(32,58,80,.06)' }}>
                <IconDoc size={22} style={{ color: '#203A50' }} />
              </div>

              <div className="flex-1">
                <h3 className="text-[14px] font-bold mb-1" style={{ color: '#0F1E2B' }}>{t.tipo}</h3>
                <p className="text-[12px] leading-relaxed" style={{ color: '#8FA0AF' }}>{t.descripcion}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#EBF0F5' }}>
                <Pill variant={cfg.variant}>
                  <cfg.Icon size={11} /> {t.estado}
                </Pill>
                {t.fecha !== '—' && <span className="text-[11px]" style={{ color: '#C0CAC2' }}>{t.fecha}</span>}
              </div>

              {t.estado === 'Listo' && (
                <BtnOutline className="w-full justify-center">
                  <IconDownload size={14} /> Descargar
                </BtnOutline>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
