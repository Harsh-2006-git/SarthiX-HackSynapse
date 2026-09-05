// routes/familyMemberRoutes.js
import express from "express";
import {
    addFamilyMember,
    getFamilyMembers,
    deleteFamilyMember,
} from "../controllers/familyMemberController.js";
import authenticateClient from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateClient);

router.post("/add", addFamilyMember);
router.get("/all", getFamilyMembers);
router.delete("/remove/:id", deleteFamilyMember);

export default router;
