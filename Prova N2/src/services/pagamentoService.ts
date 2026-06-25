import type { Pagamento } from "../models";
import { api } from "./api";

export const pagamentoService = {
  getAll: () => api.get<Pagamento>("/pagamentos"),
  getByAssinatura: (idAssinatura: string) =>
    api.get<Pagamento>(`/pagamentos?idAssinatura=${idAssinatura}`),
  create: (data: Omit<Pagamento, "id">) => api.post<Pagamento>("/pagamentos", data),
};
