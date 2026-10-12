import { useState, useCallback, useMemo } from 'react';
import { chaveEmpresa } from '../lib/vagas';

const CHAVE_STORAGE = 'jh:empresas-ocultas';

function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((e) => e && e.chave) : [];
  } catch {
    return [];
  }
}

function gravar(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
  } catch {
    // sem armazenamento (aba privada, por exemplo): a lista vale só até fechar a página
  }
}

// Empresas que o dono não quer mais ver. Fica salvo neste aparelho.
export function useEmpresasOcultas() {
  const [lista, setLista] = useState(ler);

  const chaves = useMemo(() => new Set(lista.map((e) => e.chave)), [lista]);

  const ocultar = useCallback((nome) => {
    const chave = chaveEmpresa(nome);
    if (!chave) return;
    setLista((prev) => {
      if (prev.some((e) => e.chave === chave)) return prev;
      const nova = [...prev, { chave, nome: (nome || '').trim() }];
      gravar(nova);
      return nova;
    });
  }, []);

  const reexibir = useCallback((chave) => {
    setLista((prev) => {
      const nova = prev.filter((e) => e.chave !== chave);
      gravar(nova);
      return nova;
    });
  }, []);

  const estaOculta = useCallback((nome) => chaves.has(chaveEmpresa(nome)), [chaves]);

  return { empresasOcultas: lista, ocultarEmpresa: ocultar, reexibirEmpresa: reexibir, estaOculta };
}
