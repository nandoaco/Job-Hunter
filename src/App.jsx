import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './styles/app.css';
import { useAuth } from './hooks/useAuth';
import { useVagas } from './hooks/useVagas';
import { useFiltros } from './hooks/useFiltros';
import { calcularEstatisticas, LIMITE_ALTO } from './lib/vagas';
import TopBar from './components/TopBar';
import ResumoBar from './components/ResumoBar';
import FiltrosChips from './components/FiltrosChips';
import FiltrosSheet from './components/FiltrosSheet';
import FeedCards from './components/FeedCards';
import DetailPanel from './components/DetailPanel';
import BuscaModal from './components/BuscaModal';
import LoginModal from './components/LoginModal';
import ImportadorStatusBanner from './components/ImportadorStatusBanner';
import Toast from './components/Toast';

export default function App() {
  const { user, loadingAuth, enviando, mensagemAuth, setMensagemAuth, loginComSenha, logout } = useAuth();

  const {
    vagas,
    loading,
    atualizando,
    erro,
    erroSincronizacao,
    modoDemo,
    visitante,
    setModoDemo,
    vagaSelecionada,
    setVagaSelecionada,
    carregarVagas,
    alterarStatusVaga,
    recarregarStatus
  } = useVagas(user, !loadingAuth);

  const [buscaModalAberta, setBuscaModalAberta] = useState(false);
  const [loginModalAberta, setLoginModalAberta] = useState(false);
  const [filtrosAberta, setFiltrosAberta] = useState(false);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [indiceFocado, setIndiceFocado] = useState(0);
  const [toast, setToast] = useState(null);
  // o destaque de foco nos cards só aparece enquanto se navega pelo teclado
  const [tecladoAtivo, setTecladoAtivo] = useState(false);

  const linhaRefs = useRef([]);

  // Sempre a versão mais recente da função de status (o "Desfazer" roda depois de alguns segundos)
  const alterarStatusRef = useRef(alterarStatusVaga);
  alterarStatusRef.current = alterarStatusVaga;

  const {
    filtros,
    vagasFiltradas,
    opcoesUnicas,
    atualizarFiltro,
    aplicarFiltros,
    alternarFiltro,
    limparTodosFiltros
  } = useFiltros(vagas);

  const statsGerais = useMemo(() => calcularEstatisticas(vagas), [vagas]);

  // ----- Vista padrão = só vagas com nota alta, sem descartadas, melhores primeiro -----
  const vistaPadrao =
    filtros.scoreMin === LIMITE_ALTO &&
    filtros.status === 'ATIVAS' &&
    filtros.modelo === 'TODOS' &&
    filtros.fonte === 'TODOS' &&
    filtros.periodo === 'TODOS' &&
    filtros.localizacao === 'TODAS' &&
    filtros.faixa === 'TODOS' &&
    !filtros.texto &&
    !filtros.dataDia;

  const qtdAvancados = [
    filtros.fonte !== 'TODOS',
    filtros.periodo !== 'TODOS',
    filtros.status !== 'ATIVAS',
    filtros.ordenacao !== 'SCORE',
    filtros.localizacao !== 'TODAS',
    filtros.faixa !== 'TODOS',
    filtros.scoreMin !== 0 && filtros.scoreMin !== LIMITE_ALTO,
    !['TODOS', 'Remoto', 'Híbrido'].includes(filtros.modelo),
    Boolean(filtros.dataDia)
  ].filter(Boolean).length;

  const resumoAtivo =
    filtros.status === 'NOVA'
      ? 'novas'
      : filtros.status === 'EM_ANDAMENTO'
        ? 'andamento'
        : filtros.status === 'ATIVAS' && filtros.scoreMin === LIMITE_ALTO
          ? 'altas'
          : null;

  const aoSelecionarResumo = (id) => {
    if (id === resumoAtivo) {
      limparTodosFiltros();
    } else if (id === 'novas') {
      aplicarFiltros({ status: 'NOVA', scoreMin: 0, ordenacao: 'RECENTES' });
    } else if (id === 'andamento') {
      aplicarFiltros({ status: 'EM_ANDAMENTO', scoreMin: 0 });
    } else {
      limparTodosFiltros();
    }
  };

  // ----- Gaveta de detalhes -----
  const abrirGavetaComVaga = useCallback(
    (vaga, index) => {
      setVagaSelecionada(vaga);
      setIndiceFocado(index);
      setGavetaAberta(true);
    },
    [setVagaSelecionada]
  );

  const fecharGaveta = useCallback(() => setGavetaAberta(false), []);
  const fecharToast = useCallback(() => setToast(null), []);

  const vagaAtualIndex = useMemo(() => {
    if (!vagaSelecionada) return -1;
    return vagasFiltradas.findIndex((v) => v.id === vagaSelecionada.id);
  }, [vagasFiltradas, vagaSelecionada]);

  const temAnterior = vagaAtualIndex > 0;
  const temSeguinte = vagaAtualIndex >= 0 && vagaAtualIndex < vagasFiltradas.length - 1;

  const irParaVagaAnterior = useCallback(() => {
    if (!temAnterior) return;
    const novo = vagaAtualIndex - 1;
    setVagaSelecionada(vagasFiltradas[novo]);
    setIndiceFocado(novo);
  }, [temAnterior, vagaAtualIndex, vagasFiltradas, setVagaSelecionada]);

  const irParaVagaSeguinte = useCallback(() => {
    if (!temSeguinte) return;
    const novo = vagaAtualIndex + 1;
    setVagaSelecionada(vagasFiltradas[novo]);
    setIndiceFocado(novo);
  }, [temSeguinte, vagaAtualIndex, vagasFiltradas, setVagaSelecionada]);

  // ----- Ações sobre as vagas -----
  const mudarStatus = useCallback((vaga, novoStatus) => {
    const anterior = vaga.status_candidatura || 'NOVA';
    alterarStatusRef.current(vaga.id, novoStatus);

    if (novoStatus === 'DESCARTADO' || novoStatus === 'DISPENSADO') {
      setGavetaAberta(false);
      setToast({
        id: Date.now(),
        msg: novoStatus === 'DESCARTADO' ? 'Vaga descartada' : 'Vaga marcada como dispensada',
        acao: 'Desfazer',
        onAcao: () => alterarStatusRef.current(vaga.id, anterior)
      });
    }
  }, []);

  const aoCandidatar = useCallback((vaga) => {
    setToast({
      id: Date.now(),
      msg: 'Vaga aberta em outra aba',
      acao: 'Já me candidatei',
      onAcao: () => alterarStatusRef.current(vaga.id, 'EM_ANDAMENTO')
    });
  }, []);

  // ----- Atalhos de teclado (Ctrl+K, setas, j/k, Enter) -----
  useEffect(() => {
    const aoTeclar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscaModalAberta((prev) => !prev);
        return;
      }

      if (buscaModalAberta || loginModalAberta || gavetaAberta || filtrosAberta) return;

      const ativo = document.activeElement;
      const tag = ativo?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || ativo?.isContentEditable) return;
      if (vagasFiltradas.length === 0) return;

      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setTecladoAtivo(true);
        setIndiceFocado((prev) => {
          const proximo = prev < vagasFiltradas.length - 1 ? prev + 1 : 0;
          linhaRefs.current[proximo]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return proximo;
        });
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setTecladoAtivo(true);
        setIndiceFocado((prev) => {
          const anterior = prev > 0 ? prev - 1 : vagasFiltradas.length - 1;
          linhaRefs.current[anterior]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return anterior;
        });
      } else if (e.key === 'Enter' && tag !== 'button' && tag !== 'a' && tag !== 'article') {
        e.preventDefault();
        if (vagasFiltradas[indiceFocado]) abrirGavetaComVaga(vagasFiltradas[indiceFocado], indiceFocado);
      }
    };

    const aoPonteiro = () => setTecladoAtivo(false);
    window.addEventListener('keydown', aoTeclar);
    window.addEventListener('pointerdown', aoPonteiro);
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      window.removeEventListener('pointerdown', aoPonteiro);
    };
  }, [buscaModalAberta, loginModalAberta, gavetaAberta, filtrosAberta, vagasFiltradas, indiceFocado, abrirGavetaComVaga]);

  return (
    <div className="app">
      <TopBar
        termoBusca={filtros.texto}
        setTermoBusca={(txt) => atualizarFiltro('texto', txt)}
        abrirBusca={() => setBuscaModalAberta(true)}
        carregarVagas={carregarVagas}
        atualizando={atualizando}
        modoDemo={modoDemo}
        setModoDemo={setModoDemo}
        user={user}
        visitante={visitante}
        onAbrirLogin={() => setLoginModalAberta(true)}
        onLogout={logout}
      />

      <main className="main">
        {modoDemo && (
          <div className="faixa faixa-demo">
            <span>
              {visitante
                ? 'Portfólio com dados fictícios. As vagas reais ficam atrás do login.'
                : 'Modo demonstração: você está vendo dados fictícios.'}
            </span>
            {visitante ? (
              <button type="button" onClick={() => setLoginModalAberta(true)}>Entrar</button>
            ) : (
              <button type="button" onClick={() => setModoDemo(false)}>Sair</button>
            )}
          </div>
        )}

        {erroSincronizacao && (
          <div className="faixa faixa-erro" role="alert">
            <span>{erroSincronizacao}</span>
          </div>
        )}

        <ImportadorStatusBanner user={user} vagas={vagas} onImportacaoConcluida={recarregarStatus} />

        {erro && !modoDemo ? (
          <div className="erro-box" role="alert">
            <h2>Não foi possível carregar as vagas</h2>
            <p>Verifique a conexão e tente de novo. Se continuar, confira se o Supabase está no ar.</p>
            <button type="button" className="btn btn-primary" onClick={carregarVagas}>Tentar de novo</button>
          </div>
        ) : (
          <>
            <ResumoBar
              novas={statsGerais.novas}
              altas={statsGerais.altasAtivas}
              emAndamento={statsGerais.emAndamento}
              ativo={resumoAtivo}
              onSelecionar={aoSelecionarResumo}
            />

            <FiltrosChips
              filtros={filtros}
              aplicarFiltros={aplicarFiltros}
              alternarFiltro={alternarFiltro}
              qtdAvancados={qtdAvancados}
              onAbrirFiltros={() => setFiltrosAberta(true)}
            />

            <FeedCards
              vagas={vagasFiltradas}
              totalGeral={statsGerais.total}
              loading={loading}
              vistaPadrao={vistaPadrao}
              ordemPorScore={filtros.ordenacao === 'SCORE'}
              indiceFocado={tecladoAtivo ? indiceFocado : -1}
              vagaSelecionadaId={vagaSelecionada?.id}
              gavetaAberta={gavetaAberta}
              linhaRefs={linhaRefs}
              onAbrir={abrirGavetaComVaga}
              onCandidatar={aoCandidatar}
              onDescartar={(v) => mudarStatus(v, 'DESCARTADO')}
              onVerTodas={() => aplicarFiltros({ scoreMin: 0 })}
              onLimpar={limparTodosFiltros}
            />
          </>
        )}
      </main>

      <DetailPanel
        vaga={vagaSelecionada}
        isOpen={gavetaAberta}
        onClose={fecharGaveta}
        aoMudarStatus={mudarStatus}
        onVagaAnterior={irParaVagaAnterior}
        onVagaSeguinte={irParaVagaSeguinte}
        temAnterior={temAnterior}
        temSeguinte={temSeguinte}
      />

      <FiltrosSheet
        aberto={filtrosAberta}
        onClose={() => setFiltrosAberta(false)}
        filtros={filtros}
        atualizarFiltro={atualizarFiltro}
        limparTodosFiltros={limparTodosFiltros}
        opcoesUnicas={opcoesUnicas}
        totalFiltrado={vagasFiltradas.length}
      />

      <BuscaModal
        isOpen={buscaModalAberta}
        onClose={() => setBuscaModalAberta(false)}
        vagas={vagas}
        onSelectVaga={(vaga) => {
          const idx = vagasFiltradas.findIndex((item) => item.id === vaga.id);
          abrirGavetaComVaga(vaga, idx >= 0 ? idx : 0);
        }}
      />

      <LoginModal
        isOpen={loginModalAberta}
        onClose={() => setLoginModalAberta(false)}
        onLoginComSenha={loginComSenha}
        enviando={enviando}
        mensagemAuth={mensagemAuth}
        setMensagemAuth={setMensagemAuth}
      />

      <Toast toast={toast} onFechar={fecharToast} />
    </div>
  );
}
