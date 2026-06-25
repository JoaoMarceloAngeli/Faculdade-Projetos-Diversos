import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";

import LoginPage from "./pages/LoginPage";
import CheckoutPage from "./pages/CheckoutPage";

import CategoriasPage from "./pages/admin/CategoriasPage";
import CursosAdminPage from "./pages/admin/CursosPage";
import TrilhasAdminPage from "./pages/admin/TrilhasPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import PlanosPage from "./pages/admin/PlanosPage";
import AssinaturasPage from "./pages/admin/AssinaturasPage";
import CertificadosAdminPage from "./pages/admin/CertificadosPage";
import AvaliacoesPage from "./pages/admin/AvaliacoesPage";

import CursosStudentPage from "./pages/student/CursosPage";
import TrilhasStudentPage from "./pages/student/TrilhasPage";
import MeuPlanoPage from "./pages/student/MeuPlanoPage";
import CertificadosStudentPage from "./pages/student/CertificadosPage";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/checkout"
            element={<PrivateRoute><CheckoutPage /></PrivateRoute>}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}
          >
            <Route index element={<Navigate to="/admin/categorias" replace />} />
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="cursos" element={<CursosAdminPage />} />
            <Route path="trilhas" element={<TrilhasAdminPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="planos" element={<PlanosPage />} />
            <Route path="assinaturas" element={<AssinaturasPage />} />
            <Route path="certificados" element={<CertificadosAdminPage />} />
            <Route path="avaliacoes" element={<AvaliacoesPage />} />
          </Route>

          {/* Student routes */}
          <Route
            path="/student"
            element={<PrivateRoute role="student"><StudentLayout /></PrivateRoute>}
          >
            <Route index element={<Navigate to="/student/cursos" replace />} />
            <Route path="cursos" element={<CursosStudentPage />} />
            <Route path="trilhas" element={<TrilhasStudentPage />} />
            <Route path="meu-plano" element={<MeuPlanoPage />} />
            <Route path="certificados" element={<CertificadosStudentPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
