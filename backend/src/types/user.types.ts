import { Optional } from "sequelize";

export interface UserAttributes {
  id: number;
  phone: string;
  name: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
  passwordHash: string;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}
