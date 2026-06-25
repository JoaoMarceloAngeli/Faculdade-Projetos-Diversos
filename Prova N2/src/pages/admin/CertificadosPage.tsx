import { useState, useEffect } from "react";
import type { Certificado, Usuario, Curso, Trilha } from "../../models";
import { certificadoService } from "../../services/certificadoService";
import { usuarioService } from "../../services/usuarioService";
import { cursoService } from "../../services/cursoService";
import { trilhaService } from "../../services/trilhaService";

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      certificadoService.getAll(),
      usuarioService.getAll(),
      cursoService.getAll(),
      trilhaService.getAll(),
    ]).then(([c, u, cs, t]) => {
      setCertificados(c); setUsuarios(u); setCursos(cs); setTrilhas(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Certificados</h4>
          <p className="text-muted small mb-0">Certificados emitidos na plataforma</p>
        </div>
        <span className="badge rounded-pill" style={{ background: "#1565c0" }}>{certificados.length}</span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : certificados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-award fs-1 d-block mb-2 opacity-50" />
              <p className="mb-0">Nenhum certificado emitido ainda.</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Aluno</th>
                  <th>Curso</th>
                  <th>Trilha</th>
                  <th>Código de Verificação</th>
                  <th>Data de Emissão</th>
                </tr>
              </thead>
              <tbody>
                {certificados.map(c => {
                  const user = usuarios.find(u => u.id === c.idUsuario);
                  const curso = cursos.find(cs => cs.id === c.idCurso);
                  const trilha = c.idTrilha ? trilhas.find(t => t.id === c.idTrilha) : null;
                  return (
                    <tr key={c.id}>
                      <td className="ps-3 fw-medium">{user?.nomeCompleto || "—"}</td>
                      <td>{curso?.titulo || "—"}</td>
                      <td className="text-muted small">{trilha?.titulo || "—"}</td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded" style={{ fontSize: ".8rem" }}>
                          {c.codigoVerificacao}
                        </code>
                      </td>
                      <td className="text-muted small">
                        {new Date(c.dataEmissao).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
