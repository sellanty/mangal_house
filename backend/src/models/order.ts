import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import {
  OrderStatus,
  OrderAttributes,
  OrderCreationAttributes,
} from "../types/order.types.js";

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  declare id: number;
  declare customerName: string;
  declare customerPhone: string;
  declare customerAddress: string;
  declare items: any;
  declare totalAmount: number;
  declare status: OrderStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customerName",
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customerPhone",
    },
    customerAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customerAddress",
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "totalAmount",
    },
    status: {
      type: DataTypes.ENUM(
        "new",
        "cooking",
        "delivering",
        "completed",
        "cancelled"
      ),
      defaultValue: "new",
    },
  },
  {
    sequelize,
    tableName: "Orders",
    timestamps: true, // автоматически добавить createdAt, updatedAt
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);
export default Order;
