import React, { useState, useEffect } from 'react';

const API = '/api'

function authHeaders() {
  const t = localStorage.getItem('fat_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
}

const fmt = (v) => `R$ ${parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

/* ── Modal for Adding/Editing Collaborators ──────────────── */
function ColaboradorModal({ modo, colaborador, onClose, onSaved }) {
  const inicial = colaborador
    ? { nome: colaborador.nome, cargo: colaborador.cargo || 'Ajudante', porcentagem_comissao: colaborador.porcentagem_comissao || 35, codigo_acesso: '' }
    : { nome: '', cargo: 'Ajudante', porcentagem_comissao: 35, codigo_acesso: '' }

  const [form, setForm] = useState(inicial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) { setError('O nome é obrigatório.'); return }
    setSaving(true); setError('')
    try {
      const url = modo === 'criar' ? `${API}/colaboradores` : `${API}/colaboradores/${colaborador.id}`
      const method = modo === 'criar' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ ...form, porcentagem_comissao: parseFloat(form.porcentagem_comissao) })
      })
      const data = await res.json()
      if (data.success) {
        onSaved(data.data, modo)
        onClose()
      } else {
        setError(data.message || 'Erro ao salvar.')
      }
    } catch {
      setError('Erro de conexão.')
    }
    setSaving(false)
  }

  const inputSt = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '.88rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }
  const labelSt = { fontSize: '.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {modo === 'criar' ? '➕ Novo Colaborador' : '✏️ Editar Colaborador'}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '.82rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelSt}>Nome Completo *</label>
            <input style={inputSt} placeholder="Ex: João Silva" value={form.nome} onChange={change('nome')} required />
          </div>

          <div>
            <label style={labelSt}>Cargo / Função</label>
            <input style={inputSt} placeholder="Ex: Lavador, Polidor, Ajudante..." value={form.cargo} onChange={change('cargo')} required />
          </div>

          <div>
            <label style={labelSt}>Código de Acesso (Senha)</label>
            <input style={inputSt} type="text" placeholder={modo === 'editar' ? 'Deixe em branco para manter' : 'Ex: 1234'} value={form.codigo_acesso} onChange={change('codigo_acesso')} required={modo === 'criar'} />
          </div>

          <div>
            <label style={labelSt}>Porcentagem de Comissão (%)</label>
            <input style={inputSt} type="number" step="0.1" value={form.porcentagem_comissao} onChange={change('porcentagem_comissao')} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? '⏳ Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Pane ───────────────────────────────────────────── */
export default function EquipePane() {
  const [equipe, setEquipe] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/colaboradores/relatorio`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setEquipe(data.data)
    } catch (err) {
      showToast('Erro ao carregar dados da equipe.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSaved = (data, modo) => {
    loadData() 
    showToast(modo === 'criar' ? 'Colaborador adicionado!' : 'Dados atualizados!')
  }

  const handleDelete = async (colab) => {
    if (!window.confirm(`Desativar ${colab.nome}? Ele não aparecerá mais nos novos agendamentos.`)) return
    setDeleting(colab.id)
    try {
      const res = await fetch(`${API}/colaboradores/${colab.id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.success) {
        showToast(`${colab.nome} desativado.`, 'warning')
        setEquipe(prev => prev.filter(c => c.id !== colab.id))
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Erro de conexão.', 'error')
    }
    setDeleting(null)
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>🤝 Gestão de Equipe</h2>
          <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Métricas e comissões do mês atual</p>
        </div>
        <button onClick={() => setModal({ modo: 'criar' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,.3)' }}>
          ➕ Novo Colaborador
        </button>
      </div>

      {toast && (
        <div style={{ background: toast.type === 'success' ? '#f0fdf4' : toast.type === 'warning' ? '#fffbeb' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#86efac' : toast.type === 'warning' ? '#fcd34d' : '#fca5a5'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: toast.type === 'success' ? '#166534' : toast.type === 'warning' ? '#92400e' : '#991b1b', fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.msg}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nome / Cargo', 'Comissão %', 'Serviços', 'A Pagar (Mês)', 'Saldo Total', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Carregando dados da equipe...</td></tr>
              ) : equipe.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Nenhum colaborador cadastrado.</td></tr>
              ) : equipe.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.nome}</div>
                    <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>{c.cargo}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: '#3b82f6' }}>{c.porcentagem_comissao}%</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: 'rgba(59,130,246,.1)', color: '#2563eb', padding: '3px 10px', borderRadius: '999px', fontSize: '.75rem', fontWeight: 600 }}>{c.total_servicos || 0}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>{fmt(c.valor_a_pagar)}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: '#64748b' }}>{fmt(c.saldo_acumulado)}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setModal({ modo: 'editar', colaborador: c })} style={{ padding: '6px 12px', borderRadius: '7px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', color: '#3b82f6', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(c)} disabled={deleting === c.id} style={{ padding: '6px 12px', borderRadius: '7px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer', opacity: deleting === c.id ? .6 : 1 }}>{deleting === c.id ? '...' : '🗑️'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.12)', borderRadius: '10px', fontSize: '.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        💡 <span>As comissões mensais são calculadas automaticamente. O <strong>Saldo Total</strong> pode ser usado para controle de pagamentos acumulados e adiantamentos.</span>
      </div>

      {modal && <ColaboradorModal modo={modal.modo} colaborador={modal.colaborador} onClose={() => setModal(null)} onSaved={handleSaved} />}
    </div>
  )
}