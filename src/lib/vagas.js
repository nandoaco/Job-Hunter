import React from 'react';

export function calcularEstatisticas(vagas) {
  const total = vagas.length;
  const emAndamento = vagas.filter((v) => v.status_candidatura === 'EM_ANDAMENTO').length;
  const dispensadas = vagas.filter((v) => v.status_candidatura === 'DISPENSADO').length;
  const descartadas = vagas.filter((v) => v.status_candidatura === 'DESCARTADO').length;
  const altas = vagas.filter((v) => (v.score_match || 0) >= 80).length;
  const medias = vagas.filter((v) => (v.score_match || 0) >= 60 && (v.score_match || 0) < 80).length;
  const baixas = vagas.filter((v) => (v.score_match || 0) < 60).length;
  const mediaScore = total > 0 ? Math.round(vagas.reduce((acc, cur) => acc + (cur.score_match || 0), 0) / total) : 0;

  return { total, emAndamento, dispensadas, descartadas, altas, medias, baixas, mediaScore };
}

// Converte e agrupa as vagas ingeridas por dia nos últimos 14 dias no fuso America/Sao_Paulo
export function calcularIngestao14Dias(vagas) {
  const dias = [];
  const hoje = new Date();

  // Gera as 14 chaves de data (do dia mais antigo ao mais recente)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 86400000);
    const dataSP = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const rotuloCurto = dataSP.slice(0, 5); // DD/MM
    dias.push({ dataKey: dataSP, rotulo: rotuloCurto, total: 0 });
  }

  // Contabiliza cada vaga na sua respectiva data de São Paulo
  vagas.forEach((v) => {
    if (!v.created_at) return;
    try {
      const dataVagaSP = new Date(v.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const diaObj = dias.find((d) => d.dataKey === dataVagaSP);
      if (diaObj) {
        diaObj.total += 1;
      }
    } catch {
      // Ignora datas inválidas
    }
  });

  const maxTotal = Math.max(...dias.map((d) => d.total), 1);
  return dias.map((d) => ({
    ...d,
    alturaPct: Math.round((d.total / maxTotal) * 100)
  }));
}

// Calcula texto relativo "há X minutos/horas/dias" para a vaga mais recente
export function formatarTempoRelativo(created_at) {
  if (!created_at) return 'Nenhuma';
  try {
    const diffMs = Date.now() - new Date(created_at).getTime();
    if (diffMs < 0) return 'Agora';
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'há poucos segundos';
    if (minutos < 60) return `há ${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas}h`;
    const dias = Math.floor(horas / 24);
    return `há ${dias}d`;
  } catch {
    return 'Desconhecido';
  }
}

// Formata timestamp em horário HH:MM de São Paulo
export function formatarHoraSP(timestamp) {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function renderBadgeStatus(status, data) {
  switch (status) {
    case 'EM_ANDAMENTO':
      return (
        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          ⏳ Em Andamento {data ? `(${data})` : ''}
        </span>
      );
    case 'DISPENSADO':
      return (
        <span style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid #f43f5e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          ✖ Dispensado {data ? `(${data})` : ''}
        </span>
      );
    case 'DESCARTADO':
      return (
        <span style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid #64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          🗑️ Descartada {data ? `(${data})` : ''}
        </span>
      );
    default:
      return (
        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          ● Nova Oportunidade
        </span>
      );
  }
}
