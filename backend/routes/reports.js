// ──────────────────────────────────────────────────────────────────────────────
// Hostel Management System — Report Generation Routes
// ──────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");

// ── Models ───────────────────────────────────────────────────────────────────
const User = require("../models/User");
const Room = require("../models/Room");
const Floor = require("../models/Floor");
const Complaint = require("../models/Complaint");
const UserProfile = require("../models/UserProfile");

// ── Middleware ───────────────────────────────────────────────────────────────
const { authMiddleware } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Create PDF
// ─────────────────────────────────────────────────────────────────────────────
function createPDF(res, filename, buildFn) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  doc.pipe(res);

  // Header banner
  doc.rect(0, 0, doc.page.width, 80).fill("#1e3a5f");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20)
    .text("Hostelite - Hostel Management System", 50, 22);
  doc.fillColor("#bfdbfe").font("Helvetica").fontSize(11)
    .text("Admin Report", 50, 50);
  doc.moveDown(3);

  buildFn(doc);

  // Footer on every page
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fillColor("#64748b").fontSize(9).font("Helvetica")
      .text(
        `Generated on ${new Date().toLocaleString()} | Page ${i + 1} of ${pageCount}`,
        50, doc.page.height - 40, { align: "center" }
      );
  }

  doc.end();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Section Title
// ─────────────────────────────────────────────────────────────────────────────
function sectionTitle(doc, title) {
  doc.moveDown(0.8)
    .fillColor("#1e3a5f").font("Helvetica-Bold").fontSize(14)
    .text(title);
  doc.moveDown(0.4);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Floor Sub-heading
// ─────────────────────────────────────────────────────────────────────────────
function floorHeading(doc, floorNumber) {
  doc.moveDown(0.6)
    .rect(50, doc.y, doc.page.width - 100, 20).fill("#e0f2fe");
  doc.fillColor("#0369a1").font("Helvetica-Bold").fontSize(10)
    .text(`  Floor ${floorNumber}`, 55, doc.y - 14);
  doc.moveDown(0.2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Report Meta
// ─────────────────────────────────────────────────────────────────────────────
function reportMeta(doc, title, startDate, endDate) {
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(17).text(title);
  doc.fillColor("#64748b").font("Helvetica").fontSize(10)
    .text(`Period: ${new Date(startDate).toDateString()} → ${new Date(endDate).toDateString()}`);
  doc.moveDown();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Draw Table
// ─────────────────────────────────────────────────────────────────────────────
function drawTable(doc, headers, rows, widths) {
  const startX = 50;
  const rowHeight = 24;
  const totalWidth = widths.reduce((a, b) => a + b, 0);

  let y = doc.y + 10;

  // Header row
  doc.rect(startX, y, totalWidth, rowHeight).fill("#1e3a5f");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
  let x = startX;
  headers.forEach((header, i) => {
    doc.text(header, x + 5, y + 7, { width: widths[i] - 10 });
    x += widths[i];
  });
  y += rowHeight;

  // Body rows
  rows.forEach((row, rowIndex) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 60;
    }
    const bgColor = rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff";
    doc.rect(startX, y, totalWidth, rowHeight).fill(bgColor);
    doc.fillColor("#111827").font("Helvetica").fontSize(8.5);
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? "—"), x + 5, y + 7, {
        width: widths[i] - 10,
        ellipsis: true,
      });
      x += widths[i];
    });
    doc.rect(startX, y, totalWidth, rowHeight).stroke("#e2e8f0");
    y += rowHeight;
  });

  doc.y = y + 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STUDENT REPORT — Summary + Full Student List
