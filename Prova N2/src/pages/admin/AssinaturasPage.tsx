import { useState, useEffect } from "react";
import type { Assinatura, Usuario, Plano, Pagamento } from "../../models";
import { assinaturaService } from "../../services/assinaturaService";
import { usuarioService } from "../../services/usuarioService";
import { planoService } from "../../services/planoService";
import { pagamentoService } from "../../services/pagamentoService";

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      assinaturaService.getAll(),
      usuarioService.getAll(),
      planoService.getAll(),
      pagamentoService.getAll(),
    ]).then(([a, u, p, pg]) => {
      setAssinaturas(a); setUsuarios(u); setPlanos(p); setPagamentos(pg);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ativas = assinaturas.filter(a => a.status === "ativa").length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Assinaturas</h4>
          <p className="text-muted small mb-0">Planos contratados pelos usuários</p>
        </div>
        <span className="badge rounded-pill" style={{ background: "#1565c0" }}>{ativas} ativas</span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : assinaturas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-receipt fs-1 d-block mb-2 opacity-50" />
              <p className="mb-0">Nenhuma assinatura registrada ainda.</p>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Usuário</th>
                  <th>Plano</th>
                  <th>Valor pago</th>
                  <th>Método</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assinaturas.map(a => {
                  const user = usuarios.find(u => u.id === a.idUsuario);
                  const plano = planos.find(p => p.id === a.idPlano);
                  const pg = pagamentos.find(p => p.idAssinatura === a.id);
                  return (
                    <tr key={a.id}>
                      <td className="ps-3 fw-medium">{user?.nomeCompleto || "—"}</td>
                      <td>{plano?.nome || "—"}</td>
                      <td>{pg ? `R$ ${pg.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-dark">{pg?.metodoPagamento || "—"}</span></td>
                      <td className="text-muted small">{new Date(a.dataInicio).toLocaleDateString("pt-BR")}</td>
                      <td className="text-muted small">{new Date(a.dataFim).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <span className={`badge ${a.status === "ativa" ? "bg-success" : "bg-secondary"}`}>
                          {a.status === "ativa" ? "Ativa" : "Cancelada"}
                        </span>
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
