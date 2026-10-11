import React, { useEffect, useRef } from 'react';

const FOCAVEIS = 'a[href], button:not([disabled]), input, select, summary, [tabindex]:not([tabindex="-1"])';

// Painel genérico: sobe de baixo no celular; lateral ou central no desktop.
export default function Sheet({ aberto, onClose, labelledBy, variante = 'lateral', children }) {
  const painelRef = useRef(null);

  // trava a rolagem da página e devolve o foco ao elemento de origem ao fechar
  useEffect(() => {
    if (!aberto) return undefined;
    const origem = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const painel = painelRef.current;
      // não rouba o foco se um campo de dentro já o recebeu (ex.: autoFocus do login)
      if (painel && !painel.contains(document.activeElement)) painel.focus();
    }, 30);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflowAnterior;
      if (origem && typeof origem.focus === 'function') origem.focus();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && painelRef.current) {
        const itens = Array.from(painelRef.current.querySelectorAll(FOCAVEIS));
        if (itens.length === 0) return;
        const primeiro = itens[0];
        const ultimo = itens[itens.length - 1];
        if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === painelRef.current)) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  if (!aberto) return null;

  return (
    <div className="sheet-root">
      <div className="sheet-overlay" onClick={onClose} />
      <div
        ref={painelRef}
        className={`sheet-panel sheet-${variante}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <span className="sheet-handle" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
