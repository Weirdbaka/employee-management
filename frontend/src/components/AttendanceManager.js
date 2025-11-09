import React, { useEffect, useState } from "react";

function AttendanceManager() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("${process.env.REACT_APP_API_URL}/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const handleStatusChange = (empId, status) => {
    setAttendance({ ...attendance, [empId]: status });
  };

  const markAttendance = async () => {
    for (const [employeeId, status] of Object.entries(attendance)) {
      await fetch("${process.env.REACT_APP_API_URL}/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, date, status }),
      });
    }
    alert("✅ Attendance saved!");
  };

  const viewAttendance = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance/${date}`);
    const data = await res.json();
    setRecords(data);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>📅 Attendance Manager</h1>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

      <h2>Mark Attendance</h2>
      {employees.map((emp) => (
        <div key={emp._id} style={{ marginBottom: "5px" }}>
          <strong>{emp.name}</strong> — {emp.position}
          <select
            value={attendance[emp._id] || ""}
            onChange={(e) => handleStatusChange(emp._id, e.target.value)}
          >
            <option value="">Select</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      ))}

      <button onClick={markAttendance}>✅ Save Attendance</button>
      <button onClick={viewAttendance} style={{ marginLeft: "10px" }}>
        📊 View Attendance
      </button>

      {records.length > 0 && (
        <>
          <h2>Attendance for {date}</h2>
          <ul>
            {records.map((r) => (
              <li key={r._id}>
                {r.employeeId?.name} — {r.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default AttendanceManager;
