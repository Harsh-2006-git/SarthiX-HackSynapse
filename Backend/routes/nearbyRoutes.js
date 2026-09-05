import express from 'express';
import { getNearbyPlaces } from '../controllers/nearbyController.js';

const router = express.Router();

router.get('/', getNearbyPlaces);

export default router;
