import React, { useState, useEffect, useRef } from 'react';
import { tokens } from '../styles/tokens';
import { getScoreColors } from '../lib/vagas';

export default function BuscaModal({ isOpen, onClose, vagas, onSelectVaga }) {
  const [busca, setBusca] = useState('');
  const [itemIndex, setItemIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const elementoAnteriorRef = useRef(null);

  // Armazena elemento focado antes de abrir o modal e devolve ao fechar
  useEffect(() => {
    if (isOpen) {
      elementoAnteriorRef.current = document.activeElement;
      setBusca('');
      setItemIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      elementoAnteriorRef.current?.focus?.();
    }
  }, [isOpen]);

  const resultados = React.useMemo(() => {
    if (!busca.trim()) return vagas.slice(0, 8);
    const termo = busca.toLowerCase();
    return vagas
      .filter((v) => (v.titulo || '').toLowerCase().includes(termo) || (v.empresa || '').toLowerCase().includes(termo))
      .slice(0, 8);
  }, [vagas, busca]);

  // Teclas Esc, Setas e Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setItemIndex((prev) => (prev < resultados.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setItemIndex((prev) => (prev > 0 ? prev - 1 : resultados.length - 1));
    } else if (e.key === 'Enter' && resultados[itemIndex]) {
      e.preventDefault();
      onSelectVaga(resultados[itemIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="busca-rapida-titulo"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 17, 32, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px'
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radii.lg,
          border: `1px solid ${tokens.colors.highlight}`,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border}` }}>
          <span style={{ color: tokens.colors.highlight, fontSize: '16px', marginRight: '10px' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            id="busca-rapida-titulo"
            placeholder="Buscar por cargo ou empresa... (Setas navegam, Enter seleciona)"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setItemIndex(0); }}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: tokens.colors.textPrimary, fontSize: tokens.typography.sizes.body }}
          />
          <kbd style={{ backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textSecondary, border: `1px solid ${tokens.colors.border}`, padding: '2px 6px', borderRadius: tokens.radii.sm, fontSize: tokens.typography.sizes.xs }}>
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {resultados.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: tokens.colors.textSecondary, fontSize: tokens.typography.sizes.body }}>
              Nenhuma vaga encontrada para "{busca}".
            </div>
          ) : (
            resultados.map((vaga, idx) => {
              const selecionado = idx === itemIndex;
              const scoreColors = getScoreColors(vaga.score_match);
              return (
                <div
                  key={vaga.id}
                  onClick={() => { onSelectVaga(vaga); onClose(); }}
                  onMouseEnter={() => setItemIndex(idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: tokens.radii.md,
                    backgroundColor: selecionado ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                    border: `1px solid ${selecionado ? tokens.colors.highlight : 'transparent'}`,
                    cursor: 'pointer',
                    transition: tokens.transitions.default
                  }}
                >
                  <div>
                    <div style={{ fontSize: tokens.typography.sizes.body, fontWeight: tokens.typography.weights.semibold, color: tokens.colors.textPrimary }}>
                      {vaga.titulo}
                    </div>
                    <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary }}>
                      {vaga.empresa} • {vaga.localizacao}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: tokens.radii.sm,
                    fontSize: tokens.typography.sizes.xs,
                    fontWeight: tokens.typography.weights.bold,
                    backgroundColor: scoreColors.bg,
                    color: scoreColors.color,
                    border: `1px solid ${scoreColors.border}`
                  }}>
                    {vaga.score_match}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}