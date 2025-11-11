import React, { useState } from "react";
import "../styles/AdminPayrollSetup.css";
import { RiPencilFill } from "react-icons/ri";

export default function AdminPayrollSetup() {
    const [activeTab, setActiveTab] = useState("integration");
    const [openModal, setOpenModal] = useState(false);
    const [newComponent, setNewComponent] = useState({
        name: "",
        type: "Fixed",
        status: "Active",
    });

    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    const taxSettings = [
        { type: "SSS", rate: "3.0%", date: "Aug. 11, 2025" },
        { type: "Philhealth", rate: "3.5%", date: "Aug. 11, 2025" },
        { type: "Pag-IBIG", rate: "2.0%", date: "Aug. 11, 2025" },
        { type: "Withholding Tax", rate: "Variable", date: "Aug. 11, 2025" },
    ];

    const payComponents = [
        { component: "Basic Salary", type: "Fixed", status: "Active" },
        { component: "Allowance", type: "Variable", status: "Active" },
        { component: "Bonus", type: "Manual Entry", status: "Inactive" },
        { component: "Overtime Pay", type: "Computed", status: "Active" },
    ];

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleSaveComponent = () => {
        console.log("Saving component:", newComponent);
        setOpenModal(false);
    };

    return (
        <div className="adminPayrollSetup">
            <h2 className="setup-title">Payroll Setup</h2>

            <div className="setup-container">
                <div className="setup-tabs">
                    {["integration", "tax", "pay"].map((tab) => (
                        <button
                            key={tab}
                            className={`setup-tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === "integration"
                                ? "Integration"
                                : tab === "tax"
                                    ? "Tax Settings"
                                    : "Pay Components"}
                        </button>
                    ))}
                </div>

                <div className="setup-content">
                    {activeTab === "integration" && (
                        <div className="setup-integration-placeholder">
                            <p>No integration setup yet.</p>
                        </div>
                    )}

                    {activeTab === "tax" && (
                        <div className="setup-tax-table">
                            <div className="setup-table-header">
                                <span>Tax Type</span>
                                <span>Current Rate</span>
                                <span>Effective Date</span>
                                <span>Actions</span>
                            </div>
                            {taxSettings.map((item, index) => (
                                <div className="setup-table-row" key={index}>
                                    <span>{item.type}</span>
                                    <span>{item.rate}</span>
                                    <span>{item.date}</span>
                                    <button className="setup-edit-btn">
                                        <RiPencilFill size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "pay" && (
                        <div className="setup-pay-section">
                            <button className="setup-add-btn" onClick={handleOpenModal}>
                                Add Pay Component
                            </button>

                            <div className="setup-table-header">
                                <span>Components</span>
                                <span>Type</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>

                            {payComponents.map((item, index) => (
                                <div className="setup-table-row" key={index}>
                                    <span>{item.component}</span>
                                    <span>{item.type}</span>
                                    <span>
                                        <span
                                            className={`setup-status-dot ${
                                                item.status === "Active" ? "active" : "inactive"
                                            }`}
                                        ></span>
                                        {item.status}
                                    </span>
                                    <button className="setup-edit-btn">
                                        <RiPencilFill size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {openModal && (
                <>
                    <div className="setup-modal-backdrop" onClick={handleCloseModal}></div>
                    <div className="setup-modal">
                        <h3>New Pay Component</h3>

                        <label>Component Name</label>
                        <input
                            type="text"
                            placeholder="Enter component name"
                            value={newComponent.name}
                            onChange={(e) =>
                                setNewComponent({ ...newComponent, name: e.target.value })
                            }
                        />

                        <label>Type</label>
                        <div className="glass-dropdown-container">
                            <div
                                className="glass-dropdown-selected"
                                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                            >
                                {newComponent.type}
                            </div>
                            {typeDropdownOpen && (
                                <div className="glass-dropdown-menu">
                                    {["Overtime"].map((option) => (
                                        <div
                                            key={option}
                                            className="glass-dropdown-item"
                                            onClick={() => {
                                                setNewComponent({ ...newComponent, type: option });
                                                setTypeDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label>Status</label>
                        <div className="glass-dropdown-container">
                            <div
                                className="glass-dropdown-selected"
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                            >
                                {newComponent.status}
                            </div>
                            {statusDropdownOpen && (
                                <div className="glass-dropdown-menu">
                                    {["Approved"].map((option) => (
                                        <div
                                            key={option}
                                            className="glass-dropdown-item"
                                            onClick={() => {
                                                setNewComponent({ ...newComponent, status: option });
                                                setStatusDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="setup-modal-buttons">
                            <button className="setup-add-btn" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button className="setup-add-btn" onClick={handleSaveComponent}>
                                Save
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
