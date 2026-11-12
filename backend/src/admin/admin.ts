import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
const { Database, Resource } = require('@adminjs/sequelize');
import MenuItem from '../models/menuItem';
import Order from '../models/order';

AdminJS.registerAdapter({ Database, Resource });

const adminOptions = {
  resources: [MenuItem, Order],
  rootPath: '/admin',
  branding: {
    companyName: 'Mangal House',
  },
};

const admin = new AdminJS(adminOptions);
export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        return { email };
      }

      return null;
    },
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || "fallback-secret",
  },
  null,
  {
    resave: false,
    saveUninitialized: false,
  }
);