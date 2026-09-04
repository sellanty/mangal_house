import { Optional } from "sequelize";

export interface MenuItemAttributes {
    id: number;
    name: string;
    price: number;
    description: string;
    ingredients?: string;
    category: string;
    emoji: string;
    popular: boolean;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
    available: boolean;
}

export interface MenuItemCreationAttributes extends Optional<MenuItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}