import express from "express";
import { hrDB } from "../../../db.js";

const router = express.Router();

// === Get all users ===
router.get("/", async (req, res) => {
    try {
        const [rows] = await hrDB.query(
            "SELECT employee_id AS id, full_name AS name, role, status FROM Employees"
        );
        res.json({ users: rows });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ users: [] });
    }
});

// === Add a new user ===
router.post("/", async (req, res) => {
    const { id, name, role, status } = req.body;
    if (!id || !name || !role || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        await hrDB.query(
            "INSERT INTO Employees (employee_id, full_name, role, status) VALUES (?, ?, ?, ?)",
            [id, name, role, status]
        );
        res.json({ message: "User added successfully" });
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(500).json({ message: "Failed to add user" });
    }
});

// === Update a user ===
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, role, status } = req.body;
    if (!name || !role || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const [result] = await hrDB.query(
            "UPDATE Employees SET full_name = ?, role = ?, status = ? WHERE employee_id = ?",
            [name, role, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Failed to update user" });
    }
});

// === Delete a user ===
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await hrDB.query(
            "DELETE FROM Employees WHERE employee_id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

export default router;
