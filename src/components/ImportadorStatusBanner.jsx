import React, { useState, useEffect } from 'react';
import { tokens } from '../styles/tokens';
import { supabase } from '../supabaseClient';
import { useStatusLocal } from '../hooks/useStatusLocal';

export default function ImportadorStatusBanner({ user, vagas, onImportacaoConcluida }) {
  const { getHistoricoLocal } = useStatusLocal();
  const [itensLocais, setItensLocais] = useState({});
  const [visivel, setVisivel] = useState(false);
  const [importando, setImportando] = useState(false);
  const [resultadoMsg, setResultadoMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      setVisivel(false);
      return;
    }

    const localData = getHistoricoLocal();
    const chaves = Object.keys(localData);

    // Exibe banner apenas se houver registros locais e o utilizador ainda não tiver dispensado na sessão
    const ignoradoNaSessao = sessionStorage.getItem('jh_ignorar_banner_importacao');
    if (chaves.length > 0 && !ignoradoNaSessao) {
      setItensLocais(localData);
      setVisivel(true);
    } else {
      setVisivel(false);
    }
  }, [user, getHistoricoLocal]);

  if (!visivel) return null;

  const totalLocal = Object.keys(itensLocais).length;

  // Descarrega cópia de segurança em formato JSON
  const baixarBackupJson = () => {
    try {
      const conteudo = JSON.stringify(itensLocais, null, 2);
      const blob = new Blob([conteudo], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_status_jobhunter_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar ficheiro de backup:', err);
    }
  };

  // Importa os status que correspondam a vagas existentes
  const executarImportacao = async () => {
    if (!supabase || !user) return;
    setImportando(true);

    try {
      const idsVagasExistentes = new Set(vagas.map((v) => String(v.id)));
      let importadosQtd = 0;
      let ignoradosQtd = 0;
      const registrosParaInserir = [];

      Object.entries(itensLocais).forEach(([vagaId, dados]) => {
        if (idsVagasExistentes.has(String(vagaId))) {
          registrosParaInserir.push({
            user_id: user.id,
            vaga_id: vagaId,
            status: dados.status || 'NOVA',
            atualizado_em: new Date().toISOString()
          });
          importadosQtd++;
        } else {
          ignoradosQtd++;
        }
      });

      if (registrosParaInserir.length > 0) {
        const { error } = await supabase
          .from('vaga_status')
          .upsert(registrosParaInserir, { onConflict: 'user_id, vaga_id' });

        if (error) throw error;
      }

      setResultadoMsg(`${importadosQtd} importados, ${ignoradosQtd} ignorados (vaga não encontrada). O armazenamento local foi preservado.`);
      onImportacaoConcluida();
      setTimeout(() => {
        setVisivel(false);
      }, 6000);
    } catch (err) {
      console.error('Erro durante importação de status:', err);
      setResultadoMsg('Erro ao tentar importar registros para o Supabase.');
    } finally {
      setImportando(false);
    }
  };

  const dispensarBanner = () => {
    sessionStorage.setItem('jh_ignorar_banner_importacao', 'true');
    setVisivel(false);
  };

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        border: `1px solid ${tokens.colors.highlight}`,
        borderRadius: tokens.radii.md,
        padding: '12px 16px',
        marginBottom: tokens.spacing.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.textPrimary }}>
        📦 <strong>Importação disponível:</strong> Encontrei {totalLocal} status salvos neste navegador. Importar para a sua conta no Supabase?
        {resultadoMsg && <div style={{ color: tokens.colors.green, marginTop: '4px', fontWeight: 'bold' }}>{resultadoMsg}</div>}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={baixarBackupJson}
          className="interactive-btn"
          style={{
            backgroundColor: tokens.colors.surfaceAlt,
            color: tokens.colors.textSecondary,
            border: `1px solid ${tokens.colors.border}`,
            padding: '6px 12px',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.sizes.xs,
            cursor: 'pointer'
          }}
        >
          Baixar backup (JSON)
        </button>

        <button
          onClick={executarImportacao}
          disabled={importando}
          className="interactive-btn"
          style={{
            backgroundColor: tokens.colors.highlight,
            color: tokens.colors.background,
            border: 'none',
            fontWeight: tokens.typography.weights.bold,
            padding: '6px 14px',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.sizes.xs,
            cursor: importando ? 'wait' : 'pointer'
          }}
        >
          {importando ? 'Importando...' : 'Importar'}
        </button>

        <button
          onClick={dispensarBanner}
          className="interactive-btn"
          style={{
            backgroundColor: 'transparent',
            color: tokens.colors.textMuted,
            border: 'none',
            padding: '6px 8px',
            fontSize: tokens.typography.sizes.xs,
            cursor: 'pointer'
          }}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}