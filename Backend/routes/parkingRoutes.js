// routes/parkingRoutes.js
import express from "express";
import {
    createParkingSlot,
    getAllParkingSlots,
    getMyParkingSlots,
    getParkingSlotById,
    updateParkingSlot,
    deleteParkingSlot,
    toggleActivity,
} from "../controllers/parkingController.js";
import authenticateClient from "../middlewares/authMiddleware.js";
import multer from "multer";

import { parkingStorage } from "../config/cloudinary.js";
const upload = multer({ storage: parkingStorage });

const router = express.Router();

// Public routes
router.get("/", getAllParkingSlots);
router.get("/:id", getParkingSlotById);

// Protected routes
router.use(authenticateClient);
router.post("/", upload.array("images", 5), createParkingSlot);
router.get("/user/my-slots", getMyParkingSlots);
router.put("/:id", upload.array("images", 5), updateParkingSlot);
router.delete("/:id", deleteParkingSlot);
router.patch("/:id/toggle", toggleActivity);

export default router;
