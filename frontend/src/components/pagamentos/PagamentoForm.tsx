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
import {
  useCreatePagamento,
  useUpdatePagamento,
  useValidatePagamento,
} from "@/hooks/usePagamentos";
import type { MetodoPagamento, Pagamento } from "@/types/pagamento";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const pagamentoSchema = z.object({
  compraId: z.string().min(1, "ID da compra é obrigatório"),
  valorPago: z.number().positive("Valor deve ser maior que zero"),
  metodoPagamento: z
    .enum(["DINHEIRO", "PIX", "TRANSFERENCIA", "CHEQUE"])
    .optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof pagamentoSchema>;

interface PagamentoFormProps {
  compraId: string;
  valorTotalCompra: number;
  valorJaPago: number;
  pagamento?: Pagamento;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PagamentoForm({
  compraId,
  valorTotalCompra,
  valorJaPago,
  pagamento,
  onSuccess,
  onCancel,
}: PagamentoFormProps) {
  const [valorAtual, setValorAtual] = useState(0);
  const [selectedMetodo, setSelectedMetodo] = useState<
    MetodoPagamento | undefined
  >(undefined);
  const isEdit = !!pagamento;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      compraId,
      valorPago: pagamento?.valorPago || 0,
      metodoPagamento: pagamento?.metodoPagamento,
      observacoes: pagamento?.observacoes || "",
    },
    mode: "onChange",
  });

  const createMutation = useCreatePagamento();
  const updateMutation = useUpdatePagamento();

  // Atualizar form quando pagamento muda (para edição)
  useEffect(() => {
    if (pagamento) {
      setValue("valorPago", pagamento.valorPago);
      setValue("metodoPagamento", pagamento.metodoPagamento);
      setValue("observacoes", pagamento.observacoes || "");
      setSelectedMetodo(pagamento.metodoPagamento);
    } else {
      // Reset para novo pagamento
      setValue("valorPago", 0);
      setValue("metodoPagamento", undefined);
      setValue("observacoes", "");
      setSelectedMetodo(undefined);
    }
  }, [pagamento, setValue]);

  // Watch valor para validação em tempo real
  const watchedValor = watch("valorPago");

  // Validação em tempo real
  const { data: validation, isError: validationError } = useValidatePagamento(
    compraId,
    watchedValor
  );

  useEffect(() => {
    setValorAtual(watchedValor || 0);
  }, [watchedValor]);

  const saldoRestante = valorTotalCompra - valorJaPago;
  const novoSaldo = saldoRestante - valorAtual;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: pagamento!.id,
          data: {
            valorPago: data.valorPago,
            metodoPagamento: data.metodoPagamento,
            observacoes: data.observacoes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          compraId: data.compraId,
          valorPago: data.valorPago,
          metodoPagamento: data.metodoPagamento,
          observacoes: data.observacoes,
        });
      }

      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-2xl border-none shadow-none max-h-[500px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {isEdit ? "Editar Pagamento" : "Registrar Pagamento"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Informações da Compra */}
        <div className="mb-6 p-2 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Informações da Compra</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Valor Total:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(valorTotalCompra)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Já Pago:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(valorJaPago)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Saldo Restante:</span>
              <span className="ml-2 font-medium text-orange-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(saldoRestante)}
              </span>
            </div>
            {valorAtual > 0 && (
              <div>
                <span className="text-gray-600">Novo Saldo:</span>
                <span
                  className={`ml-2 font-medium ${
                    novoSaldo <= 0 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Math.max(0, novoSaldo))}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="valorPago">Valor do Pagamento *</Label>
            <Input
              id="valorPago"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("valorPago", { valueAsNumber: true })}
              className={errors.valorPago ? "border-red-500" : ""}
            />
            {errors.valorPago && (
              <span className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.valorPago.message}
              </span>
            )}
            {validationError && watchedValor > 0 && (
              <span className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                Valor excede o saldo restante
              </span>
            )}
            {validation?.valido && watchedValor > 0 && (
              <span className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle className="h-3 w-3" />
                Valor válido
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
            <Select
              value={selectedMetodo || ""}
              onValueChange={(value) => {
                const metodo = value as MetodoPagamento;
                setValue("metodoPagamento", metodo);
                setSelectedMetodo(metodo);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {errors.metodoPagamento && (
              <span className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.metodoPagamento.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre o pagamento..."
              {...register("observacoes")}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading || validationError}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-900"
            >
              {isLoading
                ? "Salvando..."
                : isEdit
                ? "Atualizar Pagamento"
                : "Registrar Pagamento"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
