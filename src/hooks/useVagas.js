import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { DEMO_VAGAS } from '../data/demoVagas';
import { useStatusLocal } from './useStatusLocal';

export function useVagas() {
  const [vagasReais, setVagasReais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const [modoDemo, setModoDemo] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [vagaSelecionadaId, setVagaSelecionadaId] = useState(null);

  const { getHistoricoLocal, salvarHistoricoLocal } = useStatusLocal();

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

  const vagas = useMemo(() => {
    const base = modoDemo ? DEMO_VAGAS : vagasReais;
    const historico = getHistoricoLocal();

    return base.map((v) => {
      const infoLocal = historico[v.id] || {};
      return {
        ...v,
        status_candidatura: infoLocal.status || v.status_candidatura || 'NOVA',
        data_status: infoLocal.data || v.data_status || null,
        andamento_obs: infoLocal.obs || v.andamento_obs || ''
      };
    });
  }, [modoDemo, vagasReais, getHistoricoLocal]);

  const vagaSelecionada = useMemo(() => {
    if (vagas.length === 0) return null;
    const encontrada = vagas.find((v) => v.id === vagaSelecionadaId);
    return encontrada || vagas[0];
  }, [vagas, vagaSelecionadaId]);

  const alterarStatusVaga = useCallback((vagaId, novoStatus, obs = '') => {
    const agora = new Date().toLocaleString('pt-BR');
    const historico = getHistoricoLocal();
    historico[vagaId] = {
      status: novoStatus,
      data: agora,
      obs: obs
    };
    salvarHistoricoLocal(historico);

    if (modoDemo) {
      setModoDemo((prev) => !prev);
      setTimeout(() => setModoDemo(true), 0);
    } else {
      setVagasReais((prev) => [...prev]);
    }
  }, [getHistoricoLocal, salvarHistoricoLocal, modoDemo]);

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
    modoDemo,
    setModoDemo,
    ultimaAtualizacao,
    ultimaVagaCreatedAt,
    vagaSelecionada,
    setVagaSelecionada: (v) => setVagaSelecionadaId(v?.id || null),
    carregarVagas,
    alterarStatusVaga
  };
}