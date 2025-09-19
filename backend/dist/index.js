"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const compra_routes_1 = __importDefault(require("./routes/compra.routes"));
const fornecedor_routes_1 = __importDefault(require("./routes/fornecedor.routes"));
const pagamento_routes_1 = __importDefault(require("./routes/pagamento.routes"));
const relatorio_routes_1 = __importDefault(require("./routes/relatorio.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/fornecedores", fornecedor_routes_1.default);
app.use("/api/tickets", ticket_routes_1.default);
app.use("/api/compras", compra_routes_1.default);
app.use("/api/pagamentos", pagamento_routes_1.default);
app.use("/api/relatorios", relatorio_routes_1.default);
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
        path: req.originalUrl,
    });
});
app.use(error_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map