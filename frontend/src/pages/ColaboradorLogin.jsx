import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

export default function ColaboradorLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', codigo_acesso: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Limpeza profunda de cache: apaga estado do usuário anterior
  useEffect(() => {
    localStorage.removeItem('fat_colab_token')
    localStorage.removeItem('fat_colab_user')
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/auth/colaborador/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('fat_colab_token', data.token)
        localStorage.setItem('fat_colab_user', JSON.stringify(data.colaborador))
        localStorage.setItem('colaborador_id', data.colaborador.id)
        navigate('/colaborador/dashboard')
        return // Evita atualizar estado e previne o piscar de tela
      } else {
        setErro(data.message || 'Credenciais inválidas.')
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,.08)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', marginBottom: '16px', boxShadow: '0 8px 16px rgba(59,130,246,.3)' }}>
            ⚙️
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Área da Equipe</h1>
          <p style={{ color: '#64748b', fontSize: '.9rem', margin: 0 }}>Apenas funcionários autorizados.</p>
        </div>

        {erro && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', fontSize: '.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nome *</label>
            <input 
              type="text" 
              placeholder="Seu nome"
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '.95rem', outline: 'none' }}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Código de Acesso *</label>
            <input 
              type="password" 
              placeholder="Digite seu código"
              value={form.codigo_acesso}
              onChange={e => setForm({...form, codigo_acesso: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '.95rem', outline: 'none' }}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '10px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all .2s' }}>
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
