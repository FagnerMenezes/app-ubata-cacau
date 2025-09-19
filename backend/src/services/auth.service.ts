// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// export class AuthService {
//   static async createUser(data: CreateUserData): Promise<User> {
//     // Verificar se o usuário já existe
//     const existingUser = await prisma.user.findUnique({
//       where: { email: data.email },
//     });

//     if (existingUser) {
//       throw new Error("Usuário já existe com este email");
//     }

//     // Hash da senha
//     const hashedPassword = await bcrypt.hash(data.password, 12);

//     // Criar usuário
//     const user = await prisma.user.create({
//       data: {
//         email: data.email,
//         password: hashedPassword,
//         name: data.name,
//         role: data.role || "USER",
//         isActive: true,
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return user;
//   }

//   static async login(data: LoginData): Promise<AuthResponse> {
//     // Buscar usuário
//     const user = await prisma.user.findUnique({
//       where: { email: data.email },
//     });

//     if (!user) {
//       throw new Error("Credenciais inválidas");
//     }

//     if (!user.isActive) {
//       throw new Error("Usuário inativo");
//     }

//     // Verificar senha
//     const isValidPassword = await bcrypt.compare(data.password, user.password);

//     if (!isValidPassword) {
//       throw new Error("Credenciais inválidas");
//     }

//     // Gerar token JWT
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         email: user.email,
//         role: user.role,
//         iat: Math.floor(Date.now() / 1000),
//         exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
//       },
//       JWT_SECRET as string
//     );

//     // Retornar dados do usuário (sem senha) e token
//     // Remove a senha do objeto user antes de retornar
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password, ...userWithoutPassword } = user;

//     return {
//       user: userWithoutPassword,
//       token,
//     };
//   }

//   static async getUserById(id: string): Promise<User | null> {
//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return user;
//   }

//   static async updateUser(
//     id: string,
//     data: Partial<CreateUserData>
//   ): Promise<User> {
//     const updateData: any = {};

//     if (data.name) updateData.name = data.name;
//     if (data.email) updateData.email = data.email;
//     if (data.role) updateData.role = data.role;
//     if (data.password) {
//       updateData.password = await bcrypt.hash(data.password, 12);
//     }

//     const user = await prisma.user.update({
//       where: { id },
//       data: updateData,
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     return user;
//   }

//   static async deactivateUser(id: string): Promise<void> {
//     await prisma.user.update({
//       where: { id },
//       data: { isActive: false },
//     });
//   }

//   static async activateUser(id: string): Promise<void> {
//     await prisma.user.update({
//       where: { id },
//       data: { isActive: true },
//     });
//   }

//   static async listUsers(): Promise<User[]> {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return users;
//   }

//   static verifyToken(token: string): JWTPayload {
//     try {
//       return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
//     } catch (error) {
//       throw new Error("Token inválido");
//     }
//   }
// }

//import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  AuthResponse,
  CreateUserData,
  JWTPayload,
  LoginData,
  User,
} from "../types/auth";

//const supabase = createClient(
// process.env.SUPABASE_URL || "",
// process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Use a chave de serviço para acesso seguro
//);
import supabase from "../lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export class AuthService {
  static async createUser(data: CreateUserData): Promise<User> {
    // Verificar se o usuário já existe
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single();

    if (findError) throw new Error("Erro ao verificar usuário");
    if (existingUser) throw new Error("Usuário já existe com este email");

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Criar usuário
    const { data: user, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || "USER",
          isActive: true,
        },
      ])
      .select("id, email, name, role, isActive, createdAt, updatedAt")
      .single();

    if (createError || !user) throw new Error("Erro ao criar usuário");

    return user;
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    // Buscar usuário
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single();

    if (findError || !user) throw new Error("Credenciais inválidas");
    if (!user.isActive) throw new Error("Usuário inativo");

    // Verificar senha
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) throw new Error("Credenciais inválidas");

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      JWT_SECRET
    );

    // Remover senha antes de retornar
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  static async listUsers(): Promise<User[]> {
    const { data: users, error: listError } = await supabase
      .from("users")
      .select("id, email, name, role, isActive, createdAt, updatedAt")
      .order("createdAt", { ascending: false });
    if (listError) throw new Error("Erro ao listar usuários");
    if (!users) throw new Error("Nenhum usuário encontrado");
    return users;
  }
  static async getUserById(id: string): Promise<User> {
    const { data: users, error: getUserError } = await supabase
      .from("users")
      .select("id, email, name, role, isActive, createdAt, updatedAt")
      .eq("id", id)
      .single();
    if (getUserError) throw new Error("Erro ao buscar usuário");
    if (!users) throw new Error("Usuário não encontrado");
    return users;
  }

  static async updateUser(
    id: string,
    data: Partial<CreateUserData>
  ): Promise<User> {
    const { data: user, error: updateError } = await supabase
      .from("users")
      .update(data)
      .eq("id", id)
      .select("id, email, name, role, isActive, createdAt, updatedAt")
      .single();
    if (updateError) throw new Error("Erro ao atualizar usuário");
    if (!user) throw new Error("Usuário não encontrado");
    return user;
  }
  static async deactivateUser(id: string): Promise<void> {
    const { error: deactivateError } = await supabase
      .from("users")
      .update({ isActive: false })
      .eq("id", id);
    if (deactivateError) throw new Error("Erro ao desativar usuário");
  }
  static async activateUser(id: string): Promise<void> {
    const { error: activateError } = await supabase
      .from("users")
      .update({ isActive: true })
      .eq("id", id);
    if (activateError) throw new Error("Erro ao ativar usuário");
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
    } catch (error) {
      throw new Error("Token inválido");
    }
  }
}
