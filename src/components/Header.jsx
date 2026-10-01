import React from 'react';
import { tokens } from '../styles/tokens';

export default function Header({ 
  termoBusca, 
  setTermoBusca, 
  carregarVagas, 
  atualizando, 
  modoDemo, 
  setModoDemo,
  abrirBuscaModal,
  user,
  onAbrirLogin,
  onLogout
}) {
  // Abreviação de e-mail (ex: luis***@dominio.com)
  const formatarEmailAbreviado = (emailCompleto) => {
    if (!emailCompleto) return '';
    const [nome, dominio] = emailCompleto.split('@');
    if (!dominio) return emailCompleto;
    const inicial = nome.slice(0, 3);
    return `${inicial}***@${dominio}`;
  };

  return (
    <div className="header-box" style={{ backgroundColor: tokens.colors.surface, padding: '14px 18px', borderRadius: tokens.radii.lg, marginBottom: tokens.spacing.lg, border: `1px solid ${tokens.colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: tokens.radii.full, backgroundColor: tokens.colors.highlight, boxShadow: `0 0 10px ${tokens.colors.highlight}` }}></div>
        <h1 style={{ fontSize: tokens.typography.sizes.md, fontWeight: tokens.typography.weights.bold, margin: 0, letterSpacing: '0.5px', color: tokens.colors.textPrimary }}>
          JOB HUNTER <span style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.xs, fontWeight: tokens.typography.weights.medium }}>• SOC OPERATIONS</span>
        </h1>
      </div>

      <div className="header-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: tokens.typography.sizes.xs, color: modoDemo ? tokens.colors.yellow : tokens.colors.textSecondary, cursor: 'pointer', userSelect: 'none', marginRight: '6px' }}>
          <input 
            type="checkbox" 
            checked={modoDemo} 
            onChange={(e) => setModoDemo(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: tokens.colors.yellow }}
          />
          <span>Ver demonstração</span>
        </label>

        {/* Campo de Busca Rápida com gatilho Ctrl+K */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar vaga, empresa..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="search-input"
            style={{ backgroundColor: tokens.colors.background, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.textPrimary, padding: '0 52px 0 12px', height: '36px', borderRadius: tokens.radii.md, fontSize: tokens.typography.sizes.body, outline: 'none' }}
          />
          <button
            onClick={abrirBuscaModal}
            title="Abrir busca rápida (Ctrl+K)"
            style={{ position: 'absolute', right: '6px', background: tokens.colors.surfaceAlt, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.textSecondary, padding: '2px 6px', borderRadius: tokens.radii.sm, fontSize: '10px', cursor: 'pointer' }}
          >
            Ctrl K
          </button>
        </div>

        <button 
          onClick={carregarVagas}
          disabled={atualizando || modoDemo}
          title={modoDemo ? 'Desative o modo demonstração para consultar o banco' : 'Atualizar dados'}
          className="interactive-btn"
          style={{ 
            backgroundColor: (atualizando || modoDemo) ? tokens.colors.border : tokens.colors.surfaceAlt, 
            color: (atualizando || modoDemo) ? tokens.colors.textMuted : tokens.colors.textPrimary, 
            border: `1px solid ${tokens.colors.border}`, 
            padding: '0 14px', 
            height: '36px',
            borderRadius: tokens.radii.md, 
            fontWeight: tokens.typography.weights.bold, 
            fontSize: tokens.typography.sizes.xs, 
            cursor: (atualizando || modoDemo) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {atualizando ? '↻ ...' : '↻ ATUALIZAR'}
        </button>

        {/* Área de Autenticação Discreta */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '6px', borderLeft: `1px solid ${tokens.colors.border}` }}>
            <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.highlight, fontWeight: tokens.typography.weights.semibold }} title={user.email}>
              👤 {formatarEmailAbreviado(user.email)}
            </span>
            <button
              onClick={onLogout}
              className="interactive-btn"
              title="Encerrar sessão"
              style={{
                backgroundColor: 'transparent',
                color: tokens.colors.red,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radii.sm,
                padding: '4px 8px',
                fontSize: tokens.typography.sizes.xs,
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={onAbrirLogin}
            className="interactive-btn"
            style={{
              backgroundColor: tokens.colors.surfaceAlt,
              color: tokens.colors.textPrimary,
              border: `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              height: '36px',
              borderRadius: tokens.radii.md,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.semibold,
              cursor: 'pointer'
            }}
          >
            Entrar
          </button>
        )}
      </div>
    </div>
  );
}