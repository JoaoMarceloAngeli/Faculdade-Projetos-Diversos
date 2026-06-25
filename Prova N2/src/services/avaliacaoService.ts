import type { Avaliacao } from "../models";
import { api } from "./api";

export const avaliacaoService = {
  getAll: () => api.get<Avaliacao>("/avaliacoes"),
  getByCurso: (idCurso: string) => api.get<Avaliacao>(`/avaliacoes?idCurso=${idCurso}`),
  getByUsuarioCurso: (idUsuario: string, idCurso: string) =>
    api.get<Avaliacao>(`/avaliacoes?idUsuario=${idUsuario}&idCurso=${idCurso}`),
  create: (data: Omit<Avaliacao, "id">) => api.post<Avaliacao>("/avaliacoes", data),
  delete: (id: string) => api.delete("/avaliacoes", id),
};
