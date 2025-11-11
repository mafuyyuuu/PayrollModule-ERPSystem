import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RiFilter3Line, RiPencilFill, RiEyeFill } from "react-icons/ri";
import "../styles/AdminConfiguration.css";

export default function AdminConfiguration() {
    const [activeTab, setActiveTab] = useState("payrollRules");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");

    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState("Select Rule Type");

    const [freqDropdownOpen, setFreqDropdownOpen] = useState(false);
    const [selectedFreq, setSelectedFreq] = useState("Select Frequency");

    const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState("Select Department");

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setTypeDropdownOpen(false);
        setSelectedRule("Select Rule Type");
        setFreqDropdownOpen(false);
        setSelectedFreq("Select Frequency");
        setDeptDropdownOpen(false);
        setSelectedDept("Select Department");
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType("");
        setTypeDropdownOpen(false);
        setFreqDropdownOpen(false);
        setDeptDropdownOpen(false);
    };

    const renderCards = () => {
        switch (activeTab) {
            case "payrollRules":
                return (
                    <div className="Config-cardTable">
                        <div className="Config-headerRow">
                            <span></span>
                            <span>Rule Type</span>
                            <span>Description</span>
                            <span>Formula / Value</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        {["Benefit", "Deduction", "Bonus", "Allowance"].map((type, i) => (
                            <div key={i} className="Config-dataRow">
                                <span className="Config-checkboxCol"><input type="checkbox" /></span>
                                <span>{type}</span>
                                <span>Lorem Ipsum</span>
                                <span>10%</span>
                                <span className="Config-status">
                                    <span className="Config-statusDot active"></span> Active
                                </span>
                                <span className="Config-actionBtns">
                                    <button className="Config-iconBtn" onClick={() => openModal("rule")}><RiPencilFill /></button>
                                </span>
                            </div>
                        ))}
                    </div>
                );

            case "cutoffDates":
                return (
                    <div className="Config-cardTable">
                        <div className="Config-headerRow">
                            <span></span>
                            <span>Period</span>
                            <span>Start Date</span>
                            <span>End Date</span>
                            <span>Frequency</span>
                            <span>Actions</span>
                        </div>
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="Config-dataRow">
                                <span className="Config-checkboxCol"><input type="checkbox" /></span>
                                <span>Sept. 1 - 15</span>
                                <span>Sept. 1, 2025</span>
                                <span>Sept. 15, 2025</span>
                                <span>Bi-weekly</span>
                                <span className="Config-actionBtns">
                                    <button className="Config-iconBtn" onClick={() => openModal("cutoff")}><RiPencilFill /></button>
                                </span>
                            </div>
                        ))}
                    </div>
                );

            case "employeeGroups":
                return (
                    <div className="Config-cardTable">
                        <div className="Config-headerRow employeeHeader">
                            <span>Department</span>
                            <span>Employees</span>
                            <span>Full Time</span>
                            <span>Part Time</span>
                            <span>Contract</span>
                            <span>Actions</span>
                        </div>
                        {["IT Department", "HR", "Accounting"].map((dept, i) => (
                            <div key={i} className="Config-dataRow employeeRow">
                                <span>{dept}</span>
                                <span>53</span>
                                <span>23</span>
                                <span>27</span>
                                <span>3</span>
                                <span className="Config-actionBtns">
                                    <button className="Config-iconBtn" onClick={() => openModal("employee")}><RiEyeFill /></button>
                                    <button className="Config-iconBtn"><RiPencilFill /></button>
                                </span>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "rule":
                return (
                    <>
                        <h3>Config Rule</h3>

                        <label>Rule Type</label>
                        <div className="Config-dropdown-container">
                            <div
                                className="Config-dropdown-selected"
                                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                            >
                                {selectedRule}
                            </div>
                            {typeDropdownOpen && (
                                <div className="Config-dropdown-menu">
                                    {["Overtime", "Deduction", "Bonus", "Allowance"].map((option, i) => (
                                        <div
                                            key={i}
                                            className="Config-dropdown-item"
                                            onClick={() => {
                                                setSelectedRule(option);
                                                setTypeDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label>Formula or Fixed Amount</label>
                        <input type="text" placeholder="Enter value" />

                        <label>Description</label>
                        <textarea placeholder="Enter description" rows="3" />

                        <div className="Config-modal-buttons">
                            <button className="Config-add-btn" onClick={closeModal}>Remove</button>
                            <button className="Config-add-btn">Save</button>
                        </div>
                    </>
                );

            case "cutoff":
                return (
                    <>
                        <h3>Add Cutoff</h3>

                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <div style={{ flex: 1 }}>
                                <label>Start Date</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="MMMM d, yyyy"
                                    className="Config-dateInput"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>End Date</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="MMMM d, yyyy"
                                    className="Config-dateInput"
                                />
                            </div>
                        </div>

                        <label>Payroll Frequency</label>
                        <div className="Config-dropdown-container">
                            <div
                                className="Config-dropdown-selected"
                                onClick={() => setFreqDropdownOpen(!freqDropdownOpen)}
                            >
                                {selectedFreq}
                            </div>
                            {freqDropdownOpen && (
                                <div className="Config-dropdown-menu">
                                    {["Weekly", "Bi-weekly", "Monthly"].map((option, i) => (
                                        <div
                                            key={i}
                                            className="Config-dropdown-item"
                                            onClick={() => {
                                                setSelectedFreq(option);
                                                setFreqDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label>Apply to Department</label>
                        <div className="Config-dropdown-container">
                            <div
                                className="Config-dropdown-selected"
                                onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                            >
                                {selectedDept}
                            </div>
                            {deptDropdownOpen && (
                                <div className="Config-dropdown-menu">
                                    {["IT Department", "HR", "Accounting"].map((option, i) => (
                                        <div
                                            key={i}
                                            className="Config-dropdown-item"
                                            onClick={() => {
                                                setSelectedDept(option);
                                                setDeptDropdownOpen(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                            <input type="checkbox" id="applyAll" style={{ width: "16px", height: "16px" }} />
                            <label htmlFor="applyAll" style={{ fontSize: "12px", marginBottom:"7px" }}>Apply to all employees in selected department</label>
                        </div>

                        <div className="Config-modal-buttons">
                            <button className="Config-add-btn" onClick={closeModal}>Cancel</button>
                            <button className="Config-add-btn">Save</button>
                        </div>
                    </>
                );

            case "employee":
                return (
                    <div className="EmployeeModal-container">
                        <div className="EmployeeModal-header">
                            <span className="EmployeeModal-title">IT Department</span>
                            <input
                                type="text"
                                className="EmployeeModal-search"
                                placeholder="Enter User Name"
                            />
                        </div>

                        <div className="EmployeeModal-tableHeader">
                            <span>Employee</span>
                            <span>Type</span>
                        </div>

                        <div className="EmployeeModal-tableBody">
                            {[
                                { name: "Jherwin Jimenez", type: "Full Time" },
                                { name: "Symon Banana", type: "Part Time" },
                                { name: "Russell James Vitale", type: "Contract" },
                            ].map((emp, i) => (
                                <div key={i} className="EmployeeModal-row">
                                    <span>{emp.name}</span>
                                    <select
                                        defaultValue={emp.type}
                                        className="EmployeeModal-select"
                                    >
                                        <option>Full Time</option>
                                        <option>Part Time</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <div className="EmployeeModal-footer">
                            <button className="EmployeeModal-saveBtn" onClick={closeModal}>
                                Save
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="Config-pageContainer">
            <h2 className="Config-title">Payment System Setup</h2>

            <div className="Config-container">
                <div className="Config-tabs">
                    <button
                        className={`Config-tabBtn ${activeTab === "payrollRules" ? "active" : ""}`}
                        onClick={() => setActiveTab("payrollRules")}
                    >
                        Payroll Rules
                    </button>
                    <button
                        className={`Config-tabBtn ${activeTab === "cutoffDates" ? "active" : ""}`}
                        onClick={() => setActiveTab("cutoffDates")}
                    >
                        Cutoff Dates
                    </button>
                    <button
                        className={`Config-tabBtn ${activeTab === "employeeGroups" ? "active" : ""}`}
                        onClick={() => setActiveTab("employeeGroups")}
                    >
                        Employee Groups
                    </button>
                </div>

                <div className="Config-content">
                    <div className="Config-actionsHeader">
                        <div className="Config-topActions">
                            {(activeTab === "payrollRules" || activeTab === "cutoffDates") && (
                                <button className="Config-addBtn" onClick={() => openModal(activeTab === "payrollRules" ? "rule" : "cutoff")}>
                                    {activeTab === "payrollRules" && "Add Rule"}
                                    {activeTab === "cutoffDates" && "Add Cutoff"}
                                </button>
                            )}
                        </div>
                        <button className="Config-filterBtn">
                            <RiFilter3Line /> Filter
                        </button>
                    </div>
                    {renderCards()}
                </div>
            </div>

            {showModal && (
                <>
                    <div className="Config-modal-backdrop" onClick={closeModal}></div>
                    <div className="Config-modal" onClick={(e) => e.stopPropagation()}>
                        {renderModalContent()}
                    </div>
                </>
            )}
        </div>
    );
}
