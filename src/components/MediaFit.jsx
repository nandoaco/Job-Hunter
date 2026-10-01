import React from 'react';
import { tokens } from '../styles/tokens';

export default function MediaFit({ mediaScore }) {
  return (
    <div className="col-3" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: tokens.spacing.lg, border: `1px solid ${tokens.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '6px' }}>
        Média de Fit Técnico
      </span>
      
      <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden', marginTop: '10px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: tokens.radii.full, border: `10px solid ${tokens.colors.surfaceAlt}`, borderTopColor: tokens.colors.blue, borderRightColor: tokens.colors.green, transform: `rotate(${Math.min(180, (mediaScore / 100) * 180 - 45)}deg)`, transition: 'transform 0.4s ease' }}></div>
      </div>
      
      <div style={{ fontSize: tokens.typography.sizes.xl, fontWeight: tokens.typography.weights.extraBold, color: tokens.colors.textPrimary, marginTop: '-10px' }}>
        {mediaScore}%
      </div>
      <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary }}>Índice Médio Geral</span>
    </div>
  );
}