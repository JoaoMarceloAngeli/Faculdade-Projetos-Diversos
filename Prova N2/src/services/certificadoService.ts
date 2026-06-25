import type { Certificado } from "../models";
import { api } from "./api";

export const certificadoService = {
  getAll: () => api.get<Certificado>("/certificados"),
  getByUsuario: (idUsuario: string) => api.get<Certificado>(`/certificados?idUsuario=${idUsuario}`),
  getByCodigo: (codigo: string) => api.get<Certificado>(`/certificados?codigoVerificacao=${codigo}`),
  create: (data: Omit<Certificado, "id">) => api.post<Certificado>("/certificados", data),
  delete: (id: string) => api.delete("/certificados", id),
};
