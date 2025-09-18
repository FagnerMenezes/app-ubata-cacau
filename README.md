# app-ubata-cacau

sistema para gerenciamento de compra e venda de cacau

# Plataforma de Gestão de Cacau - MVP

Sistema completo para gestão de compra e venda de cacau, incluindo controle de fornecedores, pesagem, pagamentos e relatórios.

## 🚀 Tecnologias

### Frontend

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query (TanStack Query)
- Zustand
- React Router
- Zod

### Backend

- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm run install:all
```

3. Configure o banco de dados PostgreSQL
4. Configure as variáveis de ambiente no backend
5. Execute as migrations do banco

## 🏃‍♂️ Execução

### Desenvolvimento (Frontend + Backend)

```bash
npm run dev
```

### Apenas Frontend

```bash
npm run dev:frontend
```

### Apenas Backend

```bash
npm run dev:backend
```

## 📋 Funcionalidades do MVP

- ✅ Gestão de Fornecedores (CRUD)
- ✅ Sistema de Tickets de Pesagem
- ✅ Conversão de Tickets em Compras
- ✅ Gestão de Pagamentos (Total/Parcial)
- ✅ Controle de Saldo de Fornecedores
- ✅ Geração de Recibos
- ✅ Relatórios Básicos de Compras

## 🔄 Próximas Etapas

- Gestão de Estoque
- Módulo de Vendas
- Relatórios Avançados
- Sistema de Autenticação
- Otimizações de Performance
