import type { Matricula } from "../models";
import { api } from "./api";

export const matriculaService = {
  getAll: () => api.get<Matricula>("/matriculas"),
  getByUsuario: (idUsuario: string) => api.get<Matricula>(`/matriculas?idUsuario=${idUsuario}`),
  getByCurso: (idCurso: string) => api.get<Matricula>(`/matriculas?idCurso=${idCurso}`),
  create: (data: Omit<Matricula, "id">) => api.post<Matricula>("/matriculas", data),
  update: (id: string, data: Partial<Omit<Matricula, "id">>) => api.patch<Matricula>("/matriculas", id, data),
  delete: (id: string) => api.delete("/matriculas", id),
};
