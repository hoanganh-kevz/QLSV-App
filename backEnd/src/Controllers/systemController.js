const SystemConfig = require('../models/SystemConfig');

// @desc    Get all system configurations
// @route   GET /api/system/config
const getSystemConfig = async (req, res) => {
    try {
        const configs = await SystemConfig.find();
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });
        res.json(configMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update or create a system configuration
// @route   POST /api/system/config
const updateSystemConfig = async (req, res) => {
    try {
        const { key, value, description } = req.body;
        let config = await SystemConfig.findOne({ key });

        if (config) {
            config.value = value;
            if (description) config.description = description;
            await config.save();
        } else {
            config = await SystemConfig.create({ key, value, description });
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemConfig,
    updateSystemConfig
};
