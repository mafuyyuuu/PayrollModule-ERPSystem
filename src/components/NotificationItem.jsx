import React from "react";
import "./NotificationItem.css";

export const NotificationItem = ({ title, description }) => {
    return (
        <div className="notification-item">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

export default NotificationItem;
