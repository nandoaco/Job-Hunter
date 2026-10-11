import React, { useEffect } from 'react';

// Aviso rápido com ação opcional (ex.: "Desfazer"). Some sozinho em 6 segundos.
export default function Toast({ toast, onFechar }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onFechar, 6000);
    return () => clearTimeout(t);
  }, [toast, onFechar]);

  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast.msg}</span>
      {toast.acao && (
        <button
          type="button"
          onClick={() => {
            toast.onAcao?.();
            onFechar();
          }}
        >
          {toast.acao}
        </button>
      )}
    </div>
  );
}
