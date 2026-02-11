const SystemSettings = require("../models/SystemSettings");

// GET
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({ totalRooms: 0 });
    }

    res.json(settings);
  } catch {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

// UPDATE
const updateSettings = async (req, res) => {
  try {
    const { totalRooms } = req.body;

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({ totalRooms });
    } else {
      settings.totalRooms = totalRooms;
      await settings.save();
    }

    res.json({ message: "Rooms updated successfully" });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = { getSettings, updateSettings };
