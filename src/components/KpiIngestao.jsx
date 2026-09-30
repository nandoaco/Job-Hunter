import React, { useMemo } from 'react';
import { tokens } from '../styles/tokens';
import { calcularIngestao14Dias, formatarTempoRelativo, formatarHoraSP } from '../lib/vagas';

export default function KpiIngestao({ total, vagas, ultimaVagaCreatedAt, ultimaAtualizacao, diaAtivo, alternarDia }) {
  const dados14Dias = useMemo(() => calcularIngestao14Dias(vagas), [vagas]);
  const tempoRelativo = useMemo(() => formatarTempoRelativo(ultimaVagaCreatedAt), [ultimaVagaCreatedAt]);
  const horaAtualizado = useMemo(() => formatarHoraSP(ultimaAtualizacao), [ultimaAtualizacao]);

  return (
    <div className="col-5" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: tokens.spacing.lg, border: `1px solid ${tokens.colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, letterSpacing: '0.5px' }}>
          Total Ingerido <span style={{ color: tokens.colors.textMuted, fontWeight: 'normal' }}>(Geral)</span>
        </span>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, backgroundColor: tokens.colors.surfaceAlt, border: `1px solid ${tokens.colors.border}`, padding: '2px 8px', borderRadius: tokens.radii.sm }}>
          {ultimaAtualizacao ? `Atualizado às ${horaAtualizado}` : 'Não consultado'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <div style={{ fontSize: tokens.typography.sizes.kpi, fontWeight: tokens.typography.weights.extraBold, color: tokens.colors.textPrimary }}>
          {total}
        </div>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary }}>
          • Última vaga: <strong style={{ color: tokens.colors.textPrimary }}>{tempoRelativo}</strong>
        </span>
      </div>
      
      {/* Gráfico Real: Últimos 14 Dias (Clicável) */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.semibold }}>
            Ingestão diária (Clique para filtrar)
          </span>
          {diaAtivo && (
            <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.highlight }}>
              Filtro: {diaAtivo.slice(0, 5)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '75px', gap: '4px', marginTop: '6px', borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: '4px' }}>
          {dados14Dias.map((d, i) => {
            const isSelected = diaAtivo === d.dataKey;
            return (
              <div 
                key={i} 
                onClick={() => alternarDia(d.dataKey)}
                title={`${d.dataKey}: ${d.total} vaga(s) - Clique para filtrar`}
                className="chart-bar"
                style={{ 
                  flex: 1, 
                  backgroundColor: isSelected ? tokens.colors.highlight : d.total > 0 ? tokens.colors.blue : tokens.colors.surfaceAlt, 
                  height: `${Math.max(d.alturaPct, 8)}%`, 
                  borderRadius: `${tokens.radii.sm} ${tokens.radii.sm} 0 0`,
                  border: isSelected ? `1px solid #fff` : 'none',
                  cursor: 'pointer',
                  transition: tokens.transitions.default
                }}
              ></div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginTop: '4px' }}>
          <span>{dados14Dias[0]?.rotulo}</span>
          <span>{dados14Dias[6]?.rotulo}</span>
          <span>{dados14Dias[13]?.rotulo}</span>
        </div>
      </div>
    </div>
  );
}