import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import Sheet from './Sheet';
import ScoreRing from './ScoreRing';
import { rotuloStatus } from '../lib/vagas';

function Lista({ itens, vazio }) {
  if (Array.isArray(itens) && itens.length > 0) {
    return (
      <ul>
        {itens.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="nada">{vazio}</p>;
}

export default function DetailPanel({
  vaga,
  isOpen,
  onClose,
  aoMudarStatus,
  onOcultarEmpresa,
  onVagaAnterior,
  onVagaSeguinte,
  temAnterior,
  temSeguinte
}) {
  // setas do teclado navegam entre vagas (Esc e Tab são tratados pelo Sheet)
  useEffect(() => {
    if (!isOpen) return undefined;
    const aoTeclar = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft' && temAnterior) {
        e.preventDefault();
        onVagaAnterior();
      } else if (e.key === 'ArrowRight' && temSeguinte) {
        e.preventDefault();
        onVagaSeguinte();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [isOpen, temAnterior, temSeguinte, onVagaAnterior, onVagaSeguinte]);

  if (!isOpen || !vaga) return null;

  const status = (vaga.status_candidatura || 'NOVA').toUpperCase();
  // O parecer da IA é gravado na coluna "justificativa"
  const parecer = (vaga.justificativa || '').trim();
  const descricao = (vaga.descricao_raw || vaga.descricao || '').trim();
  const mostrarLocal =
    vaga.localizacao &&
    vaga.localizacao.trim().toLowerCase() !== (vaga.modelo_trabalho || '').trim().toLowerCase();
  const temEliminatorios = Array.isArray(vaga.requisitos_eliminatorios) && vaga.requisitos_eliminatorios.length > 0;

  const botaoStatus = (valor, texto) => (
    <button
      type="button"
      className="btn"
      aria-pressed={status === valor}
      onClick={() => aoMudarStatus(vaga, valor)}
    >
      {texto}
    </button>
  );

  return (
    <Sheet aberto={isOpen} onClose={onClose} labelledBy="detalhe-titulo" variante="lateral">
      <div className="sheet-head">
        <div className="sheet-nav">
          <button
            type="button"
            className="btn btn-icon"
            onClick={onVagaAnterior}
            disabled={!temAnterior}
            aria-label="Vaga anterior"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onVagaSeguinte}
            disabled={!temSeguinte}
            aria-label="Próxima vaga"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
        <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Fechar detalhes">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="sheet-scroll">
        <div className="d-titulo">
          <ScoreRing score={vaga.score_match} size={56} grande />
          <div style={{ minWidth: 0 }}>
            <h3 id="detalhe-titulo">{vaga.titulo}</h3>
            <p>{vaga.empresa}</p>
          </div>
        </div>

        <div className="meta">
          {status !== 'NOVA' && <span className="pill pill-status">{rotuloStatus(status)}</span>}
          {vaga.modelo_trabalho && <span className="pill">{vaga.modelo_trabalho}</span>}
          {mostrarLocal && <span className="meta-local">{vaga.localizacao}</span>}
          {vaga.fonte && <span>{vaga.fonte}</span>}
        </div>

        <div className="sec">
          <h4>Situação desta vaga</h4>
          <div className="situacao">
            {botaoStatus('EM_ANDAMENTO', 'Candidatado')}
            {botaoStatus('DISPENSADO', 'Dispensado')}
            {botaoStatus('DESCARTADO', 'Descartar')}
          </div>
          {status !== 'NOVA' && (
            <button type="button" className="reset" onClick={() => aoMudarStatus(vaga, 'NOVA')}>
              Voltar para nova
            </button>
          )}
          {vaga.empresa && (
            <button type="button" className="reset reset-empresa" onClick={() => onOcultarEmpresa(vaga)}>
              Ocultar vagas de {vaga.empresa}
            </button>
          )}
        </div>

        <div className="sec">
          <h4>Por que combina</h4>
          {parecer ? <p>{parecer}</p> : <p className="nada">A análise desta vaga ainda não está disponível.</p>}
        </div>

        <div className="sec">
          <h4 className="ok">Pontos fortes</h4>
          <Lista itens={vaga.pontos_fortes} vazio="Nenhum ponto forte registrado." />
        </div>

        <div className="sec">
          <h4 className="warn">Pontos de atenção</h4>
          <Lista itens={vaga.gaps} vazio="Nenhum ponto de atenção registrado." />
        </div>

        {temEliminatorios && (
          <div className="sec">
            <h4 className="bad">Requisitos eliminatórios</h4>
            <Lista itens={vaga.requisitos_eliminatorios} vazio="" />
          </div>
        )}

        {descricao && (
          <details className="desc sec">
            <summary>Descrição completa da vaga</summary>
            <div>{descricao}</div>
          </details>
        )}
      </div>

      <div className="sheet-foot">
        {vaga.url_original ? (
          <a className="btn btn-primary" href={vaga.url_original} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={18} aria-hidden="true" />
            Candidatar-me
          </a>
        ) : (
          <button type="button" className="btn" disabled>Sem link da vaga</button>
        )}
      </div>
    </Sheet>
  );
}
