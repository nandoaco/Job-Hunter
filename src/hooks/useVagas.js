import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { DEMO_VAGAS } from '../data/demoVagas';
import { useStatusVagas } from './useStatusVagas';

export function useVagas(user) {
  const [vagasReais, setVagasReais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [vagaSelecionadaId, setVagaSelecionadaId] = useState(null);

  // Hook unificado de status (Supabase para utilizador autenticado, localStorage para visitante)
  const { mapaStatus, atualizarStatus, recarregarStatus, erroSincronizacao } = useStatusVagas(user);

  const carregarVagas = useCallback(async () => {
    setAtualizando(true);
    setErro(null);

    try {
      if (!supabase) {
        throw new Error('Cliente do Supabase não configurado ou variáveis ausentes.');
      }

      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw new Error(error.message || 'Falha ao consultar base de dados.');
      }

      setVagasReais(data || []);
      setUltimaAtualizacao(Date.now());
    } catch (e) {
      console.error('Erro de requisição ao carregar vagas:', e);
      setErro(e.message || 'Não foi possível carregar as vagas.');
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarVagas();
  }, [carregarVagas]);

  // Vagas combinadas com o status correspondente
  const vagas = useMemo(() => {
    const base = modoDemo ? DEMO_VAGAS : vagasReais;

    return base.map((v) => {
      const infoStatus = mapaStatus[v.id] || {};
      return {
        ...v,
        status_candidatura: infoStatus.status || v.status_candidatura || 'NOVA',
        data_status: infoStatus.data || v.data_status || null,
        andamento_obs: infoStatus.obs || v.andamento_obs || ''
      };
    });
  }, [modoDemo, vagasReais, mapaStatus]);

  const vagaSelecionada = useMemo(() => {
    if (vagas.length === 0) return null;
    const encontrada = vagas.find((v) => v.id === vagaSelecionadaId);
    return encontrada || vagas[0];
  }, [vagas, vagaSelecionadaId]);

  const alterarStatusVaga = useCallback((vagaId, novoStatus, obs = '') => {
    atualizarStatus(vagaId, novoStatus, obs);
  }, [atualizarStatus]);

  const ultimaVagaCreatedAt = useMemo(() => {
    if (!vagas || vagas.length === 0) return null;
    const timestamps = vagas
      .map((v) => (v.created_at ? new Date(v.created_at).getTime() : 0))
      .filter((t) => t > 0);
    return timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;
  }, [vagas]);

  return {
    vagas,
    loading,
    atualizando,
    erro,
    erroSincronizacao,
    modoDemo,
    setModoDemo,
    ultimaAtualizacao,
    ultimaVagaCreatedAt,
    vagaSelecionada,
    setVagaSelecionada: (v) => setVagaSelecionadaId(v?.id || null),
    carregarVagas,
    alterarStatusVaga,
    recarregarStatus
  };
}