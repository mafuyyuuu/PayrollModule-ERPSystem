import { getAdminConfig, insertAdminConfig } from '../models/adminConfigModel.js';

export const fetchAdminConfig = async (req, res) => {
    try {
        const config = await getAdminConfig();
        res.json(config);
    } catch (err) {
        console.error('Failed to fetch admin config:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const saveAdminConfig = async (req, res) => {
    try {
        const data = req.body;
        await insertAdminConfig(data); // or updateAdminConfig(data) if overwriting
        res.json({ message: 'Configuration updated!' });
    } catch (err) {
        console.error('Failed to update config:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
