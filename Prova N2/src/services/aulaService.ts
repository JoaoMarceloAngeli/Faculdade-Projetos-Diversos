import type { Aula } from "../models";
import { api } from "./api";

export const aulaService = {
  getAll: () => api.get<Aula>("/aulas"),
  getByModulo: (idModulo: string) => api.get<Aula>(`/aulas?idModulo=${idModulo}&_sort=ordem`),
  create: (data: Omit<Aula, "id">) => api.post<Aula>("/aulas", data),
  update: (id: string, data: Partial<Omit<Aula, "id">>) => api.patch<Aula>("/aulas", id, data),
  delete: (id: string) => api.delete("/aulas", id),
};
