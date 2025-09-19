import { AuthResponse, CreateUserData, JWTPayload, LoginData, User } from "../types/auth";
export declare class AuthService {
    static createUser(data: CreateUserData): Promise<User>;
    static login(data: LoginData): Promise<AuthResponse>;
    static listUsers(): Promise<User[]>;
    static getUserById(id: string): Promise<User>;
    static updateUser(id: string, data: Partial<CreateUserData>): Promise<User>;
    static deactivateUser(id: string): Promise<void>;
    static activateUser(id: string): Promise<void>;
    static verifyToken(token: string): JWTPayload;
}
//# sourceMappingURL=auth.service.d.ts.map