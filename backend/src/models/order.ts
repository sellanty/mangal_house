import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import {
  OrderStatus,
  OrderAttributes,
  OrderCreationAttributes,
} from "../types/order.types";

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public customerName!: string;
  public customerPhone!: string;
  public customerAddress!: string;
  public items!: any;
  public totalAmount!: number;
  public status!: OrderStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
