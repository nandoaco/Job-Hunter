
import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(valorAlvo, duracao = 600) {
  const [valorExibido, setValorExibido] = useState(0);
  const valorAnteriorRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    // Respeita prefers-reduced-motion
    const prefereReducao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const destino = Number(valorAlvo) || 0;

    if (prefereReducao) {
      setValorExibido(destino);
      valorAnteriorRef.current = destino;
      return;
    }

    const inicio = valorAnteriorRef.current;
    const diferenca = destino - inicio;
    if (diferenca === 0) {
      setValorExibido(destino);
      return;
    }

    let tempoInicial = null;

    const animar = (tempoAtual) => {
      if (!tempoInicial) tempoInicial = tempoAtual;
      const progresso = Math.min((tempoAtual - tempoInicial) / duracao, 1);
      
      // Easing suave (easeOutQuad)
      const taxa = 1 - (1 - progresso) * (1 - progresso);
      const valorAtual = Math.round(inicio + diferenca * taxa);

      setValorExibido(valorAtual);

      if (progresso < 1) {
        frameRef.current = requestAnimationFrame(animar);
      } else {
        setValorExibido(destino);
        valorAnteriorRef.current = destino;
      }
    };

    frameRef.current = requestAnimationFrame(animar);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [valorAlvo, duracao]);

  return valorExibido;
}