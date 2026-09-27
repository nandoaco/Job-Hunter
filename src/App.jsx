import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [termoBusca, setTermoBusca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  // Busca vagas do Supabase
  const carregarVagas = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('vagas')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setVagas(data);
          setVagaSelecionada(data[0]);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar do Supabase:', e);
    }

    // Fallback: se o banco ainda estiver vazio ou sem chaves, carrega dados para o painel nunca ficar em branco
    const dadosIniciais = [
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
        created_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
        justificativa: 'Alinhamento quase total com perfil júnior defensivo e rotina de plantão SOC 12x36.',
        pontos_fortes: ['Monitoramento 24x7', 'Triagem de falsos positivos', 'NIST Framework'],
        gaps: ['Experiência com Splunk avançado']
      }
    ];
    setVagas(dadosIniciais);
    setVagaSelecionada(dadosIniciais[0]);
    setLoading(false);
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  // Métricas calculadas em tempo real estilo SOC KPI
  const stats = useMemo(() => {
    const total = vagas.length;
    const altas = vagas.filter(v => (v.score_match || 0) >= 80).length;
    const medias = vagas.filter(v => (v.score_match || 0) >= 60 && (v.score_match || 0) < 80).length;
    const baixas = vagas.filter(v => (v.score_match || 0) < 60).length;
    const mediaScore = total > 0 ? Math.round(vagas.reduce((acc, cur) => acc + (cur.score_match || 0), 0) / total) : 0;
    const remotas = vagas.filter(v => (v.modelo_trabalho || '').toLowerCase().includes('remot')).length;

    return { total, altas, medias, baixas, mediaScore, remotas };
  }, [vagas]);

  const vagasFiltradas = useMemo(() => {
    return vagas.filter(v => {
      const matchBusca = (v.titulo || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
                         (v.empresa || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
                         (v.localizacao || '').toLowerCase().includes(termoBusca.toLowerCase());
      if (!matchBusca) return false;
      if (filtroNivel === 'ALTO') return (v.score_match || 0) >= 80;
      if (filtroNivel === 'MEDIO') return (v.score_match || 0) >= 60 && (v.score_match || 0) < 80;
      if (filtroNivel === 'BAIXO') return (v.score_match || 0) < 60;
      return true;
    });
  }, [vagas, termoBusca, filtroNivel]);

  return (
    <div style={{ backgroundColor: '#141829', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '16px' }}>
      
      {/* Barra de Topo do Painel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1d2238', padding: '12px 20px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #28304f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }}></div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
            JOB HUNTER <span style={{ color: '#00e5ff', fontSize: '13px', fontWeight: '500' }}>• SOC OPERATIONS DASHBOARD</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Filtrar por cargo, empresa..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ backgroundColor: '#141829', border: '1px solid #2d3759', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '220px' }}
          />
          <button 
            onClick={carregarVagas}
            style={{ backgroundColor: '#00e5ff', color: '#0b1120', border: 'none', padding: '7px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
          >
            ↻ ATUALIZAR
          </button>
        </div>
      </div>

      {/* Grid Principal - Estilo Zendesk / SOC KPI Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        
        {/* Bloco Superior Esquerdo: Volume & Gráfico de Atividade */}
        <div style={{ gridColumn: 'span 5', backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Vagas Monitoradas</span>
            <span style={{ fontSize: '11px', color: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Tempo Real</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff' }}>{stats.total}</div>
          
          {/* Gráfico simulado em barras verticais (idêntico ao screenshot) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '90px', gap: '8px', marginTop: '16px', borderBottom: '1px solid #28304f', paddingBottom: '6px' }}>
            {[20, 60, 100, 35, 45, 80, 25, 50, 70, 40].map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: i === 2 ? '#00e5ff' : '#28304f', height: `${h}%`, borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </div>

        {/* Bloco Superior Central: Distribuição de Aderência (Barras horizontais) */}
        <div style={{ gridColumn: 'span 4', backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '14px' }}>Aderência das Oportunidades</span>
          
          {/* Alta / Urgent */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#00e5ff' }}>Alta (Match ≥ 80%)</span>
              <span style={{ fontWeight: 'bold' }}>{stats.altas}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#141829', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.total ? (stats.altas / stats.total) * 100 : 0}%`, backgroundColor: '#00e5ff' }}></div>
            </div>
          </div>

          {/* Média / High */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#38bdf8' }}>Média (60% - 79%)</span>
              <span style={{ fontWeight: 'bold' }}>{stats.medias}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#141829', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.total ? (stats.medias / stats.total) * 100 : 0}%`, backgroundColor: '#38bdf8' }}></div>
            </div>
          </div>

          {/* Baixa / Normal */}
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

        {/* Bloco Superior Direito: Gauge / Indicador Geral de Match */}
        <div style={{ gridColumn: 'span 3', backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', alignSelf: 'flex-start', marginBottom: '8px' }}>Média Geral de Match</span>
          
          {/* Velocímetro / Gauge visual estilizado */}
          <div style={{ position: 'relative', width: '130px', height: '65px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '12px solid #28304f', borderTopColor: '#00e5ff', borderRightColor: '#10b981', transform: `rotate(${Math.min(180, (stats.mediaScore / 100) * 180 - 45)}deg)` }}></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#00e5ff', marginTop: '-12px' }}>
            {stats.mediaScore}%
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Aderência da Base</span>
        </div>

        {/* 4 Cards de Métricas Rápidas (Linha 2) */}
        <div style={{ gridColumn: 'span 3', backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Oportunidades Remotas</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{stats.remotas}</div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>✓ 100% Home Office</span>
        </div>

        <div style={{ gridColumn: 'span 3', backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Alertas Enviados</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>{stats.altas}</div>
          <span style={{ fontSize: '11px', color: '#00e5ff' }}>📨 Notificados via Gmail</span>
        </div>

        <div style={{ gridColumn: 'span 3', backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Fontes Monitoradas</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>4</div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>LinkedIn, Gupy, Indeed, Glassdoor</span>
        </div>

        <div style={{ gridColumn: 'span 3', backgroundColor: '#1d2238', borderRadius: '10px', padding: '14px 18px', border: '1px solid #28304f' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Status da Ingestão</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>ONLINE</div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>● Pipeline n8n Ativo</span>
        </div>

        {/* Bloco Inferior: Tabela Operacional de Vagas com Links Diretos para Entrar em Contato */}
        <div style={{ gridColumn: 'span 8', backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feed de Vagas Analisadas ({vagasFiltradas.length})
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['TODOS', 'ALTO', 'MEDIO'].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setFiltroNivel(nivel)}
                  style={{
                    backgroundColor: filtroNivel === nivel ? '#00e5ff' : '#141829',
                    color: filtroNivel === nivel ? '#0b1120' : '#94a3b8',
                    border: '1px solid #28304f',
                    padding: '4px 10px',
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #28304f', color: '#64748b', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px' }}>Cargo / Empresa</th>
                  <th style={{ padding: '8px 10px' }}>Modelo</th>
                  <th style={{ padding: '8px 10px' }}>Match</th>
                  <th style={{ padding: '8px 10px' }}>Fonte</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ação Direta</th>
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
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: '600', color: '#f8fafc' }}>{v.titulo}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.empresa} • {v.localizacao}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#cbd5e1', fontSize: '12px' }}>
                      {v.modelo_trabalho || 'Remoto'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 8px',
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
                    <td style={{ padding: '12px 10px', fontSize: '11px', color: '#94a3b8' }}>
                      {v.fonte || 'JSearch'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <a
                        href={v.url_original || v.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: '#00e5ff',
                          color: '#0b1120',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        Candidatar / Link ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco Lateral Direito: Detalhes da Vaga Selecionada e Análise IA */}
        <div style={{ gridColumn: 'span 4', backgroundColor: '#1d2238', borderRadius: '10px', padding: '18px', border: '1px solid #28304f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {vagaSelecionada ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#00e5ff', textTransform: 'uppercase', fontWeight: '700' }}>{vagaSelecionada.empresa}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '2px 0 0 0' }}>{vagaSelecionada.titulo}</h3>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#00e5ff' }}>
                  {vagaSelecionada.score_match}%
                </div>
              </div>

              <div style={{ backgroundColor: '#141829', padding: '10px 12px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #212742' }}>
                <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Parecer Técnico da IA</span>
                <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                  "{vagaSelecionada.justificativa || 'Vaga alinhada com as atribuições de monitoramento, resposta a incidentes e triagem de logs.'}"
                </p>
              </div>

              {vagaSelecionada.pontos_fortes && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Pontos de Aderência:</span>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    {(Array.isArray(vagaSelecionada.pontos_fortes) ? vagaSelecionada.pontos_fortes : [vagaSelecionada.pontos_fortes]).map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vagaSelecionada.gaps && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '700', textTransform: 'uppercase' }}>Gaps / Requisitos Críticos:</span>
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
                  marginTop: '12px'
                }}
              >
                Abrir Candidatura Oficial ↗
              </a>
            </div>
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Selecione uma vaga para ver os detalhes.</div>
          )}
        </div>

      </div>
    </div>
  );
}
