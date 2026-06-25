import { createContext, useContext, useState, type ReactNode } from "react";
import type { Usuario } from "../models";
import { usuarioService } from "../services/usuarioService";
import { assinaturaService } from "../services/assinaturaService";

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
  hasActivePlan: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "jm_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  async function login(email: string, senha: string): Promise<boolean> {
    const users = await usuarioService.getByEmail(email);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.senhaHash === senha
    );
    if (!found) return false;
    setUsuario(found);
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return true;
  }

  async function register(nome: string, email: string, senha: string): Promise<Usuario> {
    const allUsers = await usuarioService.getAll();
    const role: Usuario["role"] = allUsers.length === 0 ? "admin" : "student";
    const newUser = await usuarioService.create({
      nomeCompleto: nome,
      email,
      senhaHash: senha,
      role,
      dataCadastro: new Date().toISOString(),
    });
    return newUser;
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem(SESSION_KEY);
  }

  async function hasActivePlan(): Promise<boolean> {
    if (!usuario) return false;
    const subs = await assinaturaService.getAtiva(usuario.id);
    return subs.length > 0;
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, register, logout, hasActivePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
