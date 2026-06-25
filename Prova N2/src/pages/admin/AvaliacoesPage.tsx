import { useState, useEffect } from "react";
import type { Avaliacao, Usuario, Curso } from "../../models";
import { avaliacaoService } from "../../services/avaliacaoService";
import { usuarioService } from "../../services/usuarioService";
import { cursoService } from "../../services/cursoService";

function Estrelas({ nota }: { nota: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(n => (
        <i key={n} className={`bi bi-star${nota >= n ? "-fill text-warning" : " text-muted"}`}
          style={{ fontSize: ".85rem" }} />
      ))}
    </span>
  );
}

export default function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState("");

  useEffect(() => {
    Promise.all([
      avaliacaoService.getAll(),
      usuarioService.getAll(),
      cursoService.getAll(),
    ]).then(([a, u, c]) => {
      setAvaliacoes(a); setUsuarios(u); setCursos(c);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtradas = filtroCurso
    ? avaliacoes.filter(a => a.idCurso === filtroCurso)
    : avaliacoes;

  const mediaGeral = avaliacoes.length > 0
    ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1)
    : "—";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Avaliações</h4>
          <p className="text-muted small mb-0">
            Avaliações enviadas pelos alunos · Média geral:&nbsp;
            <strong style={{ color: "#1565c0" }}>{mediaGeral}</strong>
            {avaliacoes.length > 0 && <span className="text-muted"> ({avaliacoes.length} avaliações)</span>}
          </p>
        </div>
        <select className="form-select form-select-sm" style={{ maxWidth: 240 }}
          value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}>
          <option value="">Todos os cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-star fs-1 d-block mb-2 opacity-50" />
              <p className="mb-0">Nenhuma avaliação registrada ainda.</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Aluno</th>
                  <th>Curso</th>
                  <th>Nota</th>
                  <th>Comentário</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(a => {
                  const user = usuarios.find(u => u.id === a.idUsuario);
                  const curso = cursos.find(c => c.id === a.idCurso);
                  return (
                    <tr key={a.id}>
                      <td className="ps-3 fw-medium">{user?.nomeCompleto || "—"}</td>
                      <td className="text-muted small">{curso?.titulo || "—"}</td>
                      <td><Estrelas nota={a.nota} /></td>
                      <td className="text-muted small">{a.comentario || <span className="fst-italic opacity-50">sem comentário</span>}</td>
                      <td className="text-muted small">{new Date(a.dataAvaliacao).toLocaleDateString("pt-BR")}</td>
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
