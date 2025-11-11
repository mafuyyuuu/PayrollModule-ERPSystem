import React from "react";
import "../styles/AdminReports.css";
import { RiFilter3Line } from "react-icons/ri";

const deductionData = [
    ["Jhervin Jimenez", "₱1,200", "₱500", "₱400", "₱200", "₱2,300"],
    ["Symon Banana", "₱1,100", "₱480", "₱390", "₱180", "₱2,150"],
    ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
];

export default function AdminReports() {
    return (
        <>
            <div className="report-header-top">
                <h2 className="report-main-title">Reports and Analytics</h2>
            </div>

            <div className="report-container">

                <div className="report-card report-summary">
                    <div className="report-card-header">
                        <h3>Payroll Summary Report</h3>
                        <div className="report-card-actions">
                            <button className="report-filterBtn">
                                Filter <RiFilter3Line size={16} />
                            </button>
                            <button className="report-export">Export PDF</button>
                        </div>

                    </div>

                    <div className="report-summary-wrapper">

                        <div className="report-placeholder-left">
                            <p>(Chart/Graph Placeholder)</p>
                        </div>

                        <div className="report-table-right">
                            <div className="report-table">
                                <div className="report-table-header">
                                    <span>Employee</span>
                                    <span>Tax</span>
                                    <span>SSS</span>
                                    <span>PhilHealth</span>
                                    <span>Pag-IBIG</span>
                                    <span>Total</span>
                                </div>

                                <div className="report-table-body">
                                    {deductionData.map((row, i) => (
                                        <div key={i} className="report-row">
                                            {row.map((cell, j) => (
                                                <span key={j}>{cell}</span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="report-grid">
                    <div className="report-card">
                        <div className="report-card-header">
                            <h3>Department Summary</h3>
                            <button className="report-export">Export PDF</button>
                        </div>
                        <div className="report-placeholder">
                            <p>(Chart/Graph Placeholder)</p>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-header">
                            <h3>Tax and Compliance</h3>
                            <button className="report-export">Export PDF</button>
                        </div>
                        <div className="report-placeholder">
                            <p>(Chart/Graph Placeholder)</p>
                        </div>
                    </div>
                </div>

                <div className="report-footer">
                    <button className="report-generate-btn">Generate Report</button>
                </div>
            </div>
        </>
    );
}
