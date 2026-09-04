export interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    ingredients?: string;
    category: string;
    emoji: string;
    popular: boolean;
    available: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
}