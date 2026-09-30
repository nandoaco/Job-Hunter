import React from 'react';
import { renderBadgeStatus } from '../lib/vagas';

export default function FeedTable({ 
  vagasFiltradas, 
  vagaSelecionada, 
  setVagaSelecionada, 
  filtroNivel, 
  setFiltroNivel, 
  filtroAba, 
  setFiltroAba,
  loading 
}) {
  return (
    <div className="col-8" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '16px', border: '1px solid #28304f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc', textTransform: 'uppercase' }}>
            Feed ({vagasFiltradas.length})
          </span>
          {filtroAba !== 'TODAS' && (
            <button
              onClick={() => setFiltroAba('TODAS')}
              style={{ backgroundColor: '#28304f', color: '#38bdf8', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
            >
              Limpar filtro ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {['TODOS', 'ALTO', 'MEDIO'].map((nivel) => (
            <button
              key={nivel}
              onClick={() => setFiltroNivel(nivel)}
              style={{
                backgroundColor: filtroNivel === nivel ? '#00e5ff' : '#141829',
                color: filtroNivel === nivel ? '#0b1120' : '#94a3b8',
                border: '1px solid #28304f',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {nivel}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#00e5ff', fontSize: '13px' }}>
          ↻ Carregando dados operacionais...
        </div>
      ) : vagasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontSize: '13px' }}>
          Nenhuma vaga encontrada ainda.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #28304f', color: '#64748b', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 10px' }}>Cargo / Empresa</th>
                <th style={{ padding: '8px 10px' }}>Status</th>
                <th style={{ padding: '8px 10px' }}>Match</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vagasFiltradas.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => setVagaSelecionada(v)}
                  style={{ 
                    borderBottom: '1px solid #212742', 
                    cursor: 'pointer',
                    backgroundColor: vagaSelecionada?.id === v.id ? 'rgba(0, 229, 255, 0.08)' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '13px' }}>{v.titulo}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.empresa}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {renderBadgeStatus(v.status_candidatura, v.data_status)}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: (v.score_match >= 80) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: (v.score_match >= 80) ? '#10b981' : '#f59e0b',
                      border: `1px solid ${(v.score_match >= 80) ? '#10b981' : '#f59e0b'}`
                    }}>
                      {v.score_match}%
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {v.url_original ? (
                      <a
                        href={v.url_original}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: '#00e5ff',
                          color: '#0b1120',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        Abrir ↗
                      </a>
                    ) : (
                      <button
                        disabled
                        style={{
                          backgroundColor: '#28304f',
                          color: '#64748b',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'not-allowed'
                        }}
                      >
                        Sem link
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
