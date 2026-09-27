import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroAba, setFiltroAba] = useState('TODAS'); // 'TODAS' | 'EM_ANDAMENTO' | 'DISPENSADO' | 'DESCARTADO'
  const [termoBusca, setTermoBusca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState(null);

  // Carrega status salvo localmente para manter histórico
  const getHistoricoLocal = () => {
    try {
      const salvo = localStorage.getItem('job_hunter_status_vagas');
      return salvo ? JSON.parse(salvo) : {};
    } catch {
      return {};
    }
  };

  const salvarHistoricoLocal = (historico) => {
    try {
      localStorage.setItem('job_hunter_status_vagas', JSON.stringify(historico));
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }
  };

  // Busca vagas do Supabase com fallback seguro
  const carregarVagas = async () => {
    setAtualizando(true);
    const historico = getHistoricoLocal();

    try {
      let dados = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('vagas')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          dados = data;
        }
      }

      if (dados.length === 0) {
        dados = [
          {
            id: '1',
            titulo: 'Analista de SOC Júnior',
            empresa: 'CyberShield Brasil',
            localizacao: 'São Paulo, SP (Híbrido)',
            modelo_trabalho: 'Híbrido',
            score_match: 88,
            nivel_aderencia: 'ALTO',
            fonte: 'LinkedIn',
            url_original: 'https://linkedin.com',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            justificativa: 'Forte aderência em monitoramento de alertas em SIEM, análise de logs Linux/Windows e resposta a incidentes.',
            pontos_fortes: ['Conhecimento prático em Linux', 'Análise de Logs', 'Foco em Blue Team'],
            gaps: ['Inglês avançado']
          },
          {
            id: '2',
            titulo: 'Analista de Segurança da Informação Jr',
            empresa: 'FinTech Secure',
            localizacao: 'Remoto',
            modelo_trabalho: 'Remoto',
            score_match: 75,
            nivel_aderencia: 'MEDIO',
            fonte: 'Gupy',
            url_original: 'https://gupy.io',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            justificativa: 'Perfil compatível com rotinas de triagem N1, gestão de vulnerabilidades e regras de firewall.',
            pontos_fortes: ['Fundamentos de redes', 'Firewall e WAF'],
            gaps: ['Certificação CompTIA Security+']
          },
          {
            id: '3',
            titulo: 'Operador de Monitoramento SOC N1',
            empresa: 'Global Cyber Tech',
            localizacao: 'Remoto',
            modelo_trabalho: 'Remoto',
            score_match: 92,
            nivel_aderencia: 'ALTO',
            fonte: 'Indeed',
            url_original: 'https://indeed.com',
            created_at: new Date(Date.now() - 14400000).toISOString(),
            justificativa: 'Alinhamento com perfil júnior defensivo e rotina de plantão de monitoramento contínuo.',
            pontos_fortes: ['Monitoramento 24x7', 'Triagem de falsos positivos', 'NIST Framework'],
            gaps: ['Experiência com Splunk avançado']
          }
        ];
      }

      const vagasComStatus = dados.map((v) => {
        const infoLocal = historico[v.id] || {};
        return {
          ...v,
          status_candidatura: infoLocal.status || v.status_candidatura || 'NOVA',
          data_status: infoLocal.data || v.data_status || null,
          andamento_obs: infoLocal.obs || v.andamento_obs || ''
        };
      });

      setVagas(vagasComStatus);
      if (!vagaSelecionada && vagasComStatus.length > 0) {
        setVagaSelecionada(vagasComStatus[0]);
      } else if (vagaSelecionada) {
        const atual = vagasComStatus.find((x) => x.id === vagaSelecionada.id);
        if (atual) setVagaSelecionada(atual);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  const alterarStatusVaga = (vagaId, novoStatus, obs = '') => {
    const agora = new Date().toLocaleString('pt-BR');
    const historico = getHistoricoLocal();
    historico[vagaId] = {
      status: novoStatus,
      data: agora,
      obs: obs
    };
    salvarHistoricoLocal(historico);

    setVagas((prev) =>
      prev.map((v) => {
        if (v.id === vagaId) {
          const atualizada = {
            ...v,
            status_candidatura: novoStatus,
            data_status: agora,
            andamento_obs: obs
          };
          if (vagaSelecionada?.id === vagaId) {
            setVagaSelecionada(atualizada);
          }
          return atualizada;
        }
        return v;
      })
    );
  };

  const stats = useMemo(() => {
    const total = vagas.length;
    const emAndamento = vagas.filter((v) => v.status_candidatura === 'EM_ANDAMENTO').length;
    const dispensadas = vagas.filter((v) => v.status_candidatura === 'DISPENSADO').length;
    const descartadas = vagas.filter((v) => v.status_candidatura === 'DESCARTADO').length;
    const altas = vagas.filter((v) => (v.score_match || 0) >= 80).length;
    const medias = vagas.filter((v) => (v.score_match || 0) >= 60 && (v.score_match || 0) < 80).length;
    const baixas = vagas.filter((v) => (v.score_match || 0) < 60).length;
    const mediaScore = total > 0 ? Math.round(vagas.reduce((acc, cur) => acc + (cur.score_match || 0), 0) / total) : 0;

    return { total, emAndamento, dispensadas, descartadas, altas, medias, baixas, mediaScore };
  }, [vagas]);

  const vagasFiltradas = useMemo(() => {
    return vagas.filter((v) => {
      const matchBusca =
        (v.titulo || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
        (v.empresa || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
        (v.localizacao || '').toLowerCase().includes(termoBusca.toLowerCase());

      if (!matchBusca) return false;

      if (filtroAba === 'EM_ANDAMENTO' && v.status_candidatura !== 'EM_ANDAMENTO') return false;
      if (filtroAba === 'DISPENSADO' && v.status_candidatura !== 'DISPENSADO') return false;
      if (filtroAba === 'DESCARTADO' && v.status_candidatura !== 'DESCARTADO') return false;

      if (filtroNivel === 'ALTO') return (v.score_match || 0) >= 80;
      if (filtroNivel === 'MEDIO') return (v.score_match || 0) >= 60 && (v.score_match || 0) < 80;
      if (filtroNivel === 'BAIXO') return (v.score_match || 0) < 60;

      return true;
    });
  }, [vagas, termoBusca, filtroNivel, filtroAba]);

  const renderBadgeStatus = (status, data) => {
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
  };

  return (
    <div style={{ backgroundColor: '#141829', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '12px' }}>
      
      {/* Estilos Responsivos Globais Injetados */}
      <style>{`
        * { box-sizing: border-box; }
        .grid-dashboard {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
        }
        .col-5 { grid-column: span 5; }
        .col-4 { grid-column: span 4; }
        .col-3 { grid-column: span 3; }
        .col-8 { grid-column: span 8; }
        .header-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          width: auto;
        }
        .search-input {
          width: 220px;
        }

        /* Regras para Celular e Telas Menores que 900px */
        @media (max-width: 900px) {
          .col-5, .col-4, .col-3, .col-8 {
            grid-column: span 12 !important;
          }
          .header-box {
            flex-direction: column;
            align-items: stretch !important;
          }
          .header-controls {
            width: 100% !important;
          }
          .search-input {
            flex: 1 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="header-box" style={{ backgroundColor: '#1d2238', padding: '14px 18px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #28304f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }}></div>
          <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
            JOB HUNTER <span style={{ color: '#00e5ff', fontSize: '12px', fontWeight: '500' }}>• SOC OPERATIONS</span>
          </h1>
        </div>

        <div className="header-controls">
          <input 
            type="text" 
            placeholder="Buscar vaga, empresa..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="search-input"
            style={{ backgroundColor: '#141829', border: '1px solid #2d3759', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
          />
          <button 
            onClick={carregarVagas}
            disabled={atualizando}
            style={{ 
              backgroundColor: atualizando ? '#64748b' : '#00e5ff', 
              color: '#0b1120', 
              border: 'none', 
              padding: '8px 14px', 
              borderRadius: '6px', 
              fontWeight: '700', 
              fontSize: '12px', 
              cursor: atualizando ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {atualizando ? '↻ ...' : '↻ ATUALIZAR'}
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid-dashboard">
        
        {/* Bloco 1: Total & Gráfico */}
        <div className="col-5" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Total Ingerido</span>
            <span style={{ fontSize: '11px', color: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Tempo Real</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff' }}>{stats.total}</div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '80px', gap: '6px', marginTop: '14px', borderBottom: '1px solid #28304f', paddingBottom: '6px' }}>
            {[20, 60, 100, 35, 45, 80, 25, 50, 70, 40].map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: i === 2 ? '#00e5ff' : '#28304f', height: `${h}%`, borderRadius: '3px 3px 0 0' }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </div>

        {/* Bloco 2: Aderência */}
        <div className="col-4" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '14px' }}>Aderência das Vagas</span>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#00e5ff' }}>Alta (Match ≥ 80%)</span>
              <span style={{ fontWeight: 'bold' }}>{stats.altas}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#141829', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.total ? (stats.altas / stats.total) * 100 : 0}%`, backgroundColor: '#00e5ff' }}></div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#38bdf8' }}>Média (60% - 79%)</span>
              <span style={{ fontWeight: 'bold' }}>{stats.medias}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#141829', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.total ? (stats.medias / stats.total) * 100 : 0}%`, backgroundColor: '#38bdf8' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Baixa (&lt; 60%)</span>
              <span style={{ fontWeight: 'bold' }}>{stats.baixas}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#141829', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.total ? (stats.baixas / stats.total) * 100 : 0}%`, backgroundColor: '#64748b' }}></div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Velocímetro / Match Geral */}
        <div className="col-3" style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', alignSelf: 'flex-start', marginBottom: '6px' }}>Média de Fit Técnico</span>
          
          <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '10px solid #28304f', borderTopColor: '#00e5ff', borderRightColor: '#10b981', transform: `rotate(${Math.min(180, (stats.mediaScore / 100) * 180 - 45)}deg)` }}></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#00e5ff', marginTop: '-10px' }}>
            {stats.mediaScore}%
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Índice Médio</span>
        </div>

        {/* Linha de Cards de Gestão */}
        <div 
          onClick={() => setFiltroAba(filtroAba === 'EM_ANDAMENTO' ? 'TODAS' : 'EM_ANDAMENTO')}
          className="col-4"
          style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: `1px solid ${filtroAba === 'EM_ANDAMENTO' ? '#38bdf8' : '#28304f'}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: '700' }}>⏳ Em Andamento</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Filtrar ↗</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{stats.emAndamento}</div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Candidaturas ativas</span>
        </div>

        <div 
          onClick={() => setFiltroAba(filtroAba === 'DISPENSADO' ? 'TODAS' : 'DISPENSADO')}
          className="col-4"
          style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: `1px solid ${filtroAba === 'DISPENSADO' ? '#f43f5e' : '#28304f'}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#f43f5e', textTransform: 'uppercase', fontWeight: '700' }}>✖ Dispensados</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Filtrar ↗</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{stats.dispensadas}</div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Processos encerrados</span>
        </div>

        <div 
          onClick={() => setFiltroAba(filtroAba === 'DESCARTADO' ? 'TODAS' : 'DESCARTADO')}
          className="col-4"
          style={{ backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: `1px solid ${filtroAba === 'DESCARTADO' ? '#94a3b8' : '#28304f'}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>🗑️ Descartadas</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Filtrar ↗</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{stats.descartadas}</div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Vagas preenchidas</span>
        </div>

        {/* Feed Operacional de Vagas */}
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
                      <a
                        href={v.url_original || v.url || '#'}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalhe da Vaga Selecionada */}
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

              {/* Botões de Ação de Situação */}
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

              {/* Parecer da IA */}
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

              <a
                href={vagaSelecionada.url_original || vagaSelecionada.url || '#'}
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
            </div>
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '30px 0' }}>Selecione uma vaga para ver os detalhes.</div>
          )}
        </div>

      </div>
    </div>
  );
}
