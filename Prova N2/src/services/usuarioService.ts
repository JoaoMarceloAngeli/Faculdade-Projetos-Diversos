import type { Usuario } from "../models";
import { api } from "./api";

export const usuarioService = {
  getAll: () => api.get<Usuario>("/usuarios"),
  getByEmail: (email: string) => api.get<Usuario>(`/usuarios?email=${encodeURIComponent(email)}`),
  create: (data: Omit<Usuario, "id">) => api.post<Usuario>("/usuarios", data),
  delete: (id: string) => api.delete("/usuarios", id),
};
