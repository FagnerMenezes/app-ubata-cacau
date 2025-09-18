import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error.middleware";

// Routes
import compraRoutes from "./routes/compra.routes";
import fornecedorRoutes from "./routes/fornecedor.routes";
import pagamentoRoutes from "./routes/pagamento.routes";
import relatorioRoutes from "./routes/relatorio.routes";
import ticketRoutes from "./routes/ticket.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Routes
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/relatorios", relatorioRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    path: req.originalUrl,
  });
});

// Error handling middleware (deve ser o último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
