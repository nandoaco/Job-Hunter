import React from 'react';

export default function Header({ 
  termoBusca, 
  setTermoBusca, 
  carregarVagas, 
  atualizando, 
  modoDemo, 
  setModoDemo 
}) {
  return (
    <div className="header-box" style={{ backgroundColor: '#1d2238', padding: '14px 18px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #28304f' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }}></div>
        <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
          JOB HUNTER <span style={{ color: '#00e5ff', fontSize: '12px', fontWeight: '500' }}>• SOC OPERATIONS</span>
        </h1>
      </div>

      <div className="header-controls">
        {/* Interruptor Modo Demonstração */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: modoDemo ? '#fbbf24' : '#94a3b8', cursor: 'pointer', userSelect: 'none', marginRight: '6px' }}>
          <input 
            type="checkbox" 
            checked={modoDemo} 
            onChange={(e) => setModoDemo(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#fbbf24' }}
          />
          <span>Ver demonstração</span>
        </label>

        <input 
          type="text" 
          placeholder="Buscar vaga, empresa..." 
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="search-input"
          style={{ backgroundColor: '#141829', border: '1px solid #2d3759', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
        />

        <button 
          onClick={carregarVagas}
          disabled={atualizando || modoDemo}
          title={modoDemo ? 'Desative o modo demonstração para consultar o banco' : 'Atualizar dados'}
          style={{ 
            backgroundColor: (atualizando || modoDemo) ? '#64748b' : '#00e5ff', 
            color: '#0b1120', 
            border: 'none', 
            padding: '8px 14px', 
            borderRadius: '6px', 
            fontWeight: '700', 
            fontSize: '12px', 
            cursor: (atualizando || modoDemo) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {atualizando ? '↻ ...' : '↻ ATUALIZAR'}
        </button>
      </div>
    </div>
  );
}
