// routes/bookingRoutes.js
import express from "express";
import {
    createBooking,
    verifyPayment,
    getMyBookings,
    getSlotBookings,
} from "../controllers/bookingController.js";
import authenticateClient from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateClient);

router.post("/", createBooking);
router.post("/verify", verifyPayment);
router.get("/my-bookings", getMyBookings);
router.get("/slot/:slot_id", getSlotBookings);

export default router;
