import express from 'express';
import { fetchAdminConfig, saveAdminConfig } from '../controllers/adminConfigControllers.js';

const router = express.Router();

// GET latest admin config
router.get('/', fetchAdminConfig);

// POST or update admin config
router.post('/', saveAdminConfig);

export default router;
