import type { Plano } from "../models";
import { api } from "./api";

export const planoService = {
  getAll: () => api.get<Plano>("/planos"),
  create: (data: Omit<Plano, "id">) => api.post<Plano>("/planos", data),
  update: (id: string, data: Partial<Omit<Plano, "id">>) => api.patch<Plano>("/planos", id, data),
  delete: (id: string) => api.delete("/planos", id),
};
