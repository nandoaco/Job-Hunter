import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mensagemAuth, setMensagemAuth] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);
  const [aguardandoOtp, setAguardandoOtp] = useState(false);
  const [emailSolicitado, setEmailSolicitado] = useState('');

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

  // Passo 1: Solicita o envio do código OTP de 6 dígitos para o e-mail
  const enviarCodigoOtp = useCallback(async (email) => {
    if (!supabase) return { sucesso: false, erro: 'Supabase não inicializado' };
    setEnviando(true);
    setMensagemAuth({ tipo: '', texto: '' });

    try {
      const emailLimpo = email.trim();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: {
          shouldCreateUser: false // Bloqueia cadastros não autorizados
        }
      });

      if (error) {
        let msgAmigavel = error.message;
        if (error.message.includes('Signups not allowed') || error.status === 400 || error.status === 422) {
          msgAmigavel = 'Acesso restrito. Este e-mail não está cadastrado como proprietário.';
        }
        setMensagemAuth({ tipo: 'erro', texto: msgAmigavel });
        return { sucesso: false, erro: msgAmigavel };
      }

      setEmailSolicitado(emailLimpo);
      setAguardandoOtp(true);
      setMensagemAuth({
        tipo: 'sucesso',
        texto: `Código de verificação enviado para ${emailLimpo}! Verifique seu e-mail.`
      });
      return { sucesso: true };
    } catch (err) {
      const falha = err.message || 'Falha ao solicitar código de acesso.';
      setMensagemAuth({ tipo: 'erro', texto: falha });
      return { sucesso: false, erro: falha };
    } finally {
      setEnviando(false);
    }
  }, []);

  // Passo 2: Valida o código numérico de 6 dígitos informado pelo usuário
  const verificarCodigoOtp = useCallback(async (token) => {
    if (!supabase || !emailSolicitado) return { sucesso: false };
    setEnviando(true);
    setMensagemAuth({ tipo: '', texto: '' });

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailSolicitado,
        token: token.trim(),
        type: 'email'
      });

      if (error) {
        setMensagemAuth({ tipo: 'erro', texto: 'Código inválido ou expirado. Tente novamente.' });
        return { sucesso: false, erro: error.message };
      }

      setUser(data.user);
      setAguardandoOtp(false);
      setMensagemAuth({ tipo: 'sucesso', texto: 'Autenticado com sucesso!' });
      return { sucesso: true };
    } catch (err) {
      setMensagemAuth({ tipo: 'erro', texto: 'Erro ao validar código.' });
      return { sucesso: false };
    } finally {
      setEnviando(false);
    }
  }, [emailSolicitado]);

  const logout = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAguardandoOtp(false);
      setEmailSolicitado('');
      setMensagemAuth({ tipo: '', texto: '' });
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
  }, []);

  return {
    user,
    loadingAuth,
    enviando,
    aguardandoOtp,
    setAguardandoOtp,
    mensagemAuth,
    setMensagemAuth,
    enviarCodigoOtp,
    verificarCodigoOtp,
    logout
  };
}