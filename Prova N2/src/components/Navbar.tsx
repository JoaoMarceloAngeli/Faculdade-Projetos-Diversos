import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ children }: { children?: ReactNode }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const homeLink = usuario?.role === "admin" ? "/admin" : "/student";

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-3 px-md-4 py-2" style={{ position: "sticky", top: 0, zIndex: 1042 }}>
      {children}
      <Link className="navbar-brand fw-bold fs-5 text-decoration-none" to={homeLink}>
        <span style={{ color: "#0d1b4b" }}>JM </span>
        <span style={{ color: "#1565c0" }}>Cursos</span>
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
        {usuario && (
          <span className="text-muted small d-flex align-items-center gap-2">
            {usuario.nomeCompleto.split(" ")[0]}
            {usuario.role === "admin" && (
              <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>
                Admin
              </span>
            )}
          </span>
        )}
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1" />
          Sair
        </button>
      </div>
    </nav>
  );
}
