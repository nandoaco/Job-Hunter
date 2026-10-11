import React, { useState } from 'react';
import { X } from 'lucide-react';
import Sheet from './Sheet';

// Login do dono. Nenhum e-mail vem preenchido: quem usa o próprio aparelho
// pode deixar o navegador ou o gerenciador de senhas completar.
export default function LoginModal({
  isOpen,
  onClose,
  onLoginComSenha,
  enviando,
  mensagemAuth,
  setMensagemAuth
}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fechar = () => {
    setMensagemAuth({ tipo: '', texto: '' });
    setSenha('');
    onClose();
  };

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
    <Sheet aberto={isOpen} onClose={fechar} labelledBy="login-titulo" variante="centro">
      <div className="sheet-head">
        <h2 id="login-titulo">Entrar como dono</h2>
        <button type="button" className="btn btn-icon" onClick={fechar} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <form className="sheet-scroll" onSubmit={handleSubmit}>
        <p className="login-ajuda">
          As vagas reais e a situação de cada uma ficam atrás do login. Use a conta cadastrada no Supabase.
        </p>

        {mensagemAuth?.texto && (
          <div
            className={`login-msg ${mensagemAuth.tipo === 'sucesso' ? 'login-ok' : 'login-erro'}`}
            role={mensagemAuth.tipo === 'sucesso' ? 'status' : 'alert'}
          >
            {mensagemAuth.texto}
          </div>
        )}

        <div className="campo">
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary login-enviar"
          disabled={enviando || !email || !senha}
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </Sheet>
  );
}
