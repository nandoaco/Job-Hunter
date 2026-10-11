import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { LIMITE_ALTO } from '../lib/vagas';

export default function FiltrosChips({ filtros, aplicarFiltros, alternarFiltro, qtdAvancados, onAbrirFiltros }) {
  return (
    <div className="filtros">
      <button type="button" className="btn btn-filtros" onClick={onAbrirFiltros} aria-label="Abrir filtros">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Filtros</span>
        {qtdAvancados > 0 && <span className="badge-n">{qtdAvancados}</span>}
      </button>

      <div className="chips" role="group" aria-label="Filtros rápidos">
        <button
          type="button"
          className="chip"
          aria-pressed={filtros.scoreMin === LIMITE_ALTO}
          onClick={() => aplicarFiltros({ scoreMin: LIMITE_ALTO })}
        >
          Alta ({LIMITE_ALTO}+)
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={filtros.scoreMin === 0}
          onClick={() => aplicarFiltros({ scoreMin: 0 })}
        >
          Todas
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={filtros.modelo === 'Remoto'}
          onClick={() => alternarFiltro('modelo', 'Remoto')}
        >
          Remoto
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={filtros.modelo === 'Híbrido'}
          onClick={() => alternarFiltro('modelo', 'Híbrido')}
        >
          Híbrido
        </button>
      </div>
    </div>
  );
}
