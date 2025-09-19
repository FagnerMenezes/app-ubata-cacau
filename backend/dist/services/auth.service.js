"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = __importDefault(require("../lib/supabase"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
class AuthService {
    static async createUser(data) {
        const { data: existingUser, error: findError } = await supabase_1.default
            .from("users")
            .select("*")
            .eq("email", data.email)
            .single();
        if (findError)
            throw new Error("Erro ao verificar usuário");
        if (existingUser)
            throw new Error("Usuário já existe com este email");
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        const { data: user, error: createError } = await supabase_1.default
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
        if (createError || !user)
            throw new Error("Erro ao criar usuário");
        return user;
    }
    static async login(data) {
        const { data: user, error: findError } = await supabase_1.default
            .from("users")
            .select("*")
            .eq("email", data.email)
            .single();
        if (findError || !user)
            throw new Error("Credenciais inválidas");
        if (!user.isActive)
            throw new Error("Usuário inativo");
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword)
            throw new Error("Credenciais inválidas");
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        }, JWT_SECRET);
        const { password, ...safeUser } = user;
        return {
            user: safeUser,
            token,
        };
    }
    static async listUsers() {
        const { data: users, error: listError } = await supabase_1.default
            .from("users")
            .select("id, email, name, role, isActive, createdAt, updatedAt")
            .order("createdAt", { ascending: false });
        if (listError)
            throw new Error("Erro ao listar usuários");
        if (!users)
            throw new Error("Nenhum usuário encontrado");
        return users;
    }
    static async getUserById(id) {
        const { data: users, error: getUserError } = await supabase_1.default
            .from("users")
            .select("id, email, name, role, isActive, createdAt, updatedAt")
            .eq("id", id)
            .single();
        if (getUserError)
            throw new Error("Erro ao buscar usuário");
        if (!users)
            throw new Error("Usuário não encontrado");
        return users;
    }
    static async updateUser(id, data) {
        const { data: user, error: updateError } = await supabase_1.default
            .from("users")
            .update(data)
            .eq("id", id)
            .select("id, email, name, role, isActive, createdAt, updatedAt")
            .single();
        if (updateError)
            throw new Error("Erro ao atualizar usuário");
        if (!user)
            throw new Error("Usuário não encontrado");
        return user;
    }
    static async deactivateUser(id) {
        const { error: deactivateError } = await supabase_1.default
            .from("users")
            .update({ isActive: false })
            .eq("id", id);
        if (deactivateError)
            throw new Error("Erro ao desativar usuário");
    }
    static async activateUser(id) {
        const { error: activateError } = await supabase_1.default
            .from("users")
            .update({ isActive: true })
            .eq("id", id);
        if (activateError)
            throw new Error("Erro ao ativar usuário");
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error("Token inválido");
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map