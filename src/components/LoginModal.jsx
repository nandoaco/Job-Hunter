import React, { useState } from 'react';
import { tokens } from '../styles/tokens';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginComSenha,
  enviando,
  mensagemAuth,
  setMensagemAuth
}) {
  const [email, setEmail] = useState('nandoaco@gmail.com');
  const [senha, setSenha] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) return;
    const res = await onLoginComSenha(email, senha);
    if (res?.sucesso) {
      setTimeout(() => {
        onClose();
        setMensagemAuth({ tipo: '', texto: '' });
        setSenha('');
      }, 700);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 17, 32, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: tokens.colors.surface,
          borderRadius: tokens.radii.lg,
          border: `1px solid ${tokens.colors.border}`,
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: tokens.typography.sizes.md, fontWeight: tokens.typography.weights.bold, color: tokens.colors.textPrimary }}>
            Acesso Operacional (Dono)
          </h3>
          <button
            onClick={() => { setMensagemAuth({ tipo: '', texto: '' }); onClose(); }}
            style={{ background: 'none', border: 'none', color: tokens.colors.textSecondary, fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, lineHeight: 1.5 }}>
          Identifique-se com sua conta de administrador para sincronizar os status com o Supabase.
        </p>

        {mensagemAuth?.texto && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: tokens.radii.md,
              fontSize: tokens.typography.sizes.xs,
              marginBottom: '14px',
              backgroundColor: mensagemAuth.tipo === 'sucesso' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: mensagemAuth.tipo === 'sucesso' ? tokens.colors.green : tokens.colors.red,
              border: `1px solid ${mensagemAuth.tipo === 'sucesso' ? tokens.colors.green : tokens.colors.red}`
            }}
          >
            {mensagemAuth.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '6px' }}>
              E-mail do Dono:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                backgroundColor: tokens.colors.surfaceAlt,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radii.md,
                padding: '0 12px',
                color: tokens.colors.textPrimary,
                fontSize: tokens.typography.sizes.body,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '6px' }}>
              Senha de Acesso:
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                backgroundColor: tokens.colors.surfaceAlt,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radii.md,
                padding: '0 12px',
                color: tokens.colors.textPrimary,
                fontSize: tokens.typography.sizes.body,
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={enviando || !senha}
            className="interactive-btn"
            style={{
              backgroundColor: tokens.colors.highlight,
              color: tokens.colors.background,
              fontWeight: tokens.typography.weights.bold,
              border: 'none',
              height: '38px',
              borderRadius: tokens.radii.md,
              cursor: (enviando || !senha) ? 'not-allowed' : 'pointer',
              fontSize: tokens.typography.sizes.xs,
              marginTop: '6px'
            }}
          >
            {enviando ? 'Autenticando...' : 'Entrar no Painel 🔐'}
          </button>
        </form>
      </div>
    </div>
  );
}
{/* Modal de Login do Dono com Senha */}
      <LoginModal
        isOpen={loginModalAberta}
        onClose={() => setLoginModalAberta(false)}
        onLoginComSenha={loginComSenha}
        enviando={enviando}
        mensagemAuth={mensagemAuth}
        setMensagemAuth={setMensagemAuth}
      />