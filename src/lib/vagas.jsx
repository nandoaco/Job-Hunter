import React from 'react';

// Cores e estilos dinâmicos de acordo com a pontuação de match
export function getScoreColors(score) {
  const valor = Number(score) || 0;
  if (valor >= 80) {
    return {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '#10b981'
    };
  }
  if (valor >= 60) {
    return {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: '#f59e0b'
    };
  }
  return {
    bg: 'rgba(244, 63, 94, 0.15)',
    color: '#f43f5e',
    border: '#f43f5e'
  };
}

// Emblema visual de status da vaga
export function renderBadgeStatus(status, data) {
  switch (status) {
    case 'EM_ANDAMENTO':
      return (
        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ⏳ Em Andamento {data ? `(${data})` : ''}
        </span>
      );
    case 'DISPENSADO':
      return (
        <span style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid #f43f5e', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ✕ Dispensado {data ? `(${data})` : ''}
        </span>
      );
    case 'DESCARTADO':
      return (
        <span style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid #94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🗑️ Descartada {data ? `(${data})` : ''}
        </span>
      );
    default:
      return (
        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          • Nova Oportunidade
        </span>
      );
  }
}

// Cálculo estatístico agregado para os cartões de topo
export function calcularEstatisticas(vagas = []) {
  const total = vagas.length;
  if (total === 0) {
    return {
      total: 0,
      altas: 0,
      medias: 0,
      baixas: 0,
      mediaScore: 0,
      novas: 0,
      emAndamento: 0,
      dispensadas: 0,
      descartadas: 0
    };
  }

  let somaScore = 0;
  let altas = 0;
  let medias = 0;
  let baixas = 0;

  let novas = 0;
  let emAndamento = 0;
  let dispensadas = 0;
  let descartadas = 0;

  vagas.forEach((v) => {
    const score = Number(v.score_match) || 0;
    somaScore += score;

    if (score >= 80) altas++;
    else if (score >= 60) medias++;
    else baixas++;

    const st = v.status_candidatura;
    if (st === 'EM_ANDAMENTO') emAndamento++;
    else if (st === 'DISPENSADO') dispensadas++;
    else if (st === 'DESCARTADO') descartadas++;
    else novas++;
  });

  return {
    total,
    altas,
    medias,
    baixas,
    mediaScore: Math.round(somaScore / total),
    novas,
    emAndamento,
    dispensadas,
    descartadas
  };
}

// Histórico de ingestão dos últimos 14 dias (Fuso de São Paulo)
export function calcularIngestao14Dias(vagas = []) {
  const dias = [];
  const hoje = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const dataKey = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const rotulo = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    dias.push({ dataKey, rotulo, total: 0 });
  }

  vagas.forEach((v) => {
    if (v.created_at) {
      const dataVaga = new Date(v.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const item = dias.find((d) => d.dataKey === dataVaga);
      if (item) {
        item.total++;
      }
    }
  });

  const maxTotal = Math.max(...dias.map((d) => d.total), 1);
  return dias.map((d) => ({
    ...d,
    alturaPct: Math.round((d.total / maxTotal) * 100)
  }));
}

// Formatador de tempo relativo
export function formatarTempoRelativo(dataIso) {
  if (!dataIso) return 'Sem registos';
  const agora = Date.now();
  const diffMin = Math.floor((agora - new Date(dataIso).getTime()) / 60000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Há ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  return `Há ${diffDias}d`;
}

// Formatador de hora em São Paulo
export function formatarHoraSP(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
}