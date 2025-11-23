// backend/admin/routes/dashboardRoutes.js
import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardControllers.js';

const router = express.Router();

// Single endpoint for all dashboard stats
router.get('/summary', getDashboardSummary);

export default router;
