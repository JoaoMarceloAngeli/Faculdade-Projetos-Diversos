export const API_URL = "http://localhost:3001";

const LS = "jm_ls_";
const SEEDED = "jm_seeded_v2";

const SEED: Record<string, unknown[]> = {
  usuarios: [{ id: "1", nomeCompleto: "Administrador", email: "admin@jmcursos.com", senhaHash: "admin123", role: "admin", dataCadastro: "2024-01-01T00:00:00.000Z" }],
  categorias: [
    { id: "1", nome: "Tecnologia", descricao: "Cursos de tecnologia e programação" },
    { id: "2", nome: "Negócios", descricao: "Cursos de gestão e empreendedorismo" },
    { id: "3", nome: "Design", descricao: "Cursos de design gráfico e UX/UI" },
    { id: "4", nome: "Marketing", descricao: "Cursos de marketing digital e vendas" },
    { id: "5", nome: "Desenvolvimento", descricao: "Cursos de desenvolvimento de software" },
  ],
  cursos: [
    { id: "1", titulo: "React do Zero ao Avançado", descricao: "Aprenda React com TypeScript, hooks, context API e muito mais.", idInstrutor: "1", idCategoria: "5", nivel: "Iniciante", dataPublicacao: "2024-01-15T00:00:00.000Z", totalAulas: 6, totalHoras: 10 },
    { id: "2", titulo: "Node.js e APIs REST", descricao: "Construa APIs robustas com Node.js, Express e banco de dados.", idInstrutor: "1", idCategoria: "1", nivel: "Intermediário", dataPublicacao: "2024-02-01T00:00:00.000Z", totalAulas: 4, totalHoras: 8 },
    { id: "3", titulo: "UX/UI Design Essencial", descricao: "Princípios de design centrado no usuário, Figma e prototipação.", idInstrutor: "1", idCategoria: "3", nivel: "Iniciante", dataPublicacao: "2024-03-01T00:00:00.000Z", totalAulas: 4, totalHoras: 6 },
  ],
  modulos: [
    { id: "1", idCurso: "1", titulo: "Fundamentos do React", ordem: 1 },
    { id: "2", idCurso: "1", titulo: "Hooks e Estado", ordem: 2 },
    { id: "3", idCurso: "1", titulo: "Roteamento com React Router", ordem: 3 },
    { id: "4", idCurso: "2", titulo: "Introdução ao Node.js", ordem: 1 },
    { id: "5", idCurso: "2", titulo: "Criando Rotas com Express", ordem: 2 },
    { id: "6", idCurso: "3", titulo: "Princípios de UX", ordem: 1 },
    { id: "7", idCurso: "3", titulo: "Design com Figma", ordem: 2 },
  ],
  aulas: [
    { id: "1", idModulo: "1", titulo: "O que é React?", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 12, ordem: 1 },
    { id: "2", idModulo: "1", titulo: "Componentes e JSX", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 18, ordem: 2 },
    { id: "3", idModulo: "2", titulo: "useState e useEffect", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 25, ordem: 1 },
    { id: "4", idModulo: "2", titulo: "Quiz: Hooks", tipoConteudo: "Quiz", urlConteudo: "", duracaoMinutos: 10, ordem: 2 },
    { id: "5", idModulo: "3", titulo: "Instalando React Router", tipoConteudo: "Texto", urlConteudo: "", duracaoMinutos: 8, ordem: 1 },
    { id: "6", idModulo: "3", titulo: "Rotas aninhadas", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 20, ordem: 2 },
    { id: "7", idModulo: "4", titulo: "Instalando Node.js", tipoConteudo: "Texto", urlConteudo: "", duracaoMinutos: 5, ordem: 1 },
    { id: "8", idModulo: "4", titulo: "Primeiro servidor HTTP", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 20, ordem: 2 },
    { id: "9", idModulo: "5", titulo: "GET, POST, PUT, DELETE", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 30, ordem: 1 },
    { id: "10", idModulo: "5", titulo: "Middlewares no Express", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 22, ordem: 2 },
    { id: "11", idModulo: "6", titulo: "O que é UX?", tipoConteudo: "Texto", urlConteudo: "", duracaoMinutos: 10, ordem: 1 },
    { id: "12", idModulo: "6", titulo: "Pesquisa com usuários", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 18, ordem: 2 },
    { id: "13", idModulo: "7", titulo: "Interface do Figma", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 25, ordem: 1 },
    { id: "14", idModulo: "7", titulo: "Criando protótipos", tipoConteudo: "Vídeo", urlConteudo: "https://www.youtube.com/watch?v=aWzKb071D9o&list=PLD40851E0E52E9080", duracaoMinutos: 30, ordem: 2 },
  ],
  matriculas: [],
  progressoAulas: [],
  avaliacoes: [],
  trilhas: [
    { id: "1", titulo: "Trilha Fullstack Web", descricao: "Do front-end ao back-end: construa aplicações completas.", idCategoria: "5" },
    { id: "2", titulo: "Trilha Designer Moderno", descricao: "UX, UI e prototipação com as ferramentas mais usadas do mercado.", idCategoria: "3" },
  ],
  trilhasCursos: [
    { id: "1", idTrilha: "1", idCurso: "1", ordem: 1 },
    { id: "2", idTrilha: "1", idCurso: "2", ordem: 2 },
    { id: "3", idTrilha: "2", idCurso: "3", ordem: 1 },
  ],
  certificados: [],
  planos: [
    { id: "1", nome: "Plano Mensal", descricao: "Acesso a todos os cursos por 1 mês", preco: 29.90, duracaoMeses: 1 },
    { id: "2", nome: "Plano Semestral", descricao: "Acesso a todos os cursos por 6 meses com desconto", preco: 149.90, duracaoMeses: 6 },
    { id: "3", nome: "Plano Anual", descricao: "Acesso completo por 1 ano com melhor custo-benefício", preco: 239.90, duracaoMeses: 12 },
  ],
  assinaturas: [],
  pagamentos: [],
};

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsGet<T>(col: string): T[] {
  try { return JSON.parse(localStorage.getItem(LS + col) || "[]"); } catch { return []; }
}

