import React, { useState } from 'react';

export default function LightningCheckInModal({ onClose, onSuccess, servicos = [] }) {
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [valor, setValor] = useState('');
  
  // Campos que ficam ocultos nos bastidores
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCelular, setClienteCelular] = useState('');
  
  const [buscando, setBuscando] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formatação automática da placa: Mercosul (ABC1D23) ou Antiga (ABC-1234)
  const handlePlacaChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3, 7);
    setPlaca(val);
  };

  // Busca pela Placa para preencher automaticamente
  const handleBusca = async () => {
    const p = placa.replace('-', '');
    if (p.length < 7) {
      alert('Digite a placa completa (7 caracteres).');
      return;
    }
    setBuscando(true);
    try {
      const token = localStorage.getItem('token');
      const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';
      const res = await fetch(`${API}/admin/veiculos/busca-placa?placa=${p}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setModelo(data.data.modelo);
        setClienteNome(data.data.nome);
        setClienteCelular(data.data.celular);
      } else {
        // Se não achou, limpa os campos de cliente para o backend assumir os defaults e o ADM digita só o modelo
        setClienteNome('');
        setClienteCelular('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBuscando(false);
    }
  };

  // Ao selecionar um serviço no Dropdown, traz o valor base pro Input (permitindo edição)
  const handleServiceChange = (e) => {
    const id = e.target.value;
    setServicoId(id);
    const s = servicos.find(x => x.id.toString() === id);
    if (s) setValor(s.preco);
  };

  const handleSubmit = async () => {
    if (!placa || !modelo || !servicoId) {
      alert('Placa, Modelo e Serviço são obrigatórios para a entrada rápida.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';
      
      const payload = {
        placa: placa.replace('-', ''),
        modelo_carro: modelo,
        servico_id: servicoId,
        valor_cobrado: valor,
        nome: clienteNome,         // Se for novo, vai vazio -> Backend cuida disso
        celular: clienteCelular    // Se for novo, vai vazio -> Backend cuida disso
      };

      const res = await fetch(`${API}/admin/agendamentos/manual`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        if (onSuccess) onSuccess();
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err) {
      alert('Erro de conexão ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,26,.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', animation: 'fadeInUp .2s ease', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ Check-in Relâmpago</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Passo 1: PLACA */}
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Placa *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={placa} onChange={handlePlacaChange} placeholder="ABC-1234" maxLength={8} style={{ flex: 1, padding: '14px', fontSize: '1.4rem', textTransform: 'uppercase', textAlign: 'center', fontWeight: 700, borderRadius: '10px', background: 'rgba(0,0,0,.2)', border: '2px solid var(--blue)', color: '#fff', outline: 'none' }} />
              <button onClick={handleBusca} disabled={buscando || placa.length < 8} className="btn btn-primary" style={{ padding: '0 20px', borderRadius: '10px' }}>{buscando ? '...' : '🔍 Buscar'}</button>
            </div>
          </div>

          {/* Passo 2: MODELO */}
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Modelo do Veículo *</label>
            <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: Hilux, Civic..." style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', outline: 'none' }} />
          </div>

          {/* Passo 3: SERVIÇO E VALOR */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Serviço *</label>
              <select value={servicoId} onChange={handleServiceChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', outline: 'none' }}>
                <option value="">Selecione...</option>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Valor (R$)</label>
              <input type="number" value={valor} onChange={e => setValor(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16,185,129,.4)', background: 'rgba(0,0,0,.2)', color: '#10b981', fontWeight: 700, outline: 'none' }} />
            </div>
          </div>

          {/* BOTÃO GIGANTE DE AÇÃO */}
          <button onClick={handleSubmit} disabled={loading || !placa || !modelo || !servicoId} className="btn btn-full" style={{ marginTop: '8px', background: '#10b981', color: '#fff', fontSize: '1.1rem', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: (loading || !placa || !modelo || !servicoId) ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,.3)' }}>
            {loading ? 'Iniciando...' : '🚀 Iniciar Lavagem Agora'}
          </button>
        </div>
      </div>
    </div>
  );
}