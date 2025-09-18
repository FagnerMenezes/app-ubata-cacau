import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateFornecedorData, Fornecedor, Endereco, Contato } from "@/types/fornecedor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Textarea } from "../ui/textarea";

const fornecedorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  documento: z.string().min(11, "Documento deve ter pelo menos 11 caracteres"),
  fazenda: z.string().optional(),
  observacoes: z.string().optional(),
  // Endereco fields - só valida se não estiver vazio
  "endereco.rua": z.string().refine(val => val === "" || val.length >= 5, "Rua deve ter pelo menos 5 caracteres").optional(),
  "endereco.cidade": z.string().refine(val => val === "" || val.length >= 2, "Cidade deve ter pelo menos 2 caracteres").optional(),
  "endereco.estado": z.string().refine(val => val === "" || val.length === 2, "Estado deve ter 2 caracteres").optional(),
  "endereco.cep": z.string().refine(val => val === "" || val.length >= 8, "CEP deve ter pelo menos 8 caracteres").optional(),
  "endereco.complemento": z.string().optional(),
  // Contato fields - só valida se não estiver vazio
  "contato.email": z.string().refine(val => val === "" || z.string().email().safeParse(val).success, "Email inválido").optional(),
  "contato.telefone": z.string().refine(val => val === "" || val.length >= 10, "Telefone deve ter pelo menos 10 caracteres").optional(),
  "contato.whatsapp": z.string().refine(val => val === "" || val.length >= 10, "WhatsApp deve ter pelo menos 10 caracteres").optional(),
  "contato.telefoneSecundario": z.string().refine(val => val === "" || val.length >= 10, "Telefone secundário deve ter pelo menos 10 caracteres").optional(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  fornecedor?: Fornecedor | null;
  onClose: () => void;
  onSave: (data: CreateFornecedorData) => Promise<void>;
  open: boolean;
}

