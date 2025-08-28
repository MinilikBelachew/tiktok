import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

interface RequestWithFile extends Request {
  file?: Express.Multer.File; 
  cloudinaryResult?: {
    url: string;
    public_id: string;
  };
}

const cloudinaryUpload = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next();
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: path.parse(req.file.filename).name,
      folder: "avatars",
      overwrite: true,
    });

    await fs.unlink(req.file.path);

    req.cloudinaryResult = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    next();
  } catch (error) {
    if (req.file) {
      await fs
        .unlink(req.file.path)
        .catch((err) => console.error("Failed to delete temp file on error:", err));
    }
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
};

export default cloudinaryUpload;
