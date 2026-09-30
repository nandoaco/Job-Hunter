import React from 'react';
import { tokens } from '../styles/tokens';

export default function FiltrosBar({ 
  filtros, 
  atualizarFiltro, 
  limparTodosFiltros, 
  opcoesUnicas, 
  totalGeral, 
  totalFiltrado,
  abrirBuscaModal 
}) {
  const chipsAtivos = [];

  if (filtros.texto) chipsAtivos.push({ campo: 'texto', label: `Busca: "${filtros.texto}"`, reset: '' });
  if (filtros.faixa !== 'TODOS') chipsAtivos.push({ campo: 'faixa', label: `Faixa: ${filtros.faixa}`, reset: 'TODOS' });
  if (filtros.scoreMin > 0) chipsAtivos.push({ campo: 'scoreMin', label: `Match ≥ ${filtros.scoreMin}%`, reset: 0 });
  if (filtros.modelo !== 'TODOS') chipsAtivos.push({ campo: 'modelo', label: `Modalidade: ${filtros.modelo}`, reset: 'TODOS' });
  if (filtros.fonte !== 'TODOS') chipsAtivos.push({ campo: 'fonte', label: `Fonte: ${filtros.fonte}`, reset: 'TODOS' });
  if (filtros.localizacao !== 'TODAS') chipsAtivos.push({ campo: 'localizacao', label: `Local: ${filtros.localizacao}`, reset: 'TODAS' });
  if (filtros.periodo !== 'TODOS') chipsAtivos.push({ campo: 'periodo', label: `Últimos ${filtros.periodo} dias`, reset: 'TODOS' });
  if (filtros.dataDia) chipsAtivos.push({ campo: 'dataDia', label: `Dia ${filtros.dataDia.slice(0, 5)}`, reset: null });
  if (filtros.status !== 'TODAS') chipsAtivos.push({ campo: 'status', label: `Status: ${filtros.status}`, reset: 'TODAS' });
  if (filtros.ordenacao === 'SCORE') chipsAtivos.push({ campo: 'ordenacao', label: 'Ord: Maior Match', reset: 'RECENTES' });

  return (
    <div className="col-12" style={{ backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.lg, padding: '14px 16px', border: `1px solid ${tokens.colors.border}`, marginBottom: '4px' }}>
      
      {/* Controles Principais de Filtro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'center' }}>
        
        {/* Faixa de Match */}
        <div>
          <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            Faixa de Match:
          </label>
          <select
            value={filtros.faixa}
            onChange={(e) => atualizarFiltro('faixa', e.target.value)}
            style={{ width: '100%', height: '34px', backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textPrimary, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.md, padding: '0 8px', fontSize: tokens.typography.sizes.xs }}
          >
            <option value="TODOS">Todas as faixas</option>
            <option value="ALTO">Alta (≥ 80%)</option>
            <option value="MEDIO">Média (60% - 79%)</option>
            <option value="BAIXO">Baixa (&lt; 60%)</option>
          </select>
        </div>

        {/* Modalidade */}
        <div>
          <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            Modalidade:
          </label>
          <select
            value={filtros.modelo}
            onChange={(e) => atualizarFiltro('modelo', e.target.value)}
            style={{ width: '100%', height: '34px', backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textPrimary, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.md, padding: '0 8px', fontSize: tokens.typography.sizes.xs }}
          >
            <option value="TODOS">Todas modalidades</option>
            {opcoesUnicas.modelos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Fonte */}
        <div>
          <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            Fonte:
          </label>
          <select
            value={filtros.fonte}
            onChange={(e) => atualizarFiltro('fonte', e.target.value)}
            style={{ width: '100%', height: '34px', backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textPrimary, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.md, padding: '0 8px', fontSize: tokens.typography.sizes.xs }}
          >
            <option value="TODOS">Todas as fontes</option>
            {opcoesUnicas.fontes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Período */}
        <div>
          <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            Período:
          </label>
          <select
            value={filtros.periodo}
            onChange={(e) => atualizarFiltro('periodo', e.target.value)}
            style={{ width: '100%', height: '34px', backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textPrimary, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.md, padding: '0 8px', fontSize: tokens.typography.sizes.xs }}
          >
            <option value="TODOS">Todo o histórico</option>
            <option value="7">Últimos 7 dias</option>
            <option value="14">Últimos 14 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>

        {/* Ordenação */}
        <div>
          <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            Ordenação:
          </label>
          <select
            value={filtros.ordenacao}
            onChange={(e) => atualizarFiltro('ordenacao', e.target.value)}
            style={{ width: '100%', height: '34px', backgroundColor: tokens.colors.surfaceAlt, color: tokens.colors.textPrimary, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.md, padding: '0 8px', fontSize: tokens.typography.sizes.xs }}
          >
            <option value="RECENTES">Mais recentes</option>
            <option value="SCORE">Maior Match (%)</option>
          </select>
        </div>

        {/* Slider de Score Mínimo */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '4px', fontWeight: tokens.typography.weights.semibold }}>
            <span>Match Mínimo:</span>
            <span style={{ color: tokens.colors.highlight, fontWeight: tokens.typography.weights.bold }}>{filtros.scoreMin}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filtros.scoreMin}
            onChange={(e) => atualizarFiltro('scoreMin', Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: tokens.colors.highlight }}
          />
        </div>
      </div>

      {/* Barra de Chips Ativos e Contador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${tokens.colors.border}`, flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary }}>Filtros ativos:</span>
          {chipsAtivos.length === 0 ? (
            <span style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textMuted }}>Nenhum filtro aplicado</span>
          ) : (
            chipsAtivos.map((chip, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: tokens.colors.surfaceAlt,
                  color: tokens.colors.highlight,
                  border: `1px solid ${tokens.colors.border}`,
                  padding: '2px 8px',
                  borderRadius: tokens.radii.sm,
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: tokens.typography.weights.semibold
                }}
              >
                {chip.label}
                <button
                  onClick={() => atualizarFiltro(chip.campo, chip.reset)}
                  style={{ background: 'none', border: 'none', color: tokens.colors.textSecondary, cursor: 'pointer', padding: 0, fontSize: '13px', lineHeight: 1 }}
                  title="Remover filtro"
                >
                  ×
                </button>
              </span>
            ))
          )}

          {chipsAtivos.length > 0 && (
            <button
              onClick={limparTodosFiltros}
              className="interactive-btn"
              style={{ backgroundColor: 'transparent', color: tokens.colors.red, border: 'none', fontSize: tokens.typography.sizes.xs, fontWeight: tokens.typography.weights.bold, cursor: 'pointer', padding: '2px 6px' }}
            >
              Limpar tudo ✕
            </button>
          )}
        </div>

        <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary }}>
          Mostrando <strong style={{ color: tokens.colors.textPrimary }}>{totalFiltrado}</strong> de <strong style={{ color: tokens.colors.textPrimary }}>{totalGeral}</strong> vagas
        </div>
      </div>
    </div>
  );
}