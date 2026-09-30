import React, { useState, useMemo, useEffect } from 'react';
import { tokens } from './styles/tokens';
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

export default function App() {
  const {
    vagas,
    loading,
    atualizando,
    erro,
    modoDemo,
    setModoDemo,
    ultimaAtualizacao,
    ultimaVagaCreatedAt,
    vagaSelecionada,
    setVagaSelecionada,
    carregarVagas,
    alterarStatusVaga
  } = useVagas();

  const [buscaModalAberta, setBuscaModalAberta] = useState(false);

  // Hook Central de Filtros
  const {
    filtros,
    vagasFiltradas,
    opcoesUnicas,
    atualizarFiltro,
    alternarFiltro,
    limparTodosFiltros
  } = useFiltros(vagas);

  // Atalho Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscaModalAberta((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Estatísticas calculadas sempre sobre o total geral (não o filtrado)
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
        .col-8 { grid-column: span 8; }
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
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        .primary-action-btn:hover {
          background-color: ${tokens.colors.highlightHover} !important;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
        }
        .chart-bar:hover {
          filter: brightness(1.3);
        }

        @media (max-width: 1024px) {
          .col-5 { grid-column: span 12 !important; }
          .col-4 { grid-column: span 6 !important; }
          .col-3 { grid-column: span 6 !important; }
          .col-8 { grid-column: span 12 !important; }
          .detail-panel-container { grid-column: span 12 !important; }
        }

        @media (max-width: 768px) {
          .col-5, .col-4, .col-3, .col-8, .detail-panel-container {
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
        }
      `}</style>

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
          ⚠️ MODO DEMONSTRAÇÃO ATIVO: Exibindo 30 vagas com dados fictícios de demonstração.
        </div>
      )}

      <Header 
        termoBusca={filtros.texto}
        setTermoBusca={(txt) => atualizarFiltro('texto', txt)}
        carregarVagas={carregarVagas}
        atualizando={atualizando}
        modoDemo={modoDemo}
        setModoDemo={setModoDemo}
        abrirBuscaModal={() => setBuscaModalAberta(true)}
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
          {/* Topo: KPIs (Total Geral, Barras Diárias Clicáveis e Aderência Clicável) */}
          <KpiIngestao 
            total={statsGerais.total} 
            vagas={vagas}
            ultimaVagaCreatedAt={ultimaVagaCreatedAt}
            ultimaAtualizacao={ultimaAtualizacao}
            diaAtivo={filtros.dataDia}
            alternarDia={(dia) => alternarFiltro('dataDia', dia)}
          />
          
          <AderenciaCard 
            total={statsGerais.total}
            altas={statsGerais.altas}
            medias={statsGerais.medias}
            baixas={statsGerais.baixas}
            faixaAtiva={filtros.faixa}
            alternarFaixa={(faixa) => alternarFiltro('faixa', faixa)}
          />

          <MediaFit mediaScore={statsGerais.mediaScore} />

          {/* Funil de Candidaturas Clicável */}
          <StatusFunil 
            novas={statsGerais.novas}
            emAndamento={statsGerais.emAndamento}
            dispensadas={statsGerais.dispensadas}
            descartadas={statsGerais.descartadas}
            statusAtivo={filtros.status}
            alternarStatus={(st) => alternarFiltro('status', st)}
          />

          {/* Barra de Filtros, Slider e Chips Removíveis */}
          <FiltrosBar 
            filtros={filtros}
            atualizarFiltro={atualizarFiltro}
            limparTodosFiltros={limparTodosFiltros}
            opcoesUnicas={opcoesUnicas}
            totalGeral={statsGerais.total}
            totalFiltrado={vagasFiltradas.length}
            abrirBuscaModal={() => setBuscaModalAberta(true)}
          />

          {/* Feed Operacional com Filtros Aplicados */}
          <FeedTable 
            vagasFiltradas={vagasFiltradas}
            vagaSelecionada={vagaSelecionada}
            setVagaSelecionada={setVagaSelecionada}
            filtroNivel={filtros.faixa}
            setFiltroNivel={(faixa) => atualizarFiltro('faixa', faixa)}
            limparFiltros={limparTodosFiltros}
            loading={loading}
          />

          {/* Painel de Detalhes da Vaga Selecionada */}
          <DetailPanel 
            vagaSelecionada={vagaSelecionada}
            alterarStatusVaga={alterarStatusVaga}
          />

          {/* Bloco de Distribuição das Vagas */}
          <DistribuicaoVagas vagas={vagas} />
        </div>
      )}

      {/* Modal de Busca Rápida Ctrl+K */}
      <BuscaModal 
        isOpen={buscaModalAberta}
        onClose={() => setBuscaModalAberta(false)}
        vagas={vagas}
        onSelectVaga={(vaga) => setVagaSelecionada(vaga)}
      />
    </div>
  );
}