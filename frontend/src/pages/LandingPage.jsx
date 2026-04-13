import React, { useState, useEffect } from 'react';

import logoImg from '../assets/logo-png.png'
const API = (import.meta.env.VITE_API_URL || 'https://fernandes-auto-tech-production.up.railway.app').replace(/\/$/, '') + '/api';

// Array de Inteligência / Precificação Dinâmica
const veiculosPremium = [
  // 🚗 HATCH (Carro Normal - R$ 50)
  { modelo: 'Fiat Uno', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Chevrolet Onix', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Hyundai HB20', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'VW Polo', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Fiat Argo', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Fiat Palio', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Chevrolet Celta', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Fiat Idea', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'VW Gol', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Toyota Etios Hatch', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Renault Kwid', categoria: 'Hatch', precoBase: 50 },

  // 🚙 SEDAN (Carro Normal - R$ 50)
  { modelo: 'Honda Civic', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Toyota Corolla', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'VW Virtus', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Chevrolet Onix Plus', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Hyundai HB20S', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Chevrolet Prisma', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'VW Voyage', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Toyota Yaris', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Toyota Etios Sedan', categoria: 'Sedan', precoBase: 50 },

  // 🚐 SUV COMPACTO (Porte Médio - R$ 60)
  { modelo: 'Jeep Compass', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Jeep Renegade', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Hyundai Creta', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Chevrolet Tracker', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Fiat Pulse', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Ford EcoSport', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Toyota Corolla Cross', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Chevrolet Spin', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Hyundai Tucson', categoria: 'SUV Compacto', precoBase: 60 },
  
  // 🛻 PICAPES PEQUENAS (Porte Médio - R$ 60)
  { modelo: 'VW Saveiro', categoria: 'Picape Pequena', precoBase: 60 },
  { modelo: 'Fiat Strada', categoria: 'Picape Pequena', precoBase: 60 },
  { modelo: 'Chevrolet Montana', categoria: 'Picape Pequena', precoBase: 60 },
  { modelo: 'Renault Oroch', categoria: 'Picape Pequena', precoBase: 60 },

  // 🚙 SUVs GRANDES (Porte Grande - R$ 70)
  { modelo: 'Toyota SW4', categoria: 'SUV Grande', precoBase: 70 },
  { modelo: 'Mitsubishi Pajero', categoria: 'SUV Grande', precoBase: 70 },

  // 🛻 PICAPES MÉDIAS (Porte Grande - R$ 70)
  { modelo: 'Toyota Hilux', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Chevrolet S10', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Ford Ranger', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'VW Amarok', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Mitsubishi L200 Triton', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Fiat Toro', categoria: 'Picape Média', precoBase: 70 },

  // 🚜 PICAPES GIGANTES (Porte Extra Grande - R$ 80)
  { modelo: 'Chevrolet Silverado', categoria: 'Picape Gigante', precoBase: 80 },
  { modelo: 'Dodge Ram', categoria: 'Picape Gigante', precoBase: 80 },
  { modelo: 'Ford F-250', categoria: 'Picape Gigante', precoBase: 80 },

  // 🏍️ MOTOS (R$ 30)
  { modelo: 'Honda CG Titan 150/160', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda Fan 150/160', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda NXR Bros', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda Biz', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda Pop 100/110i', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda XRE 300', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda CB 500', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda PCX', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha Fazer 150/250', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha MT-03', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha XTZ Lander 250', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha NMAX', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha Factor 125/150', categoria: 'Moto', precoBase: 30 }
];

// ── Navbar ──────────────────────────────────────────────────
 // ── Navbar ──────────────────────────────────────────────────
function Navbar({ onAgendarClick, onTrackClick }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.1)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      <div className="navbar-logo">
        <img src={logoImg} alt="Fernandes Auto Tech" className="w-24 md:w-32 h-auto" />
      </div>
      <div className="navbar-links flex items-center gap-2">
        {/* Esconde 'Serviços' no celular */}
        <a href="#servicos" className="hidden md:inline-block btn btn-ghost" style={{ fontSize: '0.9rem' }}>Serviços</a>
        
        {/* Botão de rastreio inteligente: 'Status' no celular, completo no PC */}
        <button className="btn btn-ghost p-2 md:px-4 md:py-2 text-sm md:text-base" onClick={onTrackClick}>
          <span className="inline md:hidden">🔎 Status</span>
          <span className="hidden md:inline">Acompanhar Serviço</span>
        </button>
        
        {/* Botão Agendar menor no celular */}
        <button className="btn btn-primary px-3 py-2 text-sm md:px-5 md:py-2.5 md:text-base" onClick={() => onAgendarClick()}>
          Agendar
        </button>
      </div>
    </nav>
  )
}
    

