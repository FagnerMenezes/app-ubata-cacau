// Tipos para estruturas JSON
export interface Endereco {
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export interface Contato {
  email?: string;
  telefone?: string;
  whatsapp?: string;
  telefoneSecundario?: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  documento: string;
  endereco?: Endereco;
  contato?: Contato;
  fazenda?: string;
  observacoes?: string;
  saldo?: number;
  createdAt: string;
  updatedAt: string;
  // Campos calculados (obtidos do backend)
  qualidadeMedia?: number;
  totalCompras?: number;
  valorTotal?: number;
  ultimaCompra?: string;
  tipoDocumento?: "CPF" | "CNPJ";
}

export interface CreateFornecedorData {
  nome: string;
  documento: string;
  endereco?: Endereco;
  contato?: Contato;
  fazenda?: string;
  observacoes?: string;
}

export interface UpdateFornecedorData extends Partial<CreateFornecedorData> {
}

export interface FornecedorFilters {
  search?: string;
  status?: "ativo" | "inativo";
  tipoDocumento?: "CPF" | "CNPJ";
  page?: number;
  limit?: number;
  sortBy?: "nome" | "qualidadeMedia" | "totalCompras" | "ultimaCompra";
  sortOrder?: "asc" | "desc";
}
