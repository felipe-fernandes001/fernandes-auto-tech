import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo-png.png';

const API = (import.meta.env.VITE_API_URL || 'https://fernandes-auto-tech-production.up.railway.app').replace(/\/$/, '') + '/api';

// ── Inteligência de Precificação ──────────────────────────────
const veiculosPremium = [
  // 🚗 HATCH (R$ 50)
  { modelo: 'Fiat Uno', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Chevrolet Onix', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Hyundai HB20', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'VW Polo', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Fiat Argo', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Fiat Palio', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Chevrolet Celta', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'VW Gol', categoria: 'Hatch', precoBase: 50 },
  { modelo: 'Renault Kwid', categoria: 'Hatch', precoBase: 50 },

  // 🚙 SEDAN (R$ 50)
  { modelo: 'Honda Civic', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Toyota Corolla', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'VW Virtus', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Chevrolet Onix Plus', categoria: 'Sedan', precoBase: 50 },
  { modelo: 'Hyundai HB20S', categoria: 'Sedan', precoBase: 50 },

  // 🚐 SUV COMPACTO / PICAPE P. (R$ 60)
  { modelo: 'Jeep Compass', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Jeep Renegade', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Hyundai Creta', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Chevrolet Tracker', categoria: 'SUV Compacto', precoBase: 60 },
  { modelo: 'Fiat Strada', categoria: 'Picape Pequena', precoBase: 60 },
  { modelo: 'VW Saveiro', categoria: 'Picape Pequena', precoBase: 60 },

  // 🚙 SUVs GRANDES / PICAPES MÉDIAS (R$ 70)
  { modelo: 'Toyota SW4', categoria: 'SUV Grande', precoBase: 70 },
  { modelo: 'Toyota Hilux', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Chevrolet S10', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Ford Ranger', categoria: 'Picape Média', precoBase: 70 },
  { modelo: 'Fiat Toro', categoria: 'Picape Média', precoBase: 70 },

  // 🚜 PICAPES GIGANTES (R$ 80)
  { modelo: 'Dodge Ram', categoria: 'Picape Gigante', precoBase: 80 },
  { modelo: 'Chevrolet Silverado', categoria: 'Picape Gigante', precoBase: 80 },

  // 🏍️ MOTOS (R$ 30)
  { modelo: 'Honda CG Titan 160', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda NXR Bros', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Honda Biz', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha Fazer 250', categoria: 'Moto', precoBase: 30 },
  { modelo: 'Yamaha Lander 250', categoria: 'Moto', precoBase: 30 }
];

// ── Componentes de Interface ─────────────────────────────────

function Navbar({ onAgendarClick }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
      <div className="navbar-logo">
        <img src={logoImg} alt="Fernandes Auto Tech" style={{ height: 'auto', width: '120px' }} />
      </div>
      <div className="navbar-links">
        <a href="#servicos" className="btn btn-ghost">Serviços</a>
        <button className="btn btn-primary" onClick={() => onAgendarClick()}>Agendar Agora</button>
      </div>
    </nav>
  );
}

function HeroSection({ onAgendarClick }) {
  return (
    <section className="hero-section">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-content">
          <div className="badge badge-blue"><span>⚡</span> Estética Automotiva Premium</div>
          <h1>A Nova Era da<br /><span className="gradient-text">Estética Automotiva</span></h1>
          <p className="hero-description">Tecnologia de ponta encontra cuidado artesanal. Do detalhamento de motos à lavagem premium de SUVs.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onAgendarClick()}>🗓️ Agendar Agora</button>
            <a href="#servicos" className="btn btn-secondary btn-lg">Ver Serviços</a>
          </div>
        </div>
      </div>
    </section>
  );
}

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
  
  if (veiculoSel) {
    if (isMoto) {
      filtrados = [
        { id: '5', nome: 'Lavagem Simples Moto', descricao: 'Limpeza externa com shampoo, secagem e limpeza básica.', preco: 0, duracao_minutos: 45, icone: '🏍️' },
        { id: '7', nome: 'Lavagem Detalhada Premium Moto', descricao: 'Limpeza minuciosa com pincéis. Uso exclusivo de produtos Vonixx.', preco: 0, duracao_minutos: 120, icone: '✨' }
      ];
    } else {
      filtrados = [
        { id: '8', nome: 'Lavagem Simples', descricao: 'Lavagem externa com shampoo, secagem e limpeza básica.', preco: 0, duracao_minutos: 60, icone: '🚗' },
        { id: '6', nome: 'Lavagem Detalhada Carro', descricao: 'Limpeza profunda interna, retirada de bancos e detalhamento.', preco: 0, duracao_minutos: 240, icone: '✨' }
      ];
    }
  }

  return (
    <section className="section" id="servicos">
      <div className="container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <h2>Tratamento Premium<br /><span className="gradient-text">Para Cada Veículo</span></h2>
          <p className="text-muted">Digite o modelo do seu veículo para ver os serviços e valores.</p>
        </div>

        <div className="search-container">
          <input
             value={busca}
             onChange={handleBusca}
             onFocus={() => setMostrarSugestoes(true)}
             onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
             placeholder="Qual o seu veículo? (Ex: Hilux, Civic, Bros)"
             className="search-input"
          />
          {mostrarSugestoes && sugestoes.length > 0 && (
             <div className="search-results">
                {sugestoes.map(v => (
                   <div key={v.modelo} onMouseDown={() => selecionarVeiculo(v)} className="search-item">
                        <strong>{v.modelo}</strong> <span>({v.categoria})</span>
                   </div>
                ))}
             </div>
          )}
        </div>

        {veiculoSel && (
          <div className="services-grid">
            {filtrados.map((s) => {
              const precoFinal = parseFloat(veiculoSel.precoBase || 0);
              const isDetalhada = s.nome.toLowerCase().includes('detalhada');

              const handleAction = () => {
                if (isDetalhada) {
                  const msg = isMoto ? 'Gostaria de um orçamento para Detalhamento de Moto (Vonixx).' : 'Gostaria de um orçamento para Lavagem Detalhada com retirada de bancos.';
                  window.open(`https://wa.me/5599985457391?text=${msg}`, '_blank');
                } else {
                  onAgendarClick(veiculoSel, s);
                }
              };

              return (
                <div key={s.id} className="service-card glass">
                  <div className="service-icon">{s.icone}</div>
                  <h3>{s.nome}</h3>
                  <p>{s.descricao}</p>
                  <div className="service-price-row">
                    <div>
                      <span className="price-label">{isDetalhada ? 'valor' : 'a partir de'}</span>
                      <div className="price-value">{isDetalhada ? 'Sob Consulta' : `R$ ${precoFinal.toFixed(2)}`}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleAction}>
                    {isDetalhada ? 'Fazer Avaliação →' : 'Agendar Agora →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Modal de Agendamento ─────────────────────────────────────

function BookingModal({ veiculo, servico, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  const precoBase = parseFloat(veiculo.precoBase || 0);
  const isMoto = veiculo.categoria.toLowerCase() === 'moto';

  const addonsList = isMoto 
    ? [{ id: 'cera', label: '✨ Cera', price: 10 }, { id: 'jato', label: '⚙️ Jato de Areia', price: 10 }]
    : [{ id: 'baixo', label: '💧 Lavagem por baixo', price: 10 }, { id: 'motor', label: '⚙️ Lavagem do Motor', price: 10 }, { id: 'cera', label: '✨ Cera Polidora', price: 10 }];

  const valorAcrescimos = isMoto ? (selectedAddons.length * 10) : (selectedAddons.length === 3 ? 20 : selectedAddons.length * 10);
  const valorTotal = precoBase + valorAcrescimos;

  const toggleAddon = (id) => setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        nome,
        celular,
        modelo_carro: veiculo.modelo,
        servico_id: parseInt(servico.id) || 8, // Fallback para ID 8
        data_hora: `${data}T${hora}:00`,
        valor_total: valorTotal,
        acrescimos: selectedAddons.map(id => addonsList.find(a => a.id === id).label),
        observacoes: `[Agendamento via Site] Acréscimos: ${selectedAddons.length}`
      };
      
      const res = await fetch(`${API}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) onSuccess(result.data);
    } catch (err) {
      alert('Erro ao processar agendamento.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal glass" style={{ maxWidth: '500px' }}>
        {step === 1 ? (
          <div>
            <h3>Selecione Data e Hora</h3>
            <input type="date" value={data} onChange={e => setData(e.target.value)} className="form-input" />
            <div className="time-grid">
               {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'].map(h => (
                 <button key={h} onClick={() => setHora(h)} className={`btn-time ${hora === h ? 'active' : ''}`}>{h}</button>
               ))}
            </div>
            {hora && <button className="btn btn-primary btn-full" onClick={() => setStep(2)}>Próximo Passo</button>}
          </div>
        ) : (
          <div>
            <h3>Finalizar Agendamento</h3>
            <div className="upsell-box">
              <p className="upsell-title">🌟 Combo VIP: Leve 3, Pague 2!</p>
              {addonsList.map(a => (
                <label key={a.id} className="addon-item">
                  <input type="checkbox" onChange={() => toggleAddon(a.id)} /> {a.label} (+R$ 10)
                </label>
              ))}
            </div>
            <input placeholder="Seu Nome" value={nome} onChange={e => setNome(e.target.value)} className="form-input" />
            <input placeholder="WhatsApp" value={celular} onChange={e => setCelular(e.target.value)} className="form-input" />
            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Confirmando...' : `Confirmar (R$ ${valorTotal.toFixed(2)})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuccessModal({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal glass text-center">
        <h2>✅ Agendamento Confirmado!</h2>
        <p>Seu serviço foi registrado. Clique abaixo para confirmar no WhatsApp.</p>
        <button className="btn btn-primary btn-full" onClick={() => window.open(data.whatsapp_link, '_blank')}>Abrir WhatsApp</button>
        <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <img src={logoImg} alt="Logo" style={{ height: '40px' }} />
        <p>Avenida Rodoviária, São Raimundo das Mangabeiras - MA</p>
        <p className="developer-tag">Desenvolvido por Felipe Fernandes</p>
      </div>
    </footer>
  );
}

// ── Landing Page Principal ───────────────────────────────────

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetch(`${API}/servicos`).then(r => r.json()).then(d => {
      if (d.success) setServices(d.data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes wppulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); transform: scale(1); }
          50% { box-shadow: 0 0 0 15px rgba(34,197,94,0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); transform: scale(1); }
        }
        .btn-whatsapp-pulse { animation: wppulse 3s infinite; }
      `}</style>

      <div className="page-wrapper" style={{ position: 'relative' }}>
        <Navbar onAgendarClick={() => document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })} />
        <HeroSection onAgendarClick={() => document.getElementById('servicos').scrollIntoView({ behavior: 'smooth' })} />
        <ServicesSection services={services} loading={loading} onAgendarClick={(v, s) => setModalData({ v, s })} />
        <Footer />

        {modalData && (
          <BookingModal 
            veiculo={modalData.v} 
            servico={modalData.s} 
            onClose={() => setModalData(null)} 
            onSuccess={(data) => { setModalData(null); setSuccessData(data); }} 
          />
        )}
        {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      </div>

      {/* Botão Flutuante CORRIGIDO: Fora da div relativa */}
      {!modalData && !successData && (
        <a 
          href="https://wa.me/5599981763335?text=Olá! Gostaria de tirar uma dúvida sobre os serviços." 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-[9999] bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center btn-whatsapp-pulse transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.653.864 5.12 2.33 7.155L.68 24l5.066-1.597c1.942 1.307 4.282 2.062 6.785 2.062 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm3.565 17.203c-.538 1.496-2.585 1.954-3.566 1.996-1.02.043-2.316-.276-4.66-1.258-2.825-1.182-4.646-4.148-4.786-4.323-.14-.176-1.144-1.528-1.144-2.915 0-1.387.724-2.074.981-2.353.256-.277.562-.347.75-.347.188 0 .375.006.541.015.176.01.41-.065.641.493.243.593.75 1.846.818 1.986.068.14.113.305.023.493-.09.188-.137.305-.276.471-.14.165-.296.357-.42.483-.14.14-.287.294-.124.55.163.257.727 1.173 1.554 1.986.848.835 1.844 1.168 2.102 1.307.257.14.409.117.564-.047.155-.165.666-.774.843-1.04.177-.266.354-.22.586-.165.231.055 1.464.693 1.715.823.25.13.418.195.48.305.061.11.061.642-.477 2.138z"/>
          </svg>
        </a>
      )}
    </>
  );
}