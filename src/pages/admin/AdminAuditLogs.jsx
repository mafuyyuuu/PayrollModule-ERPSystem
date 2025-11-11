import React, { useState } from "react";
import "../styles/AdminAuditLogs.css";
import { RiPencilFill } from "react-icons/ri";
import { RiArrowDownSLine } from "react-icons/ri";
import { RiSearchLine } from "react-icons/ri";

function GlassDropdown({ label, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(label);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };

    return (
        <div className="glass-dropdown">
            <button className="glass-dropdown-btn" onClick={toggleDropdown}>
                {selected}
                <RiArrowDownSLine className={`arrow ${isOpen ? "open" : ""}`} />
            </button>
            {isOpen && (
                <div className="glass-dropdown-menu">
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            className="glass-dropdown-item"
                            onClick={() => handleSelect(opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminAuditLogs() {
    const logs = [
        { date: "2025XXXX", user: "Jhervin Jimenez", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "Symon Banaag", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "Jumiah Zamora", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "Edrianne Lumabas", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "jisa", action: "Dropbox", description: "Pending" },
    ];

    return (
        <div className="audit-container">
            <div className="audit-header">
                <h2 className="audit-title">Audit Logs</h2>
            </div>

            <div className="audit-controls">
                <div className="audit-filter-group">
                    <GlassDropdown
                        label="Date Range"
                        options={["Today", "This Week", "This Month"]}
                    />
                    <GlassDropdown
                        label="Department"
                        options={["Department", "Department", "Department"]}
                    />
                    <GlassDropdown
                        label="Action Type"
                        options={["Action Type", "Action Type", "Action Type"]}
                    />
                </div>

                <div className="audit-search-box">
                    <RiSearchLine className="audit-search-icon" />
                    <input type="text" placeholder="Enter User Name" />
                </div>
            </div>

            <div className="audit-table">
                <div className="audit-table-header">
                    <span>Date</span>
                    <span>User</span>
                    <span>Action</span>
                    <span>Description</span>
                    <span>Actions</span>
                </div>

                <div className="audit-table-body">
                    {logs.map((log, index) => (
                        <div className="audit-table-row" key={index}>
                            <span>{log.date}</span>
                            <span>{log.user}</span>
                            <span>{log.action}</span>
                            <span>{log.description}</span>
                            <span className="audit-icon-cell">
                                <button className="audit-action-icon">
                                    <RiPencilFill size={16} />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
