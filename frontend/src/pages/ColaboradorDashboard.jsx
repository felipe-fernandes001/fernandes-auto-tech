import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import logoImg from '../assets/logo-png.png'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

/* ═══════════════════════════════════════════════════════════
   COMPONENTE: NOVO AGENDAMENTO MANUAL
   ═══════════════════════════════════════════════════════════ */
function ColaboradorNovoAgendamentoModal({ servicos, onClose, onCreated }) {
  const [form, setForm] = useState({ nome: '', celular: '', modelo_carro: '', servico_id: '', data_hora: '', observacoes: '', sujeira_extrema: false })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.celular || !form.modelo_carro || !form.servico_id || !form.data_hora) {
      setErro('Preencha os campos obrigatórios.'); return
    }
    setSaving(true); setErro('')
    try {
      const res = await fetch(`${API}/colaborador/agendamentos/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('fat_colab_token')}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) { onCreated(data.data); onClose() }
      else setErro(data.message || 'Erro ao criar.')
    } catch { setErro('Erro de conexão.') }
    setSaving(false)
  }

  const minDt = new Date().toISOString().slice(0, 16)
  const inputSt = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #334155', fontSize: '.95rem', color: '#f8fafc', background: '#0f172a', boxSizing: 'border-box', outline: 'none' }
  const labelSt = { fontSize: '.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp .3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>➕ Novo Cliente</h3>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', margin: 0 }}>Cadastrar veículo manual</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
        {erro && <div style={{ background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.3)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '.85rem' }}>{erro}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={labelSt}>Nome *</label><input style={inputSt} value={form.nome} onChange={change('nome')} required /></div>
            <div><label style={labelSt}>Celular *</label><input style={inputSt} value={form.celular} onChange={change('celular')} required /></div>
          </div>
          <div><label style={labelSt}>Modelo *</label><input style={inputSt} value={form.modelo_carro} onChange={change('modelo_carro')} required /></div>
          <div><label style={labelSt}>Serviço *</label>
            <select style={inputSt} value={form.servico_id} onChange={change('servico_id')} required>
              <option value="">Selecione...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco}</option>)}
            </select>
          </div>
          <div><label style={labelSt}>Data/Hora *</label><input type="datetime-local" style={inputSt} min={minDt} value={form.data_hora} onChange={change('data_hora')} required /></div>
          <div style={{ display: 'flex', gap: '10px', cursor: 'pointer' }} onClick={toggle('sujeira_extrema')}>
            <input type="checkbox" checked={form.sujeira_extrema} readOnly /> <span style={{ fontSize: '.85rem', color: '#f8fafc' }}>Sujeira Extrema (avaliar acréscimo)</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{saving ? '⏳...' : 'Salvar Cadastro'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE: CHECKLIST RÁPIDO DE FINALIZAÇÃO
   ═══════════════════════════════════════════════════════════ */
function ChecklistModal({ onConfirm, onClose, saving }) {
  const [c1, setC1] = useState(false)
  const [c2, setC2] = useState(false)
  const [c3, setC3] = useState(false)
  const ok = c1 && c2 && c3

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', animation: 'fadeInUp .3s ease' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800 }}>✅ Checklist Final</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px', background: c1 ? 'rgba(16,185,129,.15)' : '#0f172a', borderRadius: '12px', border: `1px solid ${c1 ? '#10b981' : '#334155'}`, color: '#f8fafc', fontWeight: 600 }}>
            <input type="checkbox" checked={c1} onChange={e => setC1(e.target.checked)} style={{ width: '20px', height: '20px' }} /> Carro aspirado bem?
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px', background: c2 ? 'rgba(16,185,129,.15)' : '#0f172a', borderRadius: '12px', border: `1px solid ${c2 ? '#10b981' : '#334155'}`, color: '#f8fafc', fontWeight: 600 }}>
            <input type="checkbox" checked={c2} onChange={e => setC2(e.target.checked)} style={{ width: '20px', height: '20px' }} /> Pneus com pretinho?
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px', background: c3 ? 'rgba(16,185,129,.15)' : '#0f172a', borderRadius: '12px', border: `1px solid ${c3 ? '#10b981' : '#334155'}`, color: '#f8fafc', fontWeight: 600 }}>
            <input type="checkbox" checked={c3} onChange={e => setC3(e.target.checked)} style={{ width: '20px', height: '20px' }} /> Vidros limpos por dentro?
          </label>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #475569', background: 'transparent', color: '#94a3b8', fontWeight: 700 }}>Voltar</button>
          <button onClick={onConfirm} disabled={!ok || saving} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: ok ? '#10b981' : '#334155', color: ok ? '#fff' : '#64748b', fontWeight: 800 }}>
            {saving ? '⏳...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE: HISTÓRICO DE GANHOS
   ═══════════════════════════════════════════════════════════ */
function HistoricoModal({ onClose }) {
  const [hist, setHist] = useState(null)
  useEffect(() => {
    fetch(`${API}/colaborador/historico`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('fat_colab_token')}` } })
      .then(r => r.json()).then(d => { if (d.success) setHist(d.data) })
  }, [])

  const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto', animation: 'fadeInUp .3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 800 }}>Histórico de Ganhos</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
        {!hist ? <p style={{color:'#64748b'}}>Carregando...</p> : hist.length === 0 ? <p style={{color:'#64748b'}}>Nenhum ganho recente.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hist.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0f172a', borderRadius: '14px', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{h.data_br}</div>
                  <div style={{ fontSize: '.8rem', color: '#94a3b8' }}>{h.qtde_servicos} carros lavados</div>
                </div>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>
                  {fmt(h.ganho)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL: DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function ColaboradorDashboard() {
  const user = JSON.parse(localStorage.getItem('fat_colab_user') || '{}')
  const token = localStorage.getItem('fat_colab_token')

  const navigate = useNavigate()

  const [theme, setTheme] = useState(localStorage.getItem('fat_theme') || 'dark')
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark'
    localStorage.setItem('fat_theme', theme)
  }, [theme])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab] = useState('inicio')
  const [ranking, setRanking] = useState([])
  const [configs, setConfigs] = useState({})

  // Modais
  const [novoModal, setNovoModal] = useState(false)
  const [histModal, setHistModal] = useState(false)
  const [checkFocus, setCheckFocus] = useState(null) // ID do agendamento sendo finalizado

  const [servicosParaManual, setServicosParaManual] = useState([])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    const currentToken = localStorage.getItem('fat_colab_token')
    try {
      const res = await fetch(`${API}/colaborador/dashboard`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      const dt = await res.json()
      if (dt.success) {
        setData(dt.data)
      } else {
        if (res.status === 401 || res.status === 403) navigate('/colaborador/login')
      }

      // Load services for manual combo
      const resS = await fetch(`${API}/servicos`, { headers: { 'Authorization': `Bearer ${currentToken}` } })
      const ds = await resS.json()
      if (ds.success) setServicosParaManual(ds.data)

      // Buscar Ranking e Metas
      try {
        const resR = await fetch(`${API}/colaboradores/relatorio`, { headers: { 'Authorization': `Bearer ${currentToken}` } })
        const dr = await resR.json()
        if (dr.success) setRanking(dr.data.sort((a,b) => (b.total_servicos || 0) - (a.total_servicos || 0)))
      } catch (e) {}
      try {
        const resC = await fetch(`${API}/admin/configuracoes`, { headers: { 'Authorization': `Bearer ${currentToken}` } })
        const dc = await resC.json()
        if (dc.success && dc.data) setConfigs(dc.data)
      } catch (e) {}
    } catch (err) {
        // Silenciado para produção
    }
    setLoading(false)
  }, [navigate])

  useEffect(() => {
    if (!token) navigate('/colaborador/login')
    else loadData()
  }, [loadData, navigate, token])

  const assumirServico = async (id) => {
    if (actionLoading === id) return; // Trava de duplo-clique
    setActionLoading(id)
    try {
      const res = await fetch(`${API}/colaborador/agendamentos/${id}/assumir`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const dt = await res.json()
      if (dt.success) {
        showToast('Você assumiu este carro! Mãos à obra 💪')
        loadData()
      } else showToast(dt.message, 'error')
    } catch { showToast('Erro de conexão.', 'error') }
    setActionLoading(null)
  }

  // -------------------------------------------------------------------------
  // [FUNÇÃO CRUCIAL: OPERAÇÃO DE PÁTIO]
  // Lógica de avanço rápido de status. Otimizada para o lavador apertar apenas
  // um botão no celular com as mãos molhadas e manter o cliente notificado online.
  // -------------------------------------------------------------------------
  const handleStatus = async (id, statusAtual) => {
    if (actionLoading === id) return; // Trava de duplo-clique
    let novo = ''
    if (statusAtual === 'recebido') novo = 'em_lavagem'
    else if (statusAtual === 'em_lavagem') novo = 'finalizado'
    else return

    setActionLoading(id)
    try {
      const res = await fetch(`${API}/colaborador/agendamentos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ novo_status: novo })
      })
      const dt = await res.json()
      if (dt.success) {
        setCheckFocus(null) // Fecha checklist se tiver aberto
        showToast(novo === 'finalizado' ? 'Carro finalizado com sucesso! ✅' : 'Status atualizado! 🚗')
        loadData()
      } else showToast(dt.message, 'error')
    } catch { showToast('Erro de conexão.', 'error') }
    setActionLoading(null)
  }

  const logout = () => {
    localStorage.removeItem('fat_colab_token')
    localStorage.removeItem('fat_colab_user')
    setData(null) // Limpa os dados em memória da sessão atual
    navigate('/colaborador/login')
  }

  const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const wpLnk = (num, mod, pla) => `https://wa.me/55${(num || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, aqui é da Fernandes Auto Tech! Seu veículo modelo ${mod} placa ${pla || 'sem placa'} já está pronto para retirada. Muito obrigado pela preferência!`)}`

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>Carregando seu painel...</div>

  const proximo = data?.filaDisponivel?.[0]
  const restoFila = data?.filaDisponivel?.slice(1) || []

  const valorMeta = parseFloat(configs?.meta_faturamento_mensal || 30000)
  const atualMeta = ranking.length > 0 
      ? ranking.reduce((acc, c) => acc + ((parseFloat(c.valor_a_pagar) || 0) * (100 / (parseFloat(c.porcentagem_comissao)||35))), 0)
      : 12500
  const pctMeta = Math.min(100, Math.round((atualMeta / valorMeta) * 100)) || 0

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        body { background: #0f172a !important; color: #f8fafc !important; margin: 0; font-family: 'Inter', sans-serif; }
        .colab-layout { display: flex; min-height: 100vh; flex-direction: column; background: #0f172a; }
        .colab-main { flex: 1; padding: 20px 20px 100px 20px; overflow-y: auto; }
        .colab-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: space-around; padding: 12px 10px 24px 10px; z-index: 100; box-shadow: 0 -4px 20px rgba(0,0,0,.3); }
        .colab-nav-item { display: flex; flex-direction: column; gap: 4px; align-items: center; background: none; border: none; color: #64748b; font-size: .7rem; font-weight: 600; cursor: pointer; transition: all .2s; flex: 1; }
        .colab-nav-item.active { color: #3b82f6; }
        .colab-nav-icon { font-size: 1.4rem; margin-bottom: 2px; }
        .colab-topbar-mobile { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #1e293b; border-bottom: 1px solid #334155; position: sticky; top: 0; z-index: 90; }
        
        @media(min-width: 768px) {
           .colab-layout { flex-direction: row; }
           .colab-nav { position: static; width: 260px; flex-direction: column; justify-content: flex-start; padding: 24px; border-top: none; border-right: 1px solid #334155; box-shadow: none; }
           .colab-nav-item { flex-direction: row; font-size: .95rem; padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; gap: 14px; justify-content: flex-start; }
           .colab-nav-item.active { background: rgba(59,130,246,.1); color: #60a5fa; }
           .colab-main { padding: 40px; }
           .colab-topbar-mobile { display: none !important; }
        }

        /* ════════════════════════════════════════════════════════
           TEMA LUXUOSO CLARO (LIGHT MODE)
        ═════════════════════════════════════════════════════════ */
        body.theme-light { background: #f1f5f9 !important; color: #0f172a !important; }
        body.theme-light .colab-layout { background: #f1f5f9 !important; }
        body.theme-light .colab-nav, body.theme-light .colab-topbar-mobile { background: #ffffff !important; border-color: #e2e8f0 !important; }
        body.theme-light .colab-nav-item { color: #64748b; }
        body.theme-light .colab-nav-item.active { color: #3b82f6; background: rgba(59,130,246,0.1); }
        body.theme-light .desktop-logo-wrapper img, body.theme-light .colab-topbar-mobile img { filter: none !important; }
        
        body.theme-light [style*="rgb(30, 41, 59)"] { background-color: #ffffff !important; border-color: #e2e8f0 !important; color: #0f172a !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
        body.theme-light [style*="rgb(15, 23, 42)"] { background-color: #f8fafc !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
        body.theme-light [style*="rgb(248, 250, 252)"] { color: #0f172a !important; }
        body.theme-light [style*="rgb(148, 163, 184)"] { color: #64748b !important; }
        body.theme-light [style*="1px solid rgb(51, 65, 85)"] { border-color: #e2e8f0 !important; }
        
        @media (max-width: 767px) {
            .mobile-thumb-btn { width: 100% !important; padding: 16px !important; font-size: 1.1rem !important; margin-top: 8px !important; justify-content: center; }
        }
      `}</style>

      <div className="colab-layout">
        
        {/* TOPBAR (Mobile) */}
        <div className="colab-topbar-mobile">
           <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
           <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                 {user?.nome?.[0] || 'C'}
              </div>
           </div>
        </div>

        {/* NAV (Sidebar/Bottom) */}
        <nav className="colab-nav">
           <div style={{ display: 'none', marginBottom: '40px', padding: '0 10px' }} className="desktop-logo-wrapper">
              <style>{`@media(min-width:768px){ .desktop-logo-wrapper { display: block !important; } }`}</style>
              <img src={logoImg} alt="Fernandes Auto Tech" style={{ width: '140px', filter: 'brightness(0) invert(1)' }} />
           </div>

           {[
             { id: 'inicio', icon: '🏠', label: 'Início' },
             { id: 'servicos', icon: '📋', label: 'Meus Serviços' },
             { id: 'comissoes', icon: '💰', label: 'Comissões' },
             { id: 'metas', icon: '🎯', label: 'Metas' },
           ].map(t => (
             <button key={t.id} className={`colab-nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span className="colab-nav-icon">{t.icon}</span>
                <span>{t.label}</span>
             </button>
           ))}
           
           <div style={{ flex: 1 }} className="nav-spacer" />
           <style>{`@media(max-width:767px){ .nav-spacer, .nav-logout { display: none !important; } }`}</style>
           
           <button className="colab-nav-item nav-theme" onClick={toggleTheme} style={{ marginTop: 'auto', marginBottom: '8px' }}>
              <span className="colab-nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
           </button>
           <button className="colab-nav-item nav-logout" onClick={logout} style={{ color: '#ef4444', marginTop: 'auto' }}>
              <span className="colab-nav-icon">🚪</span>
              <span>Sair do Sistema</span>
           </button>
        </nav>

        <main className="colab-main">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {toast && (
              <div style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 9999, background: toast.type === 'error' ? '#7f1d1d' : '#065f46', color: '#fff', padding: '14px 20px', borderRadius: '12px', border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`, fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,.5)', animation: 'fadeInUp .3s ease' }}>
                {toast.msg}
              </div>
            )}

            {/* ── ABA INÍCIO ── */}
            {activeTab === 'inicio' && (
              <div style={{ animation: 'fadeInUp .3s ease' }}>
                <div style={{ marginBottom: '24px' }}>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Olá, {user?.nome}! 👋</h2>
                   <p style={{ color: '#94a3b8', margin: 0, fontSize: '.9rem' }}>Pronto para mais um dia de alta performance?</p>
                </div>

                {/* META DA EQUIPE */}
                <div style={{ background: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid #334155', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                           <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>🎯 Meta da Equipe</h3>
                           <p style={{ color: '#94a3b8', fontSize: '.85rem', margin: 0 }}>Faturamento conjunto no mês</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>R$ {atualMeta.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                           <div style={{ fontSize: '.8rem', color: '#64748b' }}>de R$ {valorMeta.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                        </div>
                    </div>
                    <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
                       <div style={{ width: `${pctMeta}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '6px', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '.75rem', color: '#94a3b8', fontWeight: 700 }}>{pctMeta}% Concluído</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                   {/* PRÓXIMO DA FILA */}
                   <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px' }}>🚨 Próximo da Fila</h3>
                      {proximo ? (
                        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #3b82f6', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(59,130,246,.15)' }}>
                           <div style={{ position: 'absolute', top: 0, left: 0, padding: '6px 16px', background: '#3b82f6', color: '#fff', fontSize: '.75rem', fontWeight: 800, borderBottomRightRadius: '12px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Aguardando Lavagem</div>
                           <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>{proximo.veiculo_modelo} {proximo.veiculo_placa ? `(${proximo.veiculo_placa})` : ''}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>{proximo.servico_nome}</p>
                                {proximo.observacoes && (
                                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: '10px', color: '#fbbf24', fontSize: '.9rem', lineHeight: 1.5 }}>
                                    <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>⚠️ Atenção / Detalhes:</strong>
                                    <span style={{ whiteSpace: 'pre-wrap' }}>{proximo.observacoes}</span>
                                  </div>
                                )}
                              </div>
                              <button onClick={() => assumirServico(proximo.id)} disabled={actionLoading === proximo.id} className="mobile-thumb-btn" style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,.4)', transition: 'all .2s' }}>
                                {actionLoading === proximo.id ? 'Aguarde...' : '▶️ INICIAR SERVIÇO'}
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div style={{ background: '#1e293b', border: '1px dashed #334155', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                           <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🙌</div>
                           <p style={{ margin: 0 }}>Nenhum veículo na fila de espera. O pátio está limpo!</p>
                        </div>
                      )}

                      {/* RESTO DA FILA */}
                      {restoFila.length > 0 && (
                         <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 8px 0' }}>Na Sequência ({restoFila.length})</p>
                            {restoFila.map(r => (
                               <div key={r.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                     <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '.9rem' }}>{r.veiculo_modelo}</div>
                                     <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>{r.servico_nome}</div>
                                  </div>
                                  <div style={{ fontSize: '.75rem', color: '#64748b', background: '#0f172a', padding: '4px 8px', borderRadius: '6px' }}>{new Date(r.data_hora).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>

                   {/* RANKING */}
                   <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>🏆 Ranking de Produtividade</h3>
                      <div style={{ background: '#1e293b', borderRadius: '20px', padding: '20px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,.1)' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {ranking.length === 0 ? (
                               <>
                                 {[ {nome:'Lucas', servicos: 5}, {nome:'Gabriel', servicos: 4}, {nome: user?.nome||'Você', servicos: 2} ].sort((a,b)=>b.servicos-a.servicos).map((r, i) => (
                                   <div key={r.nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                         <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: i===0 ? '#fbbf24' : i===1 ? '#94a3b8' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i===0?'#78350f':'#fff', fontSize: '1rem' }}>{r.nome[0]}</div>
                                         <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '.95rem' }}>{r.nome} {i===0 && '🔥'}</div>
                                      </div>
                                      <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.2rem' }}>{r.servicos} <span style={{ fontSize:'.7rem', color:'#64748b', fontWeight:500 }}>carros</span></div>
                                   </div>
                                 ))}
                               </>
                            ) : ranking.map((r, i) => (
                               <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                     <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: i===0 ? '#fbbf24' : i===1 ? '#94a3b8' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i===0?'#78350f':'#fff', fontSize: '1rem' }}>{r.nome[0]}</div>
                                     <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '.95rem' }}>{r.nome} {i===0 && '🔥'}</div>
                                  </div>
                                  <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.2rem' }}>{r.total_servicos || 0} <span style={{ fontSize:'.7rem', color:'#64748b', fontWeight:500 }}>carros</span></div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* ── ABA SERVIÇOS ── */}
            {activeTab === 'servicos' && (
              <div style={{ animation: 'fadeInUp .3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                   <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Meus Serviços</h2>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '.9rem' }}>Carros sob sua responsabilidade</p>
                   </div>
                   <button onClick={() => setNovoModal(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 4px 14px rgba(59,130,246,.3)' }}>
                     ➕ Novo Cliente (Manual)
                   </button>
                </div>

                {data?.servicos?.length === 0 ? (
                  <div style={{ background: '#1e293b', borderRadius: '20px', padding: '60px 20px', textAlign: 'center', color: '#64748b', border: '1px dashed #334155' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏖️</div>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>Você não tem nenhum carro na sua fila no momento.</p>
                    <p style={{ fontSize: '.9rem', marginTop: '8px' }}>Vá até a aba "Início" e assuma um serviço no pátio!</p>
          </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data?.servicos?.map(s => (
                      <div key={s.id} style={{ background: '#1e293b', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,.15)', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 800 }}>🚗 {s.veiculo_modelo} {s.veiculo_placa ? `(${s.veiculo_placa})` : ''}</h4>
                            <p style={{ margin: 0, fontSize: '.9rem', color: '#94a3b8' }}>{s.servico_nome} - {fmt(s.valor_cobrado || s.servico_preco)}</p>
                            {s.observacoes && (
                              <div style={{ marginTop: '12px', width: '100%', fontSize: '.85rem', color: '#fbbf24', background: 'rgba(245,158,11,.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245,158,11,.3)', lineHeight: 1.5 }}>
                                <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>⚠️ Atenção / Detalhes:</strong>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{s.observacoes}</span>
                              </div>
                            )}
                  </div>
                          <div style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '.8rem', fontWeight: 700, background: s.status === 'recebido' ? 'rgba(100,116,139,.15)' : 'rgba(59,130,246,.15)', color: s.status === 'recebido' ? '#94a3b8' : '#60a5fa', border: `1px solid ${s.status === 'recebido' ? '#334155' : 'rgba(59,130,246,.3)'}` }}>
                    {s.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                        <div style={{ paddingTop: '16px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  {s.cliente_celular ? (
                            <a href={wpLnk(s.cliente_celular, s.veiculo_modelo, s.veiculo_placa)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'rgba(37,211,102,.15)', border: '1px solid rgba(37,211,102,.3)', color: '#22c55e', padding: '10px 16px', borderRadius: '10px', fontSize: '.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.1rem' }}>💬</span> Avisar Cliente
                    </a>
                  ) : <div />}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {s.status === 'recebido' && (
                      <button
                        onClick={() => handleStatus(s.id, s.status)}
                        disabled={actionLoading === s.id}
                                className="mobile-thumb-btn" style={{ padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '.9rem', border: 'none', background: '#3b82f6', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,.3)' }}>
                                {actionLoading === s.id ? 'Aguarde...' : '▶️ Iniciar Lavagem'}
                      </button>
                    )}
                    {s.status === 'em_lavagem' && (
                      <button
                        onClick={() => setCheckFocus(s.id)}
                        disabled={actionLoading === s.id}
                                className="mobile-thumb-btn" style={{ padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '.9rem', border: 'none', background: '#10b981', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,.3)' }}>
                                {actionLoading === s.id ? 'Aguarde...' : '✅ Finalizar Carro'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            )}

            {/* ── ABA COMISSÕES ── */}
            {activeTab === 'comissoes' && (
              <div style={{ animation: 'fadeInUp .3s ease' }}>
                <div style={{ marginBottom: '24px' }}>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Minhas Comissões</h2>
                   <p style={{ color: '#94a3b8', margin: 0, fontSize: '.9rem' }}>Acompanhe seus ganhos do mês</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.15), rgba(139,92,246,.15))', border: '1px solid rgba(59,130,246,.3)', borderRadius: '20px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
                   <p style={{ fontSize: '.9rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '.05em' }}>Comissão Atual ({data?.extrato?.porcentagem}%)</p>
                   <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, color: '#60a5fa', textShadow: '0 4px 20px rgba(59,130,246,.4)' }}>{fmt(data?.extrato?.comissaoMes)}</h2>
                </div>

                <button onClick={() => setHistModal(true)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  📊 Ver Extrato Completo
                </button>
              </div>
            )}

            {/* ── ABA METAS ── */}
            {activeTab === 'metas' && (
              <div style={{ animation: 'fadeInUp .3s ease' }}>
                <div style={{ marginBottom: '24px' }}>
                   <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Metas da Empresa</h2>
                   <p style={{ color: '#94a3b8', margin: 0, fontSize: '.9rem' }}>O sucesso da loja é o sucesso da equipe!</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '20px', padding: '32px', border: '1px solid #334155', textAlign: 'center' }}>
                   <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🚀</div>
                   <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: '0 0 16px 0' }}>Estamos {pctMeta}% lá!</h3>
                   
                   <div style={{ height: '16px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', marginBottom: '20px' }}>
                      <div style={{ width: `${pctMeta}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981, #fbbf24)', borderRadius: '8px', transition: 'width 1s ease' }} />
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 600, fontSize: '.95rem' }}>
                      <span>R$ 0</span>
                      <span style={{ color: '#10b981' }}>R$ {valorMeta.toLocaleString('pt-BR')}</span>
                   </div>
                   
                   <p style={{ color: '#64748b', marginTop: '24px', fontSize: '.95rem', lineHeight: 1.6 }}>
                      Continue puxando carros da fila e entregando a melhor qualidade. Quando a Fernandes Auto Tech cresce, todo mundo ganha! 💪
                   </p>
                </div>
              </div>
            )}

          </div>
        </main>

      {novoModal && (
        <ColaboradorNovoAgendamentoModal
          servicos={servicosParaManual}
          onClose={() => setNovoModal(false)}
          onCreated={(d) => { setNovoModal(false); showToast('Agendamento criado! ✅'); loadData() }}
        />
      )}

      {histModal && <HistoricoModal onClose={() => setHistModal(false)} />}

      {checkFocus && (
        <ChecklistModal
          onClose={() => setCheckFocus(null)}
          onConfirm={() => handleStatus(checkFocus, 'em_lavagem')} // Vai para finalizado no controller
          saving={actionLoading === checkFocus}
        />
      )}
    </div>
    </>
  )
}
