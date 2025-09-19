import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Compras from "./pages/Compras";
import Dashboard from "./pages/Dashboard";
import Fornecedores from "./pages/Fornecedores";
import Login from "./pages/Login";
import PagamentosPage from "./pages/Pagamentos";
import Relatorios from "./pages/Relatorios";
import Tickets from "./pages/Tickets";
import { QueryProvider } from "./providers/QueryProvider";

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="fornecedores"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Fornecedores />
                </ProtectedRoute>
              }
            />
            <Route
              path="compras"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Compras />
                </ProtectedRoute>
              }
            />
            <Route
              path="tickets"
              element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="estoque"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <div className="p-6">Estoque - Em desenvolvimento</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="pagamentos"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <PagamentosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="relatorios"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="configuracoes"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <div className="p-6">Configurações - Em desenvolvimento</div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </Router>
    </QueryProvider>
  );
}

export default App;
