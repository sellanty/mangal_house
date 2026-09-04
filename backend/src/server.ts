import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import sequelize from "./config/database";
import orderRoutes from "./routes/orderRoutes";
import menuRoutes from "./routes/menuRoutes";
import { adminRouter } from "./admin/admin";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// маршруты
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", adminRouter);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("База данных подключена");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Сервер запущен на порту: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Ошибка:", error);
  }
}

startServer();
