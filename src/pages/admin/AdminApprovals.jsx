import React, { useState } from "react";
import {
    RiFilter3Line,
    RiSettings3Fill,
    RiEyeFill,
} from "react-icons/ri";
import "../styles/AdminApproval.css";

export default function AdminApproval() {
    const [activeTab, setActiveTab] = useState("workflow");
    const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
    const [showConfigureModal, setShowConfigureModal] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);

    const [newWorkflowName, setNewWorkflowName] = useState("");
    const [newWorkflowType, setNewWorkflowType] = useState("");
    const [newWorkflowRole, setNewWorkflowRole] = useState("");

    const workflowData = [
        { name: "Payroll Flow", type: "Payroll", approver: "Manager", status: "Active" },
        { name: "Overtime Flow", type: "Overtime", approver: "Head", status: "Active" },
        { name: "Leave Flow", type: "Leave", approver: "Supervisor", status: "Inactive" },
    ];

    const exceptionsData = [
        { id: "EX001", employee: "Jherwin Jimenez", type: "Overtime", date: "Aug. 11, 2025", status: "Approved" },
        { id: "EX002", employee: "Symon Banana", type: "Leave", date: "Sept. 12, 2025", status: "Pending" },
    ];

    const workflowOptions = ["Benefit", "Payroll", "Leave"];
    const typeOptions = ["P10,000", "P20,000"];
    const roleOptions = ["Manager", "Supervisor"];

    const renderTable = () => {
        if (activeTab === "workflow") {
            return (
                <div className="Approval-cardTable">
                    <div className="Approval-headerRow">
                        <span></span>
                        <span>Workflow Name</span>
                        <span>Type</span>
                        <span>Approver Role</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {workflowData.map((item, i) => (
                        <div className="Approval-dataRow" key={i}>
                            <span className="Approval-checkboxCol"><input type="checkbox" /></span>
                            <span>{item.name}</span>
                            <span>{item.type}</span>
                            <span>{item.approver}</span>
                            <span className="Approval-status">
                <span className={`Approval-statusDot ${item.status.toLowerCase()}`}></span> {item.status}
              </span>
                            <span className="Approval-actionBtns">
                <button className="Approval-iconBtn" onClick={() => setShowConfigureModal(true)}>
                  <RiSettings3Fill />
                </button>
              </span>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="Approval-cardTable">
                <div className="Approval-headerRow">
                    <span>ID</span>
                    <span>Employee</span>
                    <span>Type</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {exceptionsData.map((item, i) => (
                    <div className="Approval-dataRow" key={i}>
                        <span>{item.id}</span>
                        <span>{item.employee}</span>
                        <span>{item.type}</span>
                        <span>{item.date}</span>
                        <span className="Approval-status">
              <span className={`Approval-statusDot ${item.status.toLowerCase()}`}></span> {item.status}
            </span>
                        <span className="Approval-actionBtns">
              <button className="Approval-iconBtn" onClick={() => setShowExceptionModal(true)}>
                <RiEyeFill />
              </button>
            </span>
                    </div>
                ))}
            </div>
        );
    };

    const Dropdown = ({ options, selected, setSelected, placeholder }) => {
        const [open, setOpen] = useState(false);

        return (
            <div className="Approval-dropdown-container">
                <div
                    className="Approval-dropdown-selected"
                    onClick={() => setOpen(!open)}
                >
                    {selected || placeholder}
                </div>
                {open && (
                    <div className="Approval-dropdown-menu">
                        {options.map((opt, idx) => (
                            <div
                                key={idx}
                                className="Approval-dropdown-item"
                                onClick={() => {
                                    setSelected(opt);
                                    setOpen(false);
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="Approval-pageContainer">
            <h2 className="Approval-title">Approval Management</h2>

            <div className="Approval-container">
                {/* Tabs */}
                <div className="Approval-tabs">
                    <button
                        className={`Approval-tabBtn ${activeTab === "workflow" ? "active" : ""}`}
                        onClick={() => setActiveTab("workflow")}
                    >
                        Approval Workflow
                    </button>
                    <button
                        className={`Approval-tabBtn ${activeTab === "exceptions" ? "active" : ""}`}
                        onClick={() => setActiveTab("exceptions")}
                    >
                        Manage Exceptions
                    </button>
                </div>

                <div className="Approval-content">
                    <div className="Approval-actionsHeader">
                        <div className="Approval-topActions">
                            {activeTab === "workflow" && (
                                <button className="Approval-addBtn" onClick={() => setShowNewWorkflowModal(true)}>
                                    New Workflow
                                </button>
                            )}
                        </div>
                        <button className="Approval-filterBtn">
                            <RiFilter3Line /> Filter
                        </button>
                    </div>

                    {renderTable()}
                </div>
            </div>

            {showNewWorkflowModal && (
                <div className="Approval-modal-backdrop" onClick={() => setShowNewWorkflowModal(false)}>
                    <div className="Approval-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>New Workflow</h3>

                        <label>Workflow Name</label>
                        <Dropdown
                            options={workflowOptions}
                            selected={newWorkflowName}
                            setSelected={setNewWorkflowName}
                            placeholder="Select Workflow"
                        />

                        <label>Type</label>
                        <Dropdown
                            options={typeOptions}
                            selected={newWorkflowType}
                            setSelected={setNewWorkflowType}
                            placeholder="Select Amount"
                        />

                        <label>Approval Role</label>
                        <Dropdown
                            options={roleOptions}
                            selected={newWorkflowRole}
                            setSelected={setNewWorkflowRole}
                            placeholder="Select Role"
                        />

                        <div className="Approval-modal-buttons">
                            <button
                                className="Approval-add-btn"
                                onClick={() => setShowNewWorkflowModal(false)}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfigureModal && (
                <div className="Approval-modal-backdrop" onClick={() => setShowConfigureModal(false)}>
                    <div className="Approval-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Configure Workflow</h3>

                        <label>Workflow Name</label>
                        <Dropdown
                            options={workflowOptions}
                            selected={newWorkflowName || "Payroll"}
                            setSelected={setNewWorkflowName}
                            placeholder="Select Workflow"
                        />

                        <label>Type</label>
                        <Dropdown
                            options={typeOptions}
                            selected={newWorkflowType || "P10,000"}
                            setSelected={setNewWorkflowType}
                            placeholder="Select Amount"
                        />

                        <label>Approval Role</label>
                        <Dropdown
                            options={roleOptions}
                            selected={newWorkflowRole || "Manager"}
                            setSelected={setNewWorkflowRole}
                            placeholder="Select Role"
                        />

                        <div className="Approval-modal-buttons">
                            <button
                                className="Approval-add-btn"
                                onClick={() => setShowConfigureModal(false)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExceptionModal && (
                <div className="Approval-modal-backdrop" onClick={() => setShowExceptionModal(false)}>
                    <div className="Approval-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Exception Details</h3>

                        <label>Employee Name</label>
                        <input type="text" placeholder="Jhervin" />

                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ flex: 1 }}>
                                <label>Type</label>
                                <input type="text" placeholder="Overtime" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Period</label>
                                <input type="text" placeholder="Sep. 1–15" />
                            </div>
                        </div>

                        <label>Date Filed</label>
                        <input type="text" placeholder="August 11, 2025" />

                        <label>Status</label>
                        <input type="text" placeholder="Approved" />

                        <div className="Approval-modal-buttons">
                            <button
                                className="Approval-rejectBtn"
                                onClick={() => setShowExceptionModal(false)}
                            >
                                Reject
                            </button>
                            <button
                                className="Approval-approveBtn"
                                onClick={() => setShowExceptionModal(false)}
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
