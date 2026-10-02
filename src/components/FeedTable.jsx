import React from 'react';
import { tokens } from '../styles/tokens';
import { renderBadgeStatus, getScoreColors, formatarScore } from '../lib/vagas';
import { SkeletonFeedTable } from './SkeletonLoader';

export default function FeedTable({
  vagasFiltradas,
  vagaSelecionada,
  indiceFocado,
  aoSelecionarVaga,
  filtroNivel,
  setFiltroNivel,
  limparFiltros,
  loading,
  linhaRefs
}) {
  return (
    <div
      className="col-12"
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radii.lg,
        padding: tokens.spacing.lg,
        border: `1px solid ${tokens.colors.border}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: tokens.typography.sizes.sm, fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary, textTransform: 'uppercase' }}>
          Feed Operacional ({vagasFiltradas.length})
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['TODOS', 'ALTO', 'MEDIO'].map((nivel) => {
            const ativo = filtroNivel === nivel;
            return (
              <button
                key={nivel}
                onClick={() => setFiltroNivel(nivel)}
                className="interactive-btn"
                style={{
                  backgroundColor: ativo ? tokens.colors.highlight : tokens.colors.background,
                  color: ativo ? tokens.colors.background : tokens.colors.textSecondary,
                  border: `1px solid ${ativo ? tokens.colors.highlight : tokens.colors.border}`,
                  padding: '0 12px',
                  height: '32px',
                  borderRadius: tokens.radii.md,
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: tokens.typography.weights.bold,
                  cursor: 'pointer',
                  transition: tokens.transitions.default
                }}
              >
                {nivel}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <SkeletonFeedTable />
      ) : vagasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.body }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
          <div style={{ color: tokens.colors.textPrimary, fontWeight: tokens.typography.weights.semibold, marginBottom: '6px' }}>
            Nenhuma vaga com esses filtros.
          </div>
          <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '14px' }}>
            Tente ajustar os parâmetros ou limpe os filtros para visualizar os dados completos.
          </div>
          <button
            onClick={limparFiltros}
            className="interactive-btn"
            style={{
              backgroundColor: tokens.colors.surfaceAlt,
              color: tokens.colors.highlight,
              border: `1px solid ${tokens.colors.highlight}`,
              padding: '6px 16px',
              borderRadius: tokens.radii.md,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.bold,
              cursor: 'pointer'
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tokens.typography.sizes.body }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${tokens.colors.border}`, color: tokens.colors.textSecondary, textAlign: 'left', fontSize: tokens.typography.sizes.xs, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px' }}>Cargo / Empresa</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px' }}>Match</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {vagasFiltradas.map((v, index) => {
                  const scoreColors = getScoreColors(v.score_match);
                  const isSelected = vagaSelecionada?.id === v.id;
                  const isFocused = indiceFocado === index;
                  const animDelay = index < 10 ? `${index * 25}ms` : '0ms';

                  return (
                    <tr
                      key={v.id}
                      ref={(el) => { if (linhaRefs?.current) linhaRefs.current[index] = el; }}
                      onClick={() => aoSelecionarVaga(v, index)}
                      className="feed-row row-stagger-entry"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          aoSelecionarVaga(v, index);
                        }
                      }}
                      style={{
                        borderBottom: `1px solid ${tokens.colors.border}`,
                        cursor: 'pointer',
                        backgroundColor: isFocused ? 'rgba(0, 229, 255, 0.12)' : isSelected ? 'rgba(0, 229, 255, 0.06)' : 'transparent',
                        outline: isFocused ? `2px solid ${tokens.colors.highlight}` : 'none',
                        outlineOffset: '-2px',
                        animationDelay: animDelay,
                        transition: tokens.transitions.default
                      }}
                    >
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: tokens.typography.weights.semibold, color: tokens.colors.textPrimary, fontSize: tokens.typography.sizes.body }}>
                          {v.titulo}
                        </div>
                        <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginTop: '2px' }}>
                          {v.empresa} • {v.localizacao}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {renderBadgeStatus(v.status_candidatura, v.data_status)}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: tokens.radii.sm,
                          fontSize: tokens.typography.sizes.xs,
                          fontWeight: tokens.typography.weights.bold,
                          backgroundColor: scoreColors.bg,
                          color: scoreColors.color,
                          border: `1px solid ${scoreColors.border}`
                        }}>
                          {formatarScore(v.score_match)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <span
                          className="link-action"
                          style={{
                            color: tokens.colors.highlight,
                            fontSize: tokens.typography.sizes.xs,
                            fontWeight: tokens.typography.weights.bold,
                            padding: '6px 10px',
                            borderRadius: tokens.radii.sm,
                            border: `1px solid ${tokens.colors.border}`,
                            display: 'inline-block'
                          }}
                        >
                          Ver Detalhes →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mobile-feed-cards">
            {vagasFiltradas.map((v, index) => {
              const scoreColors = getScoreColors(v.score_match);
              const isSelected = vagaSelecionada?.id === v.id;
              const isFocused = indiceFocado === index;

              return (
                <div
                  key={v.id}
                  onClick={() => aoSelecionarVaga(v, index)}
                  tabIndex={0}
                  role="button"
                  style={{
                    backgroundColor: isFocused ? 'rgba(0, 229, 255, 0.12)' : isSelected ? 'rgba(0, 229, 255, 0.06)' : tokens.colors.surfaceAlt,
                    border: `1px solid ${isFocused ? tokens.colors.highlight : tokens.colors.border}`,
                    borderRadius: tokens.radii.md,
                    padding: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontWeight: tokens.typography.weights.semibold, color: tokens.colors.textPrimary, fontSize: tokens.typography.sizes.body }}>
                      {v.titulo}
                    </div>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: tokens.radii.sm,
                      fontSize: tokens.typography.sizes.xs,
                      fontWeight: tokens.typography.weights.bold,
                      backgroundColor: scoreColors.bg,
                      color: scoreColors.color,
                      border: `1px solid ${scoreColors.border}`
                    }}>
                      {formatarScore(v.score_match)}
                    </span>
                  </div>
                  <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '8px' }}>
                    {v.empresa} • {v.localizacao}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {renderBadgeStatus(v.status_candidatura, v.data_status)}
                    <span style={{ color: tokens.colors.highlight, fontSize: tokens.typography.sizes.xs, fontWeight: tokens.typography.weights.bold }}>
                      Detalhes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: `1px solid ${tokens.colors.border}`, fontSize: tokens.typography.sizes.xs, color: tokens.colors.textMuted, gap: '12px', flexWrap: 'wrap' }}>
            <span><kbd className="kbd-hint">↑</kbd><kbd className="kbd-hint">↓</kbd> ou <kbd className="kbd-hint">j</kbd><kbd className="kbd-hint">k</kbd> navegar</span>
            <span>·</span>
            <span><kbd className="kbd-hint">Enter</kbd> abrir</span>
            <span>·</span>
            <span><kbd className="kbd-hint">Esc</kbd> fechar</span>
            <span>·</span>
            <span><kbd className="kbd-hint">Ctrl+K</kbd> buscar</span>
          </div>
        </>
      )}
    </div>
  );
}