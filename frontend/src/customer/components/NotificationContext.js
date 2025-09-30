import React, { createContext, useState, useContext } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success"); // success / error

    const notify = (msg, msgType = "success", duration = 3000) => {
        setMessage(msg);
        setType(msgType);
        setTimeout(() => setMessage(""), duration);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            {message && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    backgroundColor: type === "success" ? "#2ecc71" : "#e74c3c",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: 5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    transition: "all 0.3s"
                }}>
                    {message}
                </div>
            )}
        </NotificationContext.Provider>
    );
};
