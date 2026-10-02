import React, { useRef, useState, useEffect, useCallback } from 'react';
import { tokens } from '../styles/tokens';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function IndicadoresCarrossel({
  stats,
  filtros,
  alternarFiltro,
  limparTodosFiltros
}) {
  const containerRolagemRef = useRef(null);
  const [podeRolarEsquerda, setPodeRolarEsquerda] = useState(false);
  const [podeRolarDireita, setPodeRolarDireita] = useState(false);

  // Valores animados
  const totalAnimado = useAnimatedCounter(stats.total, 500);
  const novasAnimadas = useAnimatedCounter(stats.novas, 500);
  const altasAnimadas = useAnimatedCounter(stats.altas, 500);
  const emAndamentoAnimado = useAnimatedCounter(stats.emAndamento, 500);
  const dispensadasAnimadas = useAnimatedCounter(stats.dispensadas, 500);
  const descartadasAnimadas = useAnimatedCounter(stats.descartadas, 500);
  const mediaAnimada = useAnimatedCounter(stats.mediaScore ?? 0, 500);

  const verificarBordasRolagem = useCallback(() => {
    const el = containerRolagemRef.current;
    if (!el) return;
    const margemTolerancia = 4;
    setPodeRolarEsquerda(el.scrollLeft > margemTolerancia);
    setPodeRolarDireita(el.scrollLeft + el.clientWidth < el.scrollWidth - margemTolerancia);
  }, []);

  useEffect(() => {
    verificarBordasRolagem();
    const el = containerRolagemRef.current;
    if (!el) return;

    window.addEventListener('resize', verificarBordasRolagem);
    el.addEventListener('scroll', verificarBordasRolagem, { passive: true });

    return () => {
      window.removeEventListener('resize', verificarBordasRolagem);
      el.removeEventListener('scroll', verificarBordasRolagem);
    };
  }, [verificarBordasRolagem]);

  const rolar = (direcao) => {
    const el = containerRolagemRef.current;
    if (!el) return;
    // Rola a largura de um card (~150px)
    const deslocamento = direcao === 'esquerda' ? -160 : 160;
    el.scrollBy({ left: deslocamento, behavior: 'smooth' });
  };

  const handleCardFocus = (e) => {
    e.target.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  };

  // Definição dos cartões que ficam na faixa rolável
  const cardsRolaveis = [
    {
      id: 'total',
      label: 'Total de Vagas',
      valor: totalAnimado,
      ativo: !filtros.status && !filtros.faixa && !filtros.dataDia && !filtros.texto,
      cor: tokens.colors.textPrimary,
      acao: () => limparTodosFiltros()
    },
    {
      id: 'alta_aderencia',
      label: 'Alta Aderência',
      sub: 'Match ≥ 80%',
      valor: altasAnimadas,
      ativo: filtros.faixa === 'ALTO',
      cor: tokens.colors.green,
      acao: () => alternarFiltro('faixa', 'ALTO')
    },
    {
      id: 'em_andamento',
      label: 'Em Andamento',
      sub: 'Candidaturas ativas',
      valor: emAndamentoAnimado,
      ativo: filtros.status === 'EM_ANDAMENTO',
      cor: tokens.colors.blue,
      acao: () => alternarFiltro('status', 'EM_ANDAMENTO')
    },
    {
      id: 'dispensados',
      label: 'Dispensados',
      sub: 'Processos encerrados',
      valor: dispensadasAnimadas,
      ativo: filtros.status === 'DISPENSADO',
      cor: tokens.colors.red,
      acao: () => alternarFiltro('status', 'DISPENSADO')
    },
    {
      id: 'descartadas',
      label: 'Descartadas',
      sub: 'Arquivadas pelo usuário',
      valor: descartadasAnimadas,
      ativo: filtros.status === 'DESCARTADO',
      cor: tokens.colors.textSecondary,
      acao: () => alternarFiltro('status', 'DESCARTADO')
    },
    {
      id: 'media_fit',
      label: 'Média de Fit',
      sub: stats.totalComScore > 0 ? `${stats.totalComScore} analisadas` : 'Sem scores',
      valor: stats.mediaScore !== null ? `${mediaAnimada}%` : '—',
      ativo: false,
      cor: tokens.colors.highlight,
      apenasInformativo: true
    }
  ];

  const novaAtiva = filtros.status === 'NOVA';

  return (
    <div
      role="region"
      aria-label="Indicadores"
      className="col-12"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        margin: '6px 0 14px 0'
      }}
    >
      <style>{`
        .carousel-track {
          display: flex;
          align-items: stretch;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 6px;
          scroll-padding-left: 170px;
        }
        .carousel-track::-webkit-scrollbar {
          display: none;
        }
        .indicator-card {
          scroll-snap-align: start;
          flex: 0 0 150px;
          min-height: 84px;
          background-color: ${tokens.colors.surface};
          border: 1px solid ${tokens.colors.border};
          border-radius: ${tokens.radii.md};
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          text-align: left;
          user-select: none;
          transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
        }
        .indicator-card:focus-visible {
          outline: 2px solid ${tokens.colors.highlight} !important;
          outline-offset: 2px;
        }
        .nav-arrow-btn {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background-color: ${tokens.colors.surface};
          border: 1px solid ${tokens.colors.border};
          color: ${tokens.colors.textPrimary};
          border-radius: ${tokens.radii.full};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: opacity 150ms ease, background-color 150ms ease;
          z-index: 10;
        }
        .nav-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .nav-arrow-btn:not(:disabled):hover {
          background-color: ${tokens.colors.surfaceAlt};
          border-color: ${tokens.colors.highlight};
        }
        @media (max-width: 768px) {
          .nav-arrow-btn {
            display: none !important;
          }
          .indicator-card {
            flex: 0 0 78% !important; /* ~20% do próximo visível */
          }
          .carousel-track {
            scroll-padding-left: 155px;
          }
        }
      `}</style>

      {/* Botão de Rolagem Esquerda */}
      <button
        type="button"
        aria-label="Rolar indicadores para a esquerda"
        className="nav-arrow-btn"
        disabled={!podeRolarEsquerda}
        onClick={() => rolar('esquerda')}
      >
        ‹
      </button>

      {/* Conteúdo Principal com Elemento Fixo (Sticky) e Faixa Rolável */}
      <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0, alignItems: 'stretch' }}>
        
        {/* Card Fixo: NOVAS (Position: Sticky à esquerda) */}
        <button
          type="button"
          tabIndex={0}
          onClick={() => alternarFiltro('status', 'NOVA')}
          onFocus={handleCardFocus}
          aria-label={`Filtrar por Novas vagas. ${novasAnimadas} vagas`}
          style={{
            position: 'sticky',
            left: 0,
            zIndex: 5,
            flex: '0 0 150px',
            minHeight: '84px',
            backgroundColor: novaAtiva ? 'rgba(0, 229, 255, 0.12)' : tokens.colors.surface,
            border: `1px solid ${novaAtiva ? tokens.colors.highlight : tokens.colors.border}`,
            boxShadow: '4px 0 12px rgba(0, 0, 0, 0.45)',
            borderRadius: tokens.radii.md,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left',
            cursor: 'pointer',
            marginRight: '8px'
          }}
          className="interactive-btn"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: tokens.colors.highlight, fontWeight: tokens.typography.weights.bold, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Novas {novaAtiva && '✓'}
            </span>
            <div style={{ width: '6px', height: '6px', borderRadius: tokens.radii.full, backgroundColor: tokens.colors.highlight }} />
          </div>
          <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.extraBold, color: tokens.colors.textPrimary, margin: '4px 0' }}>
            {novasAnimadas}
          </div>
          <span style={{ fontSize: '10px', color: tokens.colors.textSecondary }}>
            Oportunidades recentes
          </span>
        </button>

        {/* Faixa Rolável Horizontal com os Demais Indicadores */}
        <div ref={containerRolagemRef} className="carousel-track" style={{ flex: 1, minWidth: 0 }}>
          {cardsRolaveis.map((c) => {
            if (c.apenasInformativo) {
              return (
                <div
                  key={c.id}
                  className="indicator-card"
                  style={{
                    cursor: 'default',
                    borderColor: tokens.colors.border
                  }}
                >
                  <span style={{ fontSize: '11px', color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold }}>
                    {c.label}
                  </span>
                  <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.extraBold, color: c.cor, margin: '4px 0' }}>
                    {c.valor}
                  </div>
                  <span style={{ fontSize: '10px', color: tokens.colors.textMuted }}>
                    {c.sub}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={c.id}
                type="button"
                tabIndex={0}
                onClick={c.acao}
                onFocus={handleCardFocus}
                aria-label={`Indicador ${c.label}. Total: ${c.valor}`}
                className="indicator-card interactive-btn"
                style={{
                  cursor: 'pointer',
                  backgroundColor: c.ativo ? 'rgba(255, 255, 255, 0.08)' : tokens.colors.surface,
                  borderColor: c.ativo ? c.cor : tokens.colors.border,
                  boxShadow: c.ativo ? `0 0 10px ${c.cor}33` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold }}>
                    {c.label} {c.ativo && '✓'}
                  </span>
                </div>
                <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.extraBold, color: c.cor, margin: '4px 0' }}>
                  {c.valor}
                </div>
                <span style={{ fontSize: '10px', color: tokens.colors.textMuted }}>
                  {c.sub || 'Clique para filtrar'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão de Rolagem Direita */}
      <button
        type="button"
        aria-label="Rolar indicadores para a direita"
        className="nav-arrow-btn"
        disabled={!podeRolarDireita}
        onClick={() => rolar('direita')}
      >
        ›
      </button>
    </div>
  );
}