export default function FornecedorForm({
  fornecedor,
  onClose,
  onSave,
  open,
}: FornecedorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      documento: "",
      fazenda: "",
      observacoes: "",
      "endereco.rua": "",
      "endereco.cidade": "",
      "endereco.estado": "",
      "endereco.cep": "",
      "endereco.complemento": "",
      "contato.email": "",
      "contato.telefone": "",
      "contato.whatsapp": "",
      "contato.telefoneSecundario": "",
    },
  });

  // Reset form when fornecedor changes
  useEffect(() => {
    if (fornecedor) {
      reset({
        nome: fornecedor.nome,
        documento: fornecedor.documento,
        fazenda: fornecedor.fazenda || "",
        observacoes: fornecedor.observacoes || "",
        "endereco.rua": fornecedor.endereco?.rua || "",
        "endereco.cidade": fornecedor.endereco?.cidade || "",
        "endereco.estado": fornecedor.endereco?.estado || "",
        "endereco.cep": fornecedor.endereco?.cep || "",
        "endereco.complemento": fornecedor.endereco?.complemento || "",
        "contato.email": fornecedor.contato?.email || "",
        "contato.telefone": fornecedor.contato?.telefone || "",
        "contato.whatsapp": fornecedor.contato?.whatsapp || "",
        "contato.telefoneSecundario": fornecedor.contato?.telefoneSecundario || "",
      });
    } else {
      reset({
        nome: "",
        documento: "",
        fazenda: "",
        observacoes: "",
        "endereco.rua": "",
        "endereco.cidade": "",
        "endereco.estado": "",
        "endereco.cep": "",
        "endereco.complemento": "",
        "contato.email": "",
        "contato.telefone": "",
        "contato.whatsapp": "",
        "contato.telefoneSecundario": "",
      });
    }
  }, [fornecedor, reset]);

  const onSubmit = async (data: FornecedorFormData) => {
    setIsLoading(true);
    try {
      // Debug: Pegar todos os valores usando getValues()
      const allValues = getValues();
      console.log("🔍 TODOS os valores do formulário (getValues):", allValues);

      // Transform flat form data to nested structure
      const formattedData: CreateFornecedorData = {
        nome: data.nome,
        documento: data.documento,
        fazenda: data.fazenda || undefined,
        observacoes: data.observacoes || undefined,
      };

      // Use os objetos aninhados que estão sendo criados automaticamente
      const endereco = allValues.endereco as any;
      const contato = allValues.contato as any;

      // Only add endereco if at least one field is filled
      const hasEnderecoData = endereco && (
        (endereco.rua && endereco.rua.trim() !== "") ||
        (endereco.cidade && endereco.cidade.trim() !== "") ||
        (endereco.estado && endereco.estado.trim() !== "") ||
        (endereco.cep && endereco.cep.trim() !== "")
      );

      if (hasEnderecoData) {
        formattedData.endereco = {
          rua: endereco.rua?.trim() || "",
          cidade: endereco.cidade?.trim() || "",
          estado: endereco.estado?.trim() || "",
          cep: endereco.cep?.trim() || "",
          complemento: endereco.complemento?.trim() || undefined,
        };
      }

      // Only add contato if at least one field is filled
      const hasContatoData = contato && (
        (contato.email && contato.email.trim() !== "") ||
        (contato.telefone && contato.telefone.trim() !== "") ||
        (contato.whatsapp && contato.whatsapp.trim() !== "") ||
        (contato.telefoneSecundario && contato.telefoneSecundario.trim() !== "")
      );

      if (hasContatoData) {
        formattedData.contato = {
          email: contato.email?.trim() || undefined,
          telefone: contato.telefone?.trim() || undefined,
          whatsapp: contato.whatsapp?.trim() || undefined,
          telefoneSecundario: contato.telefoneSecundario?.trim() || undefined,
        };
      }

      console.log("📋 Dados formatados enviados:", formattedData);

      await onSave(formattedData);
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] max-w-2xl mx-auto bg-white">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <div>
            <DrawerTitle>
              {fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DrawerTitle>
            <DrawerDescription>
              {fornecedor
                ? "Atualize as informações do fornecedor"
                : "Cadastre um novo fornecedor de cacau"}
            </DrawerDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Nome do fornecedor"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento *</Label>
                <Input
                  id="documento"
                  {...register("documento")}
                  placeholder={
                    watch("tipoDocumento") === "CPF"
                      ? "000.000.000-00"
                      : "00.000.000/0001-00"
                  }
                />
                {errors.documento && (
                  <p className="text-sm text-red-500">
                    {errors.documento.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato.email">Email</Label>
                <Input
                  id="contato.email"
                  type="email"
                  {...register("contato.email")}
                  placeholder="email@exemplo.com"
                />
                {errors["contato.email"] && (
                  <p className="text-sm text-red-500">{errors["contato.email"]?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fazenda">Fazenda</Label>
                <Input
                  id="fazenda"
                  {...register("fazenda")}
                  placeholder="Nome da fazenda"
                />
                {errors.fazenda && (
                  <p className="text-sm text-red-500">
                    {errors.fazenda.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato.telefone">Telefone</Label>
                <Input
                  id="contato.telefone"
                  {...register("contato.telefone")}
                  placeholder="(11) 99999-9999"
                />
                {errors["contato.telefone"] && (
                  <p className="text-sm text-red-500">
                    {errors["contato.telefone"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco.rua">Rua/Endereço</Label>
                <Input
                  id="endereco.rua"
                  {...register("endereco.rua")}
                  placeholder="Rua, número, bairro"
                />
                {errors["endereco.rua"] && (
                  <p className="text-sm text-red-500">
                    {errors["endereco.rua"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco.cidade">Cidade</Label>
                <Input
                  id="endereco.cidade"
                  {...register("endereco.cidade")}
                  placeholder="Nome da cidade"
                />
                {errors["endereco.cidade"] && (
                  <p className="text-sm text-red-500">
                    {errors["endereco.cidade"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco.estado">Estado</Label>
                <Input
                  id="endereco.estado"
                  {...register("endereco.estado")}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors["endereco.estado"] && (
                  <p className="text-sm text-red-500">
                    {errors["endereco.estado"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco.cep">CEP</Label>
                <Input
                  id="endereco.cep"
                  {...register("endereco.cep")}
                  placeholder="00000-000"
                />
                {errors["endereco.cep"] && (
                  <p className="text-sm text-red-500">
                    {errors["endereco.cep"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato.whatsapp">WhatsApp</Label>
                <Input
                  id="contato.whatsapp"
                  {...register("contato.whatsapp")}
                  placeholder="(11) 99999-9999"
                />
                {errors["contato.whatsapp"] && (
                  <p className="text-sm text-red-500">
                    {errors["contato.whatsapp"]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato.telefoneSecundario">Telefone Secundário</Label>
                <Input
                  id="contato.telefoneSecundario"
                  {...register("contato.telefoneSecundario")}
                  placeholder="(11) 88888-8888"
                />
                {errors["contato.telefoneSecundario"] && (
                  <p className="text-sm text-red-500">
                    {errors["contato.telefoneSecundario"]?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register("observacoes")}
                  placeholder="Observações do fornecedor"
                />
                {errors.observacoes && (
                  <p className="text-sm text-red-500">
                    {errors.observacoes.message}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="endereco.cidade">Cidade *</Label>
                <Input
                  id="endereco.cidade"
                  {...register("endereco.cidade")}
                  placeholder="Nome da cidade"
                />
                {errors.endereco?.cidade && (
                  <p className="text-sm text-red-500">
                    {errors.endereco.cidade.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco.estado">Estado *</Label>
                <Input
                  id="endereco.estado"
                  {...register("endereco.estado")}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.endereco?.estado && (
                  <p className="text-sm text-red-500">
                    {errors.endereco.estado.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco.cep">CEP *</Label>
                <Input
                  id="endereco.cep"
                  {...register("endereco.cep")}
                  placeholder="00000-000"
                />
                {errors.endereco?.cep && (
                  <p className="text-sm text-red-500">
                    {errors.endereco.cep.message}
                  </p>
                )}
              </div> */}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
