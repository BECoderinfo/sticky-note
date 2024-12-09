 const Label = require('../Models/label');

 const createLabel = async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Label Name is required' });
        }
        const label = await Label.create({ name, color });
        res.status(201).json({ success: true, message: 'Label created successfully', label });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all labels
const getAllLabels = async (req, res) => {
    try {
        const labels = await Label.find();
        res.status(200).json({ success: true, message: 'Labels found successfully', labels });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get a single label by ID
const getLabelById = async (req, res) => {
    try {
        const { id } = req.params;
        const label = await Label.findById(id);
        if (!label) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }
        res.status(200).json({ success: true, message: 'Label found successfully', label });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a label 
const updateLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;
        const label = await Label.findByIdAndUpdate(id, { name, color }, { new: true });
        if (!label) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }
        res.status(200).json({ success: true, message: 'Label updated successfully', label });
    } catch (error) {    
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a label 
const deleteLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const label = await Label.findByIdAndDelete(id);
        if (!label) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }
        res.status(200).json({ success: true, message: 'Label deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createLabel,
    getAllLabels,
    getLabelById,
    updateLabel,
    deleteLabel
};