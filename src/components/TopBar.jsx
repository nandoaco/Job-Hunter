import React, { useEffect, useRef, useState } from 'react';
import { Search, EllipsisVertical, RefreshCw, LogIn, LogOut } from 'lucide-react';

function abreviarEmail(email) {
  if (!email) return '';
  const [nome, dominio] = email.split('@');
  if (!dominio) return email;
  return `${nome.slice(0, 3)}***@${dominio}`;
}

export default function TopBar({
  termoBusca,
  setTermoBusca,
  abrirBusca,
  carregarVagas,
  atualizando,
  modoDemo,
  setModoDemo,
  user,
  visitante,
  onAbrirLogin,
  onLogout
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuAberto) return undefined;
    const fora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAberto(false);
    };
    const esc = (e) => {
      if (e.key === 'Escape') setMenuAberto(false);
    };
    document.addEventListener('mousedown', fora);
    document.addEventListener('touchstart', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('touchstart', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [menuAberto]);

  return (
    <header className="stack">
      <div className="stack-in">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true" />
          <span className="brand-name">Job Hunter</span>
          <span className="brand-sub">triagem para SOC e Blue Team</span>
        </div>

        <label className="search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar vaga ou empresa"
            aria-label="Buscar vaga ou empresa"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <kbd onClick={abrirBusca} title="Busca rápida">Ctrl K</kbd>
        </label>

        <div className="menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="btn btn-icon"
            aria-label="Abrir menu"
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <EllipsisVertical size={20} aria-hidden="true" />
          </button>

          {menuAberto && (
            <div className="menu" role="menu">
              <div className="menu-user">
                {user ? (
                  <>
                    <strong>Conectado como dono</strong>
                    {abreviarEmail(user.email)}
                  </>
                ) : (
                  <>
                    <strong>Modo visitante</strong>
                    As alterações de status ficam salvas só neste navegador.
                  </>
                )}
              </div>

              <button
                type="button"
                role="menuitem"
                className="menu-item"
                disabled={atualizando || modoDemo}
                onClick={() => {
                  carregarVagas();
                  setMenuAberto(false);
                }}
              >
                <span>{atualizando ? 'Atualizando…' : 'Atualizar vagas'}</span>
                <RefreshCw size={18} className={atualizando ? 'girando' : ''} aria-hidden="true" />
              </button>

              {!visitante && (
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={modoDemo}
                  className="menu-item"
                  onClick={() => setModoDemo(!modoDemo)}
                >
                  <span>Ver demonstração</span>
                  <span className="switch" aria-hidden="true" />
                </button>
              )}

              {user ? (
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    onLogout();
                    setMenuAberto(false);
                  }}
                >
                  <span className="alerta">Sair</span>
                  <LogOut size={18} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    onAbrirLogin();
                    setMenuAberto(false);
                  }}
                >
                  <span>Entrar como dono</span>
                  <LogIn size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
