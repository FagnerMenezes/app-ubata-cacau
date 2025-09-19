import { Request, Response } from "express";
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static listUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deactivateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static activateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auth.controller.d.ts.map