function lsSet(col: string, data: unknown[]): void {
  localStorage.setItem(LS + col, JSON.stringify(data));
}

function colFromPath(path: string): string {
  return path.replace(/^\//, "").split("?")[0];
}

function lsQuery<T>(path: string): T[] {
  const [col, qs] = path.slice(1).split("?");
  const items = lsGet<T>(col);
  if (!qs) return items;
  const params = new URLSearchParams(qs);
  return items.filter(item => {
    const obj = item as Record<string, unknown>;
    return Array.from(params.entries())
      .filter(([k]) => !k.startsWith("_"))
      .every(([k, v]) => String(obj[k]) === v);
  });
}

// Preenche localStorage na primeira visita (sem JSON Server)
function seedOnce(): void {
  if (localStorage.getItem(SEEDED)) return;
  Object.entries(SEED).forEach(([k, v]) => {
    if (!localStorage.getItem(LS + k)) lsSet(k, v);
  });
  localStorage.setItem(SEEDED, "1");
}

seedOnce();

// ── API com fallback automático para localStorage ────────────────────────────

async function tryFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${options?.method ?? "GET"} ${path} ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: async <T>(path: string): Promise<T[]> => {
    try { return await tryFetch<T[]>(path); }
    catch { return lsQuery<T>(path); }
  },

  post: async <T>(path: string, body: unknown): Promise<T> => {
    try { return await tryFetch<T>(path, { method: "POST", body: JSON.stringify(body) }); }
    catch {
      const col = colFromPath(path);
      const item = { ...(body as object), id: crypto.randomUUID() } as unknown as T;
      lsSet(col, [...lsGet(col), item]);
      return item;
    }
  },

  patch: async <T>(path: string, id: string, body: unknown): Promise<T> => {
    try { return await tryFetch<T>(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(body) }); }
    catch {
      const col = colFromPath(path);
      const rows = lsGet<unknown>(col).map(r => (r as {id:string}).id === id ? { ...(r as object), ...(body as object) } : r);
      lsSet(col, rows);
      return rows.find(r => (r as {id:string}).id === id) as T;
    }
  },

  delete: async (path: string, id: string): Promise<void> => {
    try { await tryFetch<void>(`${path}/${id}`, { method: "DELETE" }); }
    catch {
      const col = colFromPath(path);
      lsSet(col, lsGet<Record<string, unknown>>(col).filter(r => r.id !== id));
    }
  },
};
