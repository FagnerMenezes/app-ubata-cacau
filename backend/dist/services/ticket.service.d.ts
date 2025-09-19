import { CreateTicketInput, TicketQuery, UpdateTicketInput } from "../types";
export declare class TicketService {
    static create(data: CreateTicketInput): Promise<any>;
    static findAll(query: TicketQuery): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static findAvailable(): Promise<any[]>;
    static findById(id: string): Promise<any>;
    static update(id: string, data: UpdateTicketInput): Promise<any>;
    static delete(id: string): Promise<void>;
    static convertToCompra(ticketId: string, precoPorKg: number): Promise<any>;
    private static removeUndefinedProperties;
}
//# sourceMappingURL=ticket.service.d.ts.map