import type { Trilha } from "../models";
import { api } from "./api";

export const trilhaService = {
  getAll: () => api.get<Trilha>("/trilhas"),
  getByCategoria: (idCategoria: string) => api.get<Trilha>(`/trilhas?idCategoria=${idCategoria}`),
  create: (data: Omit<Trilha, "id">) => api.post<Trilha>("/trilhas", data),
  update: (id: string, data: Partial<Omit<Trilha, "id">>) => api.patch<Trilha>("/trilhas", id, data),
  delete: (id: string) => api.delete("/trilhas", id),
};
