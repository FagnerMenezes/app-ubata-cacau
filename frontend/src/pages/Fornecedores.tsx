import FornecedorForm from "@/components/fornecedores/FornecedorForm";
import FornecedorTable from "@/components/fornecedores/FornecedorTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  useCreateFornecedor,
  useDeleteFornecedor,
  useFornecedores,
  //useToggleFornecedorStatus,
  useUpdateFornecedor,
} from "@/hooks/useFornecedores";
import type {
  CreateFornecedorData,
  Fornecedor,
  UpdateFornecedorData,
} from "@/types/fornecedor";
import {
  Edit,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  //eslint-disable-next-line
  // const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] =
    useState<Fornecedor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<string | null>(
    null
  );

  // Debounce para evitar requisições excessivas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hooks para gerenciar fornecedores
  const {
    data: fornecedoresData,
    isLoading,
    error,
  } = useFornecedores({
    search: debouncedSearchTerm || undefined,
  });

  const createFornecedorMutation = useCreateFornecedor();
  const updateFornecedorMutation = useUpdateFornecedor();
  const deleteFornecedorMutation = useDeleteFornecedor();
  //const toggleStatusMutation = useToggleFornecedorStatus();

  const fornecedores = fornecedoresData?.data || [];
  //const totalFornecedores = fornecedores.length;
  //const fornecedoresAtivos = fornecedores.filter(
  // (f) => f.status === "ativo"
  // ).length;
  // const qualidadeMedia =
  //  fornecedores.length > 0
  //    ? fornecedores.reduce((acc, f) => acc + (f?.saldo || 0), 0) /
  //      fornecedores.length
  //   : 0;

  const handleAddNew = () => {
    setSelectedFornecedor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFornecedor(null);
  };

  const handleSave = async (data: CreateFornecedorData) => {
    try {
      console.log("Fornecedor cadastrado:", data);
      if (selectedFornecedor) {
        await updateFornecedorMutation.mutateAsync({
          id: selectedFornecedor.id,
          data: data as UpdateFornecedorData,
        });
      } else {
        await createFornecedorMutation.mutateAsync(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    }
  };

  const handleDelete = (id: string) => {
    setFornecedorToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (fornecedorToDelete) {
      try {
        await deleteFornecedorMutation.mutateAsync(fornecedorToDelete);
        setDeleteConfirmOpen(false);
        setFornecedorToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
      }
    }
  };

  // const handleToggleStatus = async (id: string) => {
  //   try {
  //     await toggleStatusMutation.mutateAsync(id);
  //   } catch (error) {
  //     console.error("Erro ao alterar status:", error);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando fornecedores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar fornecedores</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background/98 to-muted/20 min-h-screen">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/8 to-primary/5 p-8 border border-border/30 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text ">
              Fornecedores
            </h1>
            <p className="text-muted-foreground/80 text-lg font-medium mt-2">
              Gerencie seus fornecedores de cacau
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fornecedor
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Estatísticas rápidas */}
      {/* <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Total de Fornecedores
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {totalFornecedores}
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3 este mês
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Avaliação Média
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-all duration-300">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {qualidadeMedia.toFixed(1)}
            </div>
            <p className="text-sm text-blue-600 font-medium mt-1">
              De 5.0 estrelas
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Filtros e busca */}
      <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-primary/30 bg-gradient-to-r from-background/80 to-primary/5 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <div className="flex border border-border/30 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-none border-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de fornecedores */}
      {viewMode === "table" ? (
        <FornecedorTable
          fornecedores={fornecedores}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fornecedores.map((fornecedor) => (
            <Card
              key={fornecedor.id}
              className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text ">
                        {fornecedor.nome}
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-2xl border border-border/30 shadow-2xl shadow-primary/10 rounded-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(fornecedor)}
                        className="hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 transition-all duration-200 rounded-lg cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(fornecedor.id)}
                        className="hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground/80">
                    <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                    {fornecedor.endereco?.cidade}, {fornecedor.endereco?.estado}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground/80">
                    <Phone className="h-4 w-4 mr-2 text-primary/70" />
                    {fornecedor.contato?.telefone ||
                      fornecedor.contato?.whatsapp ||
                      "N/A"}
                  </div>
                  {fornecedor.contato?.email && (
                    <div className="flex items-center text-sm text-muted-foreground/80">
                      <Mail className="h-4 w-4 mr-2 text-primary/70" />
                      {fornecedor.contato.email}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold text-foreground/90">
                        {fornecedor.qualidadeMedia?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/70">
                      Última compra:{" "}
                      {fornecedor.ultimaCompra
                        ? new Date(fornecedor.ultimaCompra).toLocaleDateString(
                            "pt-BR"
                          )
                        : "Nunca"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {fornecedores?.length === 0 && (
        <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-muted-foreground/70 text-center mb-4">
              Tente ajustar os filtros ou adicionar um novo fornecedor.
            </p>
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Fornecedor */}
      <FornecedorForm
        open={isFormOpen}
        fornecedor={selectedFornecedor}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-red-500"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
