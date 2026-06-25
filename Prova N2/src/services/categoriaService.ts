import type { Categoria } from "../models";
import { api } from "./api";

export const categoriaService = {
  getAll: () => api.get<Categoria>("/categorias"),
  create: (data: Omit<Categoria, "id">) => api.post<Categoria>("/categorias", data),
  update: (id: string, data: Partial<Omit<Categoria, "id">>) => api.patch<Categoria>("/categorias", id, data),
  delete: (id: string) => api.delete("/categorias", id),
};
