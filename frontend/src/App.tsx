import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/layout/Layout";
import Compras from "./pages/Compras";
import Dashboard from "./pages/Dashboard";
import Fornecedores from "./pages/Fornecedores";
import PagamentosPage from "./pages/Pagamentos";
import Tickets from "./pages/Tickets";
import { QueryProvider } from "./providers/QueryProvider";

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="fornecedores" element={<Fornecedores />} />
            <Route path="compras" element={<Compras />} />
            <Route path="tickets" element={<Tickets />} />
            <Route
              path="estoque"
              element={<div className="p-6">Estoque - Em desenvolvimento</div>}
            />
            <Route path="pagamentos" element={<PagamentosPage />} />
            <Route
              path="relatorios"
              element={
                <div className="p-6">Relatórios - Em desenvolvimento</div>
              }
            />
            <Route
              path="configuracoes"
              element={
                <div className="p-6">Configurações - Em desenvolvimento</div>
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
