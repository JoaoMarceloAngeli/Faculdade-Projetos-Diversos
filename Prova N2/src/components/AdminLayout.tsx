import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const links = [
  { to: "/admin/categorias", label: "Categorias", icon: "bi-tag-fill" },
  { to: "/admin/cursos", label: "Cursos", icon: "bi-mortarboard-fill" },
  { to: "/admin/trilhas", label: "Trilhas", icon: "bi-map-fill" },
  { to: "/admin/usuarios", label: "Usuários", icon: "bi-people-fill" },
  { to: "/admin/planos", label: "Planos", icon: "bi-credit-card-fill" },
  { to: "/admin/assinaturas", label: "Assinaturas", icon: "bi-receipt" },
  { to: "/admin/certificados", label: "Certificados", icon: "bi-award-fill" },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: "bi-star-fill" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // fecha o menu ao navegar
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // bloqueia scroll do body quando menu aberto no mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Navbar>
        {/* botão hambúrguer — só aparece em telas pequenas */}
        <button
          className="btn btn-link text-secondary d-lg-none p-1 me-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          style={{ fontSize: "1.4rem", lineHeight: 1 }}
        >
          <i className={open ? "bi bi-x-lg" : "bi bi-list"} />
        </button>
      </Navbar>

      <div className="d-flex flex-grow-1" style={{ position: "relative" }}>

        {/* overlay escuro — só no mobile quando aberto */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              zIndex: 1040,
            }}
          />
        )}

        {/* sidebar */}
        <nav
          className="bg-white border-end d-flex flex-column py-3"
          style={{
            width: 220,
            flexShrink: 0,
            // desktop: sempre visível; mobile: desliza lateralmente
            position: "fixed",
            top: 57,
            bottom: 0,
            left: 0,
            zIndex: 1041,
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            overflowY: "auto",
          }}
          // em telas grandes anula o transform via classe
          // (ver css abaixo injetado via style tag)
        >
          <div className="px-3 mb-2">
            <span
              className="text-uppercase fw-semibold text-muted"
              style={{ fontSize: "0.68rem", letterSpacing: "0.08em" }}
            >
              Administração
            </span>
          </div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 mx-2 rounded-2 text-decoration-none small fw-medium mb-1 ${
                  isActive ? "text-white" : "text-secondary"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "linear-gradient(135deg,#1a3a8f,#1565c0)" }
                  : undefined
              }
            >
              <i className={`bi ${l.icon}`} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* conteúdo principal */}
        <main
          className="flex-grow-1 p-3 p-md-4 admin-main"
          style={{ background: "#f8fafc" }}
        >
          <Outlet />
        </main>
      </div>

      {/* estilos responsivos injetados */}
      <style>{`
        @media (min-width: 992px) {
          nav.bg-white.border-end {
            position: sticky !important;
            top: 0 !important;
            height: calc(100vh - 56px) !important;
            transform: translateX(0) !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 991.98px) {
          .admin-main {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
