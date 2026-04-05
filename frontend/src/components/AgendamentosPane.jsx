import React, { useState, useEffect } from 'react';

const API = '/api'

function authHeaders() {
  const t = localStorage.getItem('fat_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
}

const fmtDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'

const STATUS = {
  recebido: { label: 'Recebido', color: '#3b82f6', bg: 'rgba(59,130,246,.15)' },
  em_lavagem: { label: 'Em Lavagem', color: '#8b5cf6', bg: 'rgba(139,92,246,.15)' },
  detalhamento: { label: 'Detalhamento', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
  finalizado: { label: 'Finalizado', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  pronto_retirada: { label: 'Pronto p/ Retirada', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
}

function DateFilter({ value, onChange }) {
  const today = new Date().toISOString().slice(0, 10)

  const presets = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoje', label: 'Hoje' },
    { id: 'amanha', label: 'Amanhã' },
    { id: 'custom', label: '📅 Data' },
  ]

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
      <span style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 500 }}>Filtrar por data:</span>
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => onChange(p.id === 'custom' ? value : p.id)}
            style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              background: (value === p.id || (p.id === 'custom' && !['todos', 'hoje', 'amanha'].includes(value))) ? '#fff' : 'transparent',
              color: (value === p.id || (p.id === 'custom' && !['todos', 'hoje', 'amanha'].includes(value))) ? '#0f172a' : '#64748b',
              fontWeight: (value === p.id ? 600 : 400), fontSize: '.82rem', cursor: 'pointer',
              boxShadow: value === p.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s',
            }}>
            {p.label}
          </button>
        ))}
      </div>
      {(!['todos', 'hoje', 'amanha'].includes(value) || value === 'custom') && (
        <input
          type="date" defaultValue={today} onChange={e => onChange(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '.82rem', color: '#0f172a', background: '#fff', cursor: 'pointer' }}
        />
      )}
    </div>
  )
}

