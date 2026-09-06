import React from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

import "../../styles/admin.css";

const AdminLayout = () => {
    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminHeader />

                <main className="admin-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default AdminLayout;