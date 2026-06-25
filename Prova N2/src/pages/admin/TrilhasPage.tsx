import { useState, useEffect } from "react";
import type { Trilha, Curso, Categoria, TrilhaCurso } from "../../models";
import { trilhaService } from "../../services/trilhaService";
import { trilhaCursoService } from "../../services/trilhaCursoService";
import { cursoService } from "../../services/cursoService";
import { categoriaService } from "../../services/categoriaService";

export default function TrilhasPage() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [trilhasCursos, setTrilhasCursos] = useState<TrilhaCurso[]>([]);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [idCategoria, setIdCategoria] = useState("");

  const [assocTrilha, setAssocTrilha] = useState("");
  const [assocCurso, setAssocCurso] = useState("");
  const [assocOrdem, setAssocOrdem] = useState(1);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const [t, c, cat, tc] = await Promise.all([
        trilhaService.getAll(), cursoService.getAll(),
        categoriaService.getAll(), trilhaCursoService.getAll(),
      ]);
      setTrilhas(t); setCursos(c); setCategorias(cat); setTrilhasCursos(tc);
    } catch {
      // servidor indisponível
    } finally {
      setLoading(false);
    }
  }

  async function criarTrilha(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!titulo.trim() || !idCategoria) return;
    await trilhaService.create({ titulo, descricao, idCategoria });
    setTitulo(""); setDescricao(""); setIdCategoria("");
    carregar();
  }

  async function excluirTrilha(id: string, titulo: string) {
    if (!window.confirm(`Excluir trilha "${titulo}" e suas associações?`)) return;
    const assocs = trilhasCursos.filter(tc => tc.idTrilha === id);
    await Promise.all(assocs.map(tc => trilhaCursoService.delete(tc.id)));
    await trilhaService.delete(id);
    carregar();
  }

  async function associar(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!assocTrilha || !assocCurso) return;
    await trilhaCursoService.create({ idTrilha: assocTrilha, idCurso: assocCurso, ordem: assocOrdem });
    setAssocTrilha(""); setAssocCurso(""); setAssocOrdem(1);
    carregar();
  }

  async function removerAssoc(id: string) {
    if (!window.confirm("Remover associação?")) return;
    await trilhaCursoService.delete(id);
    carregar();
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <h4 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>Trilhas de Aprendizado</h4>
      <p className="text-muted small mb-4">Organize cursos em sequências de aprendizado</p>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-semibold mb-3" style={{ color: "#1565c0" }}>Nova Trilha</h6>
              <form onSubmit={criarTrilha}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Título *</label>
                  <input className="form-control" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Categoria *</label>
                  <select className="form-select" value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Descrição</label>
                  <textarea className="form-control" rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} />
                </div>
                <button type="submit" className="btn w-100 text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                  Criar Trilha
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {trilhas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-map fs-1 d-block mb-2 opacity-50" />
                  <p className="mb-0">Nenhuma trilha criada ainda.</p>
                </div>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Título</th>
                      <th>Categoria</th>
                      <th>Cursos</th>
                      <th className="text-end pe-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trilhas.map(t => (
                      <tr key={t.id}>
                        <td className="ps-3 fw-medium">{t.titulo}</td>
                        <td>
                          <span className="badge" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".75rem" }}>
                            {categorias.find(c => c.id === t.idCategoria)?.nome || "—"}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {trilhasCursos.filter(tc => tc.idTrilha === t.id).length} cursos
                        </td>
                        <td className="text-end pe-3">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => excluirTrilha(t.id, t.titulo)}>
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">Associar Curso à Trilha</h6>
          <form onSubmit={associar}>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Trilha</label>
                <select className="form-select" value={assocTrilha} onChange={e => setAssocTrilha(e.target.value)} required>
                  <option value="">Selecione a trilha...</option>
                  {trilhas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Curso</label>
                <select className="form-select" value={assocCurso} onChange={e => setAssocCurso(e.target.value)} required>
                  <option value="">Selecione o curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold">Ordem</label>
                <input type="number" min={1} className="form-control" value={assocOrdem} onChange={e => setAssocOrdem(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="col-6 col-md-2">
                <button type="submit" className="btn btn-secondary w-100">Associar</button>
              </div>
            </div>
          </form>

          {trilhasCursos.length > 0 && (
            <div className="mt-3">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Trilha</th><th>Curso</th><th>Ordem</th><th className="text-end">Ação</th></tr>
                </thead>
                <tbody>
                  {trilhasCursos.map(tc => (
                    <tr key={tc.id}>
                      <td>{trilhas.find(t => t.id === tc.idTrilha)?.titulo || "—"}</td>
                      <td>{cursos.find(c => c.id === tc.idCurso)?.titulo || "—"}</td>
                      <td>{tc.ordem}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removerAssoc(tc.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
