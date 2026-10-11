import React from 'react';
import { LIMITE_ALTO, LIMITE_MEDIO, temScoreValido } from '../lib/vagas';

// Anel de nota: a única peça "de marca" da interface. Cor = severidade do match.
export default function ScoreRing({ score, size = 48, grande = false }) {
  const valido = temScoreValido(score);
  const n = valido ? Math.max(0, Math.min(100, Math.round(Number(score)))) : 0;
  const faixa = !valido ? 'nd' : n >= LIMITE_ALTO ? 'ok' : n >= LIMITE_MEDIO ? 'warn' : 'bad';
  const r = 20;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className={`nota nota-${faixa}${grande ? ' nota-lg' : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={valido ? `Match de ${n} por cento` : 'Sem nota de match'}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        <circle className="nota-track" cx="24" cy="24" r={r} />
        <circle
          className="nota-bar"
          cx="24"
          cy="24"
          r={r}
          strokeDasharray={`${(n / 100) * circ} ${circ}`}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="nota-num" aria-hidden="true">{valido ? n : '—'}</span>
    </div>
  );
}
