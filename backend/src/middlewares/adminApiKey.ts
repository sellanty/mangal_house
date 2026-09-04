import { NextFunction, Request, Response } from "express";

export const requireAdminApiKey = (req: Request, res: Response, next: NextFunction) => {
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!adminApiKey) {
        return res.status(500).json({
            error: "ADMIN_API_KEY не настроен на сервере"
        })
    }

    const providedApiKey = req.headers["x-admin-api-key"];

    if (!providedApiKey || providedApiKey !== adminApiKey) {
        return res.status(401).json({
          error: "Нет доступа",
        });
      }
    
      next();

}