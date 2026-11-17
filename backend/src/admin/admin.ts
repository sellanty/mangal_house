import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";

import MenuItem from "../models/menuItem.js";
import Order from "../models/order.js";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const cookieSecret = process.env.ADMIN_COOKIE_SECRET;

if (!adminEmail || !adminPassword) {
  throw new Error("ADMIN_EMAIL или ADMIN_PASSWORD не заданы");
}

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error("ADMIN_COOKIE_SECRET должен содержать минимум 32 символа");
}

AdminJS.registerAdapter({
  Database: AdminJSSequelize.Database,
  Resource: AdminJSSequelize.Resource,
});

const admin = new AdminJS({
  resources: [MenuItem, Order],
  rootPath: "/admin",
  branding: {
    companyName: "Mangal House",
  },
});

export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      if (email === adminEmail && password === adminPassword) {
        return { email };
      }

      return null;
    },
    cookiePassword: cookieSecret,
  },
  null,
  {
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }
);
