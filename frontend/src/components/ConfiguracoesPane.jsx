import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

function authHeaders() {
  const t = localStorage.getItem('fat_admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
}

export default function ConfiguracoesPane({ configs, setConfigs, showToast, theme, toggleTheme }) {
  const [form, setForm] = useState({
    vagas_carro_turno: configs.vagas_carro_turno || '5',
    vagas_moto_turno: configs.vagas_moto_turno || '3',
    sabado_meio_dia: configs.sabado_meio_dia === 'true',
    bloquear_agendamentos: configs.bloquear_agendamentos === 'true',
    despesas_mensais: configs.despesas_mensais || '0'
  });
  const modoChuva = configs.modo_chuva === 'true';

  const saveConfig = async (chave, valor) => {
    await fetch(`${API}/admin/configuracoes`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ chave, valor: String(valor) }) })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    await Promise.all([ 
      saveConfig('vagas_carro_turno', form.vagas_carro_turno), 
      saveConfig('vagas_moto_turno', form.vagas_moto_turno), 
      saveConfig('sabado_meio_dia', form.sabado_meio_dia), 
      saveConfig('bloquear_agendamentos', form.bloquear_agendamentos),
      saveConfig('despesas_mensais', form.despesas_mensais)
    ])
    setConfigs(prev => ({ ...prev, ...form, sabado_meio_dia: String(form.sabado_meio_dia), bloquear_agendamentos: String(form.bloquear_agendamentos), despesas_mensais: String(form.despesas_mensais) }))
    showToast('Configurações atualizadas com sucesso!')
  }

  const toggleChuva = async () => {
    const newVal = !modoChuva;
    await saveConfig('modo_chuva', newVal);
    setConfigs(prev => ({ ...prev, modo_chuva: String(newVal) }))
    showToast(newVal ? '🌧️ Modo Chuva ativado!' : '☀️ Modo Chuva desativado!', newVal ? 'warning' : 'success')
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>⚙️ Configurações e Limites</h2>
          <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>Ajuste a capacidade de atendimento do pátio</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={toggleTheme} style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--card-bg, transparent)', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
            {theme === 'dark' ? '☀️ Tema Claro' : '🌙 Tema Escuro'}
          </button>
          <button onClick={toggleChuva} style={{ padding: '10px 16px', borderRadius: '10px', background: modoChuva ? '#ef4444' : '#3b82f6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
            {modoChuva ? '☀️ DESATIVAR MODO CHUVA' : '🌧️ ATIVAR MODO CHUVA'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ background: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>📊 Inteligência Financeira</h3>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Despesas Fixas do Mês (Aluguel, Água, Produtos, etc)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#64748b' }}>R$</span>
              <input type="number" step="0.01" min="0" style={{ width: '100%', maxWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} value={form.despesas_mensais} onChange={e => setForm({ ...form, despesas_mensais: e.target.value })} />
            </div>
            <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '6px' }}>Este valor será somado às comissões para deduzir do Faturamento Bruto e calcular o Lucro Líquido Real no Dashboard.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Vagas p/ Carros (Por Turno)</label><input type="number" min="1" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} value={form.vagas_carro_turno} onChange={e => setForm({ ...form, vagas_carro_turno: e.target.value })} /></div>
          <div><label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Vagas p/ Motos (Por Turno)</label><input type="number" min="1" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} value={form.vagas_moto_turno} onChange={e => setForm({ ...form, vagas_moto_turno: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.sabado_meio_dia} onChange={e => setForm({ ...form, sabado_meio_dia: e.target.checked })} style={{ width: '18px', height: '18px' }} /><div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '.9rem' }}>Encerrar Sábado às 12:00</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Bloqueia agendamentos após as 11:30 e remove o aviso de "entrega à tarde".</div></div></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.bloquear_agendamentos} onChange={e => setForm({ ...form, bloquear_agendamentos: e.target.checked })} style={{ width: '18px', height: '18px' }} /><div><div style={{ fontWeight: 600, color: '#ef4444', fontSize: '.9rem' }}>Bloquear novos agendamentos no site</div><div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Trava a agenda completamente. Útil em dias de lotação máxima.</div></div></label>
        </div>
        <button type="submit" style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' }}>✅ Salvar Configurações</button>
      </form>
    </div>
  )
}