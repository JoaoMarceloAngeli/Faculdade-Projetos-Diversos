import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Curso, Modulo, Aula, Matricula, ProgressoAula, Avaliacao, Certificado, Categoria, Assinatura } from "../../models";
import { cursoService } from "../../services/cursoService";
import { moduloService } from "../../services/moduloService";
import { aulaService } from "../../services/aulaService";
import { matriculaService } from "../../services/matriculaService";
import { progressoAulaService } from "../../services/progressoAulaService";
import { avaliacaoService } from "../../services/avaliacaoService";
import { certificadoService } from "../../services/certificadoService";
import { categoriaService } from "../../services/categoriaService";
import { assinaturaService } from "../../services/assinaturaService";
import { useAuth } from "../../context/AuthContext";

function gerarCodigo() {
  return "CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function CursosStudentPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<Assinatura | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [progressos, setProgressos] = useState<ProgressoAula[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [selCursoId, setSelCursoId] = useState<string | null>(null);
  const [avaliando, setAvaliando] = useState<string | null>(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  const carregar = useCallback(async () => {
    if (!usuario) return;
    try {
      const [c, cat, m, a, mat, prog, aval, cert, assinaturas] = await Promise.all([
        cursoService.getAll(),
        categoriaService.getAll(),
        moduloService.getAll(),
        aulaService.getAll(),
        matriculaService.getByUsuario(usuario.id),
        progressoAulaService.getByUsuario(usuario.id),
        avaliacaoService.getAll(),
        certificadoService.getByUsuario(usuario.id),
        assinaturaService.getAtiva(usuario.id),
      ]);
      setCursos(c); setCategorias(cat); setModulos(m); setAulas(a);
      setMatriculas(mat); setProgressos(prog);
      setAvaliacoes(aval); setCertificados(cert);
      setAssinaturaAtiva(assinaturas[0] ?? null);
    } catch {
      // servidor indisponível — mantém arrays vazios
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  async function matricular(cursoId: string) {
    if (!usuario) return;
    const jaMatriculado = matriculas.some(m => m.idCurso === cursoId);
    if (jaMatriculado) return;
    await matriculaService.create({
      idUsuario: usuario.id, idCurso: cursoId,
      dataMatricula: new Date().toISOString(),
    });
    await carregar();
  }

  async function concluirAula(aula: Aula) {
    if (!usuario) return;
    const jaConcluida = progressos.some(p => p.idAula === aula.id);
    if (jaConcluida) return;
    await progressoAulaService.create({
      idUsuario: usuario.id, idAula: aula.id,
      dataConclusao: new Date().toISOString(), status: "Concluído",
    });

    // Checar se concluiu o curso inteiro
    const aulasDoCurso = aulas.filter(a => modulos.some(m => m.idCurso === selCursoId && m.id === a.idModulo));
    const progAtualizado = [...progressos, { idAula: aula.id } as ProgressoAula];
    const todasConcluidas = aulasDoCurso.every(a => progAtualizado.some(p => p.idAula === a.id));

    if (todasConcluidas && selCursoId) {
      const jaTem = certificados.some(c => c.idCurso === selCursoId);
      if (!jaTem) {
        await certificadoService.create({
          idUsuario: usuario.id, idCurso: selCursoId,
          codigoVerificacao: gerarCodigo(),
          dataEmissao: new Date().toISOString(),
        });
        await matriculaService.getByUsuario(usuario.id).then(async (mats) => {
          const mat = mats.find(m => m.idCurso === selCursoId);
          if (mat) await matriculaService.update(mat.id, { dataConclusao: new Date().toISOString() });
        });
        alert("Parabéns! Você concluiu o curso e ganhou um certificado! 🎓");
      }
    }
    await carregar();
  }

  async function enviarAvaliacao(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!usuario || !avaliando) return;
    const jaAvaliou = avaliacoes.some(a => a.idCurso === avaliando && a.idUsuario === usuario.id);
    if (jaAvaliou) { alert("Você já avaliou este curso."); return; }
    await avaliacaoService.create({
      idUsuario: usuario.id, idCurso: avaliando,
      nota, comentario, dataAvaliacao: new Date().toISOString(),
    });
    setAvaliando(null); setNota(5); setComentario("");
    carregar();
  }

  const selCurso = cursos.find(c => c.id === selCursoId);
  const modulosDoCurso = selCursoId ? modulos.filter(m => m.idCurso === selCursoId).sort((a, b) => a.ordem - b.ordem) : [];
  const matriculadoNoCurso = selCursoId ? matriculas.some(m => m.idCurso === selCursoId) : false;
  const cursosFiltrados = filtroCategoria ? cursos.filter(c => c.idCategoria === filtroCategoria) : cursos;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  if (!assinaturaAtiva) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-lock-fill d-block mb-3" style={{ fontSize: "3rem", color: "#1565c0" }} />
        <h5 className="fw-bold mb-2" style={{ color: "#0d1b4b" }}>Acesso restrito</h5>
        <p className="text-muted mb-4">Você precisa de um plano ativo para acessar os cursos.</p>
        <button
          className="btn text-white px-4"
          style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}
          onClick={() => navigate("/checkout")}
        >
          <i className="bi bi-credit-card me-2" />
          Contratar um plano
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Cursos Disponíveis</h5>
        <select className="form-select form-select-sm" style={{ maxWidth: 220 }}
          value={filtroCategoria} onChange={e => { setFiltroCategoria(e.target.value); setSelCursoId(null); }}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {cursosFiltrados.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-mortarboard fs-1 d-block mb-2 opacity-50" />
          <p>{filtroCategoria ? "Nenhum curso nesta categoria." : "Nenhum curso disponível ainda."}</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {cursosFiltrados.map(c => {
            const isMatriculado = matriculas.some(m => m.idCurso === c.id);
            const aulasC = aulas.filter(a => modulos.some(m => m.idCurso === c.id && m.id === a.idModulo));
            const concluidas = aulasC.filter(a => progressos.some(p => p.idAula === a.id)).length;
            const total = aulasC.length;
            const progPct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
            const temCert = certificados.some(cert => cert.idCurso === c.id);
            const isSelected = selCursoId === c.id;

            return (
              <div key={c.id} className="col-12 col-sm-6 col-lg-4">
                <div
                  className={`card border-0 shadow-sm h-100 cursor-pointer ${isSelected ? "border border-primary" : ""}`}
                  style={{ cursor: "pointer", transition: "box-shadow .2s" }}
                  onClick={() => setSelCursoId(isSelected ? null : c.id)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0 me-2" style={{ color: "#0d1b4b", fontSize: ".9rem" }}>{c.titulo}</h6>
                      {temCert && <i className="bi bi-award-fill text-warning flex-shrink-0" title="Certificado obtido" />}
                    </div>
                    {c.descricao && <p className="text-muted small mb-2" style={{ fontSize: ".78rem" }}>{c.descricao}</p>}
                    <div className="d-flex gap-2 mb-2 flex-wrap">
                      <span className="badge bg-light text-dark border" style={{ fontSize: ".7rem" }}>{c.nivel}</span>
                      <span className="badge bg-light text-muted border" style={{ fontSize: ".7rem" }}>{total} aulas</span>
                    </div>
                    {isMatriculado && total > 0 && (
                      <div>
                        <div className="progress mb-1" style={{ height: 5 }}>
                          <div className="progress-bar" style={{ width: `${progPct}%`, background: "#1565c0" }} />
                        </div>
                        <span className="text-muted" style={{ fontSize: ".72rem" }}>{progPct}% concluído</span>
                      </div>
                    )}
                    {!isMatriculado && (
                      <button
                        className="btn btn-sm text-white mt-2 w-100"
                        style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".8rem" }}
                        onClick={e => { e.stopPropagation(); matricular(c.id); }}
                      >
                        Matricular-se
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detalhes do curso selecionado */}
      {selCurso && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
            <h6 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>{selCurso.titulo}</h6>
            <div className="d-flex gap-2">
              {matriculadoNoCurso && !avaliacoes.some(a => a.idCurso === selCurso.id && a.idUsuario === usuario?.id) && (
                <button className="btn btn-sm btn-outline-warning" onClick={() => setAvaliando(selCurso.id)}>
                  <i className="bi bi-star me-1" />Avaliar
                </button>
              )}
              <button className="btn-close" onClick={() => setSelCursoId(null)} />
            </div>
          </div>
          <div className="card-body pt-0">
            {!matriculadoNoCurso ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-lock fs-2 d-block mb-2 opacity-50" />
                <p className="mb-3">Matricule-se para acessar o conteúdo deste curso.</p>
                <button className="btn text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }} onClick={() => matricular(selCurso.id)}>
                  Matricular-se agora
                </button>
              </div>
            ) : modulosDoCurso.length === 0 ? (
              <p className="text-muted text-center py-3">Nenhum módulo adicionado a este curso ainda.</p>
            ) : (
              <div className="accordion" id="modulosAccordion">
                {modulosDoCurso.map(mod => {
                  const aulasDoMod = aulas.filter(a => a.idModulo === mod.id).sort((a, b) => a.ordem - b.ordem);
                  const concluidas = aulasDoMod.filter(a => progressos.some(p => p.idAula === a.id)).length;
                  return (
                    <div key={mod.id} className="accordion-item border mb-2 rounded">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed rounded fw-semibold" style={{ fontSize: ".9rem" }}
                          data-bs-toggle="collapse" data-bs-target={`#mod-${mod.id}`}>
                          <span className="me-2 badge" style={{ background: "#1565c0" }}>{mod.ordem}</span>
                          {mod.titulo}
                          <span className="ms-auto badge bg-light text-muted border me-2" style={{ fontSize: ".72rem" }}>
                            {concluidas}/{aulasDoMod.length}
                          </span>
                        </button>
                      </h2>
                      <div id={`mod-${mod.id}`} className="accordion-collapse collapse">
                        <div className="accordion-body p-0">
                          {aulasDoMod.length === 0 ? (
                            <p className="text-muted small p-3 mb-0">Nenhuma aula neste módulo.</p>
                          ) : (
                            aulasDoMod.map(aula => {
                              const concluida = progressos.some(p => p.idAula === aula.id);
                              return (
                                <div key={aula.id} className="d-flex align-items-center gap-3 p-3 border-top">
                                  <i className={`bi ${concluida ? "bi-check-circle-fill text-success" : "bi-circle text-muted"} flex-shrink-0`}
                                    style={{ fontSize: "1.1rem" }} />
                                  <div className="flex-grow-1">
                                    <div className="fw-medium small">{aula.titulo}</div>
                                    <div className="text-muted" style={{ fontSize: ".72rem" }}>
                                      {aula.tipoConteudo} · {aula.duracaoMinutos}min
                                    </div>
                                  </div>
                                  {aula.urlConteudo && (
                                    <a href={aula.urlConteudo} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm text-white flex-shrink-0"
                                      style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".75rem" }}
                                      onClick={() => concluirAula(aula)}>
                                      <i className="bi bi-play-fill me-1" />Acessar
                                    </a>
                                  )}
                                  {!aula.urlConteudo && !concluida && (
                                    <button className="btn btn-sm btn-outline-success flex-shrink-0"
                                      style={{ fontSize: ".75rem" }}
                                      onClick={() => concluirAula(aula)}>
                                      Concluir
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de avaliação */}
      {avaliando && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                <h5 className="modal-title text-white fw-bold">Avaliar Curso</h5>
                <button className="btn-close btn-close-white" onClick={() => setAvaliando(null)} />
              </div>
              <form onSubmit={enviarAvaliacao}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nota (1-5)</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button"
                          className={`btn ${nota >= n ? "btn-warning" : "btn-outline-secondary"}`}
                          onClick={() => setNota(n)}>
                          <i className="bi bi-star-fill" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Comentário (opcional)</label>
                    <textarea className="form-control" rows={3} value={comentario} onChange={e => setComentario(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setAvaliando(null)}>Cancelar</button>
                  <button type="submit" className="btn text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    Enviar avaliação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
