import type { Curso } from "../models";
import { api } from "./api";

export const cursoService = {
  getAll: () => api.get<Curso>("/cursos"),
  getByCategoria: (idCategoria: string) => api.get<Curso>(`/cursos?idCategoria=${idCategoria}`),
  create: (data: Omit<Curso, "id">) => api.post<Curso>("/cursos", data),
  update: (id: string, data: Partial<Omit<Curso, "id">>) => api.patch<Curso>("/cursos", id, data),
  delete: (id: string) => api.delete("/cursos", id),
};
