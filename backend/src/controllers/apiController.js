// src/controllers/apiController.js
const mdmQueries = require('../mdm'); // Adjust the path as necessary
const cegidQueries = require('../cegid'); // Adjust the path as necessary

exports.getMdmData = async (req, res) => {
    try {
        const data = await mdmQueries.executeQuery(); // Replace with your actual query function
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getCegiData = async (req, res) => {
    try {
        const data = await cegidQueries.executeQuery(); // Replace with your actual query function
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};