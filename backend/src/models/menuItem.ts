import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import {
  MenuItemAttributes,
  MenuItemCreationAttributes,
} from "../types/menuItem.types.js";


class MenuItem
  extends Model<MenuItemAttributes, MenuItemCreationAttributes>
  implements MenuItemAttributes
{
  declare id: number;
  declare name: string;
  declare price: number;
  declare description: string;
  declare ingredients: string;
  declare category: string;
  declare emoji: string;
  declare popular: boolean;
  declare available: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}


MenuItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "MenuItems",
    timestamps: true,
  }
);

export default MenuItem;
