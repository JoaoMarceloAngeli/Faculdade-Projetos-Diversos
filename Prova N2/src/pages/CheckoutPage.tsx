import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Plano } from "../models";
import { planoService } from "../services/planoService";
import { assinaturaService } from "../services/assinaturaService";
import { pagamentoService } from "../services/pagamentoService";
import { useAuth } from "../context/AuthContext";

type Metodo = "Cartão de Crédito" | "Cartão de Débito" | "Pix" | "Boleto";

function gerarTransacao() {
  return "TXN-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CheckoutPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location.state as { planoId?: string } | null)?.planoId;

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selPlanoId, setSelPlanoId] = useState(preselected || "");
  const [metodo, setMetodo] = useState<Metodo>("Cartão de Crédito");
  const [numCartao, setNumCartao] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"plano" | "pagamento" | "sucesso">("plano");
  const [transacaoId, setTransacaoId] = useState("");

  useEffect(() => {
    planoService.getAll().then(p => {
      setPlanos(p);
      if (!preselected && p.length > 0) setSelPlanoId(p[0].id);
    });
  }, [preselected]);

  const planoSel = planos.find(p => p.id === selPlanoId);

  async function confirmarPagamento(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!usuario || !planoSel) return;
    setLoading(true);
    try {
      // Cancelar assinatura anterior
      const antigas = await assinaturaService.getAtiva(usuario.id);
      for (const a of antigas) {
        await assinaturaService.update(a.id, { status: "cancelada" });
      }

      // Calcular datas
      const inicio = new Date();
      const fim = new Date(inicio);
      fim.setMonth(fim.getMonth() + planoSel.duracaoMeses);

      // Criar assinatura
      const assinatura = await assinaturaService.create({
        idUsuario: usuario.id,
        idPlano: planoSel.id,
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString(),
        status: "ativa",
      });

      // Gerar ID de transação
      const txnId = gerarTransacao();
      setTransacaoId(txnId);

      // Criar pagamento
      await pagamentoService.create({
        idAssinatura: assinatura.id,
        valorPago: planoSel.preco,
        dataPagamento: new Date().toISOString(),
        metodoPagamento: metodo,
        idTransacaoGateway: txnId,
        dataFim: fim.toISOString(),
      });

      setStep("sucesso");
    } finally {
      setLoading(false);
    }
  }

  if (step === "sucesso") {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ background: "linear-gradient(135deg,#f0f4ff,#e8f0fe)" }}>
        <div className="card border-0 shadow-lg text-center p-5" style={{ maxWidth: 480, width: "100%" }}>
          <div className="mb-3" style={{ fontSize: "4rem" }}>🎉</div>
          <h3 className="fw-bold mb-2" style={{ color: "#0d1b4b" }}>Pagamento confirmado!</h3>
          <p className="text-muted mb-2">Você assinou o <strong>{planoSel?.nome}</strong> com sucesso.</p>
          <div className="p-3 rounded mb-3" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
            <div className="text-muted small mb-1">ID da Transação</div>
            <code className="fw-bold" style={{ color: "#1565c0", fontSize: ".9rem" }}>{transacaoId}</code>
          </div>
          <div className="text-muted small mb-4">
            Método: <strong>{metodo}</strong> · Valor: <strong>R$ {planoSel?.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
          <button className="btn text-white w-100"
            style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}
            onClick={() => navigate("/student")}>
            Acessar plataforma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{ background: "linear-gradient(135deg,#f0f4ff,#e8f0fe)" }}>
      <div style={{ maxWidth: 860, width: "100%" }}>
        <div className="text-center mb-4">
          <div className="fw-bold mb-1" style={{ fontSize: "1.8rem", color: "#0d1b4b" }}>
            JM <span style={{ color: "#1565c0" }}>Cursos</span>
          </div>
          <h4 className="fw-bold" style={{ color: "#0d1b4b" }}>
            {step === "plano" ? "Escolha seu plano" : "Dados de pagamento"}
          </h4>
        </div>

        {/* Steps indicator */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          {["plano", "pagamento"].map((s, i) => (
            <div key={s} className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{ width: 32, height: 32, background: step === s || (s === "plano" && step === "pagamento") ? "#1565c0" : "#e5e7eb", color: step === s || (s === "plano" && step === "pagamento") ? "#fff" : "#9ca3af", fontSize: ".85rem" }}>
                {i + 1}
              </div>
              <span className="small fw-medium" style={{ color: step === s ? "#0d1b4b" : "#9ca3af" }}>
                {s === "plano" ? "Plano" : "Pagamento"}
              </span>
            </div>
          ))}
        </div>

        {step === "plano" && (
          <>
            <div className="row g-3 mb-4">
              {planos.map(p => (
                <div key={p.id} className="col-12 col-md-4">
                  <div
                    className={`card border-0 shadow-sm h-100 ${selPlanoId === p.id ? "border border-primary" : ""}`}
                    style={{ cursor: "pointer", transition: ".2s" }}
                    onClick={() => setSelPlanoId(p.id)}
                  >
                    <div className="card-body d-flex flex-column align-items-center text-center p-4">
                      {selPlanoId === p.id && (
                        <span className="badge mb-2" style={{ background: "#1565c0" }}>Selecionado</span>
                      )}
                      <h5 className="fw-bold mb-1" style={{ color: "#0d1b4b" }}>{p.nome}</h5>
                      <div className="fw-bold my-2" style={{ fontSize: "2.2rem", color: "#1565c0", lineHeight: 1 }}>
                        R$ {p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-muted small mb-2">
                        {p.duracaoMeses === 1 ? "por mês" : p.duracaoMeses === 12 ? "por ano" : `por ${p.duracaoMeses} meses`}
                      </div>
                      {p.descricao && <p className="text-muted small mb-0">{p.descricao}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                className="btn text-white px-5"
                style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}
                disabled={!selPlanoId}
                onClick={() => setStep("pagamento")}
              >
                Continuar para pagamento →
              </button>
            </div>
          </>
        )}

        {step === "pagamento" && planoSel && (
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-7">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-semibold mb-4" style={{ color: "#1565c0" }}>Dados de pagamento</h6>
                  <form onSubmit={confirmarPagamento}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Método de pagamento *</label>
                      <div className="row g-2">
                        {(["Cartão de Crédito", "Cartão de Débito", "Pix", "Boleto"] as Metodo[]).map(m => (
                          <div key={m} className="col-6">
                            <div
                              className={`p-2 rounded border text-center small fw-medium ${metodo === m ? "border-primary text-primary" : "text-muted"}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => setMetodo(m)}
                            >
                              <i className={`bi ${m === "Pix" ? "bi-qr-code" : m === "Boleto" ? "bi-barcode" : "bi-credit-card"} me-1`} />
                              {m}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(metodo === "Cartão de Crédito" || metodo === "Cartão de Débito") && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Número do cartão *</label>
                        <input
                          className="form-control"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          value={numCartao}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, "").substring(0, 16);
                            setNumCartao(v.replace(/(.{4})/g, "$1 ").trim());
                          }}
                          required
                        />
                      </div>
                    )}

                    {metodo === "Pix" && (
                      <div className="alert alert-info small mb-3">
                        <i className="bi bi-info-circle me-1" />
                        Um QR Code será gerado após a confirmação. (simulação)
                      </div>
                    )}

                    {metodo === "Boleto" && (
                      <div className="alert alert-info small mb-3">
                        <i className="bi bi-info-circle me-1" />
                        O boleto será enviado por e-mail após a confirmação. (simulação)
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-4">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setStep("plano")}>
                        ← Voltar
                      </button>
                      <button type="submit" className="btn text-white flex-grow-1" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }} disabled={loading}>
                        {loading ? "Processando..." : `Confirmar pagamento · R$ ${planoSel.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-semibold mb-3 text-muted">Resumo do pedido</h6>
                  <div className="fw-bold fs-5 mb-1">{planoSel.nome}</div>
                  <div className="text-muted small mb-3">{planoSel.descricao}</div>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="fw-semibold">Total</span>
                    <span className="fw-bold fs-4" style={{ color: "#1565c0" }}>
                      R$ {planoSel.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-muted small mt-1">
                    Acesso por {planoSel.duracaoMeses === 1 ? "1 mês" : `${planoSel.duracaoMeses} meses`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
