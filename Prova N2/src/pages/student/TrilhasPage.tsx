import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Trilha, Categoria, TrilhaCurso, Curso, Matricula, ProgressoAula, Certificado, Aula, Modulo } from "../../models";
import { trilhaService } from "../../services/trilhaService";
import { categoriaService } from "../../services/categoriaService";
import { trilhaCursoService } from "../../services/trilhaCursoService";
import { cursoService } from "../../services/cursoService";
import { matriculaService } from "../../services/matriculaService";
import { progressoAulaService } from "../../services/progressoAulaService";
import { certificadoService } from "../../services/certificadoService";
import { aulaService } from "../../services/aulaService";
import { moduloService } from "../../services/moduloService";
import { assinaturaService } from "../../services/assinaturaService";
import { useAuth } from "../../context/AuthContext";

function gerarCodigo() {
  return "CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function TrilhasStudentPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [trilhasCursos, setTrilhasCursos] = useState<TrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [progressos, setProgressos] = useState<ProgressoAula[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [iniciando, setIniciando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    try {
      const [t, cat, tc, cs, mat, prog, cert, a, m, assin] = await Promise.all([
        trilhaService.getAll(),
        categoriaService.getAll(),
        trilhaCursoService.getAll(),
        cursoService.getAll(),
        matriculaService.getByUsuario(usuario.id),
        progressoAulaService.getByUsuario(usuario.id),
        certificadoService.getByUsuario(usuario.id),
        aulaService.getAll(),
        moduloService.getAll(),
        assinaturaService.getAtiva(usuario.id),
      ]);
      setTrilhas(t); setCategorias(cat); setTrilhasCursos(tc); setCursos(cs);
      setMatriculas(mat); setProgressos(prog); setCertificados(cert);
      setAulas(a); setModulos(m);
      setAssinaturaAtiva(assin.length > 0);

      // Gera certificado de trilha automaticamente quando todos os cursos são concluídos
      let certAtualizado = cert;
      for (const trilha of t) {
        const cursosNaTrilha = tc
          .filter(x => x.idTrilha === trilha.id)
          .map(x => cs.find(c => c.id === x.idCurso))
          .filter(Boolean) as Curso[];

        if (cursosNaTrilha.length === 0) continue;

        const todosConcluidos = cursosNaTrilha.every(curso =>
          certAtualizado.some(c => c.idCurso === curso.id && !c.idTrilha)
        );
        const jaTem = certAtualizado.some(c => c.idTrilha === trilha.id);

        if (todosConcluidos && !jaTem) {
          await certificadoService.create({
            idUsuario: usuario.id,
            idCurso: cursosNaTrilha[cursosNaTrilha.length - 1].id,
            idTrilha: trilha.id,
            codigoVerificacao: gerarCodigo(),
            dataEmissao: new Date().toISOString(),
          });
          certAtualizado = await certificadoService.getByUsuario(usuario.id);
          setCertificados(certAtualizado);
        }
      }
    } catch { }
    finally { setLoading(false); }
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  async function iniciarTrilha(trilhaId: string) {
    if (!usuario) return;
    setIniciando(trilhaId);
    try {
      const cursosNaTrilha = trilhasCursos
        .filter(tc => tc.idTrilha === trilhaId)
        .sort((a, b) => a.ordem - b.ordem)
        .map(tc => cursos.find(c => c.id === tc.idCurso))
        .filter(Boolean) as Curso[];

      for (const curso of cursosNaTrilha) {
        const jaMatriculado = matriculas.some(m => m.idCurso === curso.id);
        if (!jaMatriculado) {
          await matriculaService.create({
            idUsuario: usuario.id,
            idCurso: curso.id,
            dataMatricula: new Date().toISOString(),
          });
        }
      }
      await carregar();
    } finally {
      setIniciando(null);
    }
  }

  const filtradas = filtroCategoria
    ? trilhas.filter(t => t.idCategoria === filtroCategoria)
    : trilhas;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  if (!assinaturaAtiva) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-lock-fill d-block mb-3" style={{ fontSize: "3rem", color: "#1565c0" }} />
        <h5 className="fw-bold mb-2" style={{ color: "#0d1b4b" }}>Acesso restrito</h5>
        <p className="text-muted mb-4">Você precisa de um plano ativo para acessar as trilhas.</p>
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
        <div>
          <h5 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Trilhas de Aprendizado</h5>
          <p className="text-muted small mb-0">Percursos guiados com sequência de cursos</p>
        </div>
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 200 }}
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-map fs-1 d-block mb-2 opacity-50" />
          <p>Nenhuma trilha disponível ainda.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtradas.map(t => {
            const cat = categorias.find(c => c.id === t.idCategoria);
            const cursosNaTrilha = trilhasCursos
              .filter(tc => tc.idTrilha === t.id)
              .sort((a, b) => a.ordem - b.ordem)
              .map(tc => cursos.find(c => c.id === tc.idCurso))
              .filter(Boolean) as Curso[];

            const total = cursosNaTrilha.length;
            const temCertTrilha = certificados.some(c => c.idTrilha === t.id);
            const cursosConcluidos = cursosNaTrilha.filter(c =>
              certificados.some(cert => cert.idCurso === c.id && !cert.idTrilha)
            ).length;
            const progPct = total > 0 ? Math.round((cursosConcluidos / total) * 100) : 0;
            const algumMatriculado = cursosNaTrilha.some(c => matriculas.some(m => m.idCurso === c.id));
            const todosMatriculados = total > 0 && cursosNaTrilha.every(c => matriculas.some(m => m.idCurso === c.id));
            const aberta = expandida === t.id;

            return (
              <div key={t.id} className="card border-0 shadow-sm">
                <div className="card-body">

                  {/* Cabeçalho da trilha */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h6 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>{t.titulo}</h6>
                        {temCertTrilha && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: ".72rem" }}>
                            <i className="bi bi-award-fill me-1" />Certificado obtido
                          </span>
                        )}
                      </div>
                      {cat && (
                        <span className="badge" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".72rem" }}>
                          {cat.nome}
                        </span>
                      )}
                    </div>
                    <span className="badge bg-light text-muted border flex-shrink-0">{total} curso{total !== 1 ? "s" : ""}</span>
                  </div>

                  {t.descricao && <p className="text-muted small mb-3">{t.descricao}</p>}

                  {/* Barra de progresso geral */}
                  {algumMatriculado && total > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Progresso da trilha</span>
                        <span className="small fw-semibold" style={{ color: "#1565c0" }}>
                          {cursosConcluidos} de {total} curso{total !== 1 ? "s" : ""} concluído{cursosConcluidos !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${progPct}%`, background: "linear-gradient(135deg,#1a3a8f,#1565c0)", borderRadius: 4 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="d-flex gap-2 flex-wrap">
                    {!todosMatriculados && (
                      <button
                        className="btn btn-sm text-white"
                        style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}
                        onClick={() => iniciarTrilha(t.id)}
                        disabled={iniciando === t.id}
                      >
                        {iniciando === t.id ? (
                          <><span className="spinner-border spinner-border-sm me-1" />Inscrevendo...</>
                        ) : (
                          <><i className={`bi ${algumMatriculado ? "bi-plus-circle" : "bi-play-circle"} me-1`} />
                            {algumMatriculado ? "Matricular nos restantes" : "Iniciar Trilha"}</>
                        )}
                      </button>
                    )}
                    {algumMatriculado && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate("/student/cursos")}
                      >
                        <i className="bi bi-mortarboard me-1" />Ir para os cursos
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={() => setExpandida(aberta ? null : t.id)}
                    >
                      <i className={`bi ${aberta ? "bi-chevron-up" : "bi-chevron-down"} me-1`} />
                      {aberta ? "Ocultar cursos" : "Ver cursos da trilha"}
                    </button>
                  </div>

                  {/* Lista de cursos expandida */}
                  {aberta && (
                    <div className="mt-3 pt-3 border-top">
                      {cursosNaTrilha.length === 0 ? (
                        <p className="text-muted small mb-0">Nenhum curso nesta trilha ainda.</p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {cursosNaTrilha.map((c, i) => {
                            const matriculado = matriculas.some(m => m.idCurso === c.id);
                            const temCert = certificados.some(cert => cert.idCurso === c.id && !cert.idTrilha);
                            const aulasC = aulas.filter(a => modulos.some(m => m.idCurso === c.id && m.id === a.idModulo));
                            const concluidasC = aulasC.filter(a => progressos.some(p => p.idAula === a.id)).length;
                            const totalC = aulasC.length;
                            const pctC = totalC > 0 ? Math.round((concluidasC / totalC) * 100) : 0;

                            return (
                              <div
                                key={c.id}
                                className="d-flex align-items-center gap-3 p-3 rounded"
                                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                              >
                                {/* Número / check */}
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                                  style={{
                                    width: 36, height: 36,
                                    background: temCert ? "#198754" : matriculado ? "#1565c0" : "#e2e8f0",
                                    color: (temCert || matriculado) ? "#fff" : "#94a3b8",
                                    fontSize: ".82rem",
                                  }}
                                >
                                  {temCert ? <i className="bi bi-check-lg" /> : i + 1}
                                </div>

                                <div className="flex-grow-1 min-w-0">
                                  <div className="d-flex justify-content-between align-items-start gap-2">
                                    <span className="fw-medium small text-truncate">{c.titulo}</span>
                                    {temCert && (
                                      <span className="badge bg-success flex-shrink-0" style={{ fontSize: ".65rem" }}>Concluído</span>
                                    )}
                                    {matriculado && !temCert && (
                                      <span className="badge bg-primary bg-opacity-10 text-primary border flex-shrink-0" style={{ fontSize: ".65rem" }}>Em andamento</span>
                                    )}
                                    {!matriculado && (
                                      <span className="badge bg-light text-muted border flex-shrink-0" style={{ fontSize: ".65rem" }}>Não iniciado</span>
                                    )}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: ".72rem" }}>{c.nivel} · {c.totalHoras}h</div>
                                  {matriculado && !temCert && totalC > 0 && (
                                    <div className="mt-1">
                                      <div className="progress" style={{ height: 4, borderRadius: 2 }}>
                                        <div className="progress-bar" style={{ width: `${pctC}%`, background: "#1565c0" }} />
                                      </div>
                                      <span style={{ fontSize: ".68rem", color: "#64748b" }}>{pctC}% das aulas concluídas</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
