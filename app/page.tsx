"use client";

import { useState, useRef, useEffect} from "react";
import {collection, getDocs, addDoc, updateDoc, deleteDoc, doc} from "firebase/firestore";
import { db } from "../lib/firebase";

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  hasDropdown?: boolean;
}

interface DataRow {
  id: number;
  docId?: string; // Firebase document ID
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
  const initialData: DataRow[] = [];

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
  const [showEmptyValueModal, setShowEmptyValueModal] = useState<boolean>(false);
  const [emptyCells, setEmptyCells] = useState<string[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "FormData"));

    const firebaseData: DataRow[] = snapshot.docs.map((doc, index) => {
      const d = doc.data();
      return {
        id: index + 1, // required by your existing logic
        docId: doc.id, // Store the Firebase document ID
        name: d.name || "",
        phone: d.phone || "",
        email: d.email || "",
        city: d.city || "",
        services: d.services || "",
      };
    });

    // ⬇️ Inject Firebase data into your EXISTING flow
    setData(firebaseData);
    setHistory([firebaseData]);
    setHistoryIndex(0);
  };

  fetchData();
}, []);

useEffect(() => {
  // Add global click listener to deselect when clicking outside table
  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if click is outside the table wrapper
    if (tableWrapperRef.current && !tableWrapperRef.current.contains(target)) {
      setSelectedRow(null);
      setFilterField("");
    }
  };

  // Use capture phase to ensure we catch all clicks
  document.addEventListener("click", handleGlobalClick, true);
  
  return () => {
    document.removeEventListener("click", handleGlobalClick, true);
  };
}, []);

  const handleAddRow = () => {
    const newRow: DataRow = {
      id: data.length + 1,
      name: "",
      phone: "",
      email: "",
      city: "",
      services: "",
    };
    const newData = [...data, newRow];
    
    // Add to history stack (clear redo history)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setData(newData);
    setSelectedRow(newRow.id);
    
    // Don't add to Firebase yet - wait for user to fill in all required fields
    // The row will only be saved to Firebase when user updates values
    
    // Scroll to the newly added row
    setTimeout(() => {
      if (tableWrapperRef.current) {
        tableWrapperRef.current.scrollTop = tableWrapperRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleCellClick = (rowId: number, field: string, value: any) => {
    setEditingCell({ rowId, field });
    // Use the updated value from updatedCells if it exists, otherwise use the original row value
    const cellKey = `${rowId}-${field}`;
    const editVal = updatedCells.has(cellKey) ? updatedCells.get(cellKey) : value;
    setEditValue(editVal || "");
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
    
    // Check for empty values in the changed cells
    const emptyValuesFound: string[] = [];
    updatedCells.forEach((value, cellKey) => {
      if (String(value).trim() === "") {
        emptyValuesFound.push(cellKey);
      }
    });
    
    if (emptyValuesFound.length > 0) {
      setEmptyCells(emptyValuesFound);
      setShowEmptyValueModal(true);
      return;
    }

    // Check if any row being updated will have incomplete data after updates
    const rowsBeingUpdated = new Set<number>();
    updatedCells.forEach((value, cellKey) => {
      const [rowId] = cellKey.split("-");
      rowsBeingUpdated.add(parseInt(rowId));
    });

    const incompleteRows: string[] = [];
    rowsBeingUpdated.forEach((rowId) => {
      const row = data.find((r) => r.id === rowId);
      if (row) {
        // Build the final row state after applying updates
        const finalRow = { ...row };
        updatedCells.forEach((value, cellKey) => {
          const [cellRowId, field] = cellKey.split("-");
          if (parseInt(cellRowId) === rowId) {
            finalRow[field as keyof DataRow] = value;
          }
        });

        // Check if the final row has any empty fields
        const hasEmptyField = 
          String(finalRow.name).trim() === "" ||
          String(finalRow.phone).trim() === "" ||
          String(finalRow.email).trim() === "" ||
          String(finalRow.city).trim() === "" ||
          String(finalRow.services).trim() === "";
        
        if (hasEmptyField) {
          incompleteRows.push(`Row ${rowId}`);
        }
      }
    });

    if (incompleteRows.length > 0) {
      setEmptyCells(incompleteRows);
      setShowEmptyValueModal(true);
      return;
    }
    
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

    // Track promises for Firebase operations
    const firebasePromises: Promise<any>[] = [];

    // Update Firebase for each modified cell
    updatedCells.forEach((value, cellKey) => {
      const [rowId, field] = cellKey.split("-");
      const rowToUpdate = updatedData.find((row) => row.id === parseInt(rowId));
      
      if (rowToUpdate && String(value).trim() !== "") {
        if (rowToUpdate.docId) {
          // Update existing document
          const promise = updateDoc(doc(db, "FormData", rowToUpdate.docId), {
            [field]: value,
          }).catch((error) => {
            console.error("Error updating document: ", error);
            alert("Failed to update row in Firebase. Changes will be local only.");
          });
          firebasePromises.push(promise);
        } else {
          // New row without docId - we'll handle this below
        }
      } else if (rowToUpdate && rowToUpdate.docId && String(value).trim() === "") {
        console.warn(`Skipped empty value for field '${field}' in row ${rowId}`);
      }
    });

    // Handle new rows (without docId) - add them to Firebase
    const newRows = updatedData.filter((row) => !row.docId);
    newRows.forEach((newRow) => {
      const promise = addDoc(collection(db, "FormData"), {
        name: newRow.name,
        phone: newRow.phone,
        email: newRow.email,
        city: newRow.city,
        services: newRow.services,
      })
        .then((docRef) => {
          // Update the row with the Firebase document ID
          newRow.docId = docRef.id;
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          alert("Failed to add row to Firebase. Changes will be local only.");
        });
      firebasePromises.push(promise);
    });

    // Wait for all Firebase operations to complete, then update local state
    Promise.all(firebasePromises).then(() => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setData(updatedData);
      setUpdatedCells(new Map());
      setShowConfirmModal(false);
      setEditingCell(null);
    });
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
  };

  const handleEmptyValueClose = () => {
    // Restore original values for empty cells
    const newUpdatedCells = new Map(updatedCells);
    emptyCells.forEach((cellKey) => {
      newUpdatedCells.delete(cellKey);
    });
    setUpdatedCells(newUpdatedCells);
    setEmptyCells([]);
    setShowEmptyValueModal(false);
  };

  const getEmptyCellDetails = () => {
    return emptyCells.map((cellKey) => {
      // Check if it's a row identifier (e.g., "Row 1") or a cell identifier (e.g., "1-name")
      if (cellKey.startsWith("Row ")) {
        const rowId = parseInt(cellKey.split(" ")[1]);
        const row = data.find((r) => r.id === rowId);
        if (row) {
          // Build the final row state after applying updates
          const finalRow = { ...row };
          updatedCells.forEach((value, cellKey) => {
            const [cellRowId, field] = cellKey.split("-");
            if (parseInt(cellRowId) === rowId) {
              finalRow[field as keyof DataRow] = value;
            }
          });

          // Find which fields are empty in the final state
          const emptyFields = [];
          if (String(finalRow.name).trim() === "") emptyFields.push("Name");
          if (String(finalRow.phone).trim() === "") emptyFields.push("Phone");
          if (String(finalRow.email).trim() === "") emptyFields.push("Email");
          if (String(finalRow.city).trim() === "") emptyFields.push("City");
          if (String(finalRow.services).trim() === "") emptyFields.push("Services");
          
          return {
            cellKey,
            rowId,
            field: emptyFields.join(", "),
            originalValue: `Missing: ${emptyFields.join(", ")}`,
            isRowIncomplete: true,
          };
        }
      } else {
        const [rowId, field] = cellKey.split("-");
        const row = data.find((r) => r.id === parseInt(rowId));
        const originalValue = row ? row[field as keyof DataRow] : "";
        return {
          cellKey,
          rowId: parseInt(rowId),
          field,
          originalValue,
          isRowIncomplete: false,
        };
      }
    }).filter(Boolean);
  };

  const cancelEditing = () => {
    setUpdatedCells(new Map());
    setEditingCell(null);
    setDeleteMode(false);
    setSelectedForDelete(new Set());
  };

  const handleDelete = () => {
    if (editingCell) {
      // Delete the row being edited and reassign serial numbers
      const filteredData = data.filter((row) => row.id !== editingCell.rowId);
      const updatedData = filteredData.map((row, index) => ({
        ...row,
        id: index + 1, // Reassign serial numbers sequentially
      }));
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
    // Delete from Firebase
    selectedForDelete.forEach((rowId) => {
      const rowToDelete = data.find((row) => row.id === rowId);
      if (rowToDelete && rowToDelete.docId) {
        deleteDoc(doc(db, "FormData", rowToDelete.docId)).catch((error) => {
          console.error("Error deleting document: ", error);
          alert("Failed to delete row from Firebase. Changes will be local only.");
        });
      }
    });

    // Filter out deleted rows and reassign serial numbers
    const filteredData = data.filter((row) => !selectedForDelete.has(row.id));
    const updatedData = filteredData.map((row, index) => ({
      ...row,
      id: index + 1, // Reassign serial numbers sequentially
    }));
    
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
              <button 
                onClick={handleAddRow} 
                className="btn btn-add"
                disabled={deleteMode || updatedCells.size > 0}
              >
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
                <button 
                  onClick={handleDelete} 
                  className="btn btn-delete"
                  disabled={updatedCells.size > 0}
                >
                  🗑 Delete
                </button>
              ) : null}
              <button 
                onClick={handleExport} 
                className="btn btn-export"
                disabled={deleteMode || updatedCells.size > 0}
              >
                 Export
              </button>
              <button 
                onClick={handleViewInExcel} 
                className="btn btn-excel"
                disabled={deleteMode || updatedCells.size > 0}
              >
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
                      setSelectedRow(null);
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
                      setSelectedRow(null);
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
                      setSelectedRow(null);
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
                      setSelectedRow(null);
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
                      setSelectedRow(null);
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

    {/* Empty Value Modal */}
    {showEmptyValueModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">⚠ Cannot Update - Incomplete Entry</h2>
          <p className="modal-message">Please fill all fields before updating. The following rows have missing data:</p>
          <div className="empty-cells-list">
            {getEmptyCellDetails().map((cell) => (
              <div key={cell.cellKey} className="empty-cell-item">
                {cell.isRowIncomplete ? (
                  <>
                    <strong>{cell.cellKey}:</strong> 
                    <span className="original-value">{cell.originalValue}</span>
                  </>
                ) : (
                  <>
                    <strong>Row {cell.rowId}, {cell.field.charAt(0).toUpperCase() + cell.field.slice(1)}:</strong> 
                    <span className="original-value">"{cell.originalValue}"</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="modal-buttons">
            <button onClick={handleEmptyValueClose} className="btn btn-confirm">
              OK
            </button>
          </div>
        </div>
      </div>
    )}

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
