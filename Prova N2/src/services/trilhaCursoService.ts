import type { TrilhaCurso } from "../models";
import { api } from "./api";

export const trilhaCursoService = {
  getAll: () => api.get<TrilhaCurso>("/trilhasCursos"),
  getByTrilha: (idTrilha: string) => api.get<TrilhaCurso>(`/trilhasCursos?idTrilha=${idTrilha}&_sort=ordem`),
  create: (data: Omit<TrilhaCurso, "id">) => api.post<TrilhaCurso>("/trilhasCursos", data),
  delete: (id: string) => api.delete("/trilhasCursos", id),
};
