import React, { useState } from 'react';
import { tokens } from '../styles/tokens';

export default function LoginModal({
  isOpen,
  onClose,
  onEnviarCodigoOtp,
  onVerificarCodigoOtp,
  enviando,
  aguardandoOtp,
  setAguardandoOtp,
  mensagemAuth,
  setMensagemAuth
}) {
  const [email, setEmail] = useState('');
  const [tokenOtp, setTokenOtp] = useState('');

  if (!isOpen) return null;

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    await onEnviarCodigoOtp(email);
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (!tokenOtp) return;
    const res = await onVerificarCodigoOtp(tokenOtp);
    if (res?.sucesso) {
      setTimeout(() => {
        onClose();
        setMensagemAuth({ tipo: '', texto: '' });
        setTokenOtp('');
      }, 800);
    }
  };

  const reiniciarFluxo = () => {
    setAguardandoOtp(false);
    setMensagemAuth({ tipo: '', texto: '' });
    setTokenOtp('');
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
          maxWidth: '400px',
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
          {!aguardandoOtp
            ? 'Insira seu e-mail para receber um código de liberação (Token de 6 dígitos).'
            : 'Insira o código numérico de 6 dígitos que acabou de chegar no seu e-mail:'}
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

        {!aguardandoOtp ? (
          <form onSubmit={handleEnviarEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '6px' }}>
                E-mail corporativo:
              </label>
              <input
                type="email"
                required
                placeholder="seu-email@dominio.com"
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

            <button
              type="submit"
              disabled={enviando}
              className="interactive-btn"
              style={{
                backgroundColor: tokens.colors.highlight,
                color: tokens.colors.background,
                fontWeight: tokens.typography.weights.bold,
                border: 'none',
                height: '38px',
                borderRadius: tokens.radii.md,
                cursor: enviando ? 'wait' : 'pointer',
                fontSize: tokens.typography.sizes.xs,
                marginTop: '4px'
              }}
            >
              {enviando ? 'Enviando código...' : 'Receber Código de Acesso 🔑'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: tokens.typography.sizes.xs, color: tokens.colors.textSecondary, marginBottom: '6px' }}>
                Código Token (6 dígitos):
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={tokenOtp}
                onChange={(e) => setTokenOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: tokens.colors.surfaceAlt,
                  border: `1px solid ${tokens.colors.highlight}`,
                  borderRadius: tokens.radii.md,
                  padding: '0 12px',
                  color: tokens.colors.highlight,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={enviando || tokenOtp.length < 6}
              className="interactive-btn"
              style={{
                backgroundColor: tokens.colors.green,
                color: '#ffffff',
                fontWeight: tokens.typography.weights.bold,
                border: 'none',
                height: '38px',
                borderRadius: tokens.radii.md,
                cursor: (enviando || tokenOtp.length < 6) ? 'not-allowed' : 'pointer',
                fontSize: tokens.typography.sizes.xs,
                marginTop: '4px'
              }}
            >
              {enviando ? 'Validando...' : 'Confirmar e Entrar ✓'}
            </button>

            <button
              type="button"
              onClick={reiniciarFluxo}
              style={{
                background: 'none',
                border: 'none',
                color: tokens.colors.textMuted,
                cursor: 'pointer',
                fontSize: tokens.typography.sizes.xs,
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              Voltar e reenviar e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  );
}