const Floor = require("../models/Floor");
const Room = require("../models/Room");
// CREATE FLOOR
const createFloor = async (req, res) => {
  try {
    const { floorNumber } = req.body;

    if (!floorNumber) {
      return res.status(400).json({ message: "Floor number required" });
    }

    const floor = await Floor.create({ floorNumber });

    res.json(floor);
  } catch (error) {
    res.status(500).json({ message: "Failed to create floor" });
  }
};

// GET ALL FLOORS
const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find().populate("warden", "name");
    res.json(floors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch floors" });
  }
};

// ASSIGN WARDEN
const assignWarden = async (req, res) => {
  try {
    const { wardenId } = req.body;

    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      { warden: wardenId },
      { new: true }
    );

    res.json(floor);
  } catch (error) {
    res.status(500).json({ message: "Failed to assign warden" });
  }
};

// ===== UPDATE FLOOR =====
const updateFloor = async (req, res) => {
  try {
    const { floorNumber } = req.body;

    if (!floorNumber) {
      return res.status(400).json({ message: "Floor number required" });
    }

    // prevent duplicate floors
    const exists = await Floor.findOne({ floorNumber });

    if (exists && exists._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Floor already exists" });
    }

    const updatedFloor = await Floor.findByIdAndUpdate(
      req.params.id,
      { floorNumber: Number(floorNumber) },
      { new: true }
    );

    if (!updatedFloor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    res.json(updatedFloor);

  } catch (error) {
    console.error("UPDATE FLOOR ERROR:", error);
    res.status(500).json({ message: "Failed to update floor" });
  }
};

// ===== DELETE FLOOR =====
const deleteFloor = async (req, res) => {
  try {
    const floorId = req.params.id;

    // remove floor from all rooms
    await Room.updateMany(
      { floor: floorId },
      { $unset: { floor: "" } }
    );

    // delete floor
    const deleted = await Floor.findByIdAndDelete(floorId);

    if (!deleted) {
      return res.status(404).json({ message: "Floor not found" });
    }

    res.json({ message: "Floor deleted successfully" });

  } catch (error) {
    console.error("DELETE FLOOR ERROR:", error);
    res.status(500).json({ message: "Failed to delete floor" });
  }
};

module.exports = {
  createFloor,
  getFloors,
  assignWarden,
  updateFloor,
  deleteFloor,

};