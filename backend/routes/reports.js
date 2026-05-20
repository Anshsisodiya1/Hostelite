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

// ── Middleware ───────────────────────────────────────────────────────────────
const { authMiddleware } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Create PDF
// ─────────────────────────────────────────────────────────────────────────────
function createPDF(res, filename, buildFn) {
  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    bufferPages: true,
  });

  doc.pipe(res);

  // Header
  doc.rect(0, 0, doc.page.width, 80).fill("#1e3a5f");

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("Hostelite - Hostel Management System", 50, 22);

  doc
    .fillColor("#bfdbfe")
    .font("Helvetica")
    .fontSize(11)
    .text("Admin Report", 50, 50);

  doc.moveDown(3);

  buildFn(doc);

  // Footer
  const pageCount = doc.bufferedPageRange().count;

  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Generated on ${new Date().toLocaleString()} | Page ${
          i + 1
        } of ${pageCount}`,
        50,
        doc.page.height - 40,
        {
          align: "center",
        }
      );
  }

  doc.end();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Section Title
// ─────────────────────────────────────────────────────────────────────────────
function sectionTitle(doc, title) {
  doc
    .moveDown(0.8)
    .fillColor("#1e3a5f")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(title);

  doc.moveDown(0.4);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Report Meta
// ─────────────────────────────────────────────────────────────────────────────
function reportMeta(doc, title, startDate, endDate) {
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(17)
    .text(title);

  doc
    .fillColor("#64748b")
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Period: ${new Date(startDate).toDateString()} → ${new Date(
        endDate
      ).toDateString()}`
    );

  doc.moveDown();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Draw Table
// ─────────────────────────────────────────────────────────────────────────────
function drawTable(doc, headers, rows, widths) {
  const startX = 50;
  const rowHeight = 24;

  let y = doc.y + 10;

  // Header row
  doc
    .rect(startX, y, widths.reduce((a, b) => a + b, 0), rowHeight)
    .fill("#1e3a5f");

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);

  let x = startX;

  headers.forEach((header, index) => {
    doc.text(header, x + 5, y + 7, {
      width: widths[index] - 10,
    });

    x += widths[index];
  });

  y += rowHeight;

  // Body rows
  rows.forEach((row, rowIndex) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 60;
    }

    const bgColor = rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff";

    doc
      .rect(startX, y, widths.reduce((a, b) => a + b, 0), rowHeight)
      .fill(bgColor);

    doc.fillColor("#111827").font("Helvetica").fontSize(8.5);

    x = startX;

    row.forEach((cell, index) => {
      doc.text(String(cell ?? "—"), x + 5, y + 7, {
        width: widths[index] - 10,
        ellipsis: true,
      });

      x += widths[index];
    });

    doc
      .rect(startX, y, widths.reduce((a, b) => a + b, 0), rowHeight)
      .stroke("#e2e8f0");

    y += rowHeight;
  });

  doc.y = y + 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT REPORT
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/students",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const start = new Date(startDate);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const students = await User.find({
        role: "student",
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
        .populate({
          path: "room",
          select: "roomNumber isOccupied floor",
          populate: {
            path: "floor",
            select: "floorNumber",
          },
        })
        .lean();

      const totalRooms = await Room.countDocuments();

      const occupiedRooms = await Room.countDocuments({
        isOccupied: true,
      });

      const vacantRooms = totalRooms - occupiedRooms;

      createPDF(
        res,
        `student-report-${startDate}-${endDate}.pdf`,
        (doc) => {
          reportMeta(
            doc,
            "Student Occupancy Report",
            startDate,
            endDate
          );

          sectionTitle(doc, "Summary");

          drawTable(
            doc,
            ["Metric", "Value"],
            [
              ["Total Students", students.length],
              ["Total Rooms", totalRooms],
              ["Occupied Rooms", occupiedRooms],
              ["Vacant Rooms", vacantRooms],
            ],
            [300, 200]
          );

          sectionTitle(doc, "Student Details");

          const rows = students.map((student) => [
            student.name || "—",
            student.email || "—",
            student.room?.roomNumber || "Unassigned",
            student.room?.floor?.floorNumber || "—",
            new Date(student.createdAt).toLocaleDateString(),
          ]);

          drawTable(
            doc,
            ["Name", "Email", "Room", "Floor", "Joined"],
            rows,
            [120, 180, 70, 60, 90]
          );
        }
      );
    } catch (error) {
      console.error("Student Report Error:", error);

      res.status(500).json({
        message: "Failed to generate student report",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPLAINT REPORT
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/complaints",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const start = new Date(startDate);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const complaints = await Complaint.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
        .populate("student", "name email")
        .populate("warden", "name")
        .lean();

      createPDF(
        res,
        `complaints-report-${startDate}-${endDate}.pdf`,
        (doc) => {
          reportMeta(
            doc,
            "Complaint Report",
            startDate,
            endDate
          );

          sectionTitle(doc, "Complaint Details");

          const rows = complaints.map((complaint) => [
            complaint.student?.name || "—",
            complaint.title || "—",
            complaint.priority || "—",
            complaint.status || "—",
            complaint.warden?.name || "Unassigned",
            new Date(complaint.createdAt).toLocaleDateString(),
          ]);

          drawTable(
            doc,
            [
              "Student",
              "Title",
              "Priority",
              "Status",
              "Warden",
              "Date",
            ],
            rows,
            [100, 140, 70, 80, 100, 80]
          );
        }
      );
    } catch (error) {
      console.error("Complaint Report Error:", error);

      res.status(500).json({
        message: "Failed to generate complaint report",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF REPORT
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/staff",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const start = new Date(startDate);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const wardens = await User.find({
        role: "warden",
        createdAt: {
          $gte: start,
          $lte: end,
        },
      }).lean();

      createPDF(
        res,
        `staff-report-${startDate}-${endDate}.pdf`,
        (doc) => {
          reportMeta(
            doc,
            "Staff Report",
            startDate,
            endDate
          );

          sectionTitle(doc, "Warden Details");

          const rows = wardens.map((warden) => [
            warden.name || "—",
            warden.email || "—",
            new Date(warden.createdAt).toLocaleDateString(),
          ]);

          drawTable(
            doc,
            ["Name", "Email", "Joined"],
            rows,
            [180, 220, 120]
          );
        }
      );
    } catch (error) {
      console.error("Staff Report Error:", error);

      res.status(500).json({
        message: "Failed to generate staff report",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOM REPORT
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/rooms",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const start = new Date(startDate);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const rooms = await Room.find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
        .populate("assignedTo", "name email")
        .populate("floor", "floorNumber")
        .lean();

      createPDF(
        res,
        `rooms-report-${startDate}-${endDate}.pdf`,
        (doc) => {
          reportMeta(
            doc,
            "Room Allocation Report",
            startDate,
            endDate
          );

          sectionTitle(doc, "Room Details");

          const rows = rooms.map((room) => [
            room.roomNumber || "—",
            room.floor?.floorNumber || "—",
            room.isOccupied ? "Occupied" : "Vacant",
            room.assignedTo?.name || "Unassigned",
            room.assignedTo?.email || "—",
          ]);

          drawTable(
            doc,
            [
              "Room",
              "Floor",
              "Status",
              "Student",
              "Email",
            ],
            rows,
            [70, 70, 90, 140, 180]
          );
        }
      );
    } catch (error) {
      console.error("Room Report Error:", error);

      res.status(500).json({
        message: "Failed to generate room report",
      });
    }
  }
);

module.exports = router;