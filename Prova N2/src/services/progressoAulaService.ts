import type { ProgressoAula } from "../models";
import { api } from "./api";

export const progressoAulaService = {
  getAll: () => api.get<ProgressoAula>("/progressoAulas"),
  getByUsuario: (idUsuario: string) => api.get<ProgressoAula>(`/progressoAulas?idUsuario=${idUsuario}`),
  getByAula: (idUsuario: string, idAula: string) =>
    api.get<ProgressoAula>(`/progressoAulas?idUsuario=${idUsuario}&idAula=${idAula}`),
  create: (data: Omit<ProgressoAula, "id">) => api.post<ProgressoAula>("/progressoAulas", data),
  delete: (id: string) => api.delete("/progressoAulas", id),
};
