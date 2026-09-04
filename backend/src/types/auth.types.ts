export interface RegisterRequest {
    phone: string;
    name: string;
    address: string;
    password: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
}

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