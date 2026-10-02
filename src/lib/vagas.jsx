import React from 'react';
import { tokens } from '../styles/tokens';

// Validação estrita se um score é numérico válido (0 é válido)
export function temScoreValido(score) {
  if (score === null || score === undefined || score === '') return false;
  const num = Number(score);
  return !Number.isNaN(num);
}

export function formatarScore(score) {
  if (!temScoreValido(score)) return '—';
  return `${Math.round(Number(score))}%`;
}

export function getScoreColors(score) {
  if (!temScoreValido(score)) {
    return {
      bg: 'rgba(148, 163, 184, 0.12)',
      color: tokens.colors.textMuted,
      border: 'rgba(148, 163, 184, 0.3)'
    };
  }

  const num = Number(score);
  if (num >= 80) {
    return {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: tokens.colors.green,
      border: 'rgba(16, 185, 129, 0.4)'
    };
  }
  if (num >= 60) {
    return {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: tokens.colors.yellow,
      border: 'rgba(245, 158, 11, 0.4)'
    };
  }
  return {
    bg: 'rgba(244, 63, 94, 0.15)',
    color: tokens.colors.red,
    border: 'rgba(244, 63, 94, 0.4)'
  };
}

export function renderBadgeStatus(status, dataStatus) {
  const st = (status || 'NOVA').toUpperCase();

  let bg = 'rgba(0, 229, 255, 0.12)';
  let color = tokens.colors.highlight;
  let border = 'rgba(0, 229, 255, 0.3)';
  let texto = '• Nova';

  if (st === 'EM_ANDAMENTO') {
    bg = 'rgba(56, 189, 248, 0.15)';
    color = tokens.colors.blue;
    border = 'rgba(56, 189, 248, 0.4)';
    texto = '⏳ Candidatado';
  } else if (st === 'ENTREVISTA') {
    bg = 'rgba(168, 85, 247, 0.15)';
    color = '#c084fc';
    border = 'rgba(168, 85, 247, 0.4)';
    texto = '🎙️ Entrevista';
  } else if (st === 'PROPOSTA') {
    bg = 'rgba(52, 211, 153, 0.2)';
    color = '#34d399';
    border = 'rgba(52, 211, 153, 0.5)';
    texto = '💼 Proposta';
  } else if (st === 'DISPENSADO') {
    bg = 'rgba(244, 63, 94, 0.15)';
    color = tokens.colors.red;
    border = 'rgba(244, 63, 94, 0.4)';
    texto = '✕ Dispensado';
  } else if (st === 'DESCARTADO') {
    bg = 'rgba(148, 163, 184, 0.12)';
    color = tokens.colors.textSecondary;
    border = 'rgba(148, 163, 184, 0.3)';
    texto = '🗑️ Descartada';
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: tokens.radii.sm,
          padding: '2px 8px',
          fontSize: tokens.typography.sizes.xs,
          fontWeight: tokens.typography.weights.semibold,
          width: 'fit-content'
        }}
      >
        {texto}
      </span>
      {dataStatus && (
        <span style={{ fontSize: '10px', color: tokens.colors.textMuted }}>
          {dataStatus}
        </span>
      )}
    </div>
  );
}

export function calcularEstatisticas(vagas = []) {
  const stats = {
    total: vagas.length,
    novas: 0,
    emAndamento: 0,
    dispensadas: 0,
    descartadas: 0,
    altas: 0,
    medias: 0,
    baixas: 0,
    totalComScore: 0,
    mediaScore: null
  };

  let somaScores = 0;

  vagas.forEach((v) => {
    const st = (v.status_candidatura || 'NOVA').toUpperCase();
    if (st === 'EM_ANDAMENTO') stats.emAndamento++;
    else if (st === 'DISPENSADO') stats.dispensadas++;
    else if (st === 'DESCARTADO') stats.descartadas++;
    else stats.novas++;

    if (temScoreValido(v.score_match)) {
      const scoreNum = Number(v.score_match);
      stats.totalComScore++;
      somaScores += scoreNum;

      if (scoreNum >= 80) stats.altas++;
      else if (scoreNum >= 60) stats.medias++;
      else stats.baixas++;
    }
  });

  if (stats.totalComScore > 0) {
    stats.mediaScore = Math.round(somaScores / stats.totalComScore);
  }

  return stats;
}

export function calcularIngestao14Dias(vagas = []) {
  const hoje = new Date();
  const dias = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const dataKey = d.toISOString().slice(0, 10);
    const rotulo = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    dias.push({ dataKey, rotulo, total: 0 });
  }

  const mapa = {};
  dias.forEach((item) => {
    mapa[item.dataKey] = item;
  });

  vagas.forEach((v) => {
    if (!v.created_at) return;
    const diaVaga = v.created_at.slice(0, 10);
    if (mapa[diaVaga]) {
      mapa[diaVaga].total += 1;
    }
  });

  const maxTotal = Math.max(...dias.map((d) => d.total), 1);
  return dias.map((d) => ({
    ...d,
    alturaPct: Math.round((d.total / maxTotal) * 100)
  }));
}

export function formatarTempoRelativo(isoDate) {
  if (!isoDate) return 'Sem registos';
  const agora = Date.now();
  const data = new Date(isoDate).getTime();
  const diffSegundos = Math.max(0, Math.floor((agora - data) / 1000));

  if (diffSegundos < 60) return `${diffSegundos}s atrás`;
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) return `${diffMinutos}m atrás`;
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  const diffDias = Math.floor(diffHoras / 24);
  return `${diffDias}d atrás`;
}

export function formatarHoraSP(timestamp) {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
}