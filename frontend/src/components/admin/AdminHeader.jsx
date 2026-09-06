import React from "react";

const AdminHeader = () => {
    const username = localStorage.getItem("username") || "Admin";

    return (
        <header className="admin-header">

            <div className="admin-header-left">
                <h2>Administration Panel</h2>
            </div>

            <div className="admin-header-right">
                <span className="admin-welcome">
                    Welcome, {username}
                </span>

                <div className="admin-user-icon">
                    {username.charAt(0).toUpperCase()}
                </div>
            </div>

        </header>
    );
};

export default AdminHeader;