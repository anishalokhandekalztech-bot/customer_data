"use client";

import { useState, useRef } from "react";

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  hasDropdown?: boolean;
}

interface DataRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  services: string;
}

interface EditingCell {
  rowId: number;
  field: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("customers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Home" },
    { id: "reports", label: "About Us" },
    { id: "analytics", label: "Start a Business", hasDropdown: true },
    { id: "settings", label: "Trademark Registration", hasDropdown: true },
    { id: "users", label: "Annual Compliance", hasDropdown: true },
    { id: "support", label: "Other Services", hasDropdown: true },
    { id: "customers", label: "Form Enteries" },
  ];
  const initialData: DataRow[] = [
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

  const [data, setData] = useState<DataRow[]>(initialData);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterField, setFilterField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [history, setHistory] = useState<DataRow[][]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [updatedCells, setUpdatedCells] = useState<Map<string, string>>(new Map());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const [showSortDisclaimer, setShowSortDisclaimer] = useState<boolean>(false);

  const handleAddRow = () => {
    const newRow: DataRow = {
      id: data.length + 1,
      name: "New Entry",
      phone: "555-0000",
      email: "new@example.com",
      city: "City",
      services: "Service",
    };
    const newData = [...data, newRow];
    
    // Add to history stack (clear redo history)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setData(newData);
    setSelectedRow(newRow.id);
    
    // Scroll to the newly added row
    setTimeout(() => {
      if (tableWrapperRef.current) {
        tableWrapperRef.current.scrollTop = tableWrapperRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleCellClick = (rowId: number, field: string, value: any) => {
    setEditingCell({ rowId, field });
    setEditValue(value);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = (rowId: number, field: string) => {
    if (editingCell && editingCell.rowId === rowId && editingCell.field === field) {
      // Only mark as updated if the value actually changed
      const originalValue = data.find(row => row.id === rowId)?.[field as keyof DataRow];
      if (String(originalValue) !== String(editValue)) {
        const cellKey = `${rowId}-${field}`;
        const newUpdatedCells = new Map(updatedCells);
        newUpdatedCells.set(cellKey, editValue);
        setUpdatedCells(newUpdatedCells);
      }
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowId: number, field: string) => {
    if (e.key === "Enter") {
      handleCellBlur(rowId, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleRowSelect = (rowId: number) => {
    setSelectedRow(selectedRow === rowId ? null : rowId);
    // Deselect column when selecting a row
    if (selectedRow !== rowId) {
      setFilterField("");
    }
  };

  const handleUpdateChanges = () => {
    if (updatedCells.size === 0) return;
    setShowConfirmModal(true);
  };

  const confirmUpdate = () => {
    const updatedData = data.map((row) => {
      let updatedRow = { ...row };

      updatedCells.forEach((value, cellKey) => {
        const [rowId, field] = cellKey.split("-");
        if (parseInt(rowId) === row.id) {
          updatedRow = { ...updatedRow, [field]: value };
        }
      });

      return updatedRow;
    });

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setData(updatedData);
    setUpdatedCells(new Map());
    setShowConfirmModal(false);
    setEditingCell(null);
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
  };

  const cancelEditing = () => {
    setUpdatedCells(new Map());
    setEditingCell(null);
    setDeleteMode(false);
    setSelectedForDelete(new Set());
  };

  const handleDelete = () => {
    if (editingCell) {
      // Delete the row being edited
      const updatedData = data.filter((row) => row.id !== editingCell.rowId);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
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

  const handleRowSelectForDelete = (rowId: number) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedForDelete(newSelected);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    const updatedData = data.filter((row) => !selectedForDelete.has(row.id));
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setData(updatedData);
    setDeleteMode(false);
    setSelectedForDelete(new Set());
    setShowDeleteConfirmModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setData(history[newIndex]);
      setEditingCell(null);
      setSelectedRow(null);
      setUpdatedCells(new Map());
      setDeleteMode(false);
      setSelectedForDelete(new Set());
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setData(history[newIndex]);
      setEditingCell(null);
      setSelectedRow(null);
      setUpdatedCells(new Map());
      setDeleteMode(false);
      setSelectedForDelete(new Set());
    }
  };

  const handleExport = () => {
    const jsonData = data.map((row) => ({
      "Sr No.": row.id,
      "Name": row.name,
      "Phone No.": row.phone,
      "Email": row.email,
      "City": row.city,
      "Services": row.services,
    }));

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_data.json";
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

  // Filter and search logic
  const filteredData = data
    .filter((row) => {
      const searchMatch = searchTerm === "" || 
        Object.values(row).some((value) => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      return searchMatch;
    })
    .sort((a, b) => {
      if (!filterField) return 0;

      const fieldA = String(a[filterField as keyof DataRow]).toLowerCase();
      const fieldB = String(b[filterField as keyof DataRow]).toLowerCase();

      let comparison = 0;
      if (fieldA < fieldB) comparison = -1;
      if (fieldA > fieldB) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

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

          {/* Hamburger Menu Button */}
          <button 
            className="hamburger-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-nav-header">
                <h2>Menu</h2>
                <button 
                  className="close-mobile-menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              <nav className="mobile-nav-items">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-item ${activeTab === item.id ? "active" : ""}`}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                    {item.hasDropdown && <span className="mobile-dropdown-arrow">›</span>}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
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
              {updatedCells.size > 0 && (
                <>
                  <button onClick={handleUpdateChanges} className="btn btn-update">
                    ✓ Update ({updatedCells.size})
                  </button>
                  <button onClick={cancelEditing} className="btn btn-cancel">
                    Cancel
                  </button>
                </>
              )}
              {deleteMode && updatedCells.size === 0 ? (
                <>
                  <button onClick={handleConfirmDelete} className="btn btn-delete-confirm" disabled={selectedForDelete.size === 0}>
                    Delete {selectedForDelete.size > 0 ? `(${selectedForDelete.size})` : ""}
                  </button>
                  <button onClick={cancelEditing} className="btn btn-cancel">
                    Cancel
                  </button>
                </>
              ) : updatedCells.size === 0 ? (
                <button onClick={handleDelete} className="btn btn-delete">
                  🗑 Delete
                </button>
              ) : null}
              <button onClick={handleExport} className="btn btn-export">
                 Export
              </button>
              <button onClick={handleViewInExcel} className="btn btn-excel">
                 View in Excel
              </button>
              <div className="undo-redo-icons">
                <button 
                  onClick={handleUndo} 
                  className="icon-btn icon-undo"
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  ↶
                </button>
                <button 
                  onClick={handleRedo} 
                  className="icon-btn icon-redo"
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                >
                  ↷
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-sort-container">
              <div className="sort-dropdown-container">
                <button
                  onClick={() => {
                    if (!filterField) {
                      setShowSortDisclaimer(true);
                      return;
                    }
                    setSortDropdownOpen(!sortDropdownOpen);
                    setShowSortDisclaimer(false);
                  }}
                  className="sort-dropdown-btn"
                >
                  Sort {sortDropdownOpen ? "∧" : "∨"}
                </button>
                
                {showSortDisclaimer && (
                  <div className="sort-disclaimer">
                    ⚠ Please select a column to sort
                  </div>
                )}
                
                {sortDropdownOpen && filterField && (
                  <div className="sort-dropdown-menu">
                    <button
                      onClick={() => {
                        setSortOrder("asc");
                        setSortDropdownOpen(false);
                      }}
                      className={`sort-option ${sortOrder === "asc" ? "active" : ""}`}
                    >
                      {filterField === "name" || filterField === "city" || filterField === "services" || filterField === "email" ? "A - Z" : "Ascending"}
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("desc");
                        setSortDropdownOpen(false);
                      }}
                      className={`sort-option ${sortOrder === "desc" ? "active" : ""}`}
                    >
                      {filterField === "name" || filterField === "city" || filterField === "services" || filterField === "email" ? "Z - A" : "Descending"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(searchTerm || filterField) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterField("");
                  setSortOrder("asc");
                }}
                className="btn btn-clear"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="table-wrapper" ref={tableWrapperRef}>
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">Sr No.</th>
                  <th 
                    className={`table-header column-selectable ${filterField === "name" ? "selected-column" : ""}`}
                    onDoubleClick={() => {
                      setFilterField("name");
                      setSortOrder("asc");
                      setShowSortDisclaimer(false);
                    }}
                  >
                    Name
                  </th>
                  <th 
                    className={`table-header column-selectable ${filterField === "phone" ? "selected-column" : ""}`}
                    onDoubleClick={() => {
                      setFilterField("phone");
                      setSortOrder("asc");
                      setShowSortDisclaimer(false);
                    }}
                  >
                    Phone No.
                  </th>
                  <th 
                    className={`table-header column-selectable ${filterField === "email" ? "selected-column" : ""}`}
                    onDoubleClick={() => {
                      setFilterField("email");
                      setSortOrder("asc");
                      setShowSortDisclaimer(false);
                    }}
                  >
                    Email
                  </th>
                  <th 
                    className={`table-header column-selectable ${filterField === "city" ? "selected-column" : ""}`}
                    onDoubleClick={() => {
                      setFilterField("city");
                      setSortOrder("asc");
                      setShowSortDisclaimer(false);
                    }}
                  >
                    City
                  </th>
                  <th 
                    className={`table-header column-selectable ${filterField === "services" ? "selected-column" : ""}`}
                    onDoubleClick={() => {
                      setFilterField("services");
                      setSortOrder("asc");
                      setShowSortDisclaimer(false);
                    }}
                  >
                    Services
                  </th>
                </tr>
              </thead>
              <tbody>


                {filteredData.map((row) => (
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
                    {["name", "phone", "email", "city", "services"].map((field) => {
                      const cellKey = `${row.id}-${field}`;
                      const isUpdated = updatedCells.has(cellKey);
                      const isColumnSelected = filterField === field;
                      return (
                      <td
                        key={cellKey}
                        className={`table-cell ${editingCell?.rowId === row.id && editingCell?.field === field ? "editing-cell" : ""} ${isUpdated ? "updated-cell" : ""} ${isColumnSelected ? "selected-column-cell" : ""}`}
                        onDoubleClick={() =>
                          handleCellClick(row.id, field, row[field as keyof DataRow])
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
                          <div className="table-cell-content">{isUpdated ? updatedCells.get(cellKey) : row[field as keyof DataRow]}</div>
                        )}
                      </td>
                    );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-info-bottom">
            Showing {filteredData.length} of {data.length} entries
          </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    {showConfirmModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Confirm Update</h2>
          <p className="modal-message">Are you sure you want to update {updatedCells.size} change{updatedCells.size > 1 ? 's' : ''}?</p>
          <div className="modal-buttons">
            <button onClick={confirmUpdate} className="btn btn-confirm">
              Confirm
            </button>
            <button onClick={cancelUpdate} className="btn btn-modal-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {showDeleteConfirmModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Confirm Delete</h2>
          <p className="modal-message">Are you sure you want to delete {selectedForDelete.size} row{selectedForDelete.size > 1 ? 's' : ''}? This action cannot be undone.</p>
          <div className="modal-buttons">
            <button onClick={confirmDelete} className="btn btn-confirm">
              Confirm
            </button>
            <button onClick={cancelDelete} className="btn btn-modal-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
