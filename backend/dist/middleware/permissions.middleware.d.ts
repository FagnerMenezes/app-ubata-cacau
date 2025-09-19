import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth";
export declare const requireModuleAccess: (module: string) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=permissions.middleware.d.ts.map