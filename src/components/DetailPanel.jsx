import React from 'react';
import { renderBadgeStatus } from '../lib/vagas';

export default function DetailPanel({ vagaSelecionada, alterarStatusVaga }) {
  return (
    <div className="col-4" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '16px', border: '1px solid #28304f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {vagaSelecionada ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#00e5ff', textTransform: 'uppercase', fontWeight: '700' }}>{vagaSelecionada.empresa}</span>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: '2px 0 0 0' }}>{vagaSelecionada.titulo}</h3>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{vagaSelecionada.localizacao}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#00e5ff' }}>
              {vagaSelecionada.score_match}%
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            {renderBadgeStatus(vagaSelecionada.status_candidatura, vagaSelecionada.data_status)}
          </div>

          <div style={{ backgroundColor: '#141829', padding: '10px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #28304f' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Atualizar Situação:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'EM_ANDAMENTO', 'Candidatura enviada via portal')}
                style={{ flex: 1, minWidth: '90px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ⏳ Candidatado
              </button>
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'DISPENSADO', 'Feedback negativo / processo encerrado')}
                style={{ flex: 1, minWidth: '90px', backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid #f43f5e', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✖ Dispensado
              </button>
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'DESCARTADO', 'Vaga expirada ou fora do escopo')}
                style={{ flex: 1, minWidth: '90px', backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid #64748b', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗑️ Descartar
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#141829', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #212742' }}>
            <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Parecer Técnico da IA</span>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.4', fontStyle: 'italic' }}>
              "{vagaSelecionada.justificativa || 'Vaga alinhada com as atribuições de monitoramento, resposta a incidentes e triagem de logs.'}"
            </p>
          </div>

          {vagaSelecionada.pontos_fortes && (
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Pontos de Aderência:</span>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                {(Array.isArray(vagaSelecionada.pontos_fortes) ? vagaSelecionada.pontos_fortes : [vagaSelecionada.pontos_fortes]).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {vagaSelecionada.gaps && (
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', color: '#f43f5e', fontWeight: '700', textTransform: 'uppercase' }}>Gaps / Atenção:</span>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                {(Array.isArray(vagaSelecionada.gaps) ? vagaSelecionada.gaps : [vagaSelecionada.gaps]).map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {vagaSelecionada.url_original ? (
            <a
              href={vagaSelecionada.url_original}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#00e5ff',
                color: '#0b1120',
                padding: '10px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                textDecoration: 'none',
                marginTop: '10px'
              }}
            >
              Candidatar-se Oficialmente ↗
            </a>
          ) : (
            <button
              disabled
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#28304f',
                color: '#64748b',
                padding: '10px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                marginTop: '10px',
                cursor: 'not-allowed'
              }}
            >
              Link Indisponível
            </button>
          )}
        </div>
      ) : (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '30px 0' }}>Selecione uma vaga para ver os detalhes.</div>
      )}
    </div>
  );
}
