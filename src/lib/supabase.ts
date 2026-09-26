import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Vaga {
  id: string;
  hash_dedup: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  modelo_trabalho: string;
  senioridade_declarada: string;
  url_original: string;
  fonte: string;
  score_match: number;
  nivel_aderencia: 'ALTO' | 'MEDIO' | 'BAIXO';
  pontos_fortes: string[];
  gaps: string[];
  justificativa: string;
  status_processamento: string;
  descricao_raw: string;
  created_at: string;
}