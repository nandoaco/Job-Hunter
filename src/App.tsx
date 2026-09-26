import { useEffect, useState } from 'react';
import { supabase, Vaga } from './lib/supabase';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Flame, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);

  useEffect(() => {
    carregarVagas();
  }, []);

  async function carregarVagas() {
    setLoading(true);
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .order('score_match', { ascending: false });

    if (!error && data) {
      setVagas(data as Vaga[]);
    }
    setLoading(false);
  }

  const vagasFiltradas = vagas.filter(v => 
    v.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    v.empresa.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const totalQuentes = vagas.filter(v => (v.score_match || 0) >= 75).length;
  const totalGaps = vagas.reduce((acc, v) => acc + (v.gaps?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Job Hunter Intelligence</h1>
            <p className="text-xs text-slate-400">Triagem e Análise Contínua de Oportunidades</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            n8n Pipeline Ativo
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-sm font-medium">Vagas Monitoradas</span>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold">{vagas.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-sm font-medium">Aderência Alta (≥ 75%)</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-amber-500">{totalQuentes}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-sm font-medium">Gaps Registrados</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-extrabold text-rose-400">{totalGaps}</p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Filtrar por cargo ou empresa..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={carregarVagas}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Carregando dados do Supabase...</div>
          ) : vagasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhuma vaga cadastrada ou encontrada nos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Cargo / Empresa</th>
                    <th className="py-3.5 px-4">Localização & Formato</th>
                    <th className="py-3.5 px-4">Origem</th>
                    <th className="py-3.5 px-4 text-right">Inscrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vagasFiltradas.map((vaga) => {
                    const score = vaga.score_match || 0;
                    const scoreBadge = score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                                       score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                                       'bg-slate-700/20 text-slate-400 border-slate-700';

                    return (
                      <tr 
                        key={vaga.id} 
                        onClick={() => setVagaSelecionada(vaga)}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${scoreBadge}`}>
                            {score}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-100">{vaga.titulo}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{vaga.empresa}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-slate-300 text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {vaga.localizacao || 'Remoto'}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                            {vaga.modelo_trabalho || 'Geral'}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {vaga.fonte}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <a 
                            href={vaga.url_original} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            Abrir <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {vagaSelecionada && (
        <aside className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl z-20 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{vagaSelecionada.empresa}</span>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">{vagaSelecionada.titulo}</h2>
            </div>
            <button 
              onClick={() => setVagaSelecionada(null)}
              className="text-slate-400 hover:text-slate-200 text-sm font-semibold p-1"
            >
              ✕
            </button>
          </div>

          <div className="py-6 space-y-6 flex-1">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Aderência Calculada</span>
                <span className="text-sm font-bold text-emerald-400">{vagaSelecionada.score_match}% Match</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{vagaSelecionada.justificativa || 'Análise de aderência concluída com sucesso.'}"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pontos Fortes
              </h3>
              <ul className="space-y-1.5">
                {(vagaSelecionada.pontos_fortes || []).map((ponto, i) => (
                  <li key={i} className="text-xs bg-slate-800/60 border border-slate-800 rounded-md p-2 text-slate-200">
                    {ponto}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Gaps Identificados
              </h3>
              <ul className="space-y-1.5">
                {(vagaSelecionada.gaps || []).map((gap, i) => (
                  <li key={i} className="text-xs bg-rose-500/10 border border-rose-500/20 rounded-md p-2 text-rose-300">
                    {gap}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wide">Descrição Original</h3>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-md text-xs text-slate-400 max-h-48 overflow-y-auto leading-relaxed">
                {vagaSelecionada.descricao_raw}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a 
              href={vagaSelecionada.url_original} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 rounded-lg text-center transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              Ir para Inscrição <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}