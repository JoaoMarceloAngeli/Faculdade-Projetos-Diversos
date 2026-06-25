import type { Assinatura } from "../models";
import { api } from "./api";

export const assinaturaService = {
  getAll: () => api.get<Assinatura>("/assinaturas"),
  getByUsuario: (idUsuario: string) => api.get<Assinatura>(`/assinaturas?idUsuario=${idUsuario}`),
  getAtiva: (idUsuario: string) =>
    api.get<Assinatura>(`/assinaturas?idUsuario=${idUsuario}&status=ativa`),
  create: (data: Omit<Assinatura, "id">) => api.post<Assinatura>("/assinaturas", data),
  update: (id: string, data: Partial<Omit<Assinatura, "id">>) => api.patch<Assinatura>("/assinaturas", id, data),
};
