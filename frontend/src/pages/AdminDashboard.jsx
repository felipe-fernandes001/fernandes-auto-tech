import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import logoImg from '../assets/logo-png.png'
import EquipePane from '../components/EquipePane'
import AgendamentosPane from '../components/AgendamentosPane'
import ClientesPane from '../components/ClientesPane'
import ConfiguracoesPane from '../components/ConfiguracoesPane'

const API = '/api'

/* ── helpers ─────────────────────────────────────────────── */
function authHeaders() {
  const t = localStorage.getItem('fat_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
}
function adminUser() {
  try { return JSON.parse(localStorage.getItem('fat_admin_user') || '{}') } catch { return {} }
}
const fmt = (v) => `R$ ${parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

// Formatador de datas crucial para a interface do Admin.
// Utiliza toLocaleString('pt-BR') para exibir a data e hora de forma amigável (ex: 04/04/2026, 15:00) para facilitar a leitura.
const fmtDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

/* ── Status config ───────────────────────────────────────── */
const STATUS = {
  recebido: { label: 'Recebido', color: '#3b82f6', bg: 'rgba(59,130,246,.15)' },
  em_lavagem: { label: 'Em Lavagem', color: '#8b5cf6', bg: 'rgba(139,92,246,.15)' },
  detalhamento: { label: 'Detalhamento', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
  finalizado: { label: 'Finalizado', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  pronto_retirada: { label: 'Pronto p/ Retirada', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
}

/* ── Sidebar items ───────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'agendamentos', icon: '📋', label: 'Agendamentos' },
  { id: 'clientes', icon: '👥', label: 'Clientes' },
  { id: 'equipe', icon: '🤝', label: 'Equipe' },
  { id: 'precos', icon: '💰', label: 'Configurar Preços' },
  { id: 'configuracoes', icon: '⚙️', label: 'Configurações' }
]

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
function Sidebar({ activeTab, onTabChange, onLogout, user, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 199, backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside style={{
        width: '250px',
        flexShrink: 0,
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
      }}
        className={`admin-sidebar${open ? ' open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={logoImg}
              alt="Fernandes Auto Tech"
              style={{
                width: '120px',
                height: 'auto',
                filter: 'brightness(0) invert(1)',
                opacity: 0.88,
              }}
            />
          </div>
          {/* Close btn (mobile) */}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.1rem', cursor: 'pointer', padding: '4px', flexShrink: 0 }} className="sidebar-close">✕</button>
        </div>

        {/* User pill */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59,130,246,.08)', borderRadius: '10px', padding: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 700, flexShrink: 0 }}>
              {(user?.nome || 'A')[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nome || 'Administrador'}</div>
              <div style={{ fontSize: '.7rem', color: '#3b82f6' }}>● Online</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px' }}>
          <p style={{ fontSize: '.65rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.1em', padding: '0 10px', marginBottom: '6px' }}>Menu</p>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { onTabChange(item.id); onClose() }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: '3px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'rgba(59,130,246,.12)' : 'transparent',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .2s ease',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                }}>
                <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 'auto' }}>
          <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', color: '#64748b', fontSize: '.85rem', textDecoration: 'none', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', marginBottom: '4px' }}>
            🌐 Ver site público
          </a>
          <button
            id="sidebar-logout"
            onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#f87171', fontSize: '.85rem', cursor: 'pointer', fontWeight: 500 }}>
            🚪 Sair
          </button>
        </div>
      </aside>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   SUMMARY CARDS
