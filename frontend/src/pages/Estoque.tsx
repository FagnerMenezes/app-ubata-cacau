import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Warehouse
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Dados serão carregados via API
const estoque: any[] = []


export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todos" || item.categoria.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Funções para manipular o formulário
  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete item:', id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleSave = (data: any) => {
    console.log('Save data:', data);
    setIsFormOpen(false);
  };

  const totalItens = estoque.length
  const valorTotalEstoque = estoque.reduce((acc, item) => acc + item.valorTotal, 0)
  const itensBaixoEstoque = estoque.filter(item => item.status === 'baixo' || item.status === 'critico').length
  const itensNormais = estoque.filter(item => item.status === 'normal').length

  const categorias = ["todos", ...Array.from(new Set(estoque.map(item => item.categoria)))]

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background/98 to-muted/20 min-h-screen">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/8 to-primary/5 p-8 border border-border/30 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
              Estoque
            </h1>
            <p className="text-muted-foreground/80 text-lg font-medium mt-2">
              Controle seu estoque de cacau
            </p>
          </div>
          <Button 
            onClick={() => handleAddNew()}
            className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Total de Itens
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <Warehouse className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{totalItens}</div>
            <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              6 categorias
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Valor Total
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 group-hover:from-emerald-500/30 group-hover:to-emerald-500/20 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              R$ {(valorTotalEstoque / 1000).toFixed(0)}k
            </div>
            <p className="text-sm text-emerald-600 font-medium mt-1">
              Inventário atual
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Estoque Normal
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-all duration-300">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {itensNormais}
            </div>
            <p className="text-sm text-blue-600 font-medium mt-1">
              {Math.round((itensNormais / totalItens) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground/90">
              Atenção Requerida
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 group-hover:from-orange-500/30 group-hover:to-orange-500/20 transition-all duration-300">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {itensBaixoEstoque}
            </div>
            <p className="text-sm text-orange-600 font-medium mt-1">
              Baixo/Crítico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <div className="flex gap-2">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={selectedCategory === categoria ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(categoria)}
                  className={selectedCategory === categoria 
                    ? "bg-gradient-to-r from-primary via-primary/95 to-primary/90 shadow-lg font-medium" 
                    : "border-primary/30 bg-gradient-to-r from-background/80 to-primary/5 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                  }
                >
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="border-primary/30 bg-gradient-to-r from-background/80 to-primary/5 hover:from-primary/10 hover:to-primary/15 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estoque */}
      <div className="grid gap-6">
        {filteredEstoque.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.01] backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {item.produto}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={item.status === 'adequado' ? 'default' : 
                                item.status === 'baixo' ? 'destructive' : 'secondary'}
                        className={
                          item.status === 'adequado' 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                            : item.status === 'baixo'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                        }
                      >
                        {item.status === 'adequado' ? 'Adequado' : 
                         item.status === 'baixo' ? 'Baixo' : 'Crítico'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium"
                      >
                        {item.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-2xl border border-border/30 shadow-2xl shadow-primary/10 rounded-2xl">
                    <DropdownMenuItem 
                      onClick={() => handleEdit(item)}
                      className="hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 transition-all duration-200 rounded-lg cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(item.id)}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Quantidade:</span>
                  <span className="text-lg font-bold text-foreground">
                    {item.quantidade.toLocaleString('pt-BR')} {item.unidade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Valor Unit.:</span>
                  <span className="text-sm font-semibold text-green-600">
                    R$ {item.valorUnitario.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground/80">Valor Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {(item.quantidade * item.valorUnitario).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center text-xs text-muted-foreground/70 mb-1">
                    <Warehouse className="h-3 w-3 mr-1" />
                    {item.localizacao}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground/70">
                    <Calendar className="h-3 w-3 mr-1" />
                    Última entrada: {new Date(item.dataUltimaEntrada).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                {item.status === 'baixo' && (
                  <div className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 border rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-red-700 text-xs">
                      Estoque abaixo do mínimo ({item.estoqueMinimo} {item.unidade})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensagem quando não há resultados */}
      {filteredEstoque.length === 0 && (
        <Card className="border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground/80 mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground/70 text-center mb-4">
              Tente ajustar os filtros ou adicionar um novo item ao estoque.
            </p>
            <Button 
              onClick={() => handleAddNew()}
              className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Estoque - Placeholder para quando o componente for criado */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {selectedItem ? 'Editar Item' : 'Adicionar Item'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Formulário de estoque será implementado aqui.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => handleCloseForm()} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={() => handleSave({})} className="flex-1">
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}