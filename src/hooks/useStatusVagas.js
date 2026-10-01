import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useStatusLocal } from './useStatusLocal';

export function useStatusVagas(user) {
  const { getHistoricoLocal, salvarHistoricoLocal } = useStatusLocal();
  const [mapaStatus, setMapaStatus] = useState({});
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [erroSincronizacao, setErroSincronizacao] = useState(null);
  const mapaAnteriorRef = useRef({});

  // Carrega status da fonte correspondente (Supabase se logado; localStorage se visitante)
  const carregarStatus = useCallback(async () => {
    if (user && supabase) {
      setCarregandoStatus(true);
      setErroSincronizacao(null);
      try {
        const { data, error } = await supabase
          .from('vaga_status')
          .select('vaga_id, status, atualizado_em')
          .eq('user_id', user.id);

        if (error) throw error;

        const novoMapa = {};
        (data || []).forEach((item) => {
          novoMapa[item.vaga_id] = {
            status: item.status,
            data: new Date(item.atualizado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            obs: ''
          };
        });

        setMapaStatus(novoMapa);
        mapaAnteriorRef.current = novoMapa;
      } catch (err) {
        console.error('Erro ao ler vaga_status do Supabase:', err);
        setErroSincronizacao('Não foi possível sincronizar com o banco.');
      } finally {
        setCarregandoStatus(false);
      }
    } else {
      // Visitante: lê do localStorage
      const local = getHistoricoLocal();
      setMapaStatus(local);
      mapaAnteriorRef.current = local;
      setCarregandoStatus(false);
    }
  }, [user, getHistoricoLocal]);

  useEffect(() => {
    carregarStatus();
  }, [carregarStatus]);

  // Atualização otimista de status
  const atualizarStatus = useCallback(async (vagaId, novoStatus, obs = '') => {
    const dataHoraFormatada = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const estadoAnterior = { ...mapaStatus };

    // 1. Atualização Otimista no estado visual da aplicação
    const atualizado = {
      ...mapaStatus,
      [vagaId]: {
        status: novoStatus,
        data: dataHoraFormatada,
        obs: obs
      }
    };
    setMapaStatus(atualizado);

    // 2. Persistência
    if (user && supabase) {
      try {
        const payload = {
          user_id: user.id,
          vaga_id: vagaId,
          status: novoStatus,
          atualizado_em: new Date().toISOString()
        };

        const { error } = await supabase
          .from('vaga_status')
          .upsert(payload, { onConflict: 'user_id, vaga_id' });

        if (error) throw error;
        mapaAnteriorRef.current = atualizado;
      } catch (err) {
        console.error('Falha ao persistir status no Supabase, revertendo:', err);
        // Rollback otimista imediato
        setMapaStatus(estadoAnterior);
        setErroSincronizacao('Erro ao salvar no banco. A alteração foi desfeita.');
        setTimeout(() => setErroSincronizacao(null), 4000);
      }
    } else {
      // Visitante persiste no localStorage
      salvarHistoricoLocal(atualizado);
      mapaAnteriorRef.current = atualizado;
    }
  }, [mapaStatus, user, salvarHistoricoLocal]);

  return {
    mapaStatus,
    carregandoStatus,
    erroSincronizacao,
    atualizarStatus,
    recarregarStatus: carregarStatus
  };
}