
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  const match = /^Bearer\s+(\S+)$/i.exec(authorization ?? "");

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Необходима авторизация",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET не настроен");

    return res.status(500).json({
      success: false,
      message: "Ошибка конфигурации сервера",
    });
  }

  try {
    const payload = jwt.verify(match[1], jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Недействительный токен",
      });
    }

    res.locals.userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Токен недействителен или срок действия истёк",
    });
  }
};
