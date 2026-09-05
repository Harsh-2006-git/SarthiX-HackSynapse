import express from 'express';
import { 
    getLocationHistory, 
    addGuardian, 
    approveTracking, 
    getMyGuardians, 
    getTrackingProtégés,
    getPendingGuardianRequests
} from '../controllers/locationController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Apply auth middleware to all routes

router.get('/history/:userId', getLocationHistory);
router.post('/guardian', addGuardian);
router.post('/approve', approveTracking);
router.get('/my-guardians', getMyGuardians);
router.get('/tracking-list', getTrackingProtégés);
router.get('/pending-requests', getPendingGuardianRequests);

export default router;
