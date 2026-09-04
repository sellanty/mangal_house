export interface AuthResponse {
    success: boolean;
    user?: {
        id: number;
        phone: string;
        name: string;
        address: string;
    };
    token?: string;
    message?: string;
}