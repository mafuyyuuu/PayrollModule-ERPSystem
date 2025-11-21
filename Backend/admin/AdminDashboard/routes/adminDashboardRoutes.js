import express from "express";
import {
    getTotalEmployees,
    getProcessedPayouts,
    getPendingPayouts,
    getUpcomingSchedule
} from "../models/adminDashboardModel.js";

const router = express.Router();

// Total Employees
router.get("/total-employees", async (req, res) => {
    try {
        const total = await getTotalEmployees();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Processed Payouts (Released)
router.get("/processed-payouts", async (req, res) => {
    try {
        const total = await getProcessedPayouts();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pending Payouts
router.get("/pending-payouts", async (req, res) => {
    try {
        const total = await getPendingPayouts();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upcoming Schedule
router.get("/upcoming-schedule", async (req, res) => {
    try {
        const schedule = await getUpcomingSchedule();
        res.json({ schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
