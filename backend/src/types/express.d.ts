import "express";

declare module "express-serve-static-core" {
  // augment the existing Request so all your code "just works"
  interface Request {
    user?: { id: number; role: "USER" | "ADMIN" };
    cloudinaryResult?: any;
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}