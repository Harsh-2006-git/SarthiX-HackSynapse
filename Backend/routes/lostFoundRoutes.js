import express from "express";
import multer from "multer";
import {
  createLostFound,
  getLostFoundItems,
} from "../controllers/lostFoundController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // <-- make sure this adds req.user

const router = express.Router();

import { lostFoundStorage } from "../config/cloudinary.js";
const upload = multer({ storage: lostFoundStorage });

router.post("/upload", authMiddleware, upload.single("image"), createLostFound);
router.get("/get", getLostFoundItems);

export default router;
