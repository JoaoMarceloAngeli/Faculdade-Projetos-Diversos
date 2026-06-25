import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const tabs = [
  { to: "/student/cursos", label: "Cursos", icon: "bi-play-circle" },
  { to: "/student/trilhas", label: "Trilhas", icon: "bi-map" },
  { to: "/student/meu-plano", label: "Meu Plano", icon: "bi-credit-card" },
  { to: "/student/certificados", label: "Certificados", icon: "bi-award" },
];

export default function StudentLayout() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div className="container py-4">
        <ul className="nav nav-tabs mb-4">
          {tabs.map((t) => (
            <li key={t.to} className="nav-item">
              <NavLink
                to={t.to}
                end
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-1 ${isActive ? "active fw-semibold" : ""}`
                }
              >
                <i className={`bi ${t.icon}`} />
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Outlet />
      </div>
    </div>
  );
}
