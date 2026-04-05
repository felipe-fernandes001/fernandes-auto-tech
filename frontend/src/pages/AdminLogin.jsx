import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Limpeza de cache (garante que não haja sessão anterior presa)
  useEffect(() => {
    localStorage.removeItem('fat_admin_token')
    localStorage.removeItem('fat_admin_user')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('fat_admin_token', data.token)
        localStorage.setItem('fat_admin_user', JSON.stringify(data.admin))
        navigate('/admin')
      } else {
        setError(data.message || 'Credenciais inválidas.')
      }
    } catch {
      setError('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.2 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.15 }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--blue), var(--purple))', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 8px 32px var(--blue-glow)' }}>
            🚗
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Fernandes <span className="gradient-text">Auto Tech</span></h1>
          <p className="text-muted text-sm">Painel Administrativo</p>
        </div>

        <div className="glass" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Bem-vindo de volta 👋</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '28px' }}>Acesso exclusivo para administradores</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="felipe@fernandesautotech.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                id="login-email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                id="login-password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px', color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading} id="login-submit" style={{ marginTop: '8px' }}>
              {loading ? <><div className="spinner" /> Entrando...</> : '🔑 Acessar Painel'}
            </button>
          </form>
        </div>

        <p className="text-center text-faint text-xs" style={{ marginTop: '20px' }}>
          <a href="/" style={{ color: 'var(--text-faint)' }}>← Voltar ao site público</a>
        </p>
      </div>
    </div>
  )
}
