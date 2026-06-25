import type { Modulo } from "../models";
import { api } from "./api";

export const moduloService = {
  getAll: () => api.get<Modulo>("/modulos"),
  getByCurso: (idCurso: string) => api.get<Modulo>(`/modulos?idCurso=${idCurso}&_sort=ordem`),
  create: (data: Omit<Modulo, "id">) => api.post<Modulo>("/modulos", data),
  update: (id: string, data: Partial<Omit<Modulo, "id">>) => api.patch<Modulo>("/modulos", id, data),
  delete: (id: string) => api.delete("/modulos", id),
};
