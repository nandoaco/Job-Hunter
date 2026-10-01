import React from 'react';
import { tokens } from '../styles/tokens';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { SkeletonCard } from './SkeletonLoader';

export default function AderenciaCard({ total, altas, medias, baixas, faixaAtiva, alternarFaixa, loading }) {
  const altasAnimadas = useAnimatedCounter(altas, 600);
  const mediasAnimadas = useAnimatedCounter(medias, 600);
  const baixasAnimadas = useAnimatedCounter(baixas, 600);

  if (loading) {
    return <div className="col-4"><SkeletonCard height="180px" /></div>;
  }

  return (
    <div className="col-4" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: tokens.spacing.lg, border: `1px solid ${tokens.colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, letterSpacing: '0.5px' }}>
          Aderência das Vagas
        </span>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textMuted }}>Total geral</span>
      </div>
      
      {/* Alta (≥ 80%) */}
      <div 
        onClick={() => alternarFaixa('ALTO')}
        className="interactive-btn"
        style={{ marginBottom: '12px', cursor: 'pointer', padding: '4px', borderRadius: tokens.radii.sm, backgroundColor: faixaAtiva === 'ALTO' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: `1px solid ${faixaAtiva === 'ALTO' ? tokens.colors.green : 'transparent'}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, marginBottom: '4px' }}>
          <span style={{ color: tokens.colors.green, fontWeight: tokens.typography.weights.semibold }}>
            Alta (Match ≥ 80%) {faixaAtiva === 'ALTO' && '✓'}
          </span>
          <span style={{ fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>{altasAnimadas}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.sm, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total ? (altas / total) * 100 : 0}%`, backgroundColor: tokens.colors.green, borderRadius: tokens.radii.sm, transition: 'width 500ms ease' }}></div>
        </div>
      </div>

      {/* Média (60% - 79%) */}
      <div 
        onClick={() => alternarFaixa('MEDIO')}
        className="interactive-btn"
        style={{ marginBottom: '12px', cursor: 'pointer', padding: '4px', borderRadius: tokens.radii.sm, backgroundColor: faixaAtiva === 'MEDIO' ? 'rgba(245, 158, 11, 0.15)' : 'transparent', border: `1px solid ${faixaAtiva === 'MEDIO' ? tokens.colors.yellow : 'transparent'}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, marginBottom: '4px' }}>
          <span style={{ color: tokens.colors.yellow, fontWeight: tokens.typography.weights.semibold }}>
            Média (60% - 79%) {faixaAtiva === 'MEDIO' && '✓'}
          </span>
          <span style={{ fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>{mediasAnimadas}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.sm, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total ? (medias / total) * 100 : 0}%`, backgroundColor: tokens.colors.yellow, borderRadius: tokens.radii.sm, transition: 'width 500ms ease' }}></div>
        </div>
      </div>

      {/* Baixa (< 60%) */}
      <div 
        onClick={() => alternarFaixa('BAIXO')}
        className="interactive-btn"
        style={{ cursor: 'pointer', padding: '4px', borderRadius: tokens.radii.sm, backgroundColor: faixaAtiva === 'BAIXO' ? 'rgba(244, 63, 94, 0.15)' : 'transparent', border: `1px solid ${faixaAtiva === 'BAIXO' ? tokens.colors.red : 'transparent'}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, marginBottom: '4px' }}>
          <span style={{ color: tokens.colors.red, fontWeight: tokens.typography.weights.semibold }}>
            Baixa (&lt; 60%) {faixaAtiva === 'BAIXO' && '✓'}
          </span>
          <span style={{ fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>{baixasAnimadas}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.sm, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total ? (baixas / total) * 100 : 0}%`, backgroundColor: tokens.colors.red, borderRadius: tokens.radii.sm, transition: 'width 500ms ease' }}></div>
        </div>
      </div>
    </div>
  );
}