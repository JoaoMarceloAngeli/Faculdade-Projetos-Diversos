import { useState, useEffect } from "react";
import type { Certificado, Curso, Trilha } from "../../models";
import { certificadoService } from "../../services/certificadoService";
import { cursoService } from "../../services/cursoService";
import { trilhaService } from "../../services/trilhaService";
import { useAuth } from "../../context/AuthContext";

export default function CertificadosStudentPage() {
  const { usuario } = useAuth();
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    Promise.all([
      certificadoService.getByUsuario(usuario.id),
      cursoService.getAll(),
      trilhaService.getAll(),
    ]).then(([c, cs, t]) => {
      setCertificados(c); setCursos(cs); setTrilhas(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [usuario]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Meus Certificados</h5>
          <p className="text-muted small mb-0">Certificados de conclusão de cursos</p>
        </div>
        <span className="badge rounded-pill" style={{ background: "#1565c0" }}>{certificados.length}</span>
      </div>

      {certificados.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-award fs-1 d-block mb-3 opacity-50" />
          <p className="mb-1">Você ainda não possui certificados.</p>
          <p className="small">Conclua todas as aulas de um curso para obter seu certificado.</p>
        </div>
      ) : (
        <div className="row g-3">
          {certificados.map(c => {
            const curso = cursos.find(cs => cs.id === c.idCurso);
            const trilha = c.idTrilha ? trilhas.find(t => t.id === c.idTrilha) : null;
            return (
              <div key={c.id} className="col-12 col-md-6">
                <div className="card border-0 shadow-sm overflow-hidden">
                  <div className="card-header border-0 text-white py-3"
                    style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-award-fill fs-4" />
                      <div>
                        <div className="fw-bold">Certificado de Conclusão</div>
                        <div style={{ fontSize: ".78rem", opacity: .85 }}>JM Cursos</div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>
                      {curso?.titulo || "Curso"}
                    </h6>
                    {trilha && (
                      <div className="text-muted small mb-2">
                        <i className="bi bi-map me-1" />{trilha.titulo}
                      </div>
                    )}
                    <div className="text-muted small mb-3">
                      Emitido em {new Date(c.dataEmissao).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="p-2 rounded" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                      <div className="text-muted small mb-1">Código de verificação</div>
                      <code className="fw-bold" style={{ color: "#1565c0", fontSize: ".95rem", letterSpacing: ".05em" }}>
                        {c.codigoVerificacao}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
