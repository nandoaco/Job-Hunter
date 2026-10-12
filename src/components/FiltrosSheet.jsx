import React from 'react';
import { X } from 'lucide-react';
import Sheet from './Sheet';

export default function FiltrosSheet({
  aberto,
  onClose,
  filtros,
  atualizarFiltro,
  limparTodosFiltros,
  opcoesUnicas,
  totalFiltrado,
  empresasOcultas = [],
  onReexibirEmpresa
}) {
  return (
    <Sheet aberto={aberto} onClose={onClose} labelledBy="filtros-titulo" variante="centro">
      <div className="sheet-head">
        <h2 id="filtros-titulo">Filtros</h2>
        <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Fechar filtros">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="sheet-scroll">
        <div className="campo">
          <div className="rot">
            <label htmlFor="f-score">Match mínimo</label>
            <output htmlFor="f-score">{filtros.scoreMin}+</output>
          </div>
          <input
            id="f-score"
            type="range"
            min="0"
            max="100"
            step="5"
            value={filtros.scoreMin}
            onChange={(e) => atualizarFiltro('scoreMin', Number(e.target.value))}
          />
        </div>

        <div className="campo">
          <label htmlFor="f-modelo">Modalidade</label>
          <select id="f-modelo" value={filtros.modelo} onChange={(e) => atualizarFiltro('modelo', e.target.value)}>
            <option value="TODOS">Todas</option>
            {opcoesUnicas.modelos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-fonte">Fonte</label>
          <select id="f-fonte" value={filtros.fonte} onChange={(e) => atualizarFiltro('fonte', e.target.value)}>
            <option value="TODOS">Todas</option>
            {opcoesUnicas.fontes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-periodo">Período</label>
          <select id="f-periodo" value={filtros.periodo} onChange={(e) => atualizarFiltro('periodo', e.target.value)}>
            <option value="TODOS">Todo o histórico</option>
            <option value="7">Últimos 7 dias</option>
            <option value="14">Últimos 14 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-situacao">Situação</label>
          <select id="f-situacao" value={filtros.status} onChange={(e) => atualizarFiltro('status', e.target.value)}>
            <option value="ATIVAS">Em aberto</option>
            <option value="NOVA">Novas</option>
            <option value="EM_ANDAMENTO">Candidatadas</option>
            <option value="DISPENSADO">Dispensadas</option>
            <option value="DESCARTADO">Descartadas</option>
            <option value="TODAS">Todas as situações</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="f-ordem">Ordenar por</label>
          <select id="f-ordem" value={filtros.ordenacao} onChange={(e) => atualizarFiltro('ordenacao', e.target.value)}>
            <option value="SCORE">Melhor match</option>
            <option value="RECENTES">Mais recentes</option>
          </select>
        </div>

        {empresasOcultas.length > 0 && (
          <div className="campo">
            <span className="rot-fixo">Empresas ocultas</span>
            <ul className="ocultas">
              {empresasOcultas.map((e) => (
                <li key={e.chave}>
                  <span>{e.nome}</span>
                  <button type="button" className="btn" onClick={() => onReexibirEmpresa(e.chave)}>
                    Mostrar de novo
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="sheet-foot">
        <button type="button" className="btn" onClick={limparTodosFiltros}>Restaurar padrão</button>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Ver {totalFiltrado} {totalFiltrado === 1 ? 'vaga' : 'vagas'}
        </button>
      </div>
    </Sheet>
  );
}
