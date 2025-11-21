import pool from '../../../db.js';

export const getAdminConfig = async () => {
    const [rows] = await pool.execute(
        'SELECT * FROM AdminConfig ORDER BY config_id DESC LIMIT 1'
    );
    return rows[0] || null;
};

// If you want to keep history, use INSERT
export const insertAdminConfig = async (data) => {
    const {
        default_payroll_frequency,
        default_cutoff_dates,
        default_tax_rates,
        default_contribution_rates,
        salary_computation_formula,
        effective_date_of_changes,
        updated_by
    } = data;

    const [result] = await pool.execute(
        `INSERT INTO AdminConfig 
         (default_payroll_frequency, default_cutoff_dates, default_tax_rates, default_contribution_rates, salary_computation_formula, effective_date_of_changes, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            default_payroll_frequency,
            default_cutoff_dates,
            default_tax_rates,
            default_contribution_rates,
            salary_computation_formula,
            effective_date_of_changes,
            updated_by
        ]
    );

    return result;
};

// Or to always overwrite the last row
export const updateAdminConfig = async (data) => {
    const {
        default_payroll_frequency,
        default_cutoff_dates,
        default_tax_rates,
        default_contribution_rates,
        salary_computation_formula,
        effective_date_of_changes,
        updated_by
    } = data;

    const [result] = await pool.execute(
        `UPDATE AdminConfig SET
                                default_payroll_frequency = ?,
                                default_cutoff_dates = ?,
                                default_tax_rates = ?,
                                default_contribution_rates = ?,
                                salary_computation_formula = ?,
                                effective_date_of_changes = ?,
                                updated_by = ?
         ORDER BY config_id DESC LIMIT 1`,
        [
            default_payroll_frequency,
            default_cutoff_dates,
            default_tax_rates,
            default_contribution_rates,
            salary_computation_formula,
            effective_date_of_changes,
            updated_by
        ]
    );

    return result;
};
