import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import logoImg from '../assets/logo-png.png'

const API = '/api'

const STATUS_FLOW = ['recebido', 'em_lavagem', 'detalhamento', 'finalizado', 'pronto_retirada']
const STATUS_LABELS = {
  recebido: 'Recebido',
  em_lavagem: 'Em Lavagem',
  detalhamento: 'Detalhamento',
  finalizado: 'Finalizado',
  pronto_retirada: 'Pronto para Retirada',
  cancelado: 'Cancelado',
}
const STATUS_ICONS = {
  recebido: '📋',
  em_lavagem: '🧼',
  detalhamento: '✨',
  finalizado: '✅',
  pronto_retirada: '🚗',
  cancelado: '❌',
}
const STATUS_COLORS = {
  recebido: '#3b82f6',
  em_lavagem: '#8b5cf6',
  detalhamento: '#f59e0b',
  finalizado: '#10b981',
  pronto_retirada: '#10b981',
  cancelado: '#ef4444',
}
const STATUS_BADGE = {
  recebido: 'badge-blue',
  em_lavagem: 'badge-purple',
  detalhamento: 'badge-yellow',
  finalizado: 'badge-green',
  pronto_retirada: 'badge-green',
  cancelado: 'badge-red',
}

function StatusProgressBar({ currentStatus }) {
  if (currentStatus === 'cancelado') {
    return (
      <div style={{ padding: '32px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Agendamento Cancelado</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Este serviço foi cancelado e não está mais na nossa fila de espera.</p>
      </div>
    )
  }

  const currentIndex = STATUS_FLOW.indexOf(currentStatus)

  return (
    <div style={{ padding: '32px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '1rem', color: 'var(--text-muted)' }}>📍 Status do Serviço</h3>

      {/* Mobile: vertical list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {STATUS_FLOW.map((status, index) => {
          const isDone = index < currentIndex
          const isActive = index === currentIndex
          const isPending = index > currentIndex
          const color = isActive ? STATUS_COLORS[status] : isDone ? '#10b981' : '#475569'

          return (
            <div key={status} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Step icon */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: `2px solid ${color}`,
                background: isDone ? 'rgba(16,185,129,0.1)' : isActive ? `${color}1a` : 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
                boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
                transition: 'all 0.4s ease',
                animation: isActive ? 'pulse-glow 2s infinite' : 'none',
              }}>
                {isDone ? '✓' : STATUS_ICONS[status]}
              </div>

              {/* Step info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: isActive ? 700 : isDone ? 500 : 400,
                  color: isPending ? 'var(--text-faint)' : 'var(--text)',
                  fontSize: '0.95rem',
                }}>
                  {STATUS_LABELS[status]}
                </div>
                {isActive && (
                  <div style={{ fontSize: '0.78rem', color, marginTop: '2px', animation: 'fadeIn 0.4s ease' }}>
                    ● Em andamento agora
                  </div>
                )}
              </div>

              {/* Progress indicator */}
              {(isDone || isActive) && (
                <div className={`badge ${isDone ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                  {isDone ? 'Concluído' : 'Agora'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Barra de progresso geral */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Progresso Geral</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue)' }}>
            {Math.round(((currentIndex + 1) / STATUS_FLOW.length) * 100)}%
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((currentIndex + 1) / STATUS_FLOW.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--blue), var(--purple))',
            borderRadius: '3px',
            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      </div>
    </div>
  )
}

function ChecklistSection({ checklist }) {
  if (!checklist || checklist.length === 0) return null

  return (
    <div className="glass" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📷 Checklist de Entrada
        <span className="badge badge-blue">{checklist.length} item(s)</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {checklist.map((item, i) => (
          <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            {item.foto_url && (
              <img
                src={item.foto_url}
                alt={`Foto ${i + 1}`}
                style={{ width: '100%', borderRadius: '6px', marginBottom: '8px', maxHeight: '200px', objectFit: 'cover' }}
              />
            )}
            {item.observacao && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                📝 {item.observacao}
              </p>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '6px' }}>
              Registrado em: {new Date(item.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistorySection({ historico, outrosServicos }) {
  return (
    <div className="glass" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>📚 Histórico de Serviços</h3>

      {/* Status timeline */}
      {historico && historico.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Linha do Tempo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {historico.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{STATUS_LABELS[h.status] || h.status}</span>
                <span style={{ color: 'var(--text-faint)', marginLeft: 'auto', fontSize: '0.75rem' }}>
                  {new Date(h.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outros serviços do cliente */}
      {outrosServicos && outrosServicos.length > 0 && (
        <>
          <div className="divider" />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Serviços Anteriores</p>
          {outrosServicos.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < outrosServicos.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{s.servico}</div>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>{s.veiculo}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge ${STATUS_BADGE[s.status] || 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>{STATUS_LABELS[s.status]}</span>
                <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem', marginTop: '4px' }}>
                  {new Date(s.data_hora).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {(!outrosServicos || outrosServicos.length === 0) && !historico?.length && (
        <p className="text-muted text-sm">Nenhum histórico disponível ainda.</p>
      )}
    </div>
  )
}

function RemarcarModal({ token, onClose, onSucesso }) {
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [ocupados, setOcupados] = useState([])
  const [loadingHoras, setLoadingHoras] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!data) return
    setLoadingHoras(true)
    fetch(`${API}/agendamentos/horarios-ocupados?data=${data}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const list = Array.isArray(d.data) ? d.data : (d.data.ocupados || [])
          setOcupados(list.map(ag => {
             const h = new Date(ag.data_hora).getHours()
             const m = new Date(ag.data_hora).getMinutes()
             return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
          }))
        }
      })
      .finally(() => setLoadingHoras(false))
  }, [data])

  const minDate = new Date(); minDate.setMinutes(minDate.getMinutes() + 30)
  const minDateStr = minDate.toISOString().slice(0, 10)
  const horas = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

  const submit = async () => {
    if (!data || !hora) { setErro('Selecione data e horário.'); return }
    setSaving(true); setErro('')
    try {
      const data_hora = data + 'T' + hora + ':00'
      const res = await fetch(`${API}/agendamentos/cliente/${token}/remarcar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_hora })
      })
      const result = await res.json()
      if (result.success) onSucesso()
      else setErro(result.message || 'Erro ao remarcar.')
    } catch { setErro('Erro de conexão.') }
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,26,.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', animation: 'fadeInUp .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>📅 Remarcar Agendamento</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        {erro && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '8px', padding: '10px', color: '#f87171', fontSize: '.8rem', marginBottom: '16px' }}>⚠️ {erro}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Nova Data</label>
            <input type="date" min={minDateStr} value={data} onChange={e => { setData(e.target.value); setHora('') }} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {data && (
            <div>
              {new Date(data + 'T12:00:00').getDay() === 0 ? (
                <div style={{ padding: '16px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', color: '#60a5fa', fontSize: '.85rem', textAlign: 'center', lineHeight: 1.5, marginTop: '10px' }}>
                  😴 <strong>Aviso:</strong> No momento estamos descansando para brilhar seu veículo na Segunda-feira!
                </div>
              ) : (
                <>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{loadingHoras ? 'Carregando...' : 'Novo Horário'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {!loadingHoras && horas.map(h => {
                      const isSabado = new Date(data + 'T12:00:00').getDay() === 6;
                      const blockedSabado = isSabado && h > '12:00';
                      const blocked = ocupados.includes(h) || blockedSabado;
                      return (
                        <button key={h} onClick={() => !blocked && setHora(h)} disabled={blocked}
                          style={{ padding: '10px 4px', borderRadius: '8px', border: hora === h ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', background: blocked ? 'rgba(255,255,255,.02)' : hora === h ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.04)', color: blocked ? 'var(--text-faint)' : hora === h ? '#60a5fa' : 'var(--text-muted)', fontWeight: hora === h ? 700 : 400, fontSize: '.8rem', cursor: blocked ? 'not-allowed' : 'pointer' }}>
                          {h} {blockedSabado ? '(Indisponível)' : ''}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={!data || !hora || saving} onClick={submit}>
            {saving ? 'Salvando...' : 'Confirmar Reagendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRemarcar, setShowRemarcar] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/agendamentos/status/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
        else setError(d.message)
      })
      .catch(() => setError('Erro de conexão. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [token])

  // Polling a cada 30 segundos para atualizar o status automaticamente
  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => {
      fetch(`${API}/agendamentos/status/${token}`)
        .then(r => r.json())
        .then(d => { if (d.success) setData(d.data) })
        .catch(() => { })
    }, 30000)
    return () => clearInterval(interval)
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        <p className="text-muted">Buscando seu agendamento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass text-center" style={{ padding: '48px 32px', maxWidth: '420px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😔</div>
          <h2 style={{ marginBottom: '12px' }}>Agendamento não encontrado</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{error}</p>
          <a href="/" className="btn btn-primary">← Voltar ao início</a>
        </div>
      </div>
    )
  }

  const handleCancelar = async () => {
    const motivo = window.prompt('Deseja realmente cancelar seu agendamento?\nSe sim, informe o motivo (opcional):');
    if (motivo === null) return;
    try {
      const res = await fetch(`${API}/agendamentos/cliente/${token}/cancelar`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivo.trim() }) 
      });
      const d = await res.json();
      if(d.success) {
        window.location.reload();
      } else { alert(d.message); }
    } catch(e) {
      alert('Erro ao cancelar. Verifique sua conexão.');
    }
  }

  const agendamento = data
  const dataHora = new Date(agendamento.data_hora).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
  const isPronto = agendamento.status === 'pronto_retirada'

  return (
    <div style={{ minHeight: '100vh', maxWidth: '680px', margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* Header */}
      <div style={{ paddingTop: '24px', marginBottom: '28px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Olá, {agendamento.cliente_nome?.split(' ')[0]}! 👋</h1>
            <p className="text-muted text-sm">Acompanhe o status do seu veículo em tempo real</p>
          </div>
          <span className={`badge ${STATUS_BADGE[agendamento.status]}`} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            {STATUS_ICONS[agendamento.status]} {STATUS_LABELS[agendamento.status]}
          </span>
        </div>
      </div>

      {/* Alerta: Pronto para Retirada */}
      {isPronto && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>Seu veículo está pronto!</p>
              <p className="text-sm text-muted">O serviço foi concluído com sucesso. Pode vir buscar quando quiser!</p>
            </div>
          </div>
        </div>
      )}

      {/* Card do veículo */}
      <div className="glass" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            ['🚘 Veículo', agendamento.veiculo_modelo],
            ['🔧 Serviço', agendamento.servico_nome],
            ['📅 Data/Hora', dataHora],
            ['💰 Valor', `R$ ${parseFloat(agendamento.servico_preco).toFixed(2).replace('.', ',')}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontWeight: 500, fontSize: '0.92rem' }}>{value}</p>
            </div>
          ))}
        </div>
        {agendamento.observacoes && (
          <>
            <div className="divider" />
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>📝 Observações</p>
              <p className="text-sm text-muted" style={{ lineHeight: 1.5 }}>{agendamento.observacoes}</p>
            </div>
          </>
        )}
      </div>

      {/* Botões de Ação Cliente */}
      {agendamento.status === 'recebido' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowRemarcar(true)} style={{ flex: 1, padding: '12px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '10px', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            📅 Remarcar Horário
          </button>
          <button onClick={handleCancelar} style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '10px', color: '#f87171', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            ❌ Cancelar Agendamento
          </button>
        </div>
      )}

      {showRemarcar && <RemarcarModal token={token} onClose={() => setShowRemarcar(false)} onSucesso={() => window.location.reload()} />}

      {/* Barra de status */}
      <div style={{ marginBottom: '20px' }}>
        <StatusProgressBar currentStatus={agendamento.status} />
      </div>

      {/* Checklist de entrada */}
      {data.checklist && data.checklist.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <ChecklistSection checklist={data.checklist} />
        </div>
      )}

      {/* Histórico */}
      <HistorySection historico={data.historico_status} outrosServicos={data.outros_servicos} />

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.78rem' }}>
        <p>🔄 Atualizado automaticamente a cada 30 segundos</p>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
          <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: '24px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.4 }} />
        </div>
      </div>
    </div>
  )
}
