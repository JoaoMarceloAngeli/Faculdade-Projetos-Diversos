import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  role?: "admin" | "student";
}

export default function PrivateRoute({ children, role }: Props) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (role && usuario.role !== role) {
    return <Navigate to={usuario.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
}
