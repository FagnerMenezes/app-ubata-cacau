import { Request } from "express";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: "ADMIN" | "USER";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
}
