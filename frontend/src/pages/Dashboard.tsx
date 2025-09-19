import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dados serão carregados via API
const producaoMensal: any[] = [];
const receitaSemanal: any[] = [];
const distribuicaoFornecedores: any[] = [];
const alertas: any[] = [];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleNovaCompra = () => {
    navigate("/compras");
  };

  const handleCadastrarFornecedor = () => {
    navigate("/fornecedores");
  };

  const handleRelatorioQualidade = () => {
    navigate("/relatorios");
  };

  const handleAgendarColeta = () => {
    // Por enquanto, redireciona para compras onde pode agendar
    navigate("/compras");
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background/98 to-muted/20 min-h-screen">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/8 to-primary/5 p-8 border border-border/30 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text ">
            Dashboard
          </h1>
          <p className="text-muted-foreground/80 text-lg font-medium mt-2">
            Visão geral da gestão de cacau -{" "}
            {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20  rounded-full blur-3xl"></div>
      </div>

      {/* Métricas principais com design moderno */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Produção Total
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              --
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Dados serão carregados via API
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Fornecedores Ativos
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300">
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              --
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Dados serão carregados via API
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Receita Mensal
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 group-hover:from-emerald-500/30 group-hover:to-emerald-500/20 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              --
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Dados serão carregados via API
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Qualidade Média
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              --
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Dados serão carregados via API
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos com design moderno */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Produção e Qualidade Mensal
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium">
              Acompanhamento da produção e índices de qualidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={producaoMensal}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="mes"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="producao"
                  fill="hsl(var(--primary))"
                  name="Produção (kg)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="qualidade"
                  stroke="hsl(var(--accent))"
                  name="Qualidade"
                  strokeWidth={3}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
              Receita Semanal
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium">
              Receita das últimas 4 semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={receitaSemanal}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="semana"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  formatter={(value) => [
                    `R$ ${value.toLocaleString()}`,
                    "Receita",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Distribuição de Fornecedores */}
        <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Fornecedores por Porte
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium">
              Distribuição dos fornecedores ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distribuicaoFornecedores}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="valor"
                >
                  {distribuicaoFornecedores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-3">
              {distribuicaoFornecedores.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: item.cor }}
                    />
                    <span className="font-medium text-sm">{item.nome}</span>
                  </div>
                  <span className="font-bold text-sm">{item.valor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas com design moderno */}
        <Card className="md:col-span-2 border-orange-200/40 bg-gradient-to-br from-orange-50/90 via-orange-50/70 to-orange-50/50 shadow-xl shadow-orange-500/10 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-orange-800 text-lg font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              Alertas Importantes
            </CardTitle>
            <CardDescription className="text-orange-700/80 font-medium">
              Itens que requerem sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-4 border border-orange-200/50 rounded-2xl bg-gradient-to-r from-white/80 to-orange-50/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full shadow-lg ${
                        alerta.urgencia === "alta"
                          ? "bg-red-500 animate-pulse"
                          : alerta.urgencia === "media"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-sm text-orange-900">
                        {alerta.tipo}
                      </p>
                      <p className="text-xs text-orange-700/80 font-medium">
                        {alerta.descricao}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300/50 bg-gradient-to-r from-white/80 to-orange-50/60 hover:from-orange-100/80 hover:to-orange-50/80 hover:border-orange-400/60 text-orange-800 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas com design moderno */}
      <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Ações Rápidas
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 font-medium">
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            onClick={handleNovaCompra}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Package className="h-5 w-5" />
            Nova Compra
          </Button>
          <Button
            onClick={handleCadastrarFornecedor}
            variant="outline"
            className="flex items-center gap-3 px-6 py-3 border-primary/30 bg-gradient-to-r from-background/80 to-primary/5 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Users className="h-5 w-5" />
            Cadastrar Fornecedor
          </Button>
          <Button
            onClick={handleRelatorioQualidade}
            variant="outline"
            className="flex items-center gap-3 px-6 py-3 border-accent/30 bg-gradient-to-r from-background/80 to-accent/5 hover:from-accent/10 hover:to-accent/15 hover:border-accent/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <BarChart3 className="h-5 w-5" />
            Relatório de Qualidade
          </Button>
          <Button
            onClick={handleAgendarColeta}
            variant="outline"
            className="flex items-center gap-3 px-6 py-3 border-muted-foreground/30 bg-gradient-to-r from-background/80 to-muted/10 hover:from-muted/15 hover:to-muted/20 hover:border-muted-foreground/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Calendar className="h-5 w-5" />
            Agendar Coleta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
