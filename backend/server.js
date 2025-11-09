const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/employeeDB")
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Employee Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  position: String,
  salary: Number,
});

const Employee = mongoose.model("Employee", employeeSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: { type: String, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

// Routes

app.get("/", (req, res) => res.send("Employee Management API Running..."));

// Employee routes
app.get("/employees", async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.post("/employees", async (req, res) => {
  const emp = new Employee(req.body);
  await emp.save();
  res.json(emp);
});

app.put("/employees/:id", async (req, res) => {
  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/employees/:id", async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Employee deleted" });
});

// ✅ Attendance routes

// Mark attendance
app.post("/attendance", async (req, res) => {
  const { employeeId, date, status } = req.body;
  let record = await Attendance.findOne({ employeeId, date });

  if (record) {
    record.status = status;
    await record.save();
  } else {
    record = new Attendance({ employeeId, date, status });
    await record.save();
  }

  res.json(record);
});

// Get attendance for a specific date
app.get("/attendance/:date", async (req, res) => {
  const date = req.params.date;
  const records = await Attendance.find({ date }).populate("employeeId", "name position");
  res.json(records);
});

// Attendance summary for each employee
app.get("/attendance-summary", async (req, res) => {
  const summary = await Attendance.aggregate([
    {
      $group: {
        _id: "$employeeId",
        present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
        leave: { $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] } },
      },
    },
  ]);

  const detailedSummary = await Promise.all(
    summary.map(async (s) => {
      const emp = await Employee.findById(s._id);
      return { name: emp.name, position: emp.position, ...s };
    })
  );

  res.json(detailedSummary);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