// ─────────────────────────────────────────────────────────────────────────────
router.get("/students", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const students = await User.find({
      role: "student",
      createdAt: { $gte: start, $lte: end },
    })
      .populate({
        path: "room",
        select: "roomNumber isOccupied floor",
        populate: { path: "floor", select: "floorNumber" },
      })
      .lean();

    const totalRooms    = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ isOccupied: true });
    const vacantRooms   = totalRooms - occupiedRooms;

    createPDF(res, `student-report-${startDate}-${endDate}.pdf`, (doc) => {
      reportMeta(doc, "Student Occupancy Report", startDate, endDate);

      // ── Summary ──
      sectionTitle(doc, "Summary");
      drawTable(
        doc,
        ["Metric", "Value"],
        [
          ["Total Students",  students.length],
          ["Total Rooms",     totalRooms],
          ["Occupied Rooms",  occupiedRooms],
          ["Vacant Rooms",    vacantRooms],
        ],
        [300, 200]
      );

      // ── Full Student List ──
      sectionTitle(doc, "Student Details");
      const rows = students.map((s) => [
        s.name        || "—",
        s.email       || "—",
        s.room?.roomNumber        || "Unassigned",
        s.room?.floor?.floorNumber ?? "—",
        new Date(s.createdAt).toLocaleDateString(),
      ]);

      if (rows.length === 0) {
        doc.fillColor("#64748b").font("Helvetica").fontSize(10)
          .text("No students found in this date range.");
      } else {
        drawTable(
          doc,
          ["Name", "Email", "Room", "Floor", "Joined"],
          rows,
          [120, 175, 65, 55, 90]
        );
      }
    });
  } catch (error) {
    console.error("Student Report Error:", error);
    res.status(500).json({ message: "Failed to generate student report" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. COMPLAINT REPORT — Floor-wise grouping
// ─────────────────────────────────────────────────────────────────────────────
router.get("/complaints", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const complaints = await Complaint.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate("student", "name email")
      .populate("warden",  "name")
      .populate("room",    "roomNumber")
      .populate("floor",   "floorNumber")
      .lean();

    // Group by floor
    const byFloor = {};
    complaints.forEach((c) => {
      const floorNum = c.floor?.floorNumber ?? "Unassigned";
      if (!byFloor[floorNum]) byFloor[floorNum] = [];
      byFloor[floorNum].push(c);
    });

    createPDF(res, `complaints-report-${startDate}-${endDate}.pdf`, (doc) => {
      reportMeta(doc, "Complaint Report", startDate, endDate);

      // ── Summary ──
      sectionTitle(doc, "Summary");
      const pending    = complaints.filter(c => c.status === "pending").length;
      const inProgress = complaints.filter(c => c.status === "in-progress").length;
      const resolved   = complaints.filter(c => c.status === "resolved").length;
      const rejected   = complaints.filter(c => c.status === "rejected").length;

      drawTable(
        doc,
        ["Metric", "Count"],
        [
          ["Total Complaints",       complaints.length],
          ["Pending",                pending],
          ["In Progress",            inProgress],
          ["Resolved",               resolved],
          ["Rejected",               rejected],
        ],
        [300, 200]
      );

      // ── Floor-wise Complaints ──
      sectionTitle(doc, "Complaints by Floor");

      const sortedFloors = Object.keys(byFloor).sort((a, b) => {
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        return Number(a) - Number(b);
      });

      if (sortedFloors.length === 0) {
        doc.fillColor("#64748b").font("Helvetica").fontSize(10)
          .text("No complaints found in this date range.");
      } else {
        sortedFloors.forEach((floorNum) => {
          floorHeading(doc, floorNum);

          const rows = byFloor[floorNum].map((c) => [
            c.student?.name  || "—",
            c.room?.roomNumber || "—",
            c.title          || "—",
            c.priority       || "—",
            c.status         || "—",
            c.warden?.name   || "Unassigned",
            new Date(c.createdAt).toLocaleDateString(),
          ]);

          drawTable(
            doc,
            ["Student", "Room", "Title", "Priority", "Status", "Warden", "Date"],
            rows,
            [90, 45, 120, 55, 65, 90, 70]
          );
        });
      }
    });
  } catch (error) {
    console.error("Complaint Report Error:", error);
    res.status(500).json({ message: "Failed to generate complaint report" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. STAFF / WARDEN REPORT — All wardens with name, email, floor, date joined
// ─────────────────────────────────────────────────────────────────────────────
router.get("/staff", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // ✅ All wardens in DB (not filtered by date so none are missed)
    // But still respect date filter if needed — fetch all and note joined date
    const wardens = await User.find({ role: "warden" })
      .populate("floor", "floorNumber")
      .lean();

    createPDF(res, `staff-report-${startDate}-${endDate}.pdf`, (doc) => {
      reportMeta(doc, "Warden / Staff Report", startDate, endDate);

      sectionTitle(doc, "Summary");
      drawTable(
        doc,
        ["Metric", "Value"],
        [
          ["Total Wardens", wardens.length],
          ["Report Period", `${new Date(startDate).toDateString()} → ${new Date(endDate).toDateString()}`],
        ],
        [300, 200]
      );

      sectionTitle(doc, "Warden Details");

      if (wardens.length === 0) {
        doc.fillColor("#64748b").font("Helvetica").fontSize(10)
          .text("No wardens found.");
      } else {
        const rows = wardens.map((w) => [
          w.name                    || "—",
          w.email                   || "—",
          w.floor?.floorNumber ?? "Not Assigned",
          new Date(w.createdAt).toLocaleDateString(),
        ]);

        drawTable(
          doc,
          ["Name", "Email", "Floor", "Date Joined"],
          rows,
          [150, 200, 80, 100]
        );
      }
    });
  } catch (error) {
    console.error("Staff Report Error:", error);
    res.status(500).json({ message: "Failed to generate staff report" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ROOM ALLOCATION REPORT — Floor-wise student table
// ─────────────────────────────────────────────────────────────────────────────
router.get("/rooms", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch all floors sorted
    const floors = await Floor.find().sort({ floorNumber: 1 }).lean();

    // Fetch all students with populated room → floor
    const students = await User.find({ role: "student" })
      .populate({
        path: "room",
        populate: { path: "floor", select: "floorNumber" },
      })
      .lean();

    // ✅ Fetch phone from UserProfile (phone lives in separate collection)
    const studentIds = students.map((s) => s._id);
    const profiles   = await UserProfile.find({ user: { $in: studentIds } })
      .select("user phone")
      .lean();
    const phoneMap = {};
    profiles.forEach((p) => { phoneMap[String(p.user)] = p.phone; });

    // Fetch room stats
    const totalRooms    = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ isOccupied: true });
    const vacantRooms   = totalRooms - occupiedRooms;

    // Group students by floor
    const byFloor = {};
    floors.forEach((f) => { byFloor[f.floorNumber] = []; });

    students.forEach((s) => {
      const floorNum = s.room?.floor?.floorNumber;
      if (floorNum != null) {
        if (!byFloor[floorNum]) byFloor[floorNum] = [];
        byFloor[floorNum].push(s);
      } else {
        if (!byFloor["Unassigned"]) byFloor["Unassigned"] = [];
        byFloor["Unassigned"].push(s);
      }
    });

    createPDF(res, `rooms-report-${startDate}-${endDate}.pdf`, (doc) => {
      reportMeta(doc, "Room Allocation Report", startDate, endDate);

      // ── Overall Summary ──
      sectionTitle(doc, "Summary");
      drawTable(
        doc,
        ["Metric", "Value"],
        [
          ["Total Rooms",    totalRooms],
          ["Occupied Rooms", occupiedRooms],
          ["Vacant Rooms",   vacantRooms],
          ["Total Students", students.length],
          ["Total Floors",   floors.length],
        ],
        [300, 200]
      );

      // ── Floor-wise Student Table ──
      sectionTitle(doc, "Students by Floor");

      const floorKeys = Object.keys(byFloor).sort((a, b) => {
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        return Number(a) - Number(b);
      });

      floorKeys.forEach((floorNum) => {
        const floorStudents = byFloor[floorNum];
        floorHeading(doc, floorNum);

        if (floorStudents.length === 0) {
          doc.moveDown(0.3)
            .fillColor("#94a3b8").font("Helvetica").fontSize(9)
            .text("   No students on this floor.", 55, doc.y);
          doc.moveDown(0.5);
          return;
        }

        const rows = floorStudents.map((s) => [
          s.name                          || "—",
          s.email                         || "—",
          phoneMap[String(s._id)]         || "—",
          s.room?.roomNumber              || "—",
          s.status                        || "active",
        ]);

        drawTable(
          doc,
          ["Name", "Email", "Phone", "Room No", "Status"],
          rows,
          [120, 175, 90, 60, 65]
        );
      });
    });
  } catch (error) {
    console.error("Room Report Error:", error);
    res.status(500).json({ message: "Failed to generate room report" });
  }
});

module.exports = router;