═══════════════════════════════════════════════════════════ */
function SummaryCards({ kpi, loading, agendamentos, configs, comissoesTotais }) {
  const agendamentosHoje = (agendamentos || []).filter(a => {
    const todayStr = new Date().toISOString().slice(0,10)
    return a.data_hora && a.data_hora.startsWith(todayStr) && a.status !== 'cancelado'
  })
  
  let vCarroM = 0, vMotoM = 0, vCarroT = 0, vMotoT = 0;
  agendamentosHoje.forEach(ag => {
     const h = new Date(ag.data_hora).getHours()
     const isManha = h < 13
     const isMoto = ag.veiculo_modelo?.toLowerCase().startsWith('moto')
     const peso = (ag.servico_nome?.toLowerCase().includes('higienização') || ag.servico_nome?.toLowerCase().includes('polimento')) ? 2 : 1
     if (isMoto) { if (isManha) vMotoM += peso; else vMotoT += peso; } 
     else { if (isManha) vCarroM += peso; else vCarroT += peso; }
  })
  const totalManha = vCarroM + vMotoM;
  const totalTarde = vCarroT + vMotoT;

  const faturamentoBruto = Number(kpi?.faturamento_estimado || 0);
  const despesasMensais = Number(configs?.despesas_mensais || 0);

  // -------------------------------------------------------------------------
  // [FUNÇÃO CRUCIAL: INTELIGÊNCIA FINANCEIRA]
  // Calcula os Custos Operacionais somando as despesas fixas (aluguel, água, etc)
  // com as comissões variáveis da equipe. Subtraindo do Faturamento Bruto,
  // revelamos o Lucro Líquido Real, protegendo a saúde financeira da empresa.
  // -------------------------------------------------------------------------
  const custosOperacionais = (comissoesTotais || 0) + despesasMensais;
  const lucroLiquido = faturamentoBruto - custosOperacionais;
  const lucroColor = lucroLiquido >= 0 ? '#10b981' : '#ef4444';

  const cards = [
    {
      id: 'card-vagas',
      icon: '🚗',
      label: 'Ocupação (Hoje)',
      value: loading ? '—' : (
        <div style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          <span style={{ color: totalManha >= 8 ? '#ef4444' : '#0f172a' }}>Manhã: {totalManha}/8 vagas</span>
          <span style={{ color: totalTarde >= 8 ? '#ef4444' : '#0f172a' }}>Tarde: {totalTarde}/8 vagas</span>
        </div>
      ),
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg,rgba(139,92,246,.12),rgba(139,92,246,.04))',
    },
    {
      id: 'card-faturamento',
      icon: '💰',
      label: 'Faturamento Bruto',
      value: loading ? '—' : fmt(faturamentoBruto),
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(59,130,246,.04))',
    },
    {
      id: 'card-custos',
      icon: '📉',
      label: 'Custos (Comissões + Fixos)',
      value: loading ? '—' : fmt(custosOperacionais),
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04))',
    },
    {
      id: 'card-lucro',
      icon: '💎',
      label: 'Lucro Líquido Real',
      value: loading ? '—' : fmt(lucroLiquido),
      color: lucroColor,
      gradient: `linear-gradient(135deg,${lucroColor}22,${lucroColor}0a)`,
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '16px' }}>
      {cards.map(c => (
        <div key={c.id} id={c.id} style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          border: `1px solid ${c.color}18`,
          transition: 'box-shadow .2s, transform .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: c.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
            border: `1px solid ${c.color}20`,
          }}>
            {c.icon}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{c.label}</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{loading ? '—' : c.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   REVENUE CHART — Últimos 7 dias
═══════════════════════════════════════════════════════════ */
function RevenueChart({ data }) {
  const fmt = (v) => `R$${parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
  const max = Math.max(...(data || []).map(d => d.total), 1)
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: '.78rem', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1rem' }}>
          R$ {parseFloat(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px 10px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>📈 Faturamento — Últimos 7 dias</h3>
          <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '2px' }}>Apenas serviços finalizados</p>
        </div>
        <div style={{ fontSize: '.82rem', color: '#64748b', fontWeight: 500 }}>
          Total: <span style={{ color: '#3b82f6', fontWeight: 700 }}>
            R$ {((data || []).reduce((s, d) => s + d.total, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {(!data || data.every(d => d.total === 0)) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 4px', color: '#94a3b8' }}>
          <span style={{ fontSize: '1.25rem' }}>📊</span>
          <p style={{ fontSize: '.82rem' }}>Nenhum serviço finalizado nos últimos 7 dias. Os dados aparecerão aqui assim que concluir o primeiro serviço.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter,sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter,sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,.06)' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {(data || []).map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.dia === today
                    ? 'url(#barGradientToday)'
                    : entry.total > 0 ? 'url(#barGradient)' : '#e2e8f0'
                  }
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MODAL: NOVO AGENDAMENTO MANUAL
═══════════════════════════════════════════════════════════ */
function NovoAgendamentoModal({ servicos, onClose, onCreated }) {
  const [form, setForm] = useState({ nome: '', celular: '', modelo_carro: '', placa: '', servico_id: '', dataOnly: '', horaOnly: '', observacoes: '', sujeira_extrema: false, buscar_veiculo: false })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [ocupados, setOcupados] = useState([])

  useEffect(() => {
    if(!form.dataOnly) return
    fetch(`${API}/agendamentos/horarios-ocupados?data=${form.dataOnly}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if(d.success) {
          const list = Array.isArray(d.data) ? d.data : (d.data.ocupados || [])
          setOcupados(list.map(ag => {
             const h = new Date(ag.data_hora).getHours()
             const m = new Date(ag.data_hora).getMinutes()
             return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
          }))
        }
      })
  }, [form.dataOnly])

  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.celular || !form.modelo_carro || !form.servico_id || !form.dataOnly || !form.horaOnly) {
      setErro('Preencha todos os campos obrigatórios.'); return
    }
    setSaving(true); setErro('')
    try {
      const data_hora = `${form.dataOnly}T${form.horaOnly}:00`
      const obsFormatada = (form.sujeira_extrema ? '[SUJEIRA EXTREMA] ' : '') + (form.buscar_veiculo ? '[BUSCAR VEÍCULO] ' : '') + form.observacoes;
      const payload = { ...form, data_hora, observacoes: obsFormatada.trim() }
      const res = await fetch(`${API}/admin/agendamentos/manual`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) { onCreated(data.data); onClose() }
      else setErro(data.message || 'Erro ao criar.')
    } catch { setErro('Erro de conexão.') }
    setSaving(false)
  }

  const now = new Date(); now.setMinutes(now.getMinutes() + 5)
  const minDt = now.toISOString().slice(0, 16)

  const inputSt = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }
  const labelSt = { fontSize: '.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 60px rgba(0,0,0,.18)', animation: 'fadeIn .2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>+ Novo Agendamento Manual</h3>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '3px' }}>Cliente no balão ou avanço de cadastro</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}>✕</button>
        </div>

        {erro && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: '#991b1b', fontSize: '.82rem' }}>⚠️ {erro}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelSt}>Nome *</label>
              <input style={inputSt} placeholder="Nome do cliente" value={form.nome} onChange={change('nome')} required />
            </div>
            <div>
              <label style={labelSt}>Celular *</label>
              <input style={inputSt} placeholder="(11) 9 9999-9999" value={form.celular} onChange={change('celular')} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelSt}>Modelo do Veículo *</label>
              <input style={inputSt} placeholder="Ex: Honda CB 500, Onix Plus, Hilux..." value={form.modelo_carro} onChange={change('modelo_carro')} required />
            </div>
            <div>
              <label style={labelSt}>Placa (Opcional)</label>
              <input style={inputSt} placeholder="ABC-1234" value={form.placa || ''} onChange={change('placa')} />
            </div>
          </div>

          <div>
            <label style={labelSt}>Serviço *</label>
            <select style={inputSt} value={form.servico_id} onChange={change('servico_id')} required>
              <option value="">Selecione...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — R$ {parseFloat(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelSt}>Data *</label>
              <input style={inputSt} type="date" min={minDt.slice(0, 10)} value={form.dataOnly || ''} onChange={e => { change('dataOnly')(e); setForm(f => ({ ...f, horaOnly: '' })) }} required />
            </div>
            <div>
              <label style={labelSt}>Horário *</label>
              {form.dataOnly && new Date(form.dataOnly + 'T12:00:00').getDay() === 0 ? (
                <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', color: '#3b82f6', fontSize: '.8rem', textAlign: 'center' }}>
                  Domingo fechado!
                </div>
              ) : (
                <select style={inputSt} value={form.horaOnly || ''} onChange={change('horaOnly')} required disabled={!form.dataOnly}>
                  <option value="">Selecione...</option>
                  {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map(h => {
                    const isSabado = form.dataOnly && new Date(form.dataOnly + 'T12:00:00').getDay() === 6;
                    const blockedSabado = isSabado && h > '12:00';
                    const blocked = ocupados.includes(h) || blockedSabado;
                    return (
                      <option key={h} value={h} disabled={blocked}>{h} {ocupados.includes(h) ? '(Ocupado)' : blockedSabado ? '(Indisponível)' : ''}</option>
                    )
                  })}
                </select>
              )}
            </div>
          </div>

          {/* Sujeira extrema e Busca */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid ' + (form.sujeira_extrema ? 'rgba(245,158,11,.4)' : '#e2e8f0'), background: form.sujeira_extrema ? 'rgba(245,158,11,.05)' : '#f8fafc', cursor: 'pointer' }}
              onClick={toggle('sujeira_extrema')}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: '1.5px solid ' + (form.sujeira_extrema ? '#f59e0b' : '#cbd5e1'), background: form.sujeira_extrema ? '#f59e0b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.sujeira_extrema && <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem' }}>✓</span>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '.85rem' }}>🦴 Sujeira</div>
                <div style={{ fontSize: '.72rem', color: '#64748b' }}>Avaliar acréscimo</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid ' + (form.buscar_veiculo ? 'rgba(59,130,246,.4)' : '#e2e8f0'), background: form.buscar_veiculo ? 'rgba(59,130,246,.05)' : '#f8fafc', cursor: 'pointer' }}
              onClick={toggle('buscar_veiculo')}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: '1.5px solid ' + (form.buscar_veiculo ? '#3b82f6' : '#cbd5e1'), background: form.buscar_veiculo ? '#3b82f6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.buscar_veiculo && <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem' }}>✓</span>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '.85rem' }}>📍 Buscar Veículo</div>
                <div style={{ fontSize: '.72rem', color: '#64748b' }}>Buscar em domicílio</div>
              </div>
            </div>
          </div>

          <div>
            <label style={labelSt}>Observações</label>
            <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '60px', lineHeight: 1.5 }} rows={2} placeholder="Anotações internas..." value={form.observacoes} onChange={change('observacoes')} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? '⏳ Salvando...' : '✅ Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MODAL: CONCLUIR AGENDAMENTO (Atribuir Equipe + Valor Final)
   ═══════════════════════════════════════════════════════════ */
