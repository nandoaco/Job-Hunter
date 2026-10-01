import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mensagemAuth, setMensagemAuth] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoadingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login direto e seguro por Email e Senha (sem limite de 4 emails/hora)
  const loginComSenha = useCallback(async (email, senha) => {
    if (!supabase) return { sucesso: false, erro: 'Supabase não inicializado' };
    setEnviando(true);
    setMensagemAuth({ tipo: '', texto: '' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
      });

      if (error) {
        let msgAmigavel = 'E-mail ou senha incorretos.';
        if (error.message.includes('Invalid login credentials')) {
          msgAmigavel = 'Credenciais inválidas. Verifique o e-mail e a senha cadastrados.';
        }
        setMensagemAuth({ tipo: 'erro', texto: msgAmigavel });
        return { sucesso: false, erro: msgAmigavel };
      }

      setUser(data.user);
      setMensagemAuth({ tipo: 'sucesso', texto: 'Autenticado com sucesso!' });
      return { sucesso: true };
    } catch (err) {
      const falha = err.message || 'Falha ao autenticar.';
      setMensagemAuth({ tipo: 'erro', texto: falha });
      return { sucesso: false, erro: falha };
    } finally {
      setEnviando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setMensagemAuth({ tipo: '', texto: '' });
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
  }, []);

  return {
    user,
    loadingAuth,
    enviando,
    mensagemAuth,
    setMensagemAuth,
    loginComSenha,
    logout
  };
}