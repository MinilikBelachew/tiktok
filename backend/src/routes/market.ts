import { Router } from "express";
import {
  createMarket,
  deleteMarket,
  getMarketById,
  getMarkets,
  getOpenMarkets,
  getSettledMarkets,
  getUpcomingMarkets,
  updateMarket,
  activateMarket,
  deactivateMarket,
} from "../controllers/admin/market.js";
import { adminOnly, authenticate } from "../middlewares/authorize.js";
import { uploadProfileImage } from "../middlewares/multer.js";
import cloudinaryUpload from "../middlewares/cloudinary.js";

const router = Router();
router.post(
  "/create",
  uploadProfileImage,
  cloudinaryUpload,
  authenticate,
  adminOnly,
  createMarket
);

// READ
router.get("/market", getMarkets); 
router.get("/market/settled", authenticate, getSettledMarkets);
router.get("/market/open",  getOpenMarkets);
router.get("/market/upcoming", authenticate, getUpcomingMarkets);
router.get("/market/:id(\\d+)", authenticate, getMarketById); 

// UPDATE
router.put("/market/:id(\\d+)", uploadProfileImage, cloudinaryUpload, authenticate, adminOnly, updateMarket);
router.patch("/market/:id(\\d+)/activate", authenticate, adminOnly, activateMarket);
router.patch("/market/:id(\\d+)/deactivate", authenticate, adminOnly, deactivateMarket);
 
// DELETE
router.delete("/market/:id(\\d+)", authenticate, adminOnly, deleteMarket);

export default router;
