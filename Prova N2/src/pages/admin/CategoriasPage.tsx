import { useState, useEffect } from "react";
import type { Categoria } from "../../models";
import { categoriaService } from "../../services/categoriaService";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try { setCategorias(await categoriaService.getAll()); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!nome.trim()) return;
    if (editando) {
      await categoriaService.update(editando.id, { nome, descricao });
    } else {
      await categoriaService.create({ nome, descricao });
    }
    setNome(""); setDescricao(""); setEditando(null);
    carregar();
  }

  function iniciarEdicao(c: Categoria) {
    setEditando(c); setNome(c.nome); setDescricao(c.descricao);
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir esta categoria?")) return;
    await categoriaService.delete(id);
    carregar();
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Categorias</h4>
          <p className="text-muted small mb-0">Gerencie as categorias de cursos e trilhas</p>
        </div>
        <span className="badge rounded-pill" style={{ background: "#1565c0" }}>{categorias.length}</span>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-3" style={{ color: "#1565c0" }}>
                {editando ? "Editar Categoria" : "Nova Categoria"}
              </h6>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nome *</label>
                  <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Tecnologia" required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Descrição</label>
                  <textarea className="form-control" rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição da categoria" />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn text-white flex-grow-1" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    {editando ? "Salvar" : "Criar"}
                  </button>
                  {editando && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditando(null); setNome(""); setDescricao(""); }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
              ) : categorias.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-tag fs-1 d-block mb-2 opacity-50" />
                  <p className="mb-0">Nenhuma categoria cadastrada ainda.</p>
                </div>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Nome</th>
                      <th>Descrição</th>
                      <th className="text-end pe-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(c => (
                      <tr key={c.id}>
                        <td className="ps-3 fw-medium">{c.nome}</td>
                        <td className="text-muted small">{c.descricao || "—"}</td>
                        <td className="text-end pe-3">
                          <div className="d-flex gap-1 justify-content-end">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => iniciarEdicao(c)}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(c.id)}>
                              <i className="bi bi-trash" />
                            </button>
                          </div>
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
    </div>
  );
}
