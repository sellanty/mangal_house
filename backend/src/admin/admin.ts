import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";

const { Database, Resource } = require("@adminjs/sequelize");

import MenuItem from "../models/menuItem";
import Order from "../models/order";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const cookieSecret = process.env.ADMIN_COOKIE_SECRET;

if (!adminEmail || !adminPassword) {
  throw new Error("ADMIN_EMAIL или ADMIN_PASSWORD не заданы");
}

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error("ADMIN_COOKIE_SECRET должен содержать минимум 32 символа");
}

AdminJS.registerAdapter({ Database, Resource });

const adminOptions = {
  resources: [MenuItem, Order],
  rootPath: "/admin",
  branding: {
    companyName: "Mangal House",
  },
};

const admin = new AdminJS(adminOptions);

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
    resave: false,
    saveUninitialized: false,
  }
);
