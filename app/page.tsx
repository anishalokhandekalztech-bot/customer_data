"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("customers");

  const navItems = [
    { id: "dashboard", label: "Home"},
    { id: "reports", label: "About Us" },
    { id: "analytics", label:"Start a Business", hasDropdown: true },
    { id: "settings", label: "Trademark Registration", hasDropdown: true },
    { id: "users", label: "Annual Compliance", hasDropdown: true },
    { id: "support", label: "Other Services", hasDropdown: true },
    { id: "customers", label: "Form Enteries" },
  ];
  const initialData = [
    { id: 1, name: "John Doe", phone: "555-0101", email: "john@example.com", city: "New York", services: "Consulting" },
    { id: 2, name: "Jane Smith", phone: "555-0102", email: "jane@example.com", city: "Los Angeles", services: "Development" },
    { id: 3, name: "Bob Johnson", phone: "555-0103", email: "bob@example.com", city: "Chicago", services: "Design" },
    { id: 4, name: "Alice Brown", phone: "555-0104", email: "alice@example.com", city: "Houston", services: "Marketing" },
    { id: 5, name: "Charlie Davis", phone: "555-0105", email: "charlie@example.com", city: "Phoenix", services: "Support" },
    { id: 6, name: "Diana Evans", phone: "555-0106", email: "diana@example.com", city: "Philadelphia", services: "Consulting" },
    { id: 7, name: "Edward Foster", phone: "555-0107", email: "edward@example.com", city: "San Antonio", services: "Development" },
    { id: 8, name: "Fiona Green", phone: "555-0108", email: "fiona@example.com", city: "San Diego", services: "Design" },
    { id: 9, name: "George Harris", phone: "555-0109", email: "george@example.com", city: "Dallas", services: "Marketing" },
    { id: 10, name: "Hannah White", phone: "555-0110", email: "hannah@example.com", city: "San Jose", services: "Support" },
    { id: 11, name: "Isaac Jackson", phone: "555-0111", email: "isaac@example.com", city: "Austin", services: "Consulting" },
    { id: 12, name: "Julia King", phone: "555-0112", email: "julia@example.com", city: "Jacksonville", services: "Development" },
    { id: 13, name: "Kevin Lee", phone: "555-0113", email: "kevin@example.com", city: "Fort Worth", services: "Design" },
    { id: 14, name: "Laura Martin", phone: "555-0114", email: "laura@example.com", city: "Columbus", services: "Marketing" },
    { id: 15, name: "Michael Nelson", phone: "555-0115", email: "michael@example.com", city: "Charlotte", services: "Support" },
    { id: 16, name: "Nina Perez", phone: "555-0116", email: "nina@example.com", city: "San Francisco", services: "Consulting" },
    { id: 17, name: "Oliver Quinn", phone: "555-0117", email: "oliver@example.com", city: "Indianapolis", services: "Development" },
    { id: 18, name: "Paula Roberts", phone: "555-0118", email: "paula@example.com", city: "Seattle", services: "Design" },
    { id: 19, name: "Quinn Smith", phone: "555-0119", email: "quinn@example.com", city: "Denver", services: "Marketing" },
    { id: 20, name: "Rachel Taylor", phone: "555-0120", email: "rachel@example.com", city: "Boston", services: "Support" },
    { id: 21, name: "Samuel Lee", phone: "555-0121", email: "samuel@example.com", city: "Nashville", services: "Consulting" },
    { id: 22, name: "Tina Anderson", phone: "555-0122", email: "tina@example.com", city: "Baltimore", services: "Development" },
    { id: 23, name: "Ulysses Brown", phone: "555-0123", email: "ulysses@example.com", city: "Louisville", services: "Design" },
    { id: 24, name: "Vanessa Clark", phone: "555-0124", email: "vanessa@example.com", city: "Portland", services: "Marketing" },
    { id: 25, name: "William Davis", phone: "555-0125", email: "william@example.com", city: "Las Vegas", services: "Support" },
  ];

  const [data, setData] = useState(initialData);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());
  const [selectedRow, setSelectedRow] = useState(null);

  const handleAddRow = () => {
    const newRow = {
      id: data.length + 1,
      name: "New Entry",
      phone: "555-0000",
      email: "new@example.com",
      city: "City",
      services: "Service",
    };
    setData([...data, newRow]);
  };

  const handleCellClick = (rowId, field, value) => {
    setEditingCell({ rowId, field });
    setEditValue(value);
  };

  const handleCellChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = (rowId, field) => {
    if (editingCell && editingCell.rowId === rowId && editingCell.field === field) {
      const updatedData = data.map((row) =>
        row.id === rowId ? { ...row, [field]: editValue } : row
      );
      setData(updatedData);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e, rowId, field) => {
    if (e.key === "Enter") {
      handleCellBlur(rowId, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleRowSelect = (rowId) => {
    setSelectedRow(selectedRow === rowId ? null : rowId);
  };

  const handleDelete = () => {
    if (editingCell) {
      // Delete the row being edited
      const updatedData = data.filter((row) => row.id !== editingCell.rowId);
      setData(updatedData);
      setEditingCell(null);
    } else {
      // Toggle delete mode for multi-select
      setDeleteMode(!deleteMode);
      if (deleteMode) {
        setSelectedForDelete(new Set());
      }
    }
  };

  const handleRowSelectForDelete = (rowId) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedForDelete(newSelected);
  };

  const handleConfirmDelete = () => {
    const updatedData = data.filter((row) => !selectedForDelete.has(row.id));
    setData(updatedData);
    setDeleteMode(false);
    setSelectedForDelete(new Set());
  };

  const handleExport = () => {
    const csv = [
      ["Sr No.", "Name", "Phone No.", "Email", "City", "Services"],
      ...data.map((row) => [
        row.id,
        row.name,
        row.phone,
        row.email,
        row.city,
        row.services,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_data.csv";
    a.click();
  };

  const handleViewInExcel = () => {
    const csv = [
      ["Sr No.", "Name", "Phone No.", "Email", "City", "Services"],
      ...data.map((row) => [
        row.id,
        row.name,
        row.phone,
        row.email,
        row.city,
        row.services,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header with Navigation */}
      <header className="app-header">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            <img 
              src="./founder_first_logo.png" 
              alt="Founder First Logo" 
              className="logo-image"
            />
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab ${activeTab === item.id ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.hasDropdown && <span className="dropdown-arrow">∨</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="card">
          <div className="header">
            <h1 className="title">Customer Data</h1>
            <div className="button-group">
              <button onClick={handleAddRow} className="btn btn-add">
                + Add Row
              </button>
              {deleteMode ? (
                <>
                  <button onClick={handleConfirmDelete} className="btn btn-delete-confirm" disabled={selectedForDelete.size === 0}>
                    Delete {selectedForDelete.size > 0 ? `(${selectedForDelete.size})` : ""}
                  </button>
                  <button onClick={handleDelete} className="btn btn-cancel">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleDelete} className="btn btn-delete">
                  🗑 Delete
                </button>
              )}
              <button onClick={handleExport} className="btn btn-export">
                 Export
              </button>
              <button onClick={handleViewInExcel} className="btn btn-excel">
                 View in Excel
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">Sr No.</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Phone No.</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">City</th>
                  <th className="table-header">Services</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`table-row ${editingCell?.rowId === row.id ? "editing" : ""} ${deleteMode && selectedForDelete.has(row.id) ? "selected-for-delete" : ""} ${selectedRow === row.id ? "selected" : ""}`}
                    onClick={() => deleteMode ? handleRowSelectForDelete(row.id) : handleRowSelect(row.id)}
                  >
                    {deleteMode ? (
                      <td className="table-cell table-cell-id">
                        <input 
                          type="checkbox" 
                          checked={selectedForDelete.has(row.id)}
                          onChange={() => handleRowSelectForDelete(row.id)}
                          className="delete-checkbox"
                        />
                      </td>
                    ) : (
                      <td className="table-cell table-cell-id">
                        <div className="table-cell-content">{row.id}</div>
                      </td>
                    )}
                    {["name", "phone", "email", "city", "services"].map((field) => (
                      <td
                        key={`${row.id}-${field}`}
                        className="table-cell"
                        onDoubleClick={() =>
                          handleCellClick(row.id, field, row[field])
                        }
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === field ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={() => handleCellBlur(row.id, field)}
                            onKeyDown={(e) => handleKeyDown(e, row.id, field)}
                            autoFocus
                            className="table-input"
                          />
                        ) : (
                          <div className="table-cell-content">{row[field]}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
    </>
  );
}