function ConcluirAgendamentoModal({ agendamento, colaboradores, onClose, onFinish }) {
  const [colaboradorIds, setColaboradorIds] = useState([])
  const [valorFinal, setValorFinal] = useState(parseFloat(agendamento.valor_cobrado || agendamento.servico_preco || 0).toFixed(2))
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const toggleColab = (id) => {
    setColaboradorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return // Trava contra duplo clique
    if (colaboradorIds.length === 0) { setErro('Selecione pelo menos um funcionário.'); return }
    setSaving(true); setErro('')
    try {
      // 1. Atualiza valor se mudou
      const v = parseFloat(valorFinal)
      await fetch(`${API}/admin/agendamentos/${agendamento.id}/valor`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ valor_cobrado: v })
      })

      // 2. Vincula colaborador
      await fetch(`${API}/colaboradores/agendamento/${agendamento.id}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ colaborador_ids: colaboradorIds })
      })

      // 3. Conclui
      const res = await fetch(`${API}/admin/agendamentos/${agendamento.id}/concluir`, {
        method: 'PUT',
        headers: authHeaders()
      })
      const data = await res.json()

      if (data.success) {
        onFinish(agendamento.id, v)
        onClose()
      } else {
        setErro(data.message || 'Erro ao finalizar.')
      }
    } catch {
      setErro('Erro na integração dos dados.')
    }
    setSaving(false)
  }

  const inputSt = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '.9rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }
  const labelSt = { fontSize: '.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px rgba(0,0,0,.18)', animation: 'fadeIn .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>🏁 Finalizar Atendimento</h3>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '3px' }}>#{agendamento.id} — {agendamento.cliente_nome}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {erro && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '.82rem' }}>⚠️ {erro}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelSt}>Equipe (Selecione quem realizou o serviço) *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {colaboradores.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '.85rem', color: '#0f172a', fontWeight: 500 }}>
                  <input type="checkbox" checked={colaboradorIds.includes(c.id)} onChange={() => toggleColab(c.id)} style={{ width: '18px', height: '18px' }} />
                  <span>{c.nome} <span style={{ color: '#94a3b8', fontSize: '.75rem', fontWeight: 400 }}>{c.porcentagem_comissao > 0 ? `(${c.porcentagem_comissao}%)` : '(Mensalista)'}</span></span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '6px' }}>O sistema dividirá a comissão automaticamente se houver múltiplos selecionados.</p>
          </div>

          <div>
            <label style={labelSt}>Valor Final (R$) *</label>
            <input style={{ ...inputSt, fontWeight: 700, fontSize: '1.1rem', color: '#059669' }} type="number" step="0.01" value={valorFinal} onChange={e => setValorFinal(e.target.value)} required />
            <p style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '4px' }}>Ajuste caso haja cobrança extra de sujeira.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? '⏳ Processando...' : '✅ Confirmar e Finalizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CONFIGURAR PREÇOS — Gestão Completa de Serviços
═══════════════════════════════════════════════════════════ */
const ICONS_SERVICO = ['🏍️', '✨', '🚙', '🛻', '🚗', '🧼', '🪣', '🔧', '💎', '⭐']

function ServicoModal({ modo, servico, onClose, onSaved }) {
  const inicial = servico
    ? { nome: servico.nome, descricao: servico.descricao || '', preco: servico.preco, duracao_minutos: servico.duracao_minutos || 60, icone: servico.icone || '🚗', categoria: servico.categoria || 'carro' }
    : { nome: '', descricao: '', preco: '', duracao_minutos: 60, icone: '🚗', categoria: 'carro' }

  const [form, setForm] = useState(inicial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.preco) { setError('Nome e preço são obrigatórios.'); return }
    setSaving(true); setError('')
    try {
      const url = modo === 'criar' ? '/api/servicos' : `/api/servicos/${servico.id}`
      const method = modo === 'criar' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...form, preco: parseFloat(form.preco), duracao_minutos: parseInt(form.duracao_minutos) }) })
      const data = await res.json()
      if (data.success) { onSaved(data.data, modo); onClose() }
      else setError(data.message || 'Erro ao salvar.')
    } catch { setError('Erro de conexão.') }
    setSaving(false)
  }

  const inputSt = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }
  const labelSt = { fontSize: '.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,.18)', animation: 'fadeIn .2s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {modo === 'criar' ? '➕ Novo Serviço' : '✏️ Editar Serviço'}
            </h3>
            <p style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '3px' }}>
              {modo === 'criar' ? 'Adicione um novo serviço ao catálogo' : 'Atualize os dados do serviço'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '.82rem' }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Ícone seletor */}
          <div>
            <label style={labelSt}>Ícone</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ICONS_SERVICO.map(ic => (
                <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icone: ic }))}
                  style={{ width: '38px', height: '38px', borderRadius: '10px', border: form.icone === ic ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: form.icone === ic ? 'rgba(59,130,246,.08)' : '#f8fafc', fontSize: '1.2rem', cursor: 'pointer', transition: 'all .15s' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label style={labelSt}>Categoria do Veículo *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'moto', label: 'Moto', icon: '🏍️' },
                { id: 'carro', label: 'Carro', icon: '🚗' },
                { id: 'suv', label: 'SUV', icon: '🛻' }
              ].map(cat => (
                <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, categoria: cat.id }))}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: form.categoria === cat.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: form.categoria === cat.id ? 'rgba(59,130,246,.08)' : '#f8fafc', fontSize: '.82rem', fontWeight: 600, color: form.categoria === cat.id ? '#1e40af' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label style={labelSt}>Nome do Serviço *</label>
            <input style={inputSt} placeholder="Ex: Higienização Interna Full" value={form.nome} onChange={change('nome')} required />
          </div>

          {/* Descrição */}
          <div>
            <label style={labelSt}>Descrição / Detalhes</label>
            <textarea style={{ ...inputSt, resize: 'vertical', minHeight: '80px', lineHeight: 1.5 }}
              placeholder="Descreva o que inclui neste serviço..." value={form.descricao} onChange={change('descricao')} rows={3} />
          </div>

          {/* Preço + Duração */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelSt}>Valor (R$) *</label>
              <input style={{ ...inputSt, fontWeight: 700 }} type="number" step="0.01" min="0" placeholder="0,00" value={form.preco} onChange={change('preco')} required />
            </div>
            <div>
              <label style={labelSt}>Duração (minutos)</label>
              <input style={inputSt} type="number" min="5" step="5" placeholder="60" value={form.duracao_minutos} onChange={change('duracao_minutos')} />
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? '⏳ Salvando...' : modo === 'criar' ? '✅ Criar Serviço' : '✅ Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PrecosPane() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // null | { modo: 'criar'|'editar', servico? }
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeCat, setActiveCat] = useState('carro')

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const load = () => {
    setLoading(true)
    fetch('/api/servicos', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setServicos(d.data) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSaved = (data, modo) => {
    load() // Recarrega tudo para garantir ordem e estados corretos
    showToast(modo === 'criar' ? `Serviço "${data.nome}" criado!` : `Serviço "${data.nome}" atualizado!`)
  }

  const handleDelete = async (s) => {
    if (!window.confirm(`Remover "${s.nome}"? Esta ação pode ser revertida no banco.`)) return
    setDeleting(s.id)
    try {
      const res = await fetch(`/api/servicos/${s.id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.success) {
        setServicos(prev => prev.filter(x => x.id !== s.id))
        showToast(`"${s.nome}" removido.`, 'warning')
      } else showToast(data.message, 'error')
    } catch { showToast('Erro de conexão.', 'error') }
    setDeleting(null)
  }

  const filtered = servicos.filter(s => s.categoria === activeCat)

  const ICON_MAP = { 1: '🏍️', 2: '✨', 3: '🚙' }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>💰 Gestão de Serviços</h2>
          <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Ajuste os valores por categoria de veículo</p>
        </div>
        <button id="btn-novo-servico" onClick={() => setModal({ modo: 'criar' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,.3)' }}>
          ➕ Novo Serviço
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px', width: 'fit-content' }}>
        {[
          { id: 'moto', label: 'Motos', icon: '🏍️' },
          { id: 'carro', label: 'Carros', icon: '🚗' },
          { id: 'suv', label: 'SUVs / Camionetes', icon: '🛻' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveCat(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: activeCat === t.id ? '#fff' : 'transparent', color: activeCat === t.id ? '#0f172a' : '#64748b', fontWeight: activeCat === t.id ? 700 : 500, fontSize: '.82rem', cursor: 'pointer', boxShadow: activeCat === t.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ background: toast.type === 'success' ? '#f0fdf4' : toast.type === 'warning' ? '#fffbeb' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#86efac' : toast.type === 'warning' ? '#fcd34d' : '#fca5a5'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: toast.type === 'success' ? '#166534' : toast.type === 'warning' ? '#92400e' : '#991b1b', fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f1f5f9' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '16px', width: '40%', borderRadius: '6px', background: '#f1f5f9' }} />
                <div style={{ height: '12px', width: '70%', borderRadius: '6px', background: '#f8fafc' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Nenhum serviço nesta categoria</h3>
          <p style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '20px' }}>Você ainda não cadastrou preços para {activeCat === 'moto' ? 'Motos' : activeCat === 'suv' ? 'SUVs' : 'Carros'}.</p>
          <button onClick={() => setModal({ modo: 'criar' })}
            style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
            ➕ Adicionar Serviço
          </button>
        </div>
      )}

      {/* Cards de serviços */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((s, idx) => (
            <div key={s.id} style={{ background: '#fff', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', transition: 'box-shadow .2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.09)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}>

              {/* Ícone */}
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: idx % 3 === 0 ? 'rgba(59,130,246,.08)' : idx % 3 === 1 ? 'rgba(139,92,246,.08)' : 'rgba(16,185,129,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, border: idx % 3 === 0 ? '1px solid rgba(59,130,246,.15)' : idx % 3 === 1 ? '1px solid rgba(139,92,246,.15)' : '1px solid rgba(16,185,129,.15)' }}>
                {s.icone || ICON_MAP[s.id] || '🔧'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '.95rem', marginBottom: '3px' }}>{s.nome}</div>
                {s.descricao && <div style={{ fontSize: '.78rem', color: '#64748b', lineHeight: 1.5, marginBottom: '4px' }}>{s.descricao}</div>}
                <div style={{ fontSize: '.72rem', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                  <span>⏱️ {s.duracao_minutos} min</span>
                  <span>🆔 #{s.id}</span>
                </div>
              </div>

              {/* Preço */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                  R$ {parseFloat(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '2px' }}>por serviço</div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button id={`edit-servico-${s.id}`} onClick={() => setModal({ modo: 'editar', servico: s })}
                  style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', color: '#3b82f6', fontWeight: 600, fontSize: '.78rem', cursor: 'pointer' }}>
                  ✏️ Editar
                </button>
                <button id={`del-servico-${s.id}`} onClick={() => handleDelete(s)} disabled={deleting === s.id}
                  style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontWeight: 600, fontSize: '.78rem', cursor: deleting === s.id ? 'not-allowed' : 'pointer', opacity: deleting === s.id ? .6 : 1 }}>
                  {deleting === s.id ? '...' : '🗑️ Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé informativo */}
      {!loading && servicos.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.12)', borderRadius: '10px', fontSize: '.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💡 <span>Os preços são aplicados automaticamente no formulário de agendamento do cliente. <strong style={{ color: '#3b82f6' }}>Excluído = inativo</strong> (pode ser reativado no banco).</span>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ServicoModal
          modo={modal.modo}
          servico={modal.servico}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD VIEW — Visão Geral (KPIs + Gráfico + Últimos 5)
═══════════════════════════════════════════════════════════ */
function DashboardView({
  dashData, loading, user, configs, onConcluir, onCancelar, onVerStatus, actionLoading, onNewManual,
  metaFaturamento, editingMeta, tempMeta, setTempMeta, setEditingMeta, handleSaveMeta,
  comissoesTotais
}) {
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  // Últimos 5 agendamentos ativos (não cancelados)
  const ultimos5 = (dashData?.agendamentos || [])
    .filter(a => a.status !== 'cancelado')
    .slice(0, 5)

  const agendamentosHoje = (dashData?.agendamentos || []).filter(a => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return a.data_hora && a.data_hora.startsWith(todayStr) && a.status !== 'cancelado'
  })
  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
          {saudacao}, {user?.nome || 'Felipe'}! 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Aqui está o resumo do seu dia.</p>
      </div>

      {configs?.modo_chuva === 'true' && (
        <div style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '14px', padding: '20px', marginBottom: '16px', animation: 'fadeIn .4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌧️</span>
            <h3 style={{ color: '#1e3a8a', margin: 0 }}>Modo Chuva Ativado</h3>
          </div>
          <p style={{ color: '#3b82f6', fontSize: '.85rem', marginBottom: '14px' }}>Carros agendados para hoje. Ofereça reagendamento rápido via WhatsApp:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agendamentosHoje.length === 0 ? (
              <p style={{ fontSize: '.8rem', color: '#64748b' }}>Nenhum agendamento para hoje.</p>
            ) : agendamentosHoje.map(a => {
              const nome = a.cliente_nome.split(' ')[0];
              const msg = encodeURIComponent(`Olá ${nome}, aqui é da Fernandes Auto Tech. Devido à chuva, gostaria de saber se prefere manter ou remarcar sua lavagem para quando o tempo abrir?`);
              const num = a.cliente_celular.replace(/\D/g, '');
              const waLink = `https://wa.me/${num.startsWith('55') ? num : '55' + num}?text=${msg}`;
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,.05)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#0f172a' }}>{a.cliente_nome}</div>
                    <div style={{ fontSize: '.75rem', color: '#64748b' }}>{a.veiculo_modelo} · {fmtDate(a.data_hora).split(' ')[1]}</div>
                  </div>
                  <a href={waLink} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', background: '#25d366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>📱</span> Remarcar
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <SummaryCards kpi={dashData?.kpi} loading={loading} agendamentos={dashData?.agendamentos} configs={configs} comissoesTotais={comissoesTotais} />

      {/* Meta Config */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div>
          <p style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>🎯 Meta de Faturamento Mensal</p>
          {!editingMeta ? (
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>R$ {metaFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input type="number" value={tempMeta} onChange={e => setTempMeta(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '.9rem', width: '120px' }} autoFocus />
              <button onClick={handleSaveMeta} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
              <button onClick={() => setEditingMeta(false)} style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
        {!editingMeta && (
          <button onClick={() => { setTempMeta(metaFaturamento); setEditingMeta(true); }} style={{ padding: '6px 12px', background: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '.8rem', cursor: 'pointer' }}>
            ✏️ Editar
          </button>
        )}
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={dashData?.grafico7dias} />

      {/* Últimos 5 Agendamentos */}
      <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', border: '1px solid #f1f5f9' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: '#0f172a' }}>⏱️ Últimos Agendamentos</h3>
            <p style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: '2px' }}>Aguardando ação ou recém-finalizados</p>
          </div>
          <button onClick={onNewManual} style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: '#3b82f6', padding: '6px 12px', borderRadius: '7px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
            + Novo Manual
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
          </div>
        ) : ultimos5.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>
            Nenhum agendamento ativo no momento.
          </div>
        ) : (
          <div>
            {ultimos5.map((a, i) => {
              const st = STATUS[a.status] || STATUS.recebido
              const isFinal = ['finalizado', 'pronto_retirada', 'cancelado'].includes(a.status)
              return (
                <div key={a.id}
                  style={{ padding: '14px 20px', borderBottom: i < ultimos5.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>

                  {/* Status dot */}
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color, flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.cliente_nome} — {a.veiculo_modelo}
                    </div>
                    <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {a.servico_nome} · {fmtDate(a.data_hora)}
                    </div>
                  </div>

                  {/* Badge */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '999px', fontSize: '.7rem', fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.color}33`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {st.label}
                  </span>

                  {/* Ação rápida */}
                  {!isFinal && (
                    <button
                      onClick={() => onConcluir(a.id)}
                      disabled={actionLoading === a.id}
                      style={{ padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(16,185,129,.25)', background: 'rgba(16,185,129,.08)', color: '#059669', fontWeight: 600, fontSize: '.72rem', cursor: 'pointer', flexShrink: 0 }}>
                      {actionLoading === a.id ? '...' : '✓ Concluir'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = adminUser()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [concluindoAgendamento, setConcluindoAgendamento] = useState(null)
  const [showManualModal, setShowManualModal] = useState(false)
  const [configs, setConfigs] = useState({})
  const [comissoesTotais, setComissoesTotais] = useState(0)

  const [theme, setTheme] = useState(localStorage.getItem('fat_theme') || 'light')
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light'
    localStorage.setItem('fat_theme', theme)
  }, [theme])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // -------------------------------------------------------------------------
  // [FUNÇÃO CRUCIAL: PAINEL DE AGENDAMENTOS]
  // Busca todos os dados vitais do dashboard em tempo real.
  // Esse polling garante que o painel exiba os carros do pátio instantaneamente,
  // evitando que a equipe perca um novo serviço recebido no balcão ou site.
  // -------------------------------------------------------------------------
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/dashboard`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setDashData(data.data)
      else if (res.status === 403) navigate('/admin/login')

        // Atualização Real-Time da Equipe e Comissões sem recarregar a página
        const resR = await fetch(`${API}/colaboradores/relatorio`, { headers: authHeaders() })
        const dr = await resR.json()
        if (dr.success) {
          setColaboradores(dr.data)
          setComissoesTotais(dr.data.reduce((acc, c) => acc + (Number(c.valor_a_pagar) || 0), 0))
        }
    } catch { }
    setLoading(false)
  }, [navigate])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Poll every 20s when on dashboard/agendamentos tab
  useEffect(() => {
    if (!['dashboard', 'agendamentos'].includes(activeTab)) return
    const i = setInterval(fetchDashboard, 20000)
    return () => clearInterval(i)
  }, [activeTab, fetchDashboard])

  const handleLogout = () => {
    localStorage.removeItem('fat_admin_token')
    localStorage.removeItem('fat_admin_user')
    navigate('/admin/login')
  }

  const handleConcluir = (id) => {
    const ag = dashData?.agendamentos.find(a => a.id === id)
    if (ag) setConcluindoAgendamento(ag)
  }

  const handleFinishConcluir = async (id, valorFinal) => {
    showToast('✅ Serviço finalizado! Comissão dividida com sucesso.')
    await fetchDashboard() // Atualiza KPIs e faturamento em tempo real puxando do backend
  }

  const handleCancelar = async (id) => {
    const motivo = window.prompt(`Cancelar agendamento #${id}?\nInforme o motivo do cancelamento (opcional):`)
    if (motivo === null) return // O usuário clicou em cancelar no prompt
    setActionLoading(id)
    try {
      const res = await fetch(`${API}/admin/agendamentos/${id}/cancelar`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ motivo: motivo.trim() }) })
      const data = await res.json()
      if (data.success) {
        showToast(`Agendamento #${id} cancelado.`, 'warning')
        await fetchDashboard()
      } else showToast(data.message, 'error')
    } catch { showToast('Erro de conexão.', 'error') }
    setActionLoading(null)
  }

  const handleVerStatus = (token) => {
    window.open(`/status/${token}`, '_blank')
  }

  const handleValorUpdate = async (id, valor) => {
    showToast(`Valor do agendamento #${id} atualizado para ${fmt(valor)}`)
    await fetchDashboard()
  }

  const handleManualCreated = () => {
    showToast('Agendamento manual criado! ✅')
    fetchDashboard()  // recarrega a lista
  }

  const [servicos, setServicos] = useState([])
  const [metaFaturamento, setMetaFaturamento] = useState(30000)
  const [editingMeta, setEditingMeta] = useState(false)
  const [tempMeta, setTempMeta] = useState('')

  useEffect(() => {
    fetch(`${API}/servicos`, { headers: authHeaders() }).then(r => r.json()).then(d => { if (d.success) setServicos(d.data) }).catch(() => { })
    fetch(`${API}/admin/configuracoes`, { headers: authHeaders() }).then(r => r.json()).then(d => { 
      if (d.success && d.data) { 
        setConfigs(d.data); 
        if(d.data.meta_faturamento_mensal) setMetaFaturamento(parseFloat(d.data.meta_faturamento_mensal)); 
      } 
    }).catch(() => { })
  }, [])

  const handleSaveMeta = async () => {
    if (!tempMeta || isNaN(tempMeta)) return showToast('Valor inválido', 'error')
    try {
      const res = await fetch(`${API}/admin/configuracoes`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave: 'meta_faturamento_mensal', valor: tempMeta })
      })
      if (res.ok) {
        setMetaFaturamento(parseFloat(tempMeta))
        setEditingMeta(false)
        showToast('Meta atualizada! 🎯')
      }
    } catch {}
  }

  return (
    <>
      {/* Layout & sidebar responsive styles */}
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* Reset any global body padding/margin that creates gaps */
        body { background: #f1f5f9 !important; margin: 0; padding: 0; }
        #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }

        /* Sidebar */
        .admin-sidebar { transform: translateX(-100%); }
        .admin-sidebar.open { transform: translateX(0) !important; }
        .sidebar-close { display: block; }

        /* Desktop */
        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0) !important;
            position: fixed !important;
          }
          .sidebar-close        { display: none !important; }
          .admin-main           { margin-left: 250px !important; width: calc(100% - 250px) !important; }
          .admin-topbar-hamburger { display: none !important; }
          .topbar-logo          { display: none !important; }
        }

        /* Mobile */
        @media (max-width: 767px) {
          .admin-main  { margin-left: 0 !important; width: 100% !important; }
          .topbar-logo { display: block !important; }
        }

        /* ════════════════════════════════════════════════════════
           TEMA LUXUOSO (DARK MODE)
        ═════════════════════════════════════════════════════════ */
        body.theme-dark { background: #0b1120 !important; color: #f8fafc !important; }
        body.theme-dark .admin-main { background: #0b1120 !important; }
        body.theme-dark .admin-sidebar { background: #080c17 !important; border-right-color: #1e293b !important; }
        body.theme-dark .topbar-logo { filter: brightness(0) invert(1) !important; opacity: 0.9 !important; }
        
        /* Reversão de fundos claros para grafite/marinho */
        body.theme-dark [style*="rgb(255, 255, 255)"], body.theme-dark [style*="#fff"], body.theme-dark [style*="#ffffff"] { 
            background-color: #1e293b !important; border-color: #334155 !important; color: #f8fafc !important; 
        }
        body.theme-dark [style*="rgb(241, 245, 249)"], body.theme-dark [style*="rgb(248, 250, 252)"] { 
            background-color: #0f172a !important; border-color: #1e293b !important; 
        }
        
        /* Reversão de textos e inputs */
        body.theme-dark [style*="rgb(15, 23, 42)"], body.theme-dark [style*="#0f172a"] { color: #f8fafc !important; }
        body.theme-dark [style*="rgb(100, 116, 139)"], body.theme-dark [style*="#64748b"] { color: #94a3b8 !important; }
        body.theme-dark input, body.theme-dark select, body.theme-dark textarea { background-color: #0f172a !important; color: #f8fafc !important; border-color: #334155 !important; }
        
        body.theme-dark [style*="border-bottom: 1px solid rgb(226, 232, 240)"], body.theme-dark [style*="border-bottom: 1px solid rgb(241, 245, 249)"] { border-bottom-color: #334155 !important; }
        body.theme-dark [style*="1px solid rgb(226, 232, 240)"] { border-color: #334155 !important; }
        body.theme-dark .admin-main > div:first-child { background-color: #1e293b !important; border-bottom-color: #334155 !important; }
        body.theme-dark td, body.theme-dark th { border-bottom-color: #334155 !important; color: #cbd5e1 !important; }

        /* ════════════════════════════════════════════════════════
           REFINAMENTO MOBILE (Botões acessíveis com polegar)
        ═════════════════════════════════════════════════════════ */
        @media (max-width: 767px) {
            .mobile-thumb-btn { padding: 14px 20px !important; font-size: 1rem !important; width: 100% !important; justify-content: center !important; margin-top: 8px !important; }
            .mobile-thumb-btn-inline { padding: 12px 16px !important; font-size: .95rem !important; width: 100% !important; justify-content: center !important; margin-top: 10px !important; }
            .table-action-cell > div { display: flex; flex-direction: column; gap: 8px; width: 100%; }
            table th, table td { white-space: nowrap !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main — takes all remaining width */}
        <main className="admin-main" style={{ flex: 1, minHeight: '100vh', minWidth: 0, background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar — slim single-line header */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Hamburger (mobile) */}
              <button
                id="hamburger-btn"
                className="admin-topbar-hamburger"
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '3px', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ display: 'block', width: '16px', height: '2px', background: '#475569', borderRadius: '1px' }} />
                <span style={{ display: 'block', width: '16px', height: '2px', background: '#475569', borderRadius: '1px' }} />
                <span style={{ display: 'block', width: '16px', height: '2px', background: '#475569', borderRadius: '1px' }} />
              </button>

              {/* Topbar logo (mobile only) */}
              <img src={logoImg} alt="Fernandes Auto Tech" className="topbar-logo" style={{ height: '28px', width: 'auto', display: 'none', filter: 'brightness(0) invert(0) saturate(0) brightness(.4)', opacity: 1 }} />

              {/* Page title + breadcrumb inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <span style={{ color: '#cbd5e1', fontSize: '.8rem' }}>/</span>
                <span style={{ fontSize: '.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>Painel do Dono</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }} title="Alternar Tema">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button id="refresh-btn" onClick={fetchDashboard}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 12px', fontSize: '.78rem', color: '#64748b', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                🔄 Atualizar
              </button>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                {(user?.nome || 'A')[0]}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: '20px' }}>
            {/* Toast */}
            {toast && (
              <div style={{
                position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
                background: toast.type === 'error' ? '#fef2f2' : toast.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                border: `1px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'warning' ? '#fcd34d' : '#86efac'}`,
                borderRadius: '12px', padding: '14px 20px',
                color: toast.type === 'error' ? '#991b1b' : toast.type === 'warning' ? '#92400e' : '#166534',
                fontWeight: 600, fontSize: '.875rem',
                boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                animation: 'fadeInUp .3s ease',
                maxWidth: '320px',
              }}>
                {toast.msg}
              </div>
            )}

            {/* Dashboard — Visão Geral */}
            {activeTab === 'dashboard' && (
              <DashboardView
                dashData={dashData}
                loading={loading}
                user={user}
                configs={configs}
                onConcluir={handleConcluir}
                onCancelar={handleCancelar}
                onVerStatus={handleVerStatus}
                actionLoading={actionLoading}
                onNewManual={() => setShowManualModal(true)}
                metaFaturamento={metaFaturamento}
                editingMeta={editingMeta}
                tempMeta={tempMeta}
                setTempMeta={setTempMeta}
                setEditingMeta={setEditingMeta}
                handleSaveMeta={handleSaveMeta}
                comissoesTotais={comissoesTotais}
              />
            )}

            {/* Agendamentos — Área de trabalho */}
            {activeTab === 'agendamentos' && (
              <AgendamentosPane
                dashData={dashData}
                loading={loading}
                onConcluir={handleConcluir}
                onCancelar={handleCancelar}
                onVerStatus={handleVerStatus}
                actionLoading={actionLoading}
                onValorUpdate={handleValorUpdate}
                onManualCreated={handleManualCreated}
                servicos={servicos}
                onNewManual={() => setShowManualModal(true)}
              />
            )}

            {activeTab === 'clientes' && (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                <ClientesPane />
              </div>
            )}

            {activeTab === 'precos' && (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                <PrecosPane />
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                <ConfiguracoesPane configs={configs} setConfigs={setConfigs} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />
              </div>
            )}

            {activeTab === 'equipe' && (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                <EquipePane />
              </div>
            )}
          </div>

          {/* Modal de Conclusão */}
          {concluindoAgendamento && (
            <ConcluirAgendamentoModal
              agendamento={concluindoAgendamento}
              colaboradores={colaboradores}
              onClose={() => setConcluindoAgendamento(null)}
              onFinish={handleFinishConcluir}
            />
          )}

          {showManualModal && (
            <NovoAgendamentoModal
              servicos={servicos}
              onClose={() => setShowManualModal(false)}
              onCreated={handleManualCreated}
            />
          )}
        </main>
      </div>
    </>
  )
}
