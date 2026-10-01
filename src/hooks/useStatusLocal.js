import { useCallback } from 'react';

const STORAGE_KEY = 'jh_status_historico';

export function useStatusLocal() {
  const getHistoricoLocal = useCallback(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      return salvo ? JSON.parse(salvo) : {};
    } catch {
      return {};
    }
  }, []);

  const salvarHistoricoLocal = useCallback((novoHistorico) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novoHistorico));
    } catch (e) {
      console.error('Erro ao guardar histórico localmente:', e);
    }
  }, []);

  return { getHistoricoLocal, salvarHistoricoLocal };
}