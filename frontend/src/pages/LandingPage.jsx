import React, { useState, useEffect } from 'react';

import logoImg from '../assets/logo-png.png'
const API = (import.meta.env.VITE_API_URL || 'https://fernandes-auto-tech-production.up.railway.app').replace(/\/$/, '') + '/api';

// Categorias de veículo com preço diferenciado
const CATEGORIAS_VEICULO = [
  { id: 'moto', label: 'Motos', icon: '🏍️', desc: 'Motos em geral' },
  { id: 'hatch', label: 'Hatch', icon: '🚗', desc: 'Gol, Onix, Argo...' },
  { id: 'sedan', label: 'Sedan', icon: '🚘', desc: 'Corolla, Civic, Virtus...' },
  { id: 'suv', label: 'SUVs / Camionetes', icon: '🛻', desc: 'Renegade, Compass...' },
  { id: 'picape', label: 'Picapes', icon: '🛻', desc: 'Hilux, Ranger, S10...' },
  { id: 'van', label: 'Vans', icon: '🚐', desc: 'Sprinter, Master...' },
  { id: 'micro_onibus', label: 'Micro-ônibus', icon: '🚌', desc: 'Volare, Agrale...' }
]

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

function servicosDaCategoria(services, catId) {
  const categoriaSelecionada = CATEGORIAS_VEICULO.find(c => c.id === catId);
  return services.filter(s => 
    s.categoria === categoriaSelecionada?.label || s.categoria === catId
  );
}

// ── Navbar ──────────────────────────────────────────────────
function Navbar({ onAgendarClick }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
      <div className="navbar-logo">
        <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: 'auto', width: '120px' }} />
      </div>
      <div className="navbar-links">
        <a href="#servicos" className="btn btn-ghost">Serviços</a>
        <button className="btn btn-primary" onClick={onAgendarClick} id="navbar-agendar-btn">
          Agendar Agora
        </button>
      </div>
    </nav>
  )
}

// ── Hero Section ─────────────────────────────────────────────
function HeroSection({ onAgendarClick }) {
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
            <button className="btn btn-primary btn-lg" onClick={onAgendarClick} id="hero-agendar-btn">
              🗓️ Agendar Agora
            </button>
            <a href="#servicos" className="btn btn-secondary btn-lg" id="hero-servicos-btn">Ver Serviços</a>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px', flexWrap: 'wrap' }}>
            {[['500+', 'Veículos Atendidos'], ['98%', 'Satisfação'], ['5★', 'Avaliação Média']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--blue), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', animation: 'float 2s ease-in-out infinite', color: 'var(--text-faint)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <span>↓</span><span>Serviços</span>
      </div>
    </section>
  )
}