function AgendamentosTable({ agendamentos, loading, onConcluir, onCancelar, onVerStatus, actionLoading, dateFilter, onValorUpdate }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [editValor, setEditValor] = useState({})
  const [savingValor, setSavingValor] = useState(null)

  const resolveDate = () => {
    if (!dateFilter || dateFilter === 'todos') return null
    if (dateFilter === 'hoje') return new Date().toISOString().slice(0, 10)
    if (dateFilter === 'amanha') return new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    return dateFilter 
  }

  const targetDate = resolveDate()

  const filtered = agendamentos.filter(a => {
    const matchSearch = !search || a.cliente_nome.toLowerCase().includes(search.toLowerCase()) || a.veiculo_modelo.toLowerCase().includes(search.toLowerCase()) || a.cliente_celular.includes(search)
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus
    const matchDate = !targetDate || new Date(a.data_hora).toISOString().slice(0, 10) === targetDate
    return matchSearch && matchStatus && matchDate
  })

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>Carregando agendamentos...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Todos os Agendamentos</h3>
          <p style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '2px' }}>{filtered.length} de {agendamentos.length} registros</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Buscar cliente, veículo..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '.85rem', outline: 'none', color: '#0f172a', background: '#f8fafc', width: '220px' }}
          />
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', cursor: 'pointer' }}>
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['#', 'Cliente', 'Veículo', 'Serviço / Valor', 'Data/Hora', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '.9rem' }}>Nenhum agendamento encontrado</td></tr>
            ) : filtered.map(a => {
              const st = STATUS[a.status] || STATUS.recebido
              const isLoading = actionLoading === a.id
              const isFinal = ['finalizado', 'pronto_retirada', 'cancelado'].includes(a.status)

              return (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 16px', color: '#94a3b8', fontWeight: 500 }}>#{a.id}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '.95rem', color: '#0f172a' }}>{a.cliente_nome}</div>
                    <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '2px' }}>{a.cliente_celular}</div>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#334155', fontWeight: 500 }}>
                    {a.veiculo_modelo}
                    {a.veiculo_placa && <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>{a.veiculo_placa}</div>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ color: '#334155' }}>{a.servico_nome}</div>
                    {a.equipe && <div style={{ fontSize: '.72rem', color: '#8b5cf6', marginTop: '2px', fontWeight: 600 }}>Lavado por: {a.equipe}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '.7rem', color: '#94a3b8' }}>R$</span>
                      <input
                        type="number" step="0.01" min="0" value={editValor[a.id] !== undefined ? editValor[a.id] : parseFloat(a.valor_cobrado || a.servico_preco || 0).toFixed(2)}
                        onChange={e => setEditValor(prev => ({ ...prev, [a.id]: e.target.value }))}
                        style={{ width: '72px', padding: '3px 7px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '.8rem', fontWeight: 700, color: '#059669', outline: 'none', background: '#f0fdf4' }}
                      />
                      {editValor[a.id] !== undefined && parseFloat(editValor[a.id]) !== parseFloat(a.valor_cobrado || a.servico_preco) && (
                        <button
                          onClick={async () => {
                            setSavingValor(a.id)
                            const v = parseFloat(editValor[a.id])
                            const res = await fetch(`${API}/admin/agendamentos/${a.id}/valor`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ valor_cobrado: v }) })
                            const d = await res.json()
                            if (d.success) { onValorUpdate?.(a.id, v); setEditValor(prev => { const n = { ...prev }; delete n[a.id]; return n }) }
                            setSavingValor(null)
                          }}
                          disabled={savingValor === a.id}
                          style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#059669', fontWeight: 700, fontSize: '.7rem', cursor: 'pointer' }}>
                          {savingValor === a.id ? '...' : '✓'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '.82rem' }}>{fmtDate(a.data_hora)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '.74rem', fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.color}33`, whiteSpace: 'nowrap' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color, display: 'inline-block' }} /> {st.label}
                    </span>
                  </td>
                  <td className="table-action-cell" style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button disabled={isFinal || isLoading} onClick={() => onConcluir(a.id)} className="mobile-thumb-btn"
                        style={{ padding: '6px 12px', borderRadius: '7px', cursor: isFinal ? 'not-allowed' : 'pointer', background: isFinal ? '#f1f5f9' : 'rgba(16,185,129,.1)', color: isFinal ? '#94a3b8' : '#059669', fontWeight: 600, fontSize: '.78rem', border: `1px solid ${isFinal ? '#e2e8f0' : 'rgba(16,185,129,.25)'}` }}>
                        {isLoading ? '...' : '✓ Concluir'}
                      </button>
                      <button disabled={isFinal || isLoading} onClick={() => onCancelar(a.id)} className="mobile-thumb-btn"
                        style={{ padding: '6px 12px', borderRadius: '7px', cursor: isFinal ? 'not-allowed' : 'pointer', background: isFinal ? '#f1f5f9' : 'rgba(239,68,68,.08)', color: isFinal ? '#94a3b8' : '#dc2626', fontWeight: 600, fontSize: '.78rem', border: `1px solid ${isFinal ? '#e2e8f0' : 'rgba(239,68,68,.2)'}` }}>
                        ✕ Cancelar
                      </button>
                      <button onClick={() => onVerStatus(a.token_cliente)} className="mobile-thumb-btn"
                        style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid rgba(59,130,246,.25)', background: 'rgba(59,130,246,.08)', color: '#2563eb', fontWeight: 600, fontSize: '.78rem', cursor: 'pointer' }}>
                        🔗
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AgendamentosPane({ dashData, loading, onConcluir, onCancelar, onVerStatus, actionLoading, onValorUpdate, onNewManual }) {
  const [dateFilter, setDateFilter] = useState('hoje')

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>📋 Agendamentos</h2>
          <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Gerencie e atualize o status de cada atendimento</p>
        </div>
        <button className="mobile-thumb-btn-inline" onClick={onNewManual}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,.3)' }}>
          + Novo Agendamento Manual
        </button>
      </div>

      <DateFilter value={dateFilter} onChange={setDateFilter} />

      <AgendamentosTable
        agendamentos={dashData?.agendamentos || []}
        loading={loading}
        onConcluir={onConcluir}
        onCancelar={onCancelar}
        onVerStatus={onVerStatus}
        actionLoading={actionLoading}
        dateFilter={dateFilter}
        onValorUpdate={onValorUpdate}
      />
    </div>
  )

}
