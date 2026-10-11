import React from 'react';

// Três números que importam. Tocar em um deles aplica o filtro correspondente.
export default function ResumoBar({ novas, altas, emAndamento, ativo, onSelecionar }) {
  const itens = [
    { id: 'novas', rotulo: 'Novas', valor: novas },
    { id: 'altas', rotulo: 'Alta aderência', valor: altas },
    { id: 'andamento', rotulo: 'Em andamento', valor: emAndamento }
  ];

  return (
    <section className="resumo" aria-label="Resumo das vagas">
      {itens.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={ativo === item.id}
          onClick={() => onSelecionar(item.id)}
        >
          <span className="resumo-num">{item.valor}</span>
          <span className="resumo-rot">{item.rotulo}</span>
        </button>
      ))}
    </section>
  );
}
