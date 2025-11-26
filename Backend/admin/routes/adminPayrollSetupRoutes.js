import express from 'express';
import { payrollPool } from '../../db.js'; // make sure this points to your Payroll DB

const router = express.Router();

// ==================== TAX SETTINGS ====================

// GET ALL TAX SETTINGS
router.get('/tax-settings', async (req, res) => {
    try {
        const [taxes] = await payrollPool.execute(
            `SELECT * FROM TaxSettings ORDER BY effective_date DESC`
        );
        res.json(taxes);
    } catch (err) {
        console.error('Error fetching tax settings:', err);
        res.status(500).json({ message: 'Failed to fetch tax settings' });
    }
});

// ADD NEW TAX SETTING
router.post('/tax-settings', async (req, res) => {
    const { tax_type, tax_rate, effective_date, status } = req.body;

    if (!tax_type || tax_rate == null || !effective_date) {
        return res.status(400).json({ message: 'tax_type, tax_rate, and effective_date are required' });
    }

    try {
        await payrollPool.execute(
            `INSERT INTO TaxSettings (tax_type, tax_rate, effective_date, status) VALUES (?, ?, ?, ?)`,
            [tax_type, tax_rate, effective_date, status || 'Active']
        );
        res.json({ message: 'Tax setting added successfully' });
    } catch (err) {
        console.error('Error adding tax setting:', err);
        res.status(500).json({ message: 'Failed to add tax setting' });
    }
});

// UPDATE TAX SETTING
router.put('/tax-settings/:id', async (req, res) => {
    const { id } = req.params;
    const { tax_type, tax_rate, effective_date, status } = req.body;

    try {
        await payrollPool.execute(
            `UPDATE TaxSettings 
             SET tax_type = ?, tax_rate = ?, effective_date = ?, status = ?
             WHERE tax_id = ?`,
            [tax_type, tax_rate, effective_date, status, id]
        );
        res.json({ message: 'Tax setting updated successfully' });
    } catch (err) {
        console.error('Error updating tax setting:', err);
        res.status(500).json({ message: 'Failed to update tax setting' });
    }
});

// DELETE TAX SETTING (soft delete by setting status to 'Inactive')
router.delete('/tax-settings/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await payrollPool.execute(
            `UPDATE TaxSettings SET status = 'Inactive' WHERE tax_id = ?`,
            [id]
        );
        res.json({ message: 'Tax setting deactivated successfully' });
    } catch (err) {
        console.error('Error deleting tax setting:', err);
        res.status(500).json({ message: 'Failed to deactivate tax setting' });
    }
});

// ==================== PAY COMPONENTS ====================

// GET ALL PAY COMPONENTS
router.get('/pay-components', async (req, res) => {
    try {
        const [components] = await payrollPool.execute(
            `SELECT * FROM PayComponents ORDER BY component_name ASC`
        );
        res.json(components);
    } catch (err) {
        console.error('Error fetching pay components:', err);
        res.status(500).json({ message: 'Failed to fetch pay components' });
    }
});

// ADD NEW PAY COMPONENT
router.post('/pay-components', async (req, res) => {
    const { component_name, component_type, calculation_type, formula_expression, fixed_amount, status } = req.body;

    if (!component_name || !component_type || !calculation_type) {
        return res.status(400).json({ message: 'component_name, component_type, and calculation_type are required' });
    }

    try {
        await payrollPool.execute(
            `INSERT INTO PayComponents 
             (component_name, component_type, calculation_type, formula_expression, fixed_amount, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [component_name, component_type, calculation_type, formula_expression || null, fixed_amount || null, status || 'Active']
        );
        res.json({ message: 'Pay component added successfully' });
    } catch (err) {
        console.error('Error adding pay component:', err);
        res.status(500).json({ message: 'Failed to add pay component' });
    }
});

// UPDATE PAY COMPONENT
router.put('/pay-components/:id', async (req, res) => {
    const { id } = req.params;
    const { component_name, component_type, calculation_type, formula_expression, fixed_amount, status } = req.body;

    try {
        await payrollPool.execute(
            `UPDATE PayComponents 
             SET component_name = ?, component_type = ?, calculation_type = ?, formula_expression = ?, fixed_amount = ?, status = ?
             WHERE component_id = ?`,
            [component_name, component_type, calculation_type, formula_expression || null, fixed_amount || null, status, id]
        );
        res.json({ message: 'Pay component updated successfully' });
    } catch (err) {
        console.error('Error updating pay component:', err);
        res.status(500).json({ message: 'Failed to update pay component' });
    }
});

// DELETE PAY COMPONENT (soft delete)
router.delete('/pay-components/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await payrollPool.execute(
            `UPDATE PayComponents SET status = 'Inactive' WHERE component_id = ?`,
            [id]
        );
        res.json({ message: 'Pay component deactivated successfully' });
    } catch (err) {
        console.error('Error deleting pay component:', err);
        res.status(500).json({ message: 'Failed to deactivate pay component' });
    }
});

export default router;
