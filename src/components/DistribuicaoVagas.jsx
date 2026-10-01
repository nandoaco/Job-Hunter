import React, { useMemo } from 'react';
import { tokens } from '../styles/tokens';

export default function DistribuicaoVagas({ vagas }) {
  const { porModelo, porFonte } = useMemo(() => {
    if (!vagas || vagas.length === 0) return { porModelo: [], porFonte: [] };

    const modelosMap = {};
    const fontesMap = {};

    vagas.forEach((v) => {
      const modelo = v.modelo_trabalho ? v.modelo_trabalho.trim() : 'Não informado';
      const fonte = v.fonte ? v.fonte.trim() : 'Outros';
      modelosMap[modelo] = (modelosMap[modelo] || 0) + 1;
      fontesMap[fonte] = (fontesMap[fonte] || 0) + 1;
    });

    const formatarLista = (mapa) => {
      const total = vagas.length;
      return Object.entries(mapa)
        .map(([label, qtd]) => ({
          label,
          qtd,
          pct: Math.round((qtd / total) * 100)
        }))
        .sort((a, b) => b.qtd - a.qtd);
    };

    return {
      porModelo: formatarLista(modelosMap),
      porFonte: formatarLista(fontesMap)
    };
  }, [vagas]);

  if (!vagas || vagas.length === 0) {
    return (
      <div className="col-8" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: '14px 16px', border: `1px solid ${tokens.colors.border}`, color: tokens.colors.textMuted, fontSize: tokens.typography.sizes.xs }}>
        Sem dados suficientes para exibir a distribuição das vagas.
      </div>
    );
  }

  return (
    <div className="col-8" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: '16px', border: `1px solid ${tokens.colors.border}` }}>
      <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, letterSpacing: '0.5px', display: 'block', marginBottom: '14px' }}>
        Distribuição das Vagas Ingeridas
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div>
          <span style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.textPrimary, fontWeight: tokens.typography.weights.semibold, display: 'block', marginBottom: '8px' }}>
            Por Modalidade
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {porModelo.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '2px' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>{item.qtd} ({item.pct}%)</span>
                </div>
                <div style={{ height: '6px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.sm, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, backgroundColor: tokens.colors.blue, borderRadius: tokens.radii.sm }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.textPrimary, fontWeight: tokens.typography.weights.semibold, display: 'block', marginBottom: '8px' }}>
            Por Fonte / Agregador
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {porFonte.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '2px' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>{item.qtd} ({item.pct}%)</span>
                </div>
                <div style={{ height: '6px', backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.sm, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, backgroundColor: tokens.colors.green, borderRadius: tokens.radii.sm }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}