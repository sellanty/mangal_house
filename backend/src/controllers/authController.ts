import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from "../types/auth.types.js";

const createToken = (user: User) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET не настроен на сервере");
  }

  const tokenLifetime = 7 * 24 * 60 * 60;

  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
    },
    jwtSecret,
    {
      expiresIn: tokenLifetime,
    }
  );
};

const toAuthUser = (user: User) => ({
  id: user.id,
  phone: user.phone,
  name: user.name,
  address: user.address,
});

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response<AuthResponse>
) => {
  try {
    const { phone, name, address, password } = req.body;

    if (!phone || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Телефон, имя и пароль обязательны",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Пароль должен быть минимум 6 символов",
      });
    }

    const normalizedPhone = phone.trim();

    const existingUser = await User.findOne({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Пользователь с таким телефоном уже существует",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      phone: normalizedPhone,
      name,
      address,
      passwordHash,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      user: toAuthUser(user),
      token,
      message: "Регистрация прошла успешно!",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<AuthResponse>
) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Телефон и пароль обязательны",
      });
    }

    const normalizedPhone = phone.trim();

    const user = await User.findOne({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неверный телефон или пароль",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Неверный телефон или пароль",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      user: toAuthUser(user),
      token,
      message: "Добро пожаловать!",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
};

export const getMe = async (_req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    return res.json({
      success: true,
      user: toAuthUser(user),
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
};
