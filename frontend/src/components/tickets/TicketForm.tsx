import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Fornecedor } from "@/types/fornecedor";
import type { CreateTicketInput, Ticket } from "@/types/ticket";
import { useEffect, useState } from "react";

interface TicketFormProps {
  open: boolean;
  ticket?: Ticket;
  fornecedores: Fornecedor[];
  onClose: () => void;
  onSave: (data: CreateTicketInput) => Promise<void>;
}

export function TicketForm({
  open,
  ticket,
  fornecedores,
  onClose,
  onSave,
}: TicketFormProps) {
  const [formData, setFormData] = useState<CreateTicketInput>({
    fornecedorId: "",
    pesoBruto: 0,
    pesoLiquido: 0,
    observacoes: "",
  });

  const [selectedFornecedor, setSelectedFornecedor] =
    useState<Fornecedor | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchFornecedor, setSearchFornecedor] = useState("");

  useEffect(() => {
    if (ticket) {
      setFormData({
        fornecedorId: ticket.fornecedorId,
        pesoBruto: Number(ticket.pesoBruto),
        pesoLiquido: Number(ticket.pesoLiquido),
        observacoes: ticket.observacoes || "",
      });

      const fornecedor = fornecedores.find((f) => f.id === ticket.fornecedorId);
      setSelectedFornecedor(fornecedor || null);
    } else {
      setFormData({
        fornecedorId: "",
        pesoBruto: 0,
        pesoLiquido: 0,
        observacoes: "",
      });
      setSelectedFornecedor(null);
    }
    setErrors({});
    setSearchFornecedor("");
  }, [ticket, fornecedores, open]);

  const handleFornecedorSelect = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setFormData((prev) => ({ ...prev, fornecedorId: fornecedor.id }));
    setErrors((prev) => ({ ...prev, fornecedorId: "" }));
    setSearchFornecedor("");
  };

  // Filter fornecedores based on search
  const filteredFornecedores = fornecedores.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(searchFornecedor.toLowerCase()) ||
    fornecedor.documento.includes(searchFornecedor) ||
    (fornecedor.fazenda && fornecedor.fazenda.toLowerCase().includes(searchFornecedor.toLowerCase()))
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fornecedorId) {
      newErrors.fornecedorId = "Selecione um fornecedor";
    }

    if (formData.pesoBruto <= 0) {
      newErrors.pesoBruto = "Peso bruto deve ser maior que zero";
    }

    if (formData.pesoLiquido <= 0) {
      newErrors.pesoLiquido = "Peso líquido deve ser maior que zero";
    }

    if (formData.pesoLiquido > formData.pesoBruto) {
      newErrors.pesoLiquido =
        "Peso líquido não pode ser maior que o peso bruto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Erro ao salvar ticket:", error);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      fornecedorId: "",
      pesoBruto: 0,
      pesoLiquido: 0,
      observacoes: "",
    });
    setSelectedFornecedor(null);
    setErrors({});
    setSearchFornecedor("");
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={handleClose} direction="right">
      <DrawerContent className="max-h-[90vh] bg-white">
        <DrawerHeader>
          <DrawerTitle>
            {ticket ? "Editar Ticket" : "Novo Ticket - PDV"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Fornecedor */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Fornecedor</Label>
              {selectedFornecedor ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">{selectedFornecedor.nome}</p>
                    <p className="text-sm text-gray-600">
                      {selectedFornecedor.documento}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFornecedor(null);
                      setFormData((prev) => ({ ...prev, fornecedorId: "" }));
                    }}
                  >
                    Alterar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Pesquisar fornecedor por nome, documento ou fazenda..."
                    value={searchFornecedor}
                    onChange={(e) => setSearchFornecedor(e.target.value)}
                    className="w-full"
                  />
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {filteredFornecedores.length > 0 ? (
                      filteredFornecedores.map((fornecedor) => (
                    <button
                      key={fornecedor.id}
                      type="button"
                      onClick={() => handleFornecedorSelect(fornecedor)}
                      className="flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{fornecedor.nome}</p>
                        <p className="text-sm text-gray-600">
                          {fornecedor.documento}
                        </p>
                        {fornecedor.fazenda && (
                          <p className="text-xs text-gray-500">
                            {fornecedor.fazenda}
                          </p>
                        )}
                      </div>
                    </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {searchFornecedor ? "Nenhum fornecedor encontrado" : "Carregando fornecedores..."}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {errors.fornecedorId && (
                <p className="text-sm text-red-600">{errors.fornecedorId}</p>
              )}
            </div>

            {/* Pesos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pesoBruto" className="text-base font-semibold">
                  Peso Bruto (kg)
                </Label>
                <Input
                  id="pesoBruto"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.pesoBruto}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pesoBruto: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="text-lg h-12"
                  placeholder="0.000"
                />
                {errors.pesoBruto && (
                  <p className="text-sm text-red-600">{errors.pesoBruto}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="pesoLiquido"
                  className="text-base font-semibold"
                >
                  Peso Líquido (kg)
                </Label>
                <Input
                  id="pesoLiquido"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.pesoLiquido}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pesoLiquido: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="text-lg h-12"
                  placeholder="0.000"
                />
                {errors.pesoLiquido && (
                  <p className="text-sm text-red-600">{errors.pesoLiquido}</p>
                )}
              </div>
            </div>

            {/* Diferença de Peso */}
            {formData.pesoBruto > 0 && formData.pesoLiquido > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Diferença (Tara):</span>
                  <Badge variant="secondary" className="text-lg">
                    {(formData.pesoBruto - formData.pesoLiquido).toFixed(3)} kg
                  </Badge>
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-base font-semibold">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {ticket ? "Atualizar" : "Criar Ticket"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
