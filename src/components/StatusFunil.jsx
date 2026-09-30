import React from 'react';
import { tokens } from '../styles/tokens';

export default function StatusFunil({ novas, emAndamento, dispensadas, descartadas, statusAtivo, alternarStatus }) {
  const itens = [
    { id: 'NOVA', label: 'Novas', count: novas, color: tokens.colors.green },
    { id: 'EM_ANDAMENTO', label: 'Em Andamento', count: emAndamento, color: tokens.colors.blue },
    { id: 'DISPENSADO', label: 'Dispensados', count: dispensadas, color: tokens.colors.red },
    { id: 'DESCARTADO', label: 'Descartadas', count: descartadas, color: tokens.colors.textSecondary }
  ];

  return (
    <div 
      className="col-12" 
      style={{ 
        backgroundColor: tokens.colors.surface, 
        borderRadius: tokens.radii.lg, 
        padding: '12px 16px', 
        border: `1px solid ${tokens.colors.border}` 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, letterSpacing: '0.5px' }}>
          Funil de Candidaturas <span style={{ color: tokens.colors.textMuted, fontWeight: 'normal' }}>(Total Geral)</span>
        </span>
        {statusAtivo !== 'TODAS' && (
          <button
            onClick={() => alternarStatus('TODAS')}
            className="interactive-btn"
            style={{ 
              backgroundColor: 'transparent', 
              color: tokens.colors.highlight, 
              border: 'none', 
              fontSize: tokens.typography.sizes.xs, 
              fontWeight: tokens.typography.weights.semibold,
              cursor: 'pointer',
              padding: '2px 6px'
            }}
          >
            Limpar filtro de funil ✕
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        {itens.map((item) => {
          const ativo = statusAtivo === item.id;
          return (
            <div
              key={item.id}
              onClick={() => alternarStatus(item.id)}
              className="funil-item"
              tabIndex={0}
              role="button"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') alternarStatus(item.id); }}
              style={{
                backgroundColor: ativo ? 'rgba(0, 229, 255, 0.08)' : tokens.colors.surfaceAlt,
                border: `1px solid ${ativo ? tokens.colors.highlight : tokens.colors.border}`,
                borderRadius: tokens.radii.md,
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: tokens.transitions.default
              }}
            >
              <div>
                <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, fontWeight: tokens.typography.weights.semibold }}>
                  {item.label}
                </div>
                <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary, lineHeight: 1.2 }}>
                  {item.count}
                </div>
              </div>
              <span style={{ fontSize: tokens.typography.sizes.xs, color: item.color, fontWeight: tokens.typography.weights.bold }}>
                {ativo ? 'Ativo ↗' : 'Filtrar'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}