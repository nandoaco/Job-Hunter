import React, { useEffect, useRef } from 'react';
import { tokens } from '../styles/tokens';
import { renderBadgeStatus } from '../lib/vagas';

export default function DetailPanel({
  vagaSelecionada,
  isOpen,
  onClose,
  alterarStatusVaga,
  onVagaAnterior,
  onVagaSeguinte,
  temAnterior,
  temSeguinte,
  origemFocoRef
}) {
  const gavetaRef = useRef(null);
  const botaoFecharRef = useRef(null);

  // Gestão de foco e acessibilidade ao abrir e fechar a gaveta
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        botaoFecharRef.current?.focus();
      }, 50);
    } else if (origemFocoRef?.current) {
      origemFocoRef.current.focus();
    }
  }, [isOpen, origemFocoRef]);

  // Teclado na gaveta: Esc fecha, ← / → navegam entre vagas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (temAnterior) onVagaAnterior();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (temSeguinte) onVagaSeguinte();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onVagaAnterior, onVagaSeguinte, temAnterior, temSeguinte]);

  if (!isOpen || !vagaSelecionada) return null;

  return (
    <>
      {/* Fundo escurecido com transição de opacidade */}
      <div
        className="drawer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 17, 32, 0.7)',
          backdropFilter: 'blur(2px)',
          zIndex: 900
        }}
      />

      {/* Gaveta lateral deslizante */}
      <div
        ref={gavetaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gaveta-vaga-titulo"
        className="drawer-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '480px',
          backgroundColor: tokens.colors.surface,
          borderLeft: `1px solid ${tokens.colors.border}`,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: 901,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px'
        }}
      >
        {/* Cabeçalho da Gaveta com Navegação e Botão Fechar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: `1px solid ${tokens.colors.border}`, paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={onVagaAnterior}
              disabled={!temAnterior}
              title="Vaga anterior (Seta esquerda ←)"
              className="interactive-btn"
              style={{
                backgroundColor: tokens.colors.surfaceAlt,
                border: `1px solid ${tokens.colors.border}`,
                color: temAnterior ? tokens.colors.textPrimary : tokens.colors.textMuted,
                borderRadius: tokens.radii.sm,
                padding: '4px 8px',
                cursor: temAnterior ? 'pointer' : 'not-allowed',
                fontSize: tokens.typography.sizes.xs
              }}
            >
              ← Anterior
            </button>
            <button
              onClick={onVagaSeguinte}
              disabled={!temSeguinte}
              title="Próxima vaga (Seta direita →)"
              className="interactive-btn"
              style={{
                backgroundColor: tokens.colors.surfaceAlt,
                border: `1px solid ${tokens.colors.border}`,
                color: temSeguinte ? tokens.colors.textPrimary : tokens.colors.textMuted,
                borderRadius: tokens.radii.sm,
                padding: '4px 8px',
                cursor: temSeguinte ? 'pointer' : 'not-allowed',
                fontSize: tokens.typography.sizes.xs
              }}
            >
              Próxima →
            </button>
          </div>

          <button
            ref={botaoFecharRef}
            onClick={onClose}
            aria-label="Fechar painel de detalhes"
            className="interactive-btn"
            style={{
              backgroundColor: tokens.colors.surfaceAlt,
              border: `1px solid ${tokens.colors.border}`,
              color: tokens.colors.textPrimary,
              borderRadius: tokens.radii.sm,
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Título e Empresa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {vagaSelecionada.empresa}
            </span>
            <h2 id="gaveta-vaga-titulo" style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary, margin: '4px 0 0 0' }}>
              {vagaSelecionada.titulo}
            </h2>
          </div>
          <span style={{ fontSize: tokens.typography.sizes.xl, fontWeight: tokens.typography.weights.extraBold, color: tokens.colors.highlight }}>
            {vagaSelecionada.score_match}%
          </span>
        </div>

        <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '14px' }}>
          {vagaSelecionada.localizacao} {vagaSelecionada.modelo_trabalho ? `• ${vagaSelecionada.modelo_trabalho}` : ''}
        </div>

        <div style={{ marginBottom: '18px' }}>
          {renderBadgeStatus(vagaSelecionada.status_candidatura, vagaSelecionada.data_status)}
        </div>

        {/* Botões de Ação de Situação */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, textTransform: 'uppercase', fontWeight: tokens.typography.weights.bold, display: 'block', marginBottom: '8px' }}>
            Atualizar Situação:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              onClick={() => alterarStatusVaga(vagaSelecionada.id, 'EM_ANDAMENTO')}
              className="interactive-btn"
              style={{
                backgroundColor: vagaSelecionada.status_candidatura === 'EM_ANDAMENTO' ? 'rgba(56, 189, 248, 0.25)' : tokens.colors.surfaceAlt,
                color: tokens.colors.blue,
                border: `1px solid ${tokens.colors.blue}`,
                borderRadius: tokens.radii.md,
                padding: '8px 4px',
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.bold,
                cursor: 'pointer'
              }}
            >
              ⏳ Candidatado
            </button>
            <button
              onClick={() => alterarStatusVaga(vagaSelecionada.id, 'DISPENSADO')}
              className="interactive-btn"
              style={{
                backgroundColor: vagaSelecionada.status_candidatura === 'DISPENSADO' ? 'rgba(244, 63, 94, 0.25)' : tokens.colors.surfaceAlt,
                color: tokens.colors.red,
                border: `1px solid ${tokens.colors.red}`,
                borderRadius: tokens.radii.md,
                padding: '8px 4px',
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.bold,
                cursor: 'pointer'
              }}
            >
              ✕ Dispensado
            </button>
            <button
              onClick={() => alterarStatusVaga(vagaSelecionada.id, 'DESCARTADO')}
              className="interactive-btn"
              style={{
                backgroundColor: vagaSelecionada.status_candidatura === 'DESCARTADO' ? 'rgba(148, 163, 184, 0.25)' : tokens.colors.surfaceAlt,
                color: tokens.colors.textSecondary,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radii.md,
                padding: '8px 4px',
                fontSize: tokens.typography.sizes.xs,
                fontWeight: tokens.typography.weights.bold,
                cursor: 'pointer'
              }}
            >
              🗑️ Descartar
            </button>
          </div>
        </div>

        {/* Parecer Técnico */}
        <div style={{ backgroundColor: tokens.colors.surfaceAlt, borderRadius: tokens.radii.md, padding: '12px', border: `1px solid ${tokens.colors.border}`, marginBottom: '16px' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.highlight, fontWeight: tokens.typography.weights.bold, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Parecer Técnico da IA
          </span>
          <p style={{ margin: 0, fontSize: tokens.typography.sizes.body, color: tokens.colors.textPrimary, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{vagaSelecionada.parecer_ia || 'Vaga com requisitos analisados pelo fluxo automatizado de triagem de segurança.'}"
          </p>
        </div>

        {/* Pontos Fortes e Gaps */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.green, fontWeight: tokens.typography.weights.bold, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Pontos de Aderência:
          </span>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textPrimary, lineHeight: 1.6 }}>
            {Array.isArray(vagaSelecionada.pontos_fortes) && vagaSelecionada.pontos_fortes.length > 0 ? (
              vagaSelecionada.pontos_fortes.map((ponto, i) => <li key={i}>{ponto}</li>)
            ) : (
              <li>Compatibilidade com as competências de operação SOC e análise Blue Team</li>
            )}
          </ul>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.red, fontWeight: tokens.typography.weights.bold, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Gaps / Atenção:
          </span>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textPrimary, lineHeight: 1.6 }}>
            {Array.isArray(vagaSelecionada.gaps) && vagaSelecionada.gaps.length > 0 ? (
              vagaSelecionada.gaps.map((gap, i) => <li key={i}>{gap}</li>)
            ) : (
              <li>Nenhum gap bloqueante identificado na triagem técnica</li>
            )}
          </ul>
        </div>

        {/* Botão de Candidatura */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${tokens.colors.border}` }}>
          {vagaSelecionada.url_original ? (
            <a
              href={vagaSelecionada.url_original}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action-btn"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: tokens.colors.highlight,
                color: tokens.colors.background,
                fontWeight: tokens.typography.weights.bold,
                fontSize: tokens.typography.sizes.body,
                padding: '12px',
                borderRadius: tokens.radii.md,
                textDecoration: 'none',
                transition: tokens.transitions.default
              }}
            >
              Candidatar-se Oficialmente ↗
            </a>
          ) : (
            <button
              disabled
              style={{
                width: '100%',
                backgroundColor: tokens.colors.surfaceAlt,
                color: tokens.colors.textMuted,
                border: `1px solid ${tokens.colors.border}`,
                padding: '12px',
                borderRadius: tokens.radii.md,
                cursor: 'not-allowed'
              }}
            >
              Link de inscrição indisponível
            </button>
          )}
        </div>
      </div>
    </>
  );
}