import express from "express";
// IMPORTANT: Adjust the path below to correctly import the pools and the audit log function
import { payrollPool, employeePool } from "../../server.js";
import { recordAuditLog } from '../routes/adminAuditLogsRoutes.js';

const router = express.Router();

// Role mapping to display readable names from the database role_id (1-4)
const roleMap = { 1: 'Admin', 2: 'Manager', 3: 'Payroll Officer', 4: 'Employee' };

// =====================================================================
// 1. Get all users (READ)
// Fetches account details from Payroll DB and links to Employee name from EMS DB
// =====================================================================
router.get("/", async (req, res) => {
    try {
        // --- STEP 1: Fetch all User Accounts from the Payroll DB ---
        const [userAccounts] = await payrollPool.execute(
            `SELECT 
                user_id, 
                employee_id, 
                username, 
                email_address, 
                role_id, 
                status
             FROM UserAccounts
             ORDER BY user_id`
        );

        // --- STEP 2: Collect all linked employee_ids ---
        const employeeIds = userAccounts
            .map(user => user.employee_id)
            .filter(id => id !== null); // Ignore accounts not linked to an employee

        let employeeMap = {};
        if (employeeIds.length > 0) {
            // --- STEP 3: Fetch Employee names from the EMS DB (employeePool) ---
            const placeholders = employeeIds.map(() => '?').join(',');
            const [employees] = await employeePool.execute(
                // Note: Assumes Employees table has first_name and last_name columns
                `SELECT 
                    employee_id, 
                    CONCAT(first_name, ' ', last_name) AS full_name
                 FROM Employees 
                 WHERE employee_id IN (${placeholders})`,
                employeeIds
            );

            // Map employee data by ID for quick lookup
            employees.forEach(emp => {
                employeeMap[emp.employee_id] = emp;
            });
        }

        // --- STEP 4: Combine data and format for the frontend ---
        const finalUsers = userAccounts.map(user => {
            const employeeData = employeeMap[user.employee_id] || {};
            return {
                id: user.user_id, // Use user_id as the primary component key
                employeeId: user.employee_id,
                username: user.username,
                email: user.email_address,
                role_id: user.role_id, // Keep numeric ID for updating
                role: roleMap[user.role_id] || 'Unknown', // Readable role name for display
                name: employeeData.full_name || 'N/A', // Employee name from EMS DB
                status: user.status,
            };
        });

        res.json({ users: finalUsers });
    } catch (err) {
        console.error("Error fetching user accounts:", err);
        // Return a 500 status and an informative message if the backend query fails
        res.status(500).json({ message: "Error fetching user accounts. Check Payroll DB connection or schema." });
    }
});

// =====================================================================
// 2. Add a new user (CREATE)
// Creates a new account in UserAccounts table
// =====================================================================
router.post("/", async (req, res) => {
    // The front-end must send all these fields (including a temporary/initial password)
    const { employee_id, username, email, password, role_id, status } = req.body;

    // Check for required fields
    if (!username || !email || !password || !role_id || !status) {
        return res.status(400).json({ message: "Username, email, password, role_id, and status are required" });
    }

    // NOTE: In a real system, the password MUST be securely hashed (e.g., using bcrypt) here.
    const hashedPassword = password; // Placeholder for actual hashing logic

    try {
        // Insert into UserAccounts table using payrollPool
        const [result] = await payrollPool.execute(
            `INSERT INTO UserAccounts 
             (employee_id, username, email_address, password, role_id, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id || null, username, email, hashedPassword, role_id, status]
        );

        // Record the audit log
        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'USER_CREATE',
            `Created new user account: ${username} (ID: ${result.insertId}) with Role ID: ${role_id}`
        );

        res.json({ message: "User account added successfully", id: result.insertId });
    } catch (err) {
        console.error("Error adding user account:", err);
        // Handle potential duplicate username/email errors gracefully (MySQL error code 1062)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Username or email already exists." });
        }
        res.status(500).json({ message: "Failed to add user account" });
    }
});

// =====================================================================
// 3. Update a user (UPDATE)
// Updates an existing account in UserAccounts table
// =====================================================================
router.put("/:id", async (req, res) => {
    const { id } = req.params; // This is the user_id
    // Only allow updating controllable fields
    const { username, email, role_id, status, password } = req.body;

    if (!username && !email && !role_id && !status && !password) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    let updateFields = [];
    let updateValues = [];

    if (username) { updateFields.push("username = ?"); updateValues.push(username); }
    if (email) { updateFields.push("email_address = ?"); updateValues.push(email); }
    if (role_id) { updateFields.push("role_id = ?"); updateValues.push(role_id); }
    if (status) { updateFields.push("status = ?"); updateValues.push(status); }

    if (password) {
        // NOTE: If updating password, it MUST be hashed here before storage
        const hashedPassword = password; // Placeholder for actual hashing logic
        updateFields.push("password = ?");
        updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: "Invalid fields provided for update" });
    }

    try {
        const [result] = await payrollPool.execute(
            `UPDATE UserAccounts SET ${updateFields.join(', ')} WHERE user_id = ?`,
            [...updateValues, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User account not found" });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'USER_UPDATE',
            `Updated account ID: ${id}. Fields changed: ${updateFields.join(', ')}`
        );

        res.json({ message: "User account updated successfully" });
    } catch (err) {
        console.error("Error updating user account:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Username or email already exists." });
        }
        res.status(500).json({ message: "Failed to update user account" });
    }
});

// =====================================================================
// 4. Delete a user (DELETE)
// Deletes an account from UserAccounts table
// =====================================================================
router.delete("/:id", async (req, res) => {
    const { id } = req.params; // This is the user_id
    try {
        const [result] = await payrollPool.execute(
            "DELETE FROM UserAccounts WHERE user_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User account not found" });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'USER_DELETE',
            `Deleted User Account ID: ${id}`
        );

        res.json({ message: "User account deleted successfully" });
    } catch (err) {
        console.error("Error deleting user account:", err);
        res.status(500).json({ message: "Failed to delete user account" });
    }
});

export default router;