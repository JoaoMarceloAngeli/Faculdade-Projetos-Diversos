import { useState, useEffect } from "react";
import type { Plano } from "../../models";
import { planoService } from "../../services/planoService";

const emptyForm = { nome: "", descricao: "", preco: 0, duracaoMeses: 1 };

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState<Plano | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try { setPlanos(await planoService.getAll()); }
    finally { setLoading(false); }
  }

  function abrirNovo() {
    setEditando(null); setForm(emptyForm); setShowModal(true);
  }

  function abrirEdicao(p: Plano) {
    setEditando(p);
    setForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, duracaoMeses: p.duracaoMeses });
    setShowModal(true);
  }

  async function salvar() {
    if (!form.nome.trim()) return;
    if (editando) await planoService.update(editando.id, form);
    else await planoService.create(form);
    setShowModal(false);
    carregar();
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir plano "${nome}"?`)) return;
    await planoService.delete(id);
    carregar();
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>Planos</h4>
          <p className="text-muted small mb-0">Gerencie os planos de assinatura</p>
        </div>
        <button className="btn text-white btn-sm" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }} onClick={abrirNovo}>
          <i className="bi bi-plus-circle me-1" /> Novo Plano
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : planos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-credit-card fs-1 d-block mb-2 opacity-50" />
          <p>Nenhum plano cadastrado.</p>
          <button className="btn text-white btn-sm" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }} onClick={abrirNovo}>Criar plano</button>
        </div>
      ) : (
        <div className="row g-3">
          {planos.map(p => (
            <div key={p.id} className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0" style={{ color: "#0d1b4b" }}>{p.nome}</h5>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => abrirEdicao(p)}><i className="bi bi-pencil" /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(p.id, p.nome)}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                  <div className="fw-bold mb-1" style={{ fontSize: "2rem", color: "#1565c0" }}>
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
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }}>
                <h5 className="modal-title text-white fw-bold">{editando ? "Editar Plano" : "Novo Plano"}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Nome *</label>
                  <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Plano Mensal" required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Descrição</label>
                  <textarea className="form-control" rows={2} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Preço (R$) *</label>
                    <input type="number" min={0} step={0.01} className="form-control" value={form.preco} onChange={e => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Duração (meses) *</label>
                    <input type="number" min={1} className="form-control" value={form.duracaoMeses} onChange={e => setForm({ ...form, duracaoMeses: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn text-white" style={{ background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }} onClick={salvar}>
                  {editando ? "Salvar" : "Criar plano"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
