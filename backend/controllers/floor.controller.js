const Floor = require("../models/Floor");
const Room = require("../models/Room");

// ===== CREATE FLOOR =====
const createFloor = async (req, res) => {
  try {
    const { floorNumber } = req.body;

    if (!floorNumber) {
      return res.status(400).json({
        message: "Floor number required",
      });
    }

    // Check duplicate floor number
    const existingFloor = await Floor.findOne({
      floorNumber: Number(floorNumber),
    });

    if (existingFloor) {
      return res.status(400).json({
        message: "Floor already exists",
      });
    }

    const floor = await Floor.create({
      floorNumber: Number(floorNumber),
    });

    res.status(201).json(floor);

  } catch (error) {
    console.error("CREATE FLOOR ERROR:", error);
    res.status(500).json({
      message: "Failed to create floor",
    });
  }
};

// ===== GET ALL FLOORS =====
const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find().populate("warden", "name email");

    res.json(floors);

  } catch (error) {
    console.error("GET FLOORS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch floors",
    });
  }
};

// ===== ASSIGN WARDEN =====
const assignWarden = async (req, res) => {
  try {
    const { wardenId } = req.body;
    const floorId = req.params.id;

    if (!wardenId) {
      return res.status(400).json({
        message: "Warden ID is required",
      });
    }

    // Find floor
    const floor = await Floor.findById(floorId);

    if (!floor) {
      return res.status(404).json({
        message: "Floor not found",
      });
    }

    // Check if floor already assigned to another warden
    if (
      floor.warden &&
      floor.warden.toString() !== wardenId
    ) {
      return res.status(400).json({
        message: "This floor is already assigned to another warden",
      });
    }

    // Check if this warden is already assigned to another floor
    const existingFloor = await Floor.findOne({
      warden: wardenId,
      _id: { $ne: floorId },
    });

    if (existingFloor) {
      return res.status(400).json({
        message: `This warden is already assigned to Floor ${existingFloor.floorNumber}`,
      });
    }

    // If same warden already assigned to same floor
    if (
      floor.warden &&
      floor.warden.toString() === wardenId
    ) {
      return res.status(400).json({
        message: "This floor is already assigned to this warden",
      });
    }

    floor.warden = wardenId;
    await floor.save();

    const updatedFloor = await Floor.findById(floorId).populate(
      "warden",
      "name email"
    );

    res.json({
      message: "Warden assigned successfully",
      floor: updatedFloor,
    });

  } catch (error) {
    console.error("ASSIGN WARDEN ERROR:", error);
    res.status(500).json({
      message: "Failed to assign warden",
    });
  }
};

// ===== UPDATE FLOOR =====
const updateFloor = async (req, res) => {
  try {
    const { floorNumber } = req.body;

    if (!floorNumber) {
      return res.status(400).json({
        message: "Floor number required",
      });
    }

    // Prevent duplicate floor numbers
    const exists = await Floor.findOne({
      floorNumber: Number(floorNumber),
    });

    if (
      exists &&
      exists._id.toString() !== req.params.id
    ) {
      return res.status(400).json({
        message: "Floor already exists",
      });
    }

    const updatedFloor = await Floor.findByIdAndUpdate(
      req.params.id,
      {
        floorNumber: Number(floorNumber),
      },
      {
        new: true,
      }
    );

    if (!updatedFloor) {
      return res.status(404).json({
        message: "Floor not found",
      });
    }

    res.json(updatedFloor);

  } catch (error) {
    console.error("UPDATE FLOOR ERROR:", error);
    res.status(500).json({
      message: "Failed to update floor",
    });
  }
};

// ===== DELETE FLOOR =====
const deleteFloor = async (req, res) => {
  try {
    const floorId = req.params.id;

    // Remove floor reference from rooms
    await Room.updateMany(
      { floor: floorId },
      { $unset: { floor: "" } }
    );

    const deletedFloor = await Floor.findByIdAndDelete(
      floorId
    );

    if (!deletedFloor) {
      return res.status(404).json({
        message: "Floor not found",
      });
    }

    res.json({
      message: "Floor deleted successfully",
    });

  } catch (error) {
    console.error("DELETE FLOOR ERROR:", error);
    res.status(500).json({
      message: "Failed to delete floor",
    });
  }
};

module.exports = {
  createFloor,
  getFloors,
  assignWarden,
  updateFloor,
  deleteFloor,
};