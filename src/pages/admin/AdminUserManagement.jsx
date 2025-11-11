import React from "react";
import "../styles/AdminUserManagement.css";
import {RiPencilFill, RiSearchLine} from "react-icons/ri";


export default function AdminUserManagement() {
    const users = [
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
    ];

    return (
        <div className="User-pageContainer">
            <h2 className="User-title">User Management</h2>

            <div className="User-topBar">
                <div className="User-buttons">
                    <button className="User-btn add">Add User</button>
                    <button className="User-btn remove">Remove</button>
                </div>

                <div className="audit-search-box">
                    <RiSearchLine className="audit-search-icon" />
                    <input type="text" placeholder="Enter User Name" />
                </div>
            </div>

            <div className="User-tableContainer">
                <div className="User-headerRow">
                    <span className="User-headerId">User ID</span>
                    <span className="User-headerName">Name</span>
                    <span className="User-headerRole">Role</span>
                    <span className="User-headerAccess">Access Level</span>
                    <span className="User-headerStatus">Status</span>
                    <span className="User-headerActions">Actions</span>
                </div>

                <div className="User-list">
                    {users.map((user, i) => (
                        <div className="User-row" key={i}>
                            <span className="User-id">{user.id}</span>
                            <span className="User-name">{user.name}</span>
                            <span className="User-role">{user.role}</span>
                            <span className="User-access">{user.access}</span>
                            <span className="User-status">{user.status}</span>
                            <div className="User-actions">
                                <button className="User-actionBtn">
                                    <RiPencilFill />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
