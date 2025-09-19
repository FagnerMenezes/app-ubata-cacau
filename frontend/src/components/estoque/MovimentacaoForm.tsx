import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Package,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const movimentacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida", "transferencia", "ajuste"], {
    message: "Selecione o tipo de movimentação",
  }),
  loteId: z.string().min(1, "Selecione um lote"),
  quantidade: z.number().min(0.1, "Quantidade deve ser maior que 0"),
  motivo: z.string().min(1, "Informe o motivo da movimentação"),
  responsavel: z.string().min(1, "Informe o responsável"),
  dataMovimentacao: z.string().min(1, "Selecione a data"),
  observacoes: z.string().optional(),
  // Campos específicos para transferência
  loteDestinoId: z.string().optional(),
  localizacaoDestino: z.string().optional(),
  // Campos específicos para saída
  cliente: z.string().optional(),
  numeroNF: z.string().optional(),
});

type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;

export interface Movimentacao {
  id: string;
  tipo: "entrada" | "saida" | "transferencia" | "ajuste";
  loteId: string;
  loteNome: string;
  quantidade: number;
  motivo: string;
  responsavel: string;
  dataMovimentacao: string;
  observacoes?: string;
  loteDestinoId?: string;
  loteDestinoNome?: string;
  localizacaoDestino?: string;
  cliente?: string;
  numeroNF?: string;
  createdAt: string;
}

interface MovimentacaoFormProps {
  movimentacao?: Movimentacao | null;
  onSubmit: (data: MovimentacaoFormData) => void;
  onCancel: () => void;
  lotes: Array<{
    id: string;
    codigo: string;
    fornecedorNome: string;
    quantidadeDisponivel: number;
  }>;
  tipo?: "entrada" | "saida" | "transferencia" | "ajuste";
  lotePreSelecionado?: string;
}

export default function MovimentacaoForm({
  movimentacao,
  onSubmit,
  onCancel,
  lotes,
  tipo,
  lotePreSelecionado,
}: MovimentacaoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoFormData>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: movimentacao
      ? {
          tipo: movimentacao.tipo,
          loteId: movimentacao.loteId,
          quantidade: movimentacao.quantidade,
          motivo: movimentacao.motivo,
          responsavel: movimentacao.responsavel,
          dataMovimentacao: movimentacao.dataMovimentacao.split("T")[0],
          observacoes: movimentacao.observacoes || "",
          loteDestinoId: movimentacao.loteDestinoId || "",
          localizacaoDestino: movimentacao.localizacaoDestino || "",
          cliente: movimentacao.cliente || "",
          numeroNF: movimentacao.numeroNF || "",
        }
      : {
          tipo: tipo || "entrada",
          loteId: lotePreSelecionado || "",
          dataMovimentacao: new Date().toISOString().split("T")[0],
          responsavel: "Usuário Atual",
        },
  });

  const tipoSelecionado = watch("tipo");
  const loteIdSelecionado = watch("loteId");
  const loteSelecionado = lotes.find((l) => l.id === loteIdSelecionado);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "entrada":
        return <ArrowUpCircle className="h-5 w-5 text-green-600" />;
      case "saida":
        return <ArrowDownCircle className="h-5 w-5 text-red-600" />;
      case "transferencia":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "ajuste":
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "entrada":
        return "Entrada de Estoque";
      case "saida":
        return "Saída de Estoque";
      case "transferencia":
        return "Transferência";
      case "ajuste":
        return "Ajuste de Estoque";
      default:
        return "Movimentação";
    }
  };

  const onFormSubmit = (data: MovimentacaoFormData) => {
    onSubmit({
      ...data,
      quantidade: Number(data.quantidade),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTipoIcon(tipoSelecionado)}
            {getTipoLabel(tipoSelecionado)}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white space-y-4">
          {/* Tipo de Movimentação */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimentação *</Label>
            <Select
              value={tipoSelecionado}
              onValueChange={(value) => setValue("tipo", value as any)}
              disabled={!!tipo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    Entrada
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    Saída
                  </div>
                </SelectItem>
                <SelectItem value="transferencia">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Transferência
                  </div>
                </SelectItem>
                <SelectItem value="ajuste">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    Ajuste
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          {/* Lote */}
          <div className="space-y-2">
            <Label htmlFor="loteId">Lote *</Label>
            <Select
              value={loteIdSelecionado}
              onValueChange={(value) => setValue("loteId", value)}
              disabled={!!lotePreSelecionado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o lote" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {lotes.map((lote) => (
                  <SelectItem key={lote.id} value={lote.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {lote.codigo} - {lote.fornecedorNome}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {lote.quantidadeDisponivel} kg
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.loteId && (
              <p className="text-sm text-red-600">{errors.loteId.message}</p>
            )}
            {loteSelecionado && (
              <div className="text-sm text-muted-foreground">
                Disponível: {loteSelecionado.quantidadeDisponivel} kg
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade (kg) *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.1"
                min="0"
                {...register("quantidade", { valueAsNumber: true })}
                placeholder="0.0"
              />
              {errors.quantidade && (
                <p className="text-sm text-red-600">
                  {errors.quantidade.message}
                </p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="dataMovimentacao">Data da Movimentação *</Label>
              <Input
                id="dataMovimentacao"
                type="date"
                {...register("dataMovimentacao")}
              />
              {errors.dataMovimentacao && (
                <p className="text-sm text-red-600">
                  {errors.dataMovimentacao.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Movimentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Movimentação
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white space-y-4">
          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input
              id="motivo"
              {...register("motivo")}
              placeholder="Ex: Compra de fornecedor, Venda para cliente, etc."
            />
            {errors.motivo && (
              <p className="text-sm text-red-600">{errors.motivo.message}</p>
            )}
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              {...register("responsavel")}
              placeholder="Nome do responsável"
            />
            {errors.responsavel && (
              <p className="text-sm text-red-600">
                {errors.responsavel.message}
              </p>
            )}
          </div>

          {/* Campos específicos para saída */}
          {tipoSelecionado === "saida" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  {...register("cliente")}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroNF">Número da NF</Label>
                <Input
                  id="numeroNF"
                  {...register("numeroNF")}
                  placeholder="Ex: 12345"
                />
              </div>
            </div>
          )}

          {/* Campos específicos para transferência */}
          {tipoSelecionado === "transferencia" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loteDestinoId">Lote Destino</Label>
                <Select
                  value={watch("loteDestinoId") || ""}
                  onValueChange={(value) => setValue("loteDestinoId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o lote destino" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {lotes
                      .filter((l) => l.id !== loteIdSelecionado)
                      .map((lote) => (
                        <SelectItem key={lote.id} value={lote.id}>
                          {lote.codigo} - {lote.fornecedorNome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacaoDestino">Localização Destino</Label>
                <Input
                  id="localizacaoDestino"
                  {...register("localizacaoDestino")}
                  placeholder="Ex: A-01-02"
                />
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
              placeholder="Informações adicionais sobre a movimentação..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : movimentacao
            ? "Atualizar"
            : "Registrar Movimentação"}
        </Button>
      </div>
    </form>
  );
}
