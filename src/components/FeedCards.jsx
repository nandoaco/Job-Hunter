import React from 'react';
import VagaCard from './VagaCard';
import { LIMITE_ALTO } from '../lib/vagas';

export default function FeedCards({
  vagas,
  totalGeral,
  loading,
  vistaPadrao,
  ordemPorScore,
  indiceFocado,
  vagaSelecionadaId,
  gavetaAberta,
  linhaRefs,
  onAbrir,
  onCandidatar,
  onDescartar,
  onVerTodas,
  onLimpar
}) {
  if (loading) {
    return (
      <>
        <div className="lista-topo"><h2>Buscando vagas…</h2></div>
        <div className="cards" aria-busy="true">
          <div className="sk" />
          <div className="sk" />
          <div className="sk" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="lista-topo">
        <h2>{vistaPadrao ? 'Melhores para hoje' : 'Vagas'}</h2>
        <span>{vagas.length} de {totalGeral}</span>
      </div>

      <div className="cards">
        {vagas.length === 0 ? (
          vistaPadrao ? (
            <div className="vazio">
              <h3>Nenhuma vaga acima de {LIMITE_ALTO} hoje</h3>
              <p>As novas chegam todo dia às 7h. Enquanto isso, veja as que ficaram abaixo do corte.</p>
              <button type="button" className="btn btn-primary" onClick={onVerTodas}>Ver todas as vagas</button>
            </div>
          ) : (
            <div className="vazio">
              <h3>Nenhuma vaga com esses filtros</h3>
              <p>Ajuste os filtros ou volte para a lista padrão.</p>
              <button type="button" className="btn btn-primary" onClick={onLimpar}>Limpar filtros</button>
            </div>
          )
        ) : (
          vagas.map((v, i) => (
            <VagaCard
              key={v.id}
              ref={(el) => {
                if (linhaRefs?.current) linhaRefs.current[i] = el;
              }}
              vaga={v}
              topDoDia={ordemPorScore && i < 3 && Number(v.score_match) >= LIMITE_ALTO}
              focada={!gavetaAberta && indiceFocado === i}
              selecionada={gavetaAberta && vagaSelecionadaId === v.id}
              onAbrir={() => onAbrir(v, i)}
              onCandidatar={() => onCandidatar(v)}
              onDescartar={() => onDescartar(v)}
            />
          ))
        )}
      </div>
    </>
  );
}
