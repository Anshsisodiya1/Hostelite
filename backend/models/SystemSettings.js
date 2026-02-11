const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  totalRooms: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