// ── Hero Section ─────────────────────────────────────────────
function HeroSection({ onAgendarClick, onTrackClick }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: '64px' }}>
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>
      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 20px' }}>
        <div style={{ maxWidth: '760px', animation: 'fadeInUp 0.8s ease' }}>
          <div className="badge badge-blue" style={{ marginBottom: '24px', padding: '8px 16px' }}>
            <span>⚡</span> Estética Automotiva Premium
          </div>
          <h1 style={{ marginBottom: '24px' }}>
            A Nova Era da<br /><span className="gradient-text">Estética Automotiva</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '40px' }}>
            Tecnologia de ponta encontra cuidado artesanal. Do detalhamento de motos à lavagem premium de SUVs — seu veículo merece o melhor.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onAgendarClick()} id="hero-agendar-btn">
              🗓️ Agendar Agora
            </button>
            <a href="#servicos" className="btn btn-secondary btn-lg" id="hero-servicos-btn">Ver Serviços</a>
            <button className="btn btn-ghost btn-lg" onClick={onTrackClick} style={{ color: 'var(--text-muted)' }}>
              🔍 Acompanhar Serviço
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Serviços Inteligentes (Busca Centralizada) ─────────────
function ServicesSection({ services, loading, onAgendarClick }) {
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [veiculoSel, setVeiculoSel] = useState(null);

  const handleBusca = (e) => {
    const val = e.target.value;
    setBusca(val);
    setVeiculoSel(null);
    if (val.trim().length > 0) {
      setSugestoes(veiculosPremium.filter(v => v.modelo.toLowerCase().includes(val.toLowerCase())));
    } else {
      setSugestoes([]);
    }
  };

  const selecionarVeiculo = (v) => {
    setBusca(v.modelo);
    setVeiculoSel(v);
    setSugestoes([]);
    setMostrarSugestoes(false);
  };

  const isMoto = veiculoSel?.categoria?.toLowerCase() === 'moto';
  let filtrados = [];
  if (!loading && veiculoSel) {
    if (isMoto) {
      filtrados = [
        { id: 'simples_moto', nome: 'Lavagem Simples Moto', descricao: 'Lavagem externa com shampoo e secagem.', preco: 0, duracao_minutos: 40, icone: '🏍️' },
        { id: 'detalhada_moto', nome: 'Lavagem Detalhada Premium', descricao: 'Limpeza minuciosa com pincéis de detalhamento (motor, rodas e relação). Uso exclusivo de produtos Vonixx, descontaminação e proteção de plásticos.', preco: 0, duracao_minutos: 120, icone: '✨' }
      ];
    } else {
      filtrados = [
        { id: 'simples_carro', nome: 'Lavagem Simples', descricao: 'Lavagem externa com shampoo, secagem e limpeza básica.', preco: 0, duracao_minutos: 60, icone: '🚗' },
        { id: 'detalhada_carro', nome: 'Lavagem Detalhada', descricao: 'Limpeza profunda interna, retirada de bancos e detalhamento.', preco: 0, duracao_minutos: 240, icone: '✨' }
      ];
    }
  }

  return (
    <section className="section" id="servicos">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '16px' }}>🔧 Nossos Serviços</div>
          <h2>Tratamento Premium<br /><span className="gradient-text">Para Cada Veículo</span></h2>
          <p className="text-muted" style={{ marginTop: '16px', maxWidth: '480px', margin: '16px auto 0' }}>
            Digite o modelo do seu veículo para ver os serviços e valores disponíveis.
          </p>
        </div>

        {/* Autocomplete Premium */}
        <div style={{ maxWidth: '600px', margin: '0 auto 40px', position: 'relative', zIndex: 20 }}>
          <input
             value={busca}
             onChange={handleBusca}
             onFocus={() => setMostrarSugestoes(true)}
             onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
             placeholder="Qual o seu veículo? (Ex: Hilux, Civic, Bros)"
             style={{ width: '100%', padding: '20px 24px', fontSize: '1.2rem', borderRadius: '16px', border: '2px solid var(--blue)', background: 'var(--bg-secondary)', color: 'var(--text)', outline: 'none', boxShadow: '0 8px 32px rgba(59,130,246,0.15)', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          {mostrarSugestoes && sugestoes.length > 0 && (
             <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
                {sugestoes.map(v => (
                   <div key={v.modelo} onMouseDown={(e) => { e.preventDefault(); selecionarVeiculo(v); }}
                        style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '1.1rem', transition: 'background .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <strong style={{ color: '#60a5fa' }}>{v.modelo}</strong> <span style={{ color: 'var(--text-faint)', fontSize: '.9rem' }}>({v.categoria})</span>
                   </div>
                ))}
             </div>
          )}
        </div>

        {/* Cards Renderizados Dinamicamente */}
        {veiculoSel && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            {filtrados.map((s, i) => {
              const precoFinal = parseFloat(s.preco || 0) + parseFloat(veiculoSel.precoBase || 0);
              const isDetalhada = s.nome.toLowerCase().includes('detalhada');

              const handleItemClick = (e) => {
                e.stopPropagation();
                if (isDetalhada) {
                  const msgZap = isMoto 
                    ? 'Olá Felipe! Gostaria de fazer um orçamento para a Lavagem Detalhada Premium na minha moto.'
                    : 'Olá Felipe! Gostaria de fazer um orçamento para a Lavagem Detalhada com retirada de bancos para o meu veículo.';
                  window.open(`https://wa.me/5599985457391?text=${msgZap}`, '_blank');
                } else {
                  onAgendarClick(veiculoSel, s);
                }
              };

              return (
                <div key={s.id} className="glass" onClick={handleItemClick}
                  style={{ padding: '28px', cursor: 'pointer', animation: 'fadeInUp 0.45s ' + (i * 0.07) + 's ease both', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, ' + (i % 3 === 0 ? 'rgba(59,130,246,.09)' : i % 3 === 1 ? 'rgba(139,92,246,.09)' : 'rgba(16,185,129,.07)') + ', transparent 70%)' }} />
                  
                  {isDetalhada && (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontSize: '.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '.05em', boxShadow: '0 4px 12px rgba(245,158,11,.3)', zIndex: 2 }}>
                      ⭐ Recomendado
                    </div>
                  )}

                  <div style={{ width: '56px', height: '56px', fontSize: '1.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', flexShrink: 0 }}>
                    {s.icone || '🔧'}
                  </div>
                  <h3 style={{ marginBottom: '10px', fontSize: '1.08rem' }}>{s.nome}</h3>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.65, marginBottom: '20px', flex: 1 }}>
                    {s.descricao || 'Serviço de estética automotiva premium.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '.7rem', color: 'var(--text-faint)' }}>{isDetalhada ? 'valor' : 'valor a partir de'}</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>
                        <span className="gradient-text">{isDetalhada ? 'Sob Consulta' : `R$ ${precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '.78rem', color: 'var(--text-faint)', paddingBottom: '4px' }}>⏱️ {s.duracao_minutos} min</span>
                  </div>
                  <button className="btn btn-primary btn-full" id={'service-agendar-' + s.id}
                    onClick={handleItemClick} style={{ marginTop: 'auto' }}>
                    {isDetalhada ? 'Fazer Avaliação →' : 'Agendar Este Serviço →'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// WIZARD DE AGENDAMENTO
// ─────────────────────────────────────────────────────────────
const SURCHARGE_PCT = 25;

function StepDot({ num, label, active, done }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.82rem', fontWeight: 700, background: done ? 'linear-gradient(135deg,#10b981,#3b82f6)' : active ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'rgba(255,255,255,.08)', color: (active || done) ? '#fff' : 'var(--text-faint)', border: (active || done) ? 'none' : '1px solid rgba(255,255,255,.08)', transition: 'all .3s' }}>
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: '.65rem', color: active ? 'var(--text)' : 'var(--text-faint)', whiteSpace: 'nowrap', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function BookingModal({ veiculo, servico, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState('')
  const [turno, setTurno] = useState('')
  const [hora, setHora] = useState('')
  const [nome, setNome] = useState('')
  const [celular, setCelular] = useState('')
  const [sujeira, setSujeira] = useState(false)
  const [buscarVeiculo, setBuscarVeiculo] = useState(false)
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])

  const [ocupados, setOcupados] = useState([])
  const [loadingHoras, setLoadingHoras] = useState(false)

  useEffect(() => {
    if (!data) return
    setLoadingHoras(true)
    fetch(API + '/agendamentos/horarios-ocupados?data=' + data)
      .then(r => r.json())
      .then(d => { if (d.success) setOcupados(d.data) })
      .finally(() => setLoadingHoras(false))
  }, [data])

  const precoFinal = parseFloat(servico.preco || 0) + parseFloat(veiculo.precoBase || 0);
  const isMotoSel = veiculo.categoria.toLowerCase() === 'moto';

  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addonsList = isMotoSel
    ? [{ id: 'cera_moto', label: '✨ Cera', price: 10 }, { id: 'jato_moto', label: '⚙️ Jato de Areia', price: 10 }]
    : [{ id: 'baixo', label: '💧 Lavagem por baixo', price: 10 }, { id: 'motor', label: '⚙️ Lavagem do Motor', price: 10 }, { id: 'cera', label: '✨ Cera Polidora', price: 10 }];

  const valorAcrescimos = isMotoSel ? selectedAddons.length * 10 : (selectedAddons.length === 3 ? 20 : selectedAddons.length * 10);
  const valorTotal = precoFinal + valorAcrescimos;

  const minDate = new Date(); minDate.setMinutes(minDate.getMinutes() + 30)
  const minDateStr = minDate.toISOString().slice(0, 10)

  // Lógica de Capacidade de Pátio / Turno
  const limit = isMotoSel ? 3 : 5;
  const countMorning = ocupados.filter(h => parseInt(h.split(':')[0]) < 13).length;
  const countAfternoon = ocupados.filter(h => parseInt(h.split(':')[0]) >= 13).length;
  const isManhaLotada = ocupados.length >= 5 || countMorning >= limit;
  const isTardeLotada = countAfternoon >= limit;

  const horasManha = ['08:00', '08:30', '09:00', '09:30', '10:00'];
  const horasTarde = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

  const submit = async () => {
    if (!nome.trim() || !celular.trim()) { setErro('Nome e celular são obrigatórios.'); return }
    if (!data || !turno || !hora) { setErro('Selecione data, turno e horário de chegada.'); return }
    setLoading(true); setErro('')
    try {
      const data_hora = data + 'T' + hora + ':00'
      const addonsArr = selectedAddons.map(id => addonsList.find(a => a.id === id).label);
      const addonsNomes = addonsArr.join(', ');
      const obsAddons = addonsNomes ? `[Acréscimos: ${addonsNomes}] ` : '';
      const obsTurno = `[Turno de Entrega: ${turno === 'manha' ? 'Manhã (até 12:30)' : 'Tarde (até 17:30)'}] `;
      const obsCompleta = obsTurno + obsAddons + (sujeira ? '[SUJEIRA EXTREMA] ' : '') + (buscarVeiculo ? '[BUSCAR VEÍCULO] ' : '') + obs;

      const res = await fetch(API + '/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          celular, 
          modelo_carro: veiculo.modelo, 
          servico_id: 8, // <-- AQUI FOI AJUSTADO PARA O ID 8 PASSAR NO SUPABASE
          data_hora, 
          observacoes: obsCompleta.trim(),
          valor_total: valorTotal,
          acrescimos: addonsArr
        }),
      })
      const result = await res.json()
      if (result.success) { 
        onSuccess({ ...result.data, buscarVeiculo, modeloFormatado: veiculo.modelo }) 
      }
      else { setErro(result.message || 'Erro ao agendar.') }
    } catch { setErro('Erro de conexão com o servidor.') }
    setLoading(false)
  }

  const ovStyle = { position: 'fixed', inset: 0, background: 'rgba(10,14,26,.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }
  const cardSt = { background: 'var(--bg-secondary)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '540px', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,.5)', animation: 'fadeInUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }

  return (
    <div style={ovStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={cardSt}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🗓️ Agendar Serviço</h3>
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Passo {step} de 2</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 1 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Quando você prefere?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Data *</label>
                <input type="date" min={minDateStr} value={data} onChange={e => { setData(e.target.value); setTurno(''); setHora(''); }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)' }} />
              </div>
              {data && (
                <div style={{ marginBottom: '8px', animation: 'fadeIn .3s ease' }}>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Turno de Entrega *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button 
                      onClick={() => { setTurno('manha'); setHora(''); }} 
                      disabled={isManhaLotada}
                      style={{ padding: '16px 12px', borderRadius: '12px', border: turno === 'manha' ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', background: isManhaLotada ? 'rgba(255,255,255,.02)' : turno === 'manha' ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.04)', color: isManhaLotada ? 'var(--text-faint)' : turno === 'manha' ? '#60a5fa' : 'var(--text-muted)', cursor: isManhaLotada ? 'not-allowed' : 'pointer', transition: 'all .2s' }}
                    >
                      <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>☀️</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '2px' }}>Manhã</div>
                      <div style={{ fontSize: '.7rem', opacity: 0.8 }}>Pronto até as 12:30</div>
                      {isManhaLotada && <div style={{ fontSize: '.65rem', color: '#ef4444', marginTop: '6px', fontWeight: 700, background: 'rgba(239,68,68,.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Lotação Esgotada</div>}
                    </button>
                    <button 
                      onClick={() => { setTurno('tarde'); setHora(''); }} 
                      disabled={isTardeLotada}
                      style={{ padding: '16px 12px', borderRadius: '12px', border: turno === 'tarde' ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', background: isTardeLotada ? 'rgba(255,255,255,.02)' : turno === 'tarde' ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.04)', color: isTardeLotada ? 'var(--text-faint)' : turno === 'tarde' ? '#60a5fa' : 'var(--text-muted)', cursor: isTardeLotada ? 'not-allowed' : 'pointer', transition: 'all .2s' }}
                    >
                      <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🌤️</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '2px' }}>Tarde</div>
                      <div style={{ fontSize: '.7rem', opacity: 0.8 }}>Pronto até as 17:30</div>
                      {isTardeLotada && <div style={{ fontSize: '.65rem', color: '#ef4444', marginTop: '6px', fontWeight: 700, background: 'rgba(239,68,68,.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Lotação Esgotada</div>}
                    </button>
                  </div>
                </div>
              )}
              {data && turno && (
                <div style={{ animation: 'fadeIn .2s ease' }}>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Horário de Chegada (Deixar o veículo) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {(turno === 'manha' ? horasManha : horasTarde).map(h => {
                      const disabled = ocupados.includes(h);
                      return (
                        <button key={h} onClick={() => !disabled && setHora(h)} disabled={disabled}
                          style={{ padding: '10px 4px', borderRadius: '8px', border: hora === h ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', background: disabled ? 'rgba(255,255,255,.02)' : hora === h ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.04)', color: disabled ? 'var(--text-faint)' : hora === h ? '#60a5fa' : 'var(--text-muted)', fontWeight: hora === h ? 700 : 400, fontSize: '.8rem', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                          {h}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {data && turno && hora && (
                <button className="btn btn-primary btn-full" onClick={() => setStep(2)} style={{ marginTop: '8px' }}>Próximo Passo →</button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Quase lá! Seus dados para confirmação:</p>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '10px' }}>
                {isMotoSel ? '🔥 Trato de Motoqueiro' : '🌟 Combo VIP: Selecione os 3 acréscimos e pague apenas 2.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {addonsList.map(addon => (
                  <label key={addon.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: selectedAddons.includes(addon.id) ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.04)', border: '1px solid ' + (selectedAddons.includes(addon.id) ? 'rgba(59,130,246,.4)' : 'var(--border)'), borderRadius: '10px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                      <span style={{ fontSize: '.88rem', fontWeight: 600, color: selectedAddons.includes(addon.id) ? '#60a5fa' : 'var(--text)' }}>{addon.label}</span>
                    </div>
                    <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>+ R$ {addon.price},00</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Retorno Simplificado da Sujeira Extrema */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '10px' }}>
                <input type="checkbox" checked={sujeira} onChange={e => setSujeira(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '.88rem', fontWeight: 600, color: sujeira ? '#fbbf24' : 'var(--text)' }}>🦴 Sujeira Extrema</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Barro pesado, pelos de animais, terra, etc.</span>
                </div>
              </label>
              {sujeira && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: '8px', color: '#fbbf24', fontSize: '.8rem', lineHeight: 1.4 }}>
                  ⚠️ Veículos com sujeira extrema sofrerão reajuste no valor após avaliação no local da equipe.
                </div>
              )}
            </div>

            {/* Opção de Buscar Veículo */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '10px' }}>
                <input type="checkbox" checked={buscarVeiculo} onChange={e => setBuscarVeiculo(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '.88rem', fontWeight: 600, color: buscarVeiculo ? '#60a5fa' : 'var(--text)' }}>🚗 Buscar Veículo</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Deseja que a gente busque o veículo em sua casa/trabalho?</span>
                </div>
              </label>
              {buscarVeiculo && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '8px', color: '#60a5fa', fontSize: '.8rem', lineHeight: 1.4 }}>
                  ⚠️ <strong>Importante:</strong> O horário agendado é o início do serviço em nossa loja. Entraremos em contato para buscar seu veículo cerca de 30 a 40 minutos ANTES do horário escolhido.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Nome Completo *</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome..." style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>WhatsApp *</label>
                <input value={celular} onChange={e => setCelular(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)' }} />
              </div>

              {erro && <div style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '.8rem' }}>⚠️ {erro}</div>}

              <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading}>
                {loading ? 'Agendando...' : `✅ Confirmar (R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`}
              </button>
            </div>
            <button onClick={() => setStep(1)} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.82rem' }}>← Voltar</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SuccessModal({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal glass text-center" style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Agendamento Realizado!</h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Salvo com sucesso. Clique para confirmar via WhatsApp.</p>
        <button className="btn btn-primary btn-full btn-lg" onClick={() => window.open(data.whatsapp_link, '_blank')} style={{ marginBottom: '12px' }}>
          📱 Confirmar no WhatsApp
        </button>
        <button className="btn btn-ghost btn-full" onClick={onClose} style={{ color: 'var(--text-faint)' }}>Fechar</button>
      </div>
    </div>
  )
}

// ── Modal de Acompanhamento (Track Serviço via WhatsApp) ─────
function TrackModal({ onClose }) {
  const [numero, setNumero] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!numero.trim()) return
    const msg = encodeURIComponent(`Olá! Gostaria de saber o status de andamento do meu veículo. Meu número cadastrado é: ${numero}`)
    window.open(`https://wa.me/5599981763335?text=${msg}`, '_blank')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,26,.85)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass" style={{ borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '440px', animation: 'fadeInUp .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>🔍 Acompanhar Serviço</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>Informe o seu WhatsApp cadastrado no agendamento para consultar o status direto com a nossa equipe.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Seu WhatsApp/Celular *</label>
            <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="(11) 99999-9999" required style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Consultar no WhatsApp →</button>
        </form>
      </div>
    </div>
  )
}

// ── Seção de Depoimentos ─────────────────────────────────────
function TestimonialsSection() {
  const [reviews, setReviews] = useState([
    { id: 1, nome: 'Carlos Mendes', veiculo: 'Toyota Hilux', texto: 'Serviço impecável! A lavagem detalhada deixou minha caminhonete parecendo que acabou de sair da concessionária. Recomendo muito.', estrelas: 5 },
    { id: 2, nome: 'Ana Paula', veiculo: 'Jeep Compass', texto: 'Atendimento nota 10 e muita agilidade. Gostei bastante do cuidado com os detalhes no painel e bancos de couro.', estrelas: 5 },
    { id: 3, nome: 'Roberto Silva', veiculo: 'Honda CB 500', texto: 'O trato de motoqueiro é real. Minha moto estava cheia de graxa e barro, e voltou brilhando. Excelentes profissionais!', estrelas: 5 }
  ]);

  useEffect(() => {
    fetch(API + '/public/avaliacoes')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data && d.data.length > 0) {
          setReviews(d.data);
        }
      })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="badge badge-blue" style={{ marginBottom: '16px' }}>⭐ Avaliações</div>
          <h2>O Que Dizem<br /><span className="gradient-text">Nossos Clientes</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {reviews.map((r, i) => (
            <div key={i} className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', animation: `fadeInUp 0.5s ${i * 0.15}s ease both` }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', fontSize: '1.2rem' }}>
                {'★'.repeat(r.estrelas)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', flex: 1, lineHeight: 1.6, fontSize: '.95rem' }}>"{r.texto}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {r.nome[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>{r.nome}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-faint)' }}>{r.veiculo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', marginTop: '40px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="navbar-logo">
          <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: '36px', width: 'auto', opacity: 0.85 }} />
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span className="text-muted text-sm">📍 Avenida Rodoviária, São Raimundo das Mangabeiras - MA</span>
          <a href="https://wa.me/5599981763335" target="_blank" rel="noreferrer" className="text-muted text-sm" style={{ textDecoration: 'none' }}>📱 WhatsApp disponível</a>
          <span className="text-muted text-sm">⏰ Seg–Sáb: 8h–18h</span>
        </div>
        <p className="text-faint text-xs">© 2025 Fernandes Auto Tech. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    fetch(API + '/servicos')
      .then(r => r.json())
      .then(d => { if (d.success) setServices(d.data) })
      .catch(() => { })
      .finally(() => setLoadingServices(false))
  }, [])


  const handleAgendarClick = (veiculo, servico) => {
    if (veiculo && servico) {
      setModalData({ veiculo, servico });
      setShowModal(true);
    } else {
      document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSuccess = (data) => { 
    setShowModal(false); 
    setSuccessData(data);
    if (data.buscarVeiculo) {
      setTimeout(() => window.open(data.whatsapp_link, '_blank'), 300)
    }
  }

  return (
    <>
      <style>{`
        @keyframes wppulse {
          0% { box-shadow: 0 10px 15px -3px rgba(34,197,94,0.3), 0 0 0 0 rgba(34,197,94,0.6); transform: scale(1); }
          10% { box-shadow: 0 10px 15px -3px rgba(34,197,94,0.3), 0 0 0 16px rgba(34,197,94,0); transform: scale(1.1); }
          20% { box-shadow: 0 10px 15px -3px rgba(34,197,94,0.3), 0 0 0 0 rgba(34,197,94,0); transform: scale(1); }
          100% { box-shadow: 0 10px 15px -3px rgba(34,197,94,0.3), 0 0 0 0 rgba(34,197,94,0); transform: scale(1); }
        }
        .btn-whatsapp-pulse {
          animation: wppulse 4s infinite;
        }
        .btn-whatsapp-pulse:hover {
          animation: none;
          transform: scale(1.1);
        }
      `}</style>
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Navbar onAgendarClick={handleAgendarClick} onTrackClick={() => setShowTrackModal(true)} />
        <HeroSection onAgendarClick={handleAgendarClick} onTrackClick={() => setShowTrackModal(true)} />
        <ServicesSection services={services} loading={loadingServices} onAgendarClick={handleAgendarClick} />
        <TestimonialsSection />
        <Footer />
        {showModal && modalData && <BookingModal veiculo={modalData.veiculo} servico={modalData.servico} onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
        {showTrackModal && <TrackModal onClose={() => setShowTrackModal(false)} />}
        {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
        <div className="text-center text-sm text-slate-400 pb-6">
          Desenvolvido por Felipe Fernandes
        </div>
      </div>

      {/* Botão WhatsApp - Com regra para sumir no Modal */}
      {(!showModal && !successData) && (
        <a
          href="https://wa.me/5599981763335?text=Olá! Estava navegando no site e fiquei com uma dúvida sobre os serviços."
          target="_blank"
          rel="noreferrer"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2147483647,
            backgroundColor: '#25D366',
            color: 'white',
            borderRadius: '50px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            textDecoration: 'none'
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.653.864 5.12 2.33 7.155L.68 24l5.066-1.597c1.942 1.307 4.282 2.062 6.785 2.062 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.565 17.203c-.538 1.496-2.585 1.954-3.566 1.996-1.02.043-2.316-.276-4.66-1.258-2.825-1.182-4.646-4.148-4.786-4.323-.14-.176-1.144-1.528-1.144-2.915 0-1.387.724-2.074.981-2.353.256-.277.562-.347.75-.347.188 0 .375.006.541.015.176.01.41-.065.641.493.243.593.75 1.846.818 1.986.068.14.113.305.023.493-.09.188-.137.305-.276.471-.14.165-.296.357-.42.483-.14.14-.287.294-.124.55.163.257.727 1.173 1.554 1.986.848.835 1.844 1.168 2.102 1.307.257.14.409.117.564-.047.155-.165.666-.774.843-1.04.177-.266.354-.22.586-.165.231.055 1.464.693 1.715.823.25.13.418.195.48.305.061.11.061.642-.477 2.138z"/>
          </svg>
          <span className="hidden md:inline" style={{ fontWeight: '600', fontSize: '1rem' }}>Precisa de ajuda?</span>
        </a>
      )}
    </>
  )
}