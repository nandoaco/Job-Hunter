import React, { useRef, useState } from 'react';

// Texto limpo da descrição: junta linhas e tira marcações soltas
function limparDescricao(texto) {
  return (texto || '')
    .replace(/\r/g, '')
    .replace(/[*_#]+/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function Itens({ itens }) {
  const lista = Array.isArray(itens) ? itens.filter(Boolean).slice(0, 2) : [];
  if (lista.length === 0) return <p className="nada">Nada registrado.</p>;
  return (
    <ul>
      {lista.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

// Carrossel de 3 telas dentro do card: Por que combina / A vaga / Pontos
export default function CarroselVaga({ vaga }) {
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);

  const razao = (vaga.justificativa || '').trim();
  const descricao = limparDescricao(vaga.descricao_raw || vaga.descricao);

  const slides = [
    {
      chave: 'razao',
      rotulo: 'Por que combina',
      corpo: razao ? <p>{razao}</p> : <p className="nada">Análise ainda não disponível.</p>
    },
    {
      chave: 'vaga',
      rotulo: 'Sobre a vaga',
      corpo: descricao ? (
        <p>{descricao}</p>
      ) : (
        <p className="nada">A descrição não foi salva para esta vaga. Abra o link para ler o anúncio.</p>
      )
    },
    {
      chave: 'pontos',
      rotulo: 'Pontos fortes e de atenção',
      corpo: (
        <>
          <Itens itens={vaga.pontos_fortes} />
          {Array.isArray(vaga.gaps) && vaga.gaps.length > 0 && (
            <>
              <b className="warn-t">Atenção</b>
              <Itens itens={vaga.gaps.slice(0, 1)} />
            </>
          )}
        </>
      )
    }
  ];

  const aoRolar = () => {
    const el = trilho.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  };

  const irPara = (i) => {
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth });
  };

  const parar = (e) => e.stopPropagation();

  return (
    <div className="carro" onClick={parar} onKeyDown={parar}>
      <div className="carro-trilho" ref={trilho} onScroll={aoRolar} role="group" aria-label="Detalhes da vaga">
        {slides.map((s) => (
          <section key={s.chave} className="carro-slide" aria-label={s.rotulo}>
            <b className={s.chave === 'pontos' ? 'ok-t' : undefined}>{s.rotulo}</b>
            {s.corpo}
          </section>
        ))}
      </div>
      <div className="carro-pontos">
        {slides.map((s, i) => (
          <button
            key={s.chave}
            type="button"
            aria-label={`Ver: ${s.rotulo}`}
            aria-current={atual === i}
            onClick={() => irPara(i)}
          />
        ))}
      </div>
    </div>
  );
}
