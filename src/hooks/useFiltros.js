import { useState, useMemo, useEffect, useCallback } from 'react';

const FILTROS_INICIAIS = {
  texto: '',
  faixa: 'TODOS', // 'TODOS' | 'ALTO' | 'MEDIO' | 'BAIXO'
  scoreMin: 0,
  modelo: 'TODOS',
  fonte: 'TODOS',
  localizacao: 'TODAS',
  periodo: 'TODOS', // '7' | '14' | '30' | 'TODOS'
  dataDia: null, // string DD/MM/AAAA para filtro por clique no gráfico
  status: 'TODAS', // 'TODAS' | 'EM_ANDAMENTO' | 'DISPENSADO' | 'DESCARTADO' | 'NOVA'
  ordenacao: 'RECENTES' // 'RECENTES' | 'SCORE'
};

export function useFiltros(vagas) {
  // Lê filtros iniciais a partir da URL
  const lerFiltrosDaUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        texto: params.get('q') || '',
        faixa: ['TODOS', 'ALTO', 'MEDIO', 'BAIXO'].includes(params.get('faixa')) ? params.get('faixa') : 'TODOS',
        scoreMin: Number(params.get('scoreMin')) >= 0 && Number(params.get('scoreMin')) <= 100 ? Number(params.get('scoreMin')) : 0,
        modelo: params.get('modelo') || 'TODOS',
        fonte: params.get('fonte') || 'TODOS',
        localizacao: params.get('localizacao') || 'TODAS',
        periodo: ['7', '14', '30', 'TODOS'].includes(params.get('periodo')) ? params.get('periodo') : 'TODOS',
        dataDia: params.get('dataDia') || null,
        status: ['TODAS', 'EM_ANDAMENTO', 'DISPENSADO', 'DESCARTADO', 'NOVA'].includes(params.get('status')) ? params.get('status') : 'TODAS',
        ordenacao: ['RECENTES', 'SCORE'].includes(params.get('ordem')) ? params.get('ordem') : 'RECENTES'
      };
    } catch {
      return FILTROS_INICIAIS;
    }
  };

  const [filtros, setFiltros] = useState(lerFiltrosDaUrl);

  // Sincroniza estado com a URL sem recarregar a página
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.texto) params.set('q', filtros.texto);
    if (filtros.faixa !== 'TODOS') params.set('faixa', filtros.faixa);
    if (filtros.scoreMin > 0) params.set('scoreMin', filtros.scoreMin.toString());
    if (filtros.modelo !== 'TODOS') params.set('modelo', filtros.modelo);
    if (filtros.fonte !== 'TODOS') params.set('fonte', filtros.fonte);
    if (filtros.localizacao !== 'TODAS') params.set('localizacao', filtros.localizacao);
    if (filtros.periodo !== 'TODOS') params.set('periodo', filtros.periodo);
    if (filtros.dataDia) params.set('dataDia', filtros.dataDia);
    if (filtros.status !== 'TODAS') params.set('status', filtros.status);
    if (filtros.ordenacao !== 'RECENTES') params.set('ordem', filtros.ordenacao);

    const novoQuery = params.toString();
    const novaUrl = novoQuery ? `${window.location.pathname}?${novoQuery}` : window.location.pathname;
    window.history.replaceState(null, '', novaUrl);
  }, [filtros]);

  const atualizarFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const alternarFiltro = useCallback((campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: prev[campo] === valor ? (campo === 'faixa' || campo === 'modelo' || campo === 'fonte' ? 'TODOS' : campo === 'status' ? 'TODAS' : null) : valor
    }));
  }, []);

  const limparTodosFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
  }, []);

  // Extrai valores únicos presentes nos dados atuais
  const opcoesUnicas = useMemo(() => {
    const modelos = new Set();
    const fontes = new Set();
    const locais = new Set();

    vagas.forEach((v) => {
      if (v.modelo_trabalho) modelos.add(v.modelo_trabalho.trim());
      if (v.fonte) fontes.add(v.fonte.trim());
      if (v.localizacao) locais.add(v.localizacao.trim());
    });

    return {
      modelos: Array.from(modelos).sort(),
      fontes: Array.from(fontes).sort(),
      locais: Array.from(locais).sort()
    };
  }, [vagas]);

  // Lista filtrada e ordenada
  const vagasFiltradas = useMemo(() => {
    const agora = Date.now();

    return vagas
      .filter((v) => {
        // Texto
        if (filtros.texto) {
          const termo = filtros.texto.toLowerCase();
          const matchTexto =
            (v.titulo || '').toLowerCase().includes(termo) ||
            (v.empresa || '').toLowerCase().includes(termo) ||
            (v.localizacao || '').toLowerCase().includes(termo);
          if (!matchTexto) return false;
        }

        // Faixa de match (>=80, 60-79, <60)
        const score = v.score_match || 0;
        if (filtros.faixa === 'ALTO' && score < 80) return false;
        if (filtros.faixa === 'MEDIO' && (score < 60 || score >= 80)) return false;
        if (filtros.faixa === 'BAIXO' && score >= 60) return false;

        // Score Mínimo
        if (score < filtros.scoreMin) return false;

        // Modalidade
        if (filtros.modelo !== 'TODOS' && v.modelo_trabalho !== filtros.modelo) return false;

        // Fonte
        if (filtros.fonte !== 'TODOS' && v.fonte !== filtros.fonte) return false;

        // Localização
        if (filtros.localizacao !== 'TODAS' && v.localizacao !== filtros.localizacao) return false;

        // Status
        if (filtros.status !== 'TODAS') {
          if (filtros.status === 'NOVA' && (v.status_candidatura && v.status_candidatura !== 'NOVA')) return false;
          if (filtros.status !== 'NOVA' && v.status_candidatura !== filtros.status) return false;
        }

        // Período (7, 14, 30 dias baseado em created_at)
        if (filtros.periodo !== 'TODOS' && v.created_at) {
          const diasLimite = Number(filtros.periodo);
          const diffDias = (agora - new Date(v.created_at).getTime()) / 86400000;
          if (diffDias > diasLimite) return false;
        }

        // Filtro específico de data por clique no gráfico (DD/MM/AAAA em America/Sao_Paulo)
        if (filtros.dataDia && v.created_at) {
          const dataVagaSP = new Date(v.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          if (dataVagaSP !== filtros.dataDia) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filtros.ordenacao === 'SCORE') {
          return (b.score_match || 0) - (a.score_match || 0);
        }
        // Padrão: Mais recentes primeiro
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [vagas, filtros]);

  return {
    filtros,
    vagasFiltradas,
    opcoesUnicas,
    atualizarFiltro,
    alternarFiltro,
    limparTodosFiltros
  };
}