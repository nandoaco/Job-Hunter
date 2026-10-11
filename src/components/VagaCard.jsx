import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import ScoreRing from './ScoreRing';
import { formatarTempoRelativo, rotuloStatus } from '../lib/vagas';

const VagaCard = React.forwardRef(function VagaCard(
  { vaga, topDoDia, focada, selecionada, onAbrir, onCandidatar, onDescartar },
  ref
) {
  const status = (vaga.status_candidatura || 'NOVA').toUpperCase();
  const razao = (vaga.justificativa || '').trim();
  const remoto = (vaga.modelo_trabalho || '').toLowerCase().includes('remot');
  const mostrarLocal =
    vaga.localizacao &&
    vaga.localizacao.trim().toLowerCase() !== (vaga.modelo_trabalho || '').trim().toLowerCase();

  const aoTeclar = (e) => {
    // só reage ao Enter no próprio card (não nos botões de dentro)
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      onAbrir();
    }
  };

  return (
    <article
      ref={ref}
      className={`card${focada ? ' focada' : ''}${selecionada ? ' selecionada' : ''}`}
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={aoTeclar}
    >
      <div className="card-topo">
        <ScoreRing score={vaga.score_match} />
        <div style={{ minWidth: 0 }}>
          <h3 className="card-titulo">{vaga.titulo}</h3>
          <p className="card-empresa">{vaga.empresa}</p>
        </div>
      </div>

      <div className="meta">
        {topDoDia && <span className="pill pill-top">Top do dia</span>}
        {status !== 'NOVA' && <span className="pill pill-status">{rotuloStatus(status)}</span>}
        {vaga.modelo_trabalho && (
          <span className={`pill${remoto ? ' pill-remoto' : ''}`}>{vaga.modelo_trabalho}</span>
        )}
        {mostrarLocal && <span className="meta-local">{vaga.localizacao}</span>}
        {vaga.fonte && <span>{vaga.fonte}</span>}
        {vaga.created_at && <span>{formatarTempoRelativo(vaga.created_at)}</span>}
      </div>

      {razao && (
        <div className="razao">
          <b>Por que combina</b>
          <p>{razao}</p>
        </div>
      )}

      <div className="acoes">
        {vaga.url_original ? (
          <a
            className="btn btn-primary"
            href={vaga.url_original}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onCandidatar();
            }}
          >
            <ExternalLink size={18} aria-hidden="true" />
            Candidatar-me
          </a>
        ) : (
          <button type="button" className="btn" disabled>Sem link da vaga</button>
        )}
        <button
          type="button"
          className="btn"
          onClick={(e) => {
            e.stopPropagation();
            onDescartar();
          }}
        >
          <Trash2 size={18} aria-hidden="true" />
          Descartar
        </button>
      </div>
    </article>
  );
});

export default VagaCard;
