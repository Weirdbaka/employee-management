
import React, { useEffect, useState } from "react";

function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", position: "", salary: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch all employees
  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:5000/employees");
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add or Update Employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing employee
      await fetch(`http://localhost:5000/employees/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      // Add new employee
      await fetch("http://localhost:5000/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ name: "", position: "", salary: "" });
    fetchEmployees();
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    await fetch(`http://localhost:5000/employees/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  // Edit employee
  const editEmployee = (emp) => {
    setForm({ name: emp.name, position: emp.position, salary: emp.salary });
    setEditingId(emp._id);
  };

  // Filter employees by search text
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  // Print employee details
  const printEmployees = () => {
    window.print();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>Employee Management System</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "5px",
        }}
      />

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          required
        />
        <input
          placeholder="Salary"
          type="number"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          required
        />
        <button type="submit">{editingId ? "Update" : "Add"} Employee</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", position: "", salary: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Employee List */}
      <h2>Employee List</h2>
      <button onClick={printEmployees}>🖨️ Print Employee List</button>

      <ul>
        {filteredEmployees.map((emp) => (
          <li key={emp._id} style={{ marginBottom: "10px" }}>
            {emp.name} - {emp.position} - ₹{emp.salary}
            <button onClick={() => editEmployee(emp)}>Edit</button>
            <button onClick={() => deleteEmployee(emp._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeeManager;