// ── Serviços com Abas ──────────────────────────────────────
function ServicesSection({ services, loading, onAgendarClick }) {
  const [activeTab, setActiveTab] = useState('moto')
  const filtrados = loading ? [] : servicosDaCategoria(services, activeTab)

  return (
    <section className="section" id="servicos">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '16px' }}>🔧 Nossos Serviços</div>
          <h2>Tratamento Premium<br /><span className="gradient-text">Para Cada Veículo</span></h2>
          <p className="text-muted" style={{ marginTop: '16px', maxWidth: '480px', margin: '16px auto 0' }}>
            Selecione a categoria e veja os preços para o seu veículo.
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {CATEGORIAS_VEICULO.map(cat => {
            const on = activeTab === cat.id
            return (
              <button key={cat.id} id={'tab-' + cat.id} onClick={() => setActiveTab(cat.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', minHeight: '48px', minWidth: '140px', borderRadius: '999px', border: on ? '1.5px solid rgba(59,130,246,.6)' : '1px solid rgba(255,255,255,.08)', background: on ? 'linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))' : 'rgba(255,255,255,.04)', color: on ? '#f1f5f9' : 'var(--text-muted)', fontWeight: on ? 700 : 500, fontSize: '.88rem', cursor: 'pointer', backdropFilter: 'blur(8px)', boxShadow: on ? '0 0 24px rgba(59,130,246,.3)' : 'none', transition: 'all .2s ease', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div>{cat.label}</div>
                  <div style={{ fontSize: '.68rem', color: on ? 'rgba(255,255,255,.6)' : 'var(--text-faint)', fontWeight: 400 }}>{cat.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {loading
            ? [1, 2, 3].map(i => (
              <div key={i} className="glass" style={{ padding: '32px', height: '300px' }}>
                <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '14px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '70%', height: '22px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '90%', height: '14px', marginBottom: '8px' }} />
              </div>
            ))
            : filtrados.length === 0
              ? (
                <div key="empty" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
                  <p>Nenhum serviço para esta categoria. Tente outra aba ou fale conosco.</p>
                </div>
              )
          : filtrados.map((s, i) => {
            const handleItemClick = (e) => {
              e.stopPropagation();
              if (s.nome.toLowerCase().includes('detalhada')) {
                window.open('https://wa.me/5599985457391?text=Olá, gostaria de fazer uma avaliação para a Lavagem Detalhada.', '_blank');
              } else {
                onAgendarClick();
              }
            };
            return (
            <div key={s.id} className="glass" onClick={handleItemClick}
                  style={{ padding: '28px', cursor: 'pointer', animation: 'fadeInUp 0.45s ' + (i * 0.07) + 's ease both', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, ' + (i % 3 === 0 ? 'rgba(59,130,246,.09)' : i % 3 === 1 ? 'rgba(139,92,246,.09)' : 'rgba(16,185,129,.07)') + ', transparent 70%)' }} />
                  <div style={{ width: '56px', height: '56px', fontSize: '1.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', flexShrink: 0 }}>
                    {s.icone || CATEGORIAS_VEICULO.find(c => c.id === activeTab)?.icon || '🔧'}
                  </div>
                  <h3 style={{ marginBottom: '10px', fontSize: '1.08rem' }}>{s.nome}</h3>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.65, marginBottom: '20px', flex: 1 }}>
                    {s.descricao || 'Serviço de estética automotiva premium.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '.7rem', color: 'var(--text-faint)' }}>valor fixo</span>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>
                        <span className="gradient-text">R$ {parseFloat(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '.78rem', color: 'var(--text-faint)', paddingBottom: '4px' }}>⏱️ {s.duracao_minutos} min</span>
                  </div>
                  <button className="btn btn-primary btn-full" id={'service-agendar-' + s.id}
                onClick={handleItemClick} style={{ marginTop: 'auto' }}>
                    Agendar Este Serviço →
                  </button>
                </div>
          )})
          }
        </div>

        {!loading && services.length > 0 && (
          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '.8rem', color: 'var(--text-faint)' }}>
            Não encontrou o que procura?{' '}
            <button onClick={onAgendarClick} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600, fontSize: '.8rem', fontFamily: 'inherit' }}>Fale conosco →</button>
          </p>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// WIZARD DE AGENDAMENTO — 4 passos sem digitação desnecessária
// ─────────────────────────────────────────────────────────────
const SURCHARGE_PCT = 25  // % de acréscimo por sujeira extrema (informativo)

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

function BookingModal({ services, onClose, onSuccess }) {
  const [step, setStep] = useState(1)  // 1=categoria 2=serviço 3=data/hora 4=dados
  const [catId, setCatId] = useState(null)
  const [servSel, setServSel] = useState(null)
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [modeloCarro, setModeloCarro] = useState('')
  const [precoBase, setPrecoBase] = useState(50)
  const [sugestoes, setSugestoes] = useState([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [nome, setNome] = useState('')
  const [celular, setCelular] = useState('')
  const [sujeira, setSujeira] = useState(false)
  const [buscarVeiculo, setBuscarVeiculo] = useState(false)
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

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

  // Lógica de Autocomplete e Precificação Ouro
  const handleBuscaVeiculo = (e) => {
    const val = e.target.value;
    setModeloCarro(val);
    if (val.trim().length > 0) {
      setSugestoes(veiculosPremium.filter(v => v.modelo.toLowerCase().includes(val.toLowerCase())));
    } else {
      setSugestoes([]);
    }
    setPrecoBase(50); // Fallback: Carro Normal (Hatch/Sedan) caso digite um carro fora da lista
  };

  const selecionarVeiculo = (veiculo) => {
    setModeloCarro(veiculo.modelo);
    setPrecoBase(veiculo.precoBase);
    setSugestoes([]);
    setMostrarSugestoes(false);
  };

  const isMotoSel = catId === 'moto'
  const pesoSel = (servSel?.nome?.toLowerCase().includes('higienização') || servSel?.nome?.toLowerCase().includes('polimento')) ? 2 : 1
  
  let vagasCarroManha = 0, vagasMotoManha = 0, vagasCarroTarde = 0, vagasMotoTarde = 0
  const exatosOcupados = []
  
  ocupados.forEach(ag => {
    const h = new Date(ag.data_hora).getHours()
    const isManha = h < 13
    const isMoto = ag.veiculo_modelo?.toLowerCase().startsWith('moto')
    const peso = (ag.servico_nome?.toLowerCase().includes('higienização') || ag.servico_nome?.toLowerCase().includes('polimento')) ? 2 : 1
    
    if (isMoto) { if (isManha) vagasMotoManha += peso; else vagasMotoTarde += peso; } 
    else { if (isManha) vagasCarroManha += peso; else vagasCarroTarde += peso; }
    
    const hh = String(h).padStart(2, '0')
    const mm = String(new Date(ag.data_hora).getMinutes()).padStart(2, '0')
    exatosOcupados.push(`${hh}:${mm}`)
  })
  
  const manhaLotada = isMotoSel ? (vagasMotoManha + pesoSel > 3) : (vagasCarroManha + pesoSel > 5)
  const tardeLotada = isMotoSel ? (vagasMotoTarde + pesoSel > 3) : (vagasCarroTarde + pesoSel > 5)
  
  const isLateMorning = (h) => ['10:30', '11:00', '11:30', '12:00', '12:30'].includes(h)

  const servicosFiltrados = catId ? servicosDaCategoria(services, catId) : services

  const minDate = new Date(); minDate.setMinutes(minDate.getMinutes() + 30)
  const minDateStr = minDate.toISOString().slice(0, 10)
  const horas = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

  const back = () => { setErro(''); setStep(s => s - 1) }

  const submit = async () => {
    // -------------------------------------------------------------------------
    // [FUNÇÃO CRUCIAL: AGENDAMENTO]
    // Processa os dados do formulário e valida apenas o que é essencial.
    // O foco principal é a agilidade e menor atrito para o cliente da região de 
    // São Raimundo das Mangabeiras conseguir agendar com o mínimo de cliques.
    // -------------------------------------------------------------------------
    if (!nome.trim() || !celular.trim()) { setErro('Nome e celular são obrigatórios.'); return }
    if (!data || !hora) { setErro('Selecione data e horário.'); return }
    setLoading(true); setErro('')
    try {
      const data_hora = data + 'T' + hora + ':00'
      const obsCompleta = (sujeira ? '[SUJEIRA EXTREMA - avaliar acréscimo] ' : '') + (buscarVeiculo ? '[BUSCAR VEÍCULO] ' : '') + obs
      const res = await fetch(API + '/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, celular, modelo_carro: modeloCarro, servico_id: parseInt(servSel.id), data_hora, observacoes: obsCompleta.trim() }),
      })
      const result = await res.json()
      if (result.success) { 
        const modeloFormatado = CATEGORIAS_VEICULO.find(c => c.id === catId)?.label || 'veículo'
        onSuccess({ ...result.data, buscarVeiculo, modeloFormatado }) 
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🗓️ Agendar Serviço</h3>
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Passo {step} de 4</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '28px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,.08)', zIndex: 0 }} />
          {['Veículo', 'Serviço', 'Data/Hora', 'Seus Dados'].map((label, i) => (
            <StepDot key={i} num={i + 1} label={label} active={step === i + 1} done={step > i + 1} />
          ))}
        </div>

        {/* ── STEP 1: Tipo de veículo ── */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Qual é o seu tipo de veículo?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {CATEGORIAS_VEICULO.map(cat => (
                <button key={cat.id} onClick={() => { setCatId(cat.id); setStep(2) }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 12px', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.04)', cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(59,130,246,.5)'; e.currentTarget.style.background = 'rgba(59,130,246,.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}>
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.88rem' }}>{cat.label}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-faint)', marginTop: '2px' }}>{cat.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Serviço ── */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Qual serviço você quer?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {servicosFiltrados.map(s => {
                const sel = servSel?.id === s.id
                return (
                  <button key={s.id} onClick={() => { setServSel(s); setStep(3) }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: sel ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', background: sel ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.04)', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9rem' }}>{s.nome}</div>
                      {s.descricao && <div style={{ fontSize: '.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>{s.descricao.slice(0, 60)}{s.descricao.length > 60 ? '...' : ''}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        R$ {parseFloat(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-faint)' }}>⏱️ {s.duracao_minutos}min</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button onClick={back} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'inherit' }}>← Voltar</button>
          </div>
        )}

        {/* ── STEP 3: Data + Hora ── */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Quando você prefere?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '8px' }}>Data *</label>
                <input type="date" min={minDateStr} value={data} onChange={e => { setData(e.target.value); setHora('') }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', fontSize: '.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              {data && (
                <div>
                  {new Date(data + 'T12:00:00').getDay() === 0 ? (
                    <div style={{ padding: '16px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', color: '#60a5fa', fontSize: '.85rem', textAlign: 'center', lineHeight: 1.5 }}>
                      😴 <strong>Aviso:</strong> No momento estamos descansando para brilhar seu veículo na Segunda-feira!
                    </div>
                  ) : (
                    <>
                      <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '8px' }}>
                        {loadingHoras ? 'Carregando horários...' : 'Horário *'}
                      </label>
                      {!loadingHoras && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {horas.filter(h => {
                            const isManha = parseInt(h.split(':')) < 13
                            const isSabado = new Date(data + 'T12:00:00').getDay() === 6
                            if (isSabado && h > '12:00') return false
                            return !(isManha ? manhaLotada : tardeLotada)
                          }).length === 0 ? (
                            <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: '.85rem', padding: '10px', textAlign: 'center' }}>
                              Nenhum horário disponível para esta data.
                            </div>
                          ) : horas.map(h => {
                            const isManha = parseInt(h.split(':')) < 13
                            const lotado = isManha ? manhaLotada : tardeLotada
                            const blockedExato = exatosOcupados.includes(h)
                            const isSabado = new Date(data + 'T12:00:00').getDay() === 6
                            const blockedSabado = isSabado && h > '12:00'
                            const disabled = lotado || blockedExato || blockedSabado
                            
                            if (lotado) return null
                            
                            return (
                              <button key={h} onClick={() => !disabled && setHora(h)} disabled={disabled}
                                style={{ 
                                  padding: '10px 4px', borderRadius: '8px', 
                                  border: hora === h ? '1.5px solid rgba(59,130,246,.6)' : '1px solid var(--border)', 
                                  background: disabled ? 'rgba(255,255,255,.02)' : hora === h ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.04)', 
                                  color: disabled ? 'var(--text-faint)' : hora === h ? '#60a5fa' : 'var(--text-muted)', 
                                  fontWeight: hora === h ? 700 : 400, fontSize: '.8rem', 
                                  cursor: disabled ? 'not-allowed' : 'pointer', 
                                  fontFamily: 'inherit', transition: 'all .15s' 
                                }}>
                                {h} {blockedExato ? '(X)' : blockedSabado ? '(Indisponível)' : ''}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {hora && isLateMorning(hora) && (
                        <div style={{ padding: '12px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: '8px', color: '#fbbf24', fontSize: '.8rem', marginTop: '12px', lineHeight: 1.5, animation: 'fadeIn .3s ease' }}>
                          ⚠️ <strong>Aviso de Entrega:</strong> Para agendamentos neste horário, a entrega do veículo será realizada no turno da tarde (após as 14:00h).
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {data && hora && (
                <button className="btn btn-primary btn-full" onClick={() => setStep(4)} style={{ marginTop: '8px' }}>
                  Confirmar: {new Date(data + 'T' + hora).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} às {hora} →
                </button>
              )}
            </div>
            <button onClick={back} style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'inherit' }}>← Voltar</button>
          </div>
        )}

        {/* ── STEP 4: Dados pessoais + sujeira ── */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Quase lá! Seus dados para confirmação:</p>

            {/* Resumo */}
            <div style={{ background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', fontSize: '.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><span style={{ color: 'var(--text-faint)' }}>Categoria Base:</span> {CATEGORIAS_VEICULO.find(c => c.id === catId)?.label}</div>
              <div><span style={{ color: 'var(--text-faint)' }}>Serviço:</span> {servSel?.nome} — <strong style={{ color: '#60a5fa' }}>R$ {parseFloat((servSel?.preco || 0) + precoBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
              <div><span style={{ color: 'var(--text-faint)' }}>Data/Hora:</span> {new Date(data + 'T' + hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Campo Search Inteligente com Autocomplete */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '6px' }}>Modelo do Veículo *</label>
                <input 
                  value={modeloCarro} 
                  onChange={handleBuscaVeiculo} 
                  onFocus={() => setMostrarSugestoes(true)}
                  onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                  placeholder="Ex: Silverado, Civic, Hilux..." 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', fontSize: '.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} 
                />
                {mostrarSugestoes && sugestoes.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
                    {sugestoes.map(v => (
                      <div 
                        key={v.modelo} 
                        onMouseDown={(e) => { e.preventDefault(); selecionarVeiculo(v); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.85rem', color: 'var(--text)', transition: 'background .2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <strong style={{ color: '#60a5fa' }}>{v.modelo}</strong> <span style={{ color: 'var(--text-faint)' }}>({v.categoria})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '6px' }}>Nome Completo *</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome..." style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', fontSize: '.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '6px' }}>WhatsApp *</label>
                <input value={celular} onChange={e => setCelular(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', fontSize: '.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* Taxa sujeira extrema */}
              <div style={{ background: sujeira ? 'rgba(245,158,11,.08)' : 'rgba(255,255,255,.04)', border: '1px solid ' + (sujeira ? 'rgba(245,158,11,.3)' : 'var(--border)'), borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all .2s' }} onClick={() => setSujeira(s => !s)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1.5px solid ' + (sujeira ? '#f59e0b' : 'var(--border)'), background: sujeira ? '#f59e0b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                    {sujeira && <span style={{ color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: sujeira ? '#fbbf24' : 'var(--text)', fontSize: '.88rem' }}>🦴 Sujeira extrema?</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Barro, pelos de pet, fluidos internos...</div>
                  </div>
                </div>
                {sujeira && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', borderRadius: '8px', fontSize: '.75rem', color: '#fbbf24', lineHeight: 1.5 }}>
                    ⚠️ O valor final pode ter um acréscimo de até <strong>{SURCHARGE_PCT}%</strong> ou será avaliado no local pela equipe. Você será avisado antes da execução.
                  </div>
                )}
              </div>

          {/* Taxa busca veículo */}
          <div style={{ background: buscarVeiculo ? 'rgba(59,130,246,.08)' : 'rgba(255,255,255,.04)', border: '1px solid ' + (buscarVeiculo ? 'rgba(59,130,246,.3)' : 'var(--border)'), borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all .2s' }} onClick={() => setBuscarVeiculo(b => !b)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1.5px solid ' + (buscarVeiculo ? '#3b82f6' : 'var(--border)'), background: buscarVeiculo ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                {buscarVeiculo && <span style={{ color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>✓</span>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: buscarVeiculo ? '#60a5fa' : 'var(--text)', fontSize: '.88rem' }}>📍 Desejo que busquem meu veículo</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>Busca em domicílio. Pode haver taxa de deslocamento.</div>
              </div>
            </div>
          </div>

              <div>
                <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '6px' }}>Observações (opcional)</label>
                <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Algum detalhe sobre o veículo..." style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,.06)', color: 'var(--text)', fontSize: '.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {erro && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '.8rem' }}>⚠️ {erro}</div>}

              <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading} id="form-submit">
                {loading ? <><div className="spinner" /> Agendando...</> : '✅ Confirmar Agendamento'}
              </button>
            </div>
            <button onClick={back} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'inherit' }}>← Voltar</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Modal de Sucesso ──────────────────────────────────────────
function SuccessModal({ data, onClose }) {
  const openWhatsApp = () => {
    window.open(data.whatsapp_link, '_blank')
  }
  return (
    <div className="modal-overlay">
      <div className="modal glass text-center" style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>✅</div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Agendamento Realizado!</h3>
        <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
          Salvo com sucesso. Clique para confirmar via WhatsApp e receber seu link de acompanhamento.
        </p>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
          <p className="text-faint text-xs" style={{ marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Link de acompanhamento</p>
          <p className="text-sm" style={{ wordBreak: 'break-all', color: 'var(--blue)' }}>{data.link_status}</p>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={openWhatsApp} id="success-whatsapp-btn" style={{ marginBottom: '12px' }}>
          <span>📱</span> Confirmar no WhatsApp
        </button>
        <button className="btn btn-ghost btn-full" onClick={() => { window.open(data.link_status, '_blank'); onClose() }} id="success-status-btn">Ver Status do Meu Serviço</button>
        <button className="btn btn-ghost btn-full" onClick={onClose} style={{ color: 'var(--text-faint)', marginTop: '4px' }}>Fechar</button>
      </div>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', marginTop: '40px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="navbar-logo">
          <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: '36px', width: 'auto', opacity: 0.85 }} />
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span className="text-muted text-sm">📍 Avenida Rodoviária, São Raimundo das Mangabeiras - MA (Em frente ao Centro São Francisco)</span>
          <span className="text-muted text-sm">📱 WhatsApp disponível</span>
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
  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    fetch(API + '/servicos')
      .then(r => r.json())
      .then(d => { if (d.success) setServices(d.data) })
      .catch(() => { })
      .finally(() => setLoadingServices(false))
  }, [])

  const handleAgendarClick = () => setShowModal(true)
  
  // -------------------------------------------------------------------------
  // [FUNÇÃO CRUCIAL: WHATSAPP E BUSCA DE VEÍCULO]
  // -------------------------------------------------------------------------
  const handleSuccess = (data) => { 
    setShowModal(false); 
    setSuccessData(data);

    if (data.buscarVeiculo) {
      // Se o cliente solicitou busca, utilizamos window.open para redirecioná-lo 
      // instantaneamente para o WhatsApp da loja pedindo a localização, garantindo
      // um atendimento rápido e altamente humanizado logo após fechar o pedido.
      setTimeout(() => {
        window.open(data.whatsapp_link, '_blank')
      }, 300)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar onAgendarClick={handleAgendarClick} />
      <HeroSection onAgendarClick={handleAgendarClick} />
      <ServicesSection services={services} loading={loadingServices} onAgendarClick={handleAgendarClick} />
      <Footer />
      {showModal && <BookingModal services={services} onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
      {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
    </div>
  )
}
