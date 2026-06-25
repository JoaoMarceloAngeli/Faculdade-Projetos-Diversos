import { useState, useEffect } from "react";
import type { Usuario } from "../../models";
import { usuarioService } from "../../services/usuarioService";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try { setUsuarios(await usuarioService.getAll()); }
    finally { setLoading(false); }
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir usuário "${nome}"?`)) return;
    await usuarioService.delete(id);
    carregar();
  }

  const filtrados = usuarios.filter(u =>
    u.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Usuários</h4>
          <p className="text-muted small mb-0">Gerencie os usuários cadastrados na plataforma</p>
        </div>
        <span className="badge rounded-pill" style={{ background: "#1565c0" }}>
          {usuarios.filter(u => u.role === "student").length} alunos
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body pb-0">
          <div className="input-group mb-3" style={{ maxWidth: 360 }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted" /></span>
            <input
              className="form-control border-start-0"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2 opacity-50" />
              <p className="mb-0">{busca ? "Nenhum resultado encontrado." : "Nenhum usuário cadastrado."}</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Usuário</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Cadastrado em</th>
                  <th className="text-end pe-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(u => (
                  <tr key={u.id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                          style={{ width: 36, height: 36, background: "linear-gradient(135deg,#1a3a8f,#1565c0)", fontSize: ".85rem", flexShrink: 0 }}
                        >
                          {u.nomeCompleto[0].toUpperCase()}
                        </div>
                        <span className="fw-medium">{u.nomeCompleto}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary bg-opacity-10 text-primary"}`}>
                        {u.role === "admin" ? "Admin" : "Aluno"}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(u.dataCadastro).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="text-end pe-3">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(u.id, u.nomeCompleto)}>
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
  );
}
