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

    // Obtém sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    // Escuta alterações de estado de autenticação (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoadingAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const enviarMagicLink = useCallback(async (email) => {
    if (!supabase) return { sucesso: false, erro: 'Supabase não inicializado' };
    setEnviando(true);
    setMensagemAuth({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: false // Impede criação de contas públicas não autorizadas
        }
      });

      if (error) {
        let msgAmigavel = error.message;
        if (error.message.includes('Signups not allowed') || error.status === 400) {
          msgAmigavel = 'Acesso restrito. Este e-mail não está cadastrado como proprietário.';
        }
        setMensagemAuth({ tipo: 'erro', texto: msgAmigavel });
        return { sucesso: false, erro: msgAmigavel };
      }

      setMensagemAuth({
        tipo: 'sucesso',
        texto: 'Link de acesso enviado com sucesso! Verifique a sua caixa de entrada.'
      });
      return { sucesso: true };
    } catch (err) {
      const falha = err.message || 'Falha ao solicitar link de autenticação.';
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
    enviarMagicLink,
    logout
  };
}