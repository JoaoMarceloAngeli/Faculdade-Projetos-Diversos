import { useState, useEffect } from "react";
import type { Curso, Modulo, Aula, Categoria } from "../../models";
import { cursoService } from "../../services/cursoService";
import { moduloService } from "../../services/moduloService";
import { aulaService } from "../../services/aulaService";
import { categoriaService } from "../../services/categoriaService";
import { useAuth } from "../../context/AuthContext";

type Tab = "cursos" | "modulos" | "aulas";

const NIVEIS: Curso["nivel"][] = ["Iniciante", "Intermediário", "Avançado"];
const TIPOS: Aula["tipoConteudo"][] = ["Vídeo", "Texto", "Quiz"];

export default function CursosPage() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState<Tab>("cursos");

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Forms
  const [cursoForm, setCursoForm] = useState({ titulo: "", descricao: "", idCategoria: "", nivel: "Iniciante" as Curso["nivel"], totalHoras: 0 });
  const [selCursoId, setSelCursoId] = useState("");
  const [moduloTitulo, setModuloTitulo] = useState("");
  const [moduloOrdem, setModuloOrdem] = useState(1);

  const [selModuloId, setSelModuloId] = useState("");
  const [aulaForm, setAulaForm] = useState({ titulo: "", tipoConteudo: "Vídeo" as Aula["tipoConteudo"], urlConteudo: "", duracaoMinutos: 5, ordem: 1 });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const [c, m, a, cat] = await Promise.all([
        cursoService.getAll(), moduloService.getAll(),
        aulaService.getAll(), categoriaService.getAll(),
      ]);
      setCursos(c); setModulos(m); setAulas(a); setCategorias(cat);
    } catch {
      // servidor indisponível
    } finally {
      setLoading(false);
    }
  }

  async function criarCurso(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!cursoForm.titulo.trim()) return;
    await cursoService.create({
      titulo: cursoForm.titulo,
      descricao: cursoForm.descricao,
      idInstrutor: usuario?.id || "1",
      idCategoria: cursoForm.idCategoria,
      nivel: cursoForm.nivel,
      dataPublicacao: new Date().toISOString(),
      totalAulas: 0,
      totalHoras: cursoForm.totalHoras,
    });
    setCursoForm({ titulo: "", descricao: "", idCategoria: "", nivel: "Iniciante", totalHoras: 0 });
    carregar();
  }

  async function excluirCurso(id: string, titulo: string) {
    if (!window.confirm(`Excluir curso "${titulo}"? Todos os módulos e aulas serão excluídos.`)) return;
    const modsDoC = modulos.filter(m => m.idCurso === id);
    for (const m of modsDoC) {
      const aulasDoM = aulas.filter(a => a.idModulo === m.id);
      await Promise.all(aulasDoM.map(a => aulaService.delete(a.id)));
      await moduloService.delete(m.id);
    }
    await cursoService.delete(id);
    carregar();
  }

  async function criarModulo(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!selCursoId || !moduloTitulo.trim()) return;
    await moduloService.create({ idCurso: selCursoId, titulo: moduloTitulo, ordem: moduloOrdem });
    setModuloTitulo(""); setModuloOrdem(moduloOrdem + 1);
    carregar();
  }

  async function excluirModulo(id: string, titulo: string) {
    if (!window.confirm(`Excluir módulo "${titulo}"?`)) return;
    const aulasDoM = aulas.filter(a => a.idModulo === id);
    await Promise.all(aulasDoM.map(a => aulaService.delete(a.id)));
    await moduloService.delete(id);
    carregar();
  }

  async function criarAula(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!selModuloId || !aulaForm.titulo.trim()) return;
    await aulaService.create({ ...aulaForm, idModulo: selModuloId });
    setAulaForm({ titulo: "", tipoConteudo: "Vídeo", urlConteudo: "", duracaoMinutos: 5, ordem: aulaForm.ordem + 1 });
    carregar();
  }

  async function excluirAula(id: string, titulo: string) {
    if (!window.confirm(`Excluir aula "${titulo}"?`)) return;
    await aulaService.delete(id);
    carregar();
  }

  const modulosDoCurso = modulos.filter(m => m.idCurso === selCursoId).sort((a, b) => a.ordem - b.ordem);
  const aulasDoModulo = aulas.filter(a => a.idModulo === selModuloId).sort((a, b) => a.ordem - b.ordem);
  const cursosFiltrados = filtroCategoria ? cursos.filter(c => c.idCategoria === filtroCategoria) : cursos;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <h4 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>Cursos</h4>
      <p className="text-muted small mb-4">Gerencie cursos, módulos e aulas</p>

      <ul className="nav nav-tabs mb-4">
        {([["cursos", "Cursos", "bi-mortarboard"], ["modulos", "Módulos", "bi-grid"], ["aulas", "Aulas", "bi-play-circle"]] as [Tab, string, string][]).map(([key, label, icon]) => (
          <li key={key} className="nav-item">
            <button className={`nav-link ${tab === key ? "active fw-semibold" : ""}`} onClick={() => setTab(key)}>
              <i className={`bi ${icon} me-1`} />{label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── CURSOS ── */}
      {tab === "cursos" && (
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-semibold mb-3" style={{ color: "#1565c0" }}>Novo Curso</h6>
                <form onSubmit={criarCurso}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Título *</label>
                    <input className="form-control" value={cursoForm.titulo} onChange={e => setCursoForm({ ...cursoForm, titulo: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Descrição</label>
                    <textarea className="form-control" rows={2} value={cursoForm.descricao} onChange={e => setCursoForm({ ...cursoForm, descricao: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Categoria</label>
                      <select className="form-select form-select-sm" value={cursoForm.idCategoria} onChange={e => setCursoForm({ ...cursoForm, idCategoria: e.target.value })}>
                        <option value="">Nenhuma</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Nível</label>
                      <select className="form-select form-select-sm" value={cursoForm.nivel} onChange={e => setCursoForm({ ...cursoForm, nivel: e.target.value as Curso["nivel"] })}>
                        {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Carga horária (h)</label>
                    <input type="number" min={0} className="form-control form-control-sm" value={cursoForm.totalHoras} onChange={e => setCursoForm({ ...cursoForm, totalHoras: parseInt(e.target.value) || 0 })} />
                  </div>
                  <button type="submit" className="btn w-100 text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    Criar Curso
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body border-bottom pb-2 pt-3 px-3">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label small fw-semibold mb-0 text-muted">Filtrar por categoria:</label>
                  <select className="form-select form-select-sm" style={{ maxWidth: 220 }}
                    value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas as categorias</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  {filtroCategoria && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setFiltroCategoria("")}>Limpar</button>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                {cursosFiltrados.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-mortarboard fs-1 d-block mb-2 opacity-50" />
                    <p className="mb-0">{filtroCategoria ? "Nenhum curso nesta categoria." : "Nenhum curso criado ainda."}</p>
                  </div>
                ) : (
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Título</th>
                        <th>Categoria</th>
                        <th>Nível</th>
                        <th>Módulos</th>
                        <th className="text-end pe-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursosFiltrados.map(c => (
                        <tr key={c.id}>
                          <td className="ps-3 fw-medium">{c.titulo}</td>
                          <td className="text-muted small">{categorias.find(cat => cat.id === c.idCategoria)?.nome || "—"}</td>
                          <td><span className="badge bg-light text-dark border" style={{ fontSize: ".72rem" }}>{c.nivel}</span></td>
                          <td className="text-muted small">{modulos.filter(m => m.idCurso === c.id).length}</td>
                          <td className="text-end pe-3">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => excluirCurso(c.id, c.titulo)}>
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
      )}

      {/* ── MÓDULOS ── */}
      {tab === "modulos" && (
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-semibold mb-3" style={{ color: "#1565c0" }}>Novo Módulo</h6>
                <form onSubmit={criarModulo}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Curso *</label>
                    <select className="form-select" value={selCursoId} onChange={e => setSelCursoId(e.target.value)} required>
                      <option value="">Selecione...</option>
                      {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Título do Módulo *</label>
                    <input className="form-control" value={moduloTitulo} onChange={e => setModuloTitulo(e.target.value)} placeholder="Ex: Introdução" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Ordem</label>
                    <input type="number" min={1} className="form-control" value={moduloOrdem} onChange={e => setModuloOrdem(Math.max(1, parseInt(e.target.value) || 1))} />
                  </div>
                  <button type="submit" className="btn w-100 text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    Adicionar Módulo
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {modulos.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-grid fs-1 d-block mb-2 opacity-50" />
                    <p className="mb-0">Nenhum módulo criado ainda.</p>
                  </div>
                ) : (
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Curso</th>
                        <th>Módulo</th>
                        <th>Ordem</th>
                        <th>Aulas</th>
                        <th className="text-end pe-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modulos.map(m => (
                        <tr key={m.id}>
                          <td className="ps-3 text-muted small">{cursos.find(c => c.id === m.idCurso)?.titulo || "—"}</td>
                          <td className="fw-medium">{m.titulo}</td>
                          <td>{m.ordem}</td>
                          <td>{aulas.filter(a => a.idModulo === m.id).length}</td>
                          <td className="text-end pe-3">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => excluirModulo(m.id, m.titulo)}>
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
      )}

      {/* ── AULAS ── */}
      {tab === "aulas" && (
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-semibold mb-3" style={{ color: "#1565c0" }}>Nova Aula</h6>
                <form onSubmit={criarAula}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Curso</label>
                    <select className="form-select form-select-sm" value={selCursoId} onChange={e => { setSelCursoId(e.target.value); setSelModuloId(""); }}>
                      <option value="">Selecione o curso...</option>
                      {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Módulo *</label>
                    <select className="form-select form-select-sm" value={selModuloId} onChange={e => setSelModuloId(e.target.value)} required>
                      <option value="">Selecione o módulo...</option>
                      {modulosDoCurso.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Título *</label>
                    <input className="form-control form-control-sm" value={aulaForm.titulo} onChange={e => setAulaForm({ ...aulaForm, titulo: e.target.value })} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Tipo de Conteúdo</label>
                    <select className="form-select form-select-sm" value={aulaForm.tipoConteudo} onChange={e => setAulaForm({ ...aulaForm, tipoConteudo: e.target.value as Aula["tipoConteudo"] })}>
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">URL do Conteúdo</label>
                    <input className="form-control form-control-sm" value={aulaForm.urlConteudo} onChange={e => setAulaForm({ ...aulaForm, urlConteudo: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Duração (min)</label>
                      <input type="number" min={1} className="form-control form-control-sm" value={aulaForm.duracaoMinutos} onChange={e => setAulaForm({ ...aulaForm, duracaoMinutos: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Ordem</label>
                      <input type="number" min={1} className="form-control form-control-sm" value={aulaForm.ordem} onChange={e => setAulaForm({ ...aulaForm, ordem: Math.max(1, parseInt(e.target.value) || 1) })} />
                    </div>
                  </div>
                  <button type="submit" className="btn w-100 text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    Adicionar Aula
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {aulas.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-play-circle fs-1 d-block mb-2 opacity-50" />
                    <p className="mb-0">Nenhuma aula criada ainda.</p>
                  </div>
                ) : (
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Módulo</th>
                        <th>Aula</th>
                        <th>Tipo</th>
                        <th>Duração</th>
                        <th>Ord.</th>
                        <th className="text-end pe-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selModuloId ? aulasDoModulo : aulas).map(a => (
                        <tr key={a.id}>
                          <td className="ps-3 text-muted small">{modulos.find(m => m.id === a.idModulo)?.titulo || "—"}</td>
                          <td className="fw-medium">{a.titulo}</td>
                          <td>
                            <span className={`badge ${a.tipoConteudo === "Vídeo" ? "bg-danger bg-opacity-10 text-danger" : a.tipoConteudo === "Quiz" ? "bg-warning bg-opacity-25 text-dark" : "bg-info bg-opacity-10 text-info"}`} style={{ fontSize: ".72rem" }}>
                              {a.tipoConteudo}
                            </span>
                          </td>
                          <td className="text-muted small">{a.duracaoMinutos}min</td>
                          <td>{a.ordem}</td>
                          <td className="text-end pe-3">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => excluirAula(a.id, a.titulo)}>
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
      )}
    </div>
  );
}
