import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Plano, Assinatura } from "../../models";
import { planoService } from "../../services/planoService";
import { assinaturaService } from "../../services/assinaturaService";
import { useAuth } from "../../context/AuthContext";

export default function MeuPlanoPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([planoService.getAll(), assinaturaService.getByUsuario(usuario?.id || "")]).then(([p, a]) => {
      setPlanos(p); setAssinaturas(a);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [usuario]);

  const assinaturaAtiva = assinaturas.find(a => a.status === "ativa");
  const planoAtivo = assinaturaAtiva ? planos.find(p => p.id === assinaturaAtiva.idPlano) : null;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <h5 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>Meu Plano</h5>
      <p className="text-muted small mb-4">Gerencie sua assinatura</p>

      {planoAtivo && assinaturaAtiva && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderLeft: "4px solid #1565c0 !important" }}>
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-check-circle-fill text-primary" />
              <span className="fw-semibold" style={{ color: "#1565c0" }}>Plano ativo</span>
            </div>
            <div className="row align-items-center">
              <div className="col">
                <h5 className="fw-bold mb-1">{planoAtivo.nome}</h5>
                <div className="fw-bold" style={{ fontSize: "1.8rem", color: "#1565c0" }}>
                  R$ {planoAtivo.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  <span className="text-muted fw-normal" style={{ fontSize: ".85rem" }}>
                    /{planoAtivo.duracaoMeses === 1 ? "mês" : `${planoAtivo.duracaoMeses} meses`}
                  </span>
                </div>
                {planoAtivo.descricao && <p className="text-muted small mt-1 mb-0">{planoAtivo.descricao}</p>}
              </div>
              <div className="col-auto text-muted small">
                <div>Início: {new Date(assinaturaAtiva.dataInicio).toLocaleDateString("pt-BR")}</div>
                <div>Vencimento: {new Date(assinaturaAtiva.dataFim).toLocaleDateString("pt-BR")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!planoAtivo && (
        <div className="alert alert-warning mb-4">
          Você não possui um plano ativo.
          <button className="btn btn-sm btn-warning ms-3" onClick={() => navigate("/checkout")}>
            Contratar plano
          </button>
        </div>
      )}

      <h6 className="fw-semibold mb-3 text-muted">{planoAtivo ? "Trocar de plano" : "Planos disponíveis"}</h6>

      {planos.length === 0 ? (
        <p className="text-muted">Nenhum plano disponível no momento.</p>
      ) : (
        <div className="row g-3">
          {planos.map(p => {
            const isCurrent = planoAtivo?.id === p.id;
            return (
              <div key={p.id} className="col-12 col-md-4">
                <div className={`card border-0 shadow-sm h-100 ${isCurrent ? "border border-primary" : ""}`}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>{p.nome}</h5>
                    <div className="fw-bold my-2" style={{ fontSize: "1.8rem", color: "#1565c0" }}>
                      R$ {p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      <span className="text-muted fw-normal" style={{ fontSize: ".8rem" }}>
                        /{p.duracaoMeses === 1 ? "mês" : `${p.duracaoMeses}m`}
                      </span>
                    </div>
                    {p.descricao && <p className="text-muted small mb-0 flex-grow-1">{p.descricao}</p>}
                    <button
                      className={`btn mt-3 w-100 ${isCurrent ? "btn-outline-primary" : "text-white"}`}
                      style={isCurrent ? {} : { background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}
                      disabled={isCurrent}
                      onClick={() => navigate("/checkout", { state: { planoId: p.id } })}
                    >
                      {isCurrent ? "Plano atual" : "Contratar"}
                    </button>
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
