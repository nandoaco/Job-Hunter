import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filtroScore, setFiltroScore] = useState(0);
  const [termoBusca, setTermoBusca] = useState('');

  const fetchVagas = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      if (!supabase) {
        throw new Error('Configuração do Supabase ausente. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas na Vercel.');
      }

      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setVagas(data || []);
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);
      setErrorMsg(err.message || 'Falha ao conectar com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVagas();
  }, []);

  const vagasFiltradas = vagas.filter((v) => {
    const scoreValido = (v.score_match || 0) >= filtroScore;
    const matchBusca =
      (v.titulo || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
      (v.empresa || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
      (v.localizacao || '').toLowerCase().includes(termoBusca.toLowerCase());
    return scoreValido && matchBusca;
  });

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e293b', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
              Job Hunter SOC <span style={{ color: '#6366f1', fontSize: '13px', fontWeight: 'normal', backgroundColor: '#312e81', padding: '2px 8px', borderRadius: '4px' }}>v1.0</span>
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Triagem automatizada com IA Gemini e n8n para Blue Team & SOC
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchVagas} 
            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            🔄 Atualizar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Painel de Filtros */}
        <section style={{ backgroundColor: '#0f172a', padding: '18px 24px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px' }}>
            <input 
              type="text" 
              placeholder="Buscar por cargo, empresa ou cidade..." 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 14px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8' }}>Score Mínimo:</label>
            <select 
              value={filtroScore} 
              onChange={(e) => setFiltroScore(Number(e.target.value))}
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '9px 14px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
            >
              <option value={0}>Todos os scores</option>
              <option value={50}>≥ 50% (Média aderência)</option>
              <option value={75}>≥ 75% (Alta relevância)</option>
              <option value={85}>≥ 85% (Match perfeito)</option>
            </select>
          </div>
        </section>

        {/* Mensagem de Erro / Alerta */}
        {errorMsg && (
          <div style={{ backgroundColor: '#451a1a', border: '1px solid #b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#fca5a5' }}>
            <strong>Aviso de Conexão:</strong> {errorMsg}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
            <p>Consultando base de vagas no Supabase...</p>
          </div>
        )}

        {/* Lista Vazia */}
        {!loading && vagasFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px dashed #334155' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 6px 0' }}>Nenhuma vaga encontrada</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
              Se o seu n8n acabou de rodar, verifique se as linhas foram gravadas no Supabase e se o RLS (Row Level Security) da tabela "vagas" permite leitura.
            </p>
          </div>
        )}

        {/* Grid de Vagas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {vagasFiltradas.map((v) => {
            const score = v.score_match || 0;
            const corScore = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
            const fundoScore = score >= 80 ? 'rgba(16, 185, 129, 0.15)' : score >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';

            return (
              <div 
                key={v.id || Math.random()} 
                style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.2s' }}
              >
                <div>
                  {/* Topo do Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#f8fafc' }}>
                        {v.titulo || 'Cargo não informado'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        {v.empresa || 'Empresa Confidencial'} • <span style={{ color: '#cbd5e1' }}>{v.localizacao || 'Brasil'}</span>
                      </p>
                    </div>

                    <div style={{ backgroundColor: fundoScore, color: corScore, border: `1px solid ${corScore}`, padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
                      {score}%
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px' }}>
                      {v.modelo_trabalho || 'Não especificado'}
                    </span>
                    <span style={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px' }}>
                      {v.senioridade || 'Junior'}
                    </span>
                    {v.fonte && (
                      <span style={{ fontSize: '11px', backgroundColor: '#312e81', color: '#a5b4fc', padding: '3px 8px', borderRadius: '4px' }}>
                        {v.fonte}
                      </span>
                    )}
                  </div>

                  {/* Justificativa Técnica da IA */}
                  {v.justificativa && (
                    <div style={{ backgroundColor: '#1e293b/60', borderLeft: '3px solid #6366f1', padding: '10px 12px', borderRadius: '4px', marginBottom: '14px' }}>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                        "{v.justificativa}"
                      </p>
                    </div>
                  )}

                  {/* Pontos Fortes */}
                  {Array.isArray(v.pontos_fortes) && v.pontos_fortes.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#34d399', textTransform: 'uppercase' }}>Pontos Fortes:</span>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                        {v.pontos_fortes.slice(0, 3).map((pf, idx) => (
                          <li key={idx}>{pf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {Array.isArray(v.gaps) && v.gaps.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fb7185', textTransform: 'uppercase' }}>Gaps / Atenção:</span>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                        {v.gaps.slice(0, 2).map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Link */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                  <a 
                    href={v.url_original || v.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', backgroundColor: '#4f46e5', color: '#ffffff', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Ver Vaga Oficial ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
