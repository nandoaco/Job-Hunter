import React, { useMemo } from 'react';
import { calcularIngestao14Dias, formatarTempoRelativo, formatarHoraSP } from '../lib/vagas';

export default function KpiIngestao({ total, vagas, ultimaVagaCreatedAt, ultimaAtualizacao }) {
  const dados14Dias = useMemo(() => calcularIngestao14Dias(vagas), [vagas]);
  const tempoRelativo = useMemo(() => formatarTempoRelativo(ultimaVagaCreatedAt), [ultimaVagaCreatedAt]);
  const horaAtualizado = useMemo(() => formatarHoraSP(ultimaAtualizacao), [ultimaAtualizacao]);

  return (
    <div className="col-5" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Total Ingerido</span>
        <span style={{ fontSize: '11px', color: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
          {ultimaAtualizacao ? `Atualizado às ${horaAtualizado}` : 'Não consultado'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff' }}>{total}</div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          • Última vaga: <strong style={{ color: '#cbd5e1' }}>{tempoRelativo}</strong>
        </span>
      </div>
      
      {/* Gráfico Real: Últimos 14 Dias */}
      <div style={{ marginTop: '14px' }}>
        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
          Ingestão por dia (Últimos 14 dias)
        </span>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '75px', gap: '4px', marginTop: '6px', borderBottom: '1px solid #28304f', paddingBottom: '4px' }}>
          {dados14Dias.map((d, i) => (
            <div 
              key={i} 
              title={`${d.dataKey}: ${d.total} vaga(s)`}
              style={{ 
                flex: 1, 
                backgroundColor: d.total > 0 ? '#00e5ff' : '#28304f', 
                height: `${Math.max(d.alturaPct, 6)}%`, 
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.3s ease'
              }}
            ></div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
          <span>{dados14Dias[0]?.rotulo}</span>
          <span>{dados14Dias[6]?.rotulo}</span>
          <span>{dados14Dias[13]?.rotulo}</span>
        </div>
      </div>
    </div>
  );
}
