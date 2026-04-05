import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

function authHeaders() {
  const t = localStorage.getItem('fat_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
}

const fmt = (v) => `R$ ${parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  function EditarClienteModal({ cliente, onClose, onSaved }) {
  const [form, setForm] = useState({ nome: cliente.nome, celular: cliente.celular })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API}/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        onSaved()
        onClose()
      } else {
        alert(data.message || 'Erro ao editar cliente.')
      }
    } catch {
      alert('Erro de conexão.')
    }
    setSaving(false)
  }

  const inputSt = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0 }}>✏️ Editar Cliente</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '.8rem', marginBottom: '4px' }}>Nome</label>
          <input style={inputSt} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          
          <label style={{ display: 'block', fontSize: '.8rem', marginBottom: '4px' }}>Celular</label>
          <input style={inputSt} value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} required />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientesPane() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalCliente, setModalCliente] = useState(null)

  const carregarClientes = () => {
    setLoading(true)
    fetch(`${API}/clientes`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setClientes(d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) || c.celular.includes(search)
  )

  const openWA = (cel) => {
    const n = cel.replace(/\D/g, '')
    window.open(`https://wa.me/${n.startsWith('55') ? n : '55' + n}`, '_blank')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      const res = await fetch(`${API}/clientes/${id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (data.success) {
        setClientes(prev => prev.filter(c => c.id !== id))
      } else {
        alert(data.message || 'Erro ao excluir')
      }
    } catch { alert('Erro de conexão') }
  }

  return (
    <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Gestão de Clientes</h3>
          <p style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '2px' }}>{clientes.length} clientes cadastrados</p>
        </div>
        <input
          placeholder="🔍 Buscar por nome ou celular..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '.85rem', outline: 'none', color: '#0f172a', background: '#f8fafc', width: '240px' }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Cliente', 'Celular', 'Atendimentos', 'Último Serviço', 'Total Gasto', 'Ações'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Carregando...</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.nome}</div>
                  <div style={{ fontSize: '.72rem', color: '#94a3b8' }}>desde {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}</div>
                </td>
                <td style={{ padding: '13px 16px', color: '#334155', fontFamily: 'monospace' }}>{c.celular}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ background: 'rgba(59,130,246,.1)', color: '#2563eb', padding: '3px 10px', borderRadius: '999px', fontSize: '.75rem', fontWeight: 600 }}>{c.total_agendamentos || 0}</span>
                </td>
                <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '.82rem' }}>{c.ultimo_agendamento ? new Date(c.ultimo_agendamento).toLocaleDateString('pt-BR') : '—'}</td>
                <td style={{ padding: '13px 16px', fontWeight: 700, color: '#059669' }}>{fmt(c.total_gasto)}</td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => openWA(c.celular)} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.3)', color: '#16a34a', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>📱 Whats</button>
                    <button onClick={() => setModalCliente(c)} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', color: '#2563eb', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#dc2626', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>🗑️ Excluir</button>
                    {(c.token_ultimo_agendamento || c.ultimo_token) && (
                      <button onClick={() => window.open(`/status/${c.token_ultimo_agendamento || c.ultimo_token}`, '_blank')} style={{ padding: '6px 10px', borderRadius: '7px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.3)', color: '#8b5cf6', fontWeight: 600, fontSize: '.75rem', cursor: 'pointer' }}>🔗 Painel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalCliente && <EditarClienteModal cliente={modalCliente} onClose={() => setModalCliente(null)} onSaved={carregarClientes} />}
    </div>
  )
}