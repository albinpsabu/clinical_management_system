import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Stethoscope,
    Users,
    Pill,
    FlaskConical,
    FileBarChart,
    Settings,
    LogOut,
} from "lucide-react";

const AdminSidebar = () => {

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <aside className="admin-sidebar">

            {/* Logo */}
            <div className="admin-sidebar-logo">

                <div className="admin-logo-icon">
                    +
                </div>

                <div>
                    <h2>Clinical</h2>
                    <span>Administration</span>
                </div>

            </div>


            {/* Navigation */}
            <nav className="admin-sidebar-nav">

                <div className="admin-nav-section">
                    <span className="admin-nav-title">
                        MAIN
                    </span>


                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </NavLink>


                    <NavLink
                        to="/admin/departments"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <Building2 size={19} />
                        <span>Departments</span>
                    </NavLink>


                    <NavLink
                        to="/admin/doctors"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <Stethoscope size={19} />
                        <span>Doctors</span>
                    </NavLink>


                    <NavLink
                        to="/admin/staff"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <Users size={19} />
                        <span>Staff</span>
                    </NavLink>


                    <NavLink
                        to="/admin/medicines"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <Pill size={19} />
                        <span>Medicines</span>
                    </NavLink>


                    <NavLink
                        to="/admin/lab-tests"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <FlaskConical size={19} />
                        <span>Lab Tests</span>
                    </NavLink>

                </div>


                <div className="admin-nav-section">

                    <span className="admin-nav-title">
                        SYSTEM
                    </span>


                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <FileBarChart size={19} />
                        <span>Reports</span>
                    </NavLink>


                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            `admin-nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <Settings size={19} />
                        <span>Settings</span>
                    </NavLink>

                </div>

            </nav>


            {/* Logout */}
            <div className="admin-sidebar-footer">

                <button
                    type="button"
                    className="admin-logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
};

export default AdminSidebar;