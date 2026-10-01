import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { tokens } from './styles/tokens';
import { useAuth } from './hooks/useAuth';
import { useVagas } from './hooks/useVagas';
import { useFiltros } from './hooks/useFiltros';
import { calcularEstatisticas } from './lib/vagas';
import Header from './components/Header';
import KpiIngestao from './components/KpiIngestao';
import AderenciaCard from './components/AderenciaCard';
import MediaFit from './components/MediaFit';
import StatusFunil from './components/StatusFunil';
import FiltrosBar from './components/FiltrosBar';
import FeedTable from './components/FeedTable';
import DetailPanel from './components/DetailPanel';
import DistribuicaoVagas from './components/DistribuicaoVagas';
import BuscaModal from './components/BuscaModal';
import LoginModal from './components/LoginModal';
import ImportadorStatusBanner from './components/ImportadorStatusBanner';

export default function App() {
  const { user, enviando, mensagemAuth, setMensagemAuth, enviarMagicLink, logout } = useAuth();

  const {
    vagas,
    loading,
    atualizando,
    erro,
    erroSincronizacao,
    modoDemo,
    setModoDemo,
    ultimaAtualizacao,
    ultimaVagaCreatedAt,
    vagaSelecionada,
    setVagaSelecionada,
    carregarVagas,
    alterarStatusVaga,
    recarregarStatus
  } = useVagas(user);

  const [buscaModalAberta, setBuscaModalAberta] = useState(false);
  const [loginModalAberta, setLoginModalAberta] = useState(false);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [indiceFocado, setIndiceFocado] = useState(0);

  const linhaRefs = useRef([]);
  const origemFocoRef = useRef(null);

  // Hook Central de Filtros
  const {
    filtros,
    vagasFiltradas,
    opcoesUnicas,
    atualizarFiltro,
    alternarFiltro,
    limparTodosFiltros
  } = useFiltros(vagas);

  // Abrir a gaveta ao clicar ou pressionar Enter numa vaga
  const abrirGavetaComVaga = useCallback((vaga, index) => {
    setVagaSelecionada(vaga);
    setIndiceFocado(index);
    origemFocoRef.current = linhaRefs.current[index] || document.activeElement;
    setGavetaAberta(true);
  }, [setVagaSelecionada]);

  const fecharGaveta = useCallback(() => {
    setGavetaAberta(false);
  }, []);

  // Navegação dentro da gaveta (← / →)
  const vagaAtualIndex = useMemo(() => {
    if (!vagaSelecionada) return -1;
    return vagasFiltradas.findIndex((v) => v.id === vagaSelecionada.id);
  }, [vagasFiltradas, vagaSelecionada]);

  const temAnterior = vagaAtualIndex > 0;
  const temSeguinte = vagaAtualIndex >= 0 && vagaAtualIndex < vagasFiltradas.length - 1;

  const irParaVagaAnterior = useCallback(() => {
    if (temAnterior) {
      const novoIndex = vagaAtualIndex - 1;
      setVagaSelecionada(vagasFiltradas[novoIndex]);
      setIndiceFocado(novoIndex);
    }
  }, [temAnterior, vagaAtualIndex, vagasFiltradas, setVagaSelecionada]);

  const irParaVagaSeguinte = useCallback(() => {
    if (temSeguinte) {
      const novoIndex = vagaAtualIndex + 1;
      setVagaSelecionada(vagasFiltradas[novoIndex]);
      setIndiceFocado(novoIndex);
    }
  }, [temSeguinte, vagaAtualIndex, vagasFiltradas, setVagaSelecionada]);

  // Gestão de Atalhos Globais no Feed (↑/↓ e j/k)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscaModalAberta((prev) => !prev);
        return;
      }

      if (buscaModalAberta || loginModalAberta || gavetaAberta) return;

      const elementoAtivo = document.activeElement;
      const tag = elementoAtivo?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || elementoAtivo?.isContentEditable) {
        return;
      }

      if (vagasFiltradas.length === 0) return;

      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIndiceFocado((prev) => {
          const proximo = prev < vagasFiltradas.length - 1 ? prev + 1 : 0;
          linhaRefs.current[proximo]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return proximo;
        });
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIndiceFocado((prev) => {
          const anterior = prev > 0 ? prev - 1 : vagasFiltradas.length - 1;
          linhaRefs.current[anterior]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return anterior;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (vagasFiltradas[indiceFocado]) {
          abrirGavetaComVaga(vagasFiltradas[indiceFocado], indiceFocado);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [buscaModalAberta, loginModalAberta, gavetaAberta, vagasFiltradas, indiceFocado, abrirGavetaComVaga]);

  // Estatísticas agregadas calculadas sobre o total geral
  const statsGerais = useMemo(() => calcularEstatisticas(vagas), [vagas]);

  return (
    <div style={{ backgroundColor: tokens.colors.background, color: tokens.colors.textPrimary, minHeight: '100vh', fontFamily: tokens.typography.fontFamily, padding: tokens.spacing.md }}>
      
      <style>{`
        * { box-sizing: border-box; }
        
        .grid-dashboard {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }

        .col-12 { grid-column: span 12; }
        .col-5 { grid-column: span 5; }
        .col-4 { grid-column: span 4; }
        .col-3 { grid-column: span 3; }

        .header-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          width: auto;
        }
        .search-input {
          width: 220px;
        }

        .mobile-feed-cards {
          display: none;
        }
        .table-wrapper {
          display: block;
          overflow-x: auto;
        }

        @keyframes pulseSkeleton {
          0% { opacity: 0.5; }
          50% { opacity: 0.9; }
          100% { opacity: 0.5; }
        }

        .skeleton-pulse {
          animation: pulseSkeleton 1.4s ease-in-out infinite;
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .row-stagger-entry {
          animation: fadeInSlide 260ms ease-out both;
        }

        .drawer-overlay {
          animation: fadeIn 200ms ease-out both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .drawer-panel {
          animation: slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .kbd-hint {
          background-color: ${tokens.colors.surfaceAlt};
          color: ${tokens.colors.textSecondary};
          border: 1px solid ${tokens.colors.border};
          padding: 2px 6px;
          border-radius: ${tokens.radii.sm};
          font-size: 11px;
          font-family: inherit;
        }

        .interactive-btn:hover {
          filter: brightness(1.15);
        }
        .interactive-btn:focus-visible, .funil-item:focus-visible, .feed-row:focus-visible {
          outline: 2px solid ${tokens.colors.highlight} !important;
          outline-offset: 2px;
        }
        .funil-item:hover {
          border-color: ${tokens.colors.borderLight} !important;
        }
        .feed-row:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        .primary-action-btn:hover {
          background-color: ${tokens.colors.highlightHover} !important;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
        }

        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .skeleton-pulse {
            animation: none !important;
            opacity: 0.7 !important;
          }
        }

        @media (max-width: 1024px) {
          .col-5 { grid-column: span 12 !important; }
          .col-4 { grid-column: span 6 !important; }
          .col-3 { grid-column: span 6 !important; }
        }

        @media (max-width: 768px) {
          .col-5, .col-4, .col-3, .col-12 {
            grid-column: span 12 !important;
          }
          .header-box {
            flex-direction: column;
            align-items: stretch !important;
          }
          .header-controls {
            width: 100% !important;
            flex-wrap: wrap;
          }
          .search-input {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
          .table-wrapper {
            display: none !important;
          }
          .mobile-feed-cards {
            display: block !important;
          }
          .drawer-panel {
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Faixa Superior Informativa: Modo Demo, Erro de Sync ou Aviso de Visitante */}
      {modoDemo && (
        <div style={{
          backgroundColor: '#92400e',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: tokens.radii.md,
          marginBottom: tokens.spacing.md,
          fontSize: tokens.typography.sizes.xs,
          fontWeight: tokens.typography.weights.bold,
          textAlign: 'center',
          letterSpacing: '0.5px',
          border: `1px solid ${tokens.colors.yellow}`
        }}>
          ⚠️ MODO DEMONSTRAÇÃO ATIVO: Exibindo dados fictícios de demonstração.
        </div>
      )}

      {erroSincronizacao && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          color: tokens.colors.red,
          border: `1px solid ${tokens.colors.red}`,
          padding: '8px 14px',
          borderRadius: tokens.radii.md,
          marginBottom: tokens.spacing.sm,
          fontSize: tokens.typography.sizes.xs,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {erroSincronizacao}
        </div>
      )}

      {!user && !modoDemo && (
        <div style={{
          backgroundColor: tokens.colors.surfaceAlt,
          color: tokens.colors.textSecondary,
          border: `1px solid ${tokens.colors.border}`,
          padding: '6px 12px',
          borderRadius: tokens.radii.md,
          marginBottom: tokens.spacing.sm,
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>ℹ️ <strong>Modo visitante:</strong> As alterações de status ficam salvas apenas neste navegador.</span>
          <button
            onClick={() => setLoginModalAberta(true)}
            style={{ background: 'none', border: 'none', color: tokens.colors.highlight, cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
          >
            É o dono? Entrar
          </button>
        </div>
      )}

      {/* Banner de Importação para a Nuvem (Dono Logado) */}
      <ImportadorStatusBanner
        user={user}
        vagas={vagas}
        onImportacaoConcluida={recarregarStatus}
      />

      <Header 
        termoBusca={filtros.texto}
        setTermoBusca={(txt) => atualizarFiltro('texto', txt)}
        carregarVagas={carregarVagas}
        atualizando={atualizando}
        modoDemo={modoDemo}
        setModoDemo={setModoDemo}
        abrirBuscaModal={() => setBuscaModalAberta(true)}
        user={user}
        onAbrirLogin={() => setLoginModalAberta(true)}
        onLogout={logout}
      />

      {erro && !modoDemo ? (
        <div style={{ backgroundColor: tokens.colors.surface, border: `1px solid ${tokens.colors.red}`, borderRadius: tokens.radii.lg, padding: '32px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ color: tokens.colors.red, fontSize: tokens.typography.sizes.md, fontWeight: tokens.typography.weights.bold, marginBottom: '8px' }}>
            Falha na conexão com o banco de dados
          </div>
          <div style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.body, marginBottom: '18px' }}>
            Não foi possível recuperar as vagas do Supabase. Verifique a conexão ou tente novamente.
          </div>
          <button 
            onClick={carregarVagas}
            className="interactive-btn"
            style={{ backgroundColor: tokens.colors.highlight, color: tokens.colors.background, border: 'none', padding: '0 20px', height: '36px', borderRadius: tokens.radii.md, fontWeight: tokens.typography.weights.bold, fontSize: tokens.typography.sizes.body, cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="grid-dashboard">
          {/* Topo: KPIs Operacionais */}
          <KpiIngestao 
            total={statsGerais.total} 
            vagas={vagas}
            ultimaVagaCreatedAt={ultimaVagaCreatedAt}
            ultimaAtualizacao={ultimaAtualizacao}
            diaAtivo={filtros.dataDia}
            alternarDia={(dia) => alternarFiltro('dataDia', dia)}
            loading={loading}
          />
          
          <AderenciaCard 
            total={statsGerais.total}
            altas={statsGerais.altas}
            medias={statsGerais.medias}
            baixas={statsGerais.baixas}
            faixaAtiva={filtros.faixa}
            alternarFaixa={(faixa) => alternarFiltro('faixa', faixa)}
            loading={loading}
          />

          <MediaFit 
            mediaScore={statsGerais.mediaScore} 
            loading={loading}
          />

          {/* Funil de Candidaturas */}
          <StatusFunil 
            novas={statsGerais.novas}
            emAndamento={statsGerais.emAndamento}
            dispensadas={statsGerais.dispensadas}
            descartadas={statsGerais.descartadas}
            statusAtivo={filtros.status}
            alternarStatus={(st) => alternarFiltro('status', st)}
          />

          {/* Barra de Filtros, Slider e Chips */}
          <FiltrosBar 
            filtros={filtros}
            atualizarFiltro={atualizarFiltro}
            limparTodosFiltros={limparTodosFiltros}
            opcoesUnicas={opcoesUnicas}
            totalGeral={statsGerais.total}
            totalFiltrado={vagasFiltradas.length}
            abrirBuscaModal={() => setBuscaModalAberta(true)}
          />

          {/* Feed Operacional (Largura total col-12) */}
          <FeedTable 
            vagasFiltradas={vagasFiltradas}
            vagaSelecionada={vagaSelecionada}
            indiceFocado={indiceFocado}
            aoSelecionarVaga={abrirGavetaComVaga}
            filtroNivel={filtros.faixa}
            setFiltroNivel={(faixa) => atualizarFiltro('faixa', faixa)}
            limparFiltros={limparTodosFiltros}
            loading={loading}
            linhaRefs={linhaRefs}
          />

          {/* Distribuição das Vagas Ingeridas */}
          <DistribuicaoVagas vagas={vagas} />
        </div>
      )}

      {/* Gaveta de Detalhes Deslizante (Slide-Over) */}
      <DetailPanel 
        vagaSelecionada={vagaSelecionada}
        isOpen={gavetaAberta}
        onClose={fecharGaveta}
        alterarStatusVaga={alterarStatusVaga}
        onVagaAnterior={irParaVagaAnterior}
        onVagaSeguinte={irParaVagaSeguinte}
        temAnterior={temAnterior}
        temSeguinte={temSeguinte}
        origemFocoRef={origemFocoRef}
      />

      {/* Modal de Busca Rápida Ctrl+K */}
      <BuscaModal 
        isOpen={buscaModalAberta}
        onClose={() => setBuscaModalAberta(false)}
        vagas={vagas}
        onSelectVaga={(vaga) => {
          const idx = vagasFiltradas.findIndex((item) => item.id === vaga.id);
          abrirGavetaComVaga(vaga, idx >= 0 ? idx : 0);
        }}
      />

      {/* Modal de Login do Dono */}
      <LoginModal
        isOpen={loginModalAberta}
        onClose={() => setLoginModalAberta(false)}
        onEnviarMagicLink={enviarMagicLink}
        enviando={enviando}
        mensagemAuth={mensagemAuth}
        setMensagemAuth={setMensagemAuth}
      />
    </div>
  );
}