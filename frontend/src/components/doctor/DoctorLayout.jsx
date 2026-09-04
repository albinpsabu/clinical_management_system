import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    LogOut,
    ArrowLeft,
    Stethoscope,
} from "lucide-react";

function DoctorLayout({
    children,
    title,
    subtitle,
    showBack = true,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const username =
        localStorage.getItem("username") || "Doctor";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const isDashboard =
        location.pathname === "/doctor";

    const isAppointments =
        location.pathname.startsWith("/doctor/appointments");

    return (
        <div className="doctor-layout">

            {/* =========================
                SIDEBAR
            ========================= */}
            <aside className="doctor-sidebar">

                <div className="doctor-sidebar-brand">

                    <div className="doctor-sidebar-brand-icon">
                        <Stethoscope size={22} />
                    </div>

                    <div className="doctor-sidebar-brand-text">
                        <strong>Clinic Management</strong>
                        <span>Doctor Portal</span>
                    </div>

                </div>

                <nav>

                    <button
                        className={`doctor-sidebar-link ${
                            isDashboard ? "active" : ""
                        }`}
                        onClick={() => navigate("/doctor")}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`doctor-sidebar-link ${
                            isAppointments ? "active" : ""
                        }`}
                        onClick={() =>
                            navigate("/doctor/appointments")
                        }
                    >
                        <CalendarDays size={18} />
                        <span>Appointments</span>
                    </button>

                </nav>

                <button
                    className="doctor-sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

            </aside>


            {/* =========================
                MAIN AREA
            ========================= */}
            <div className="doctor-main">

                {/* HEADER */}
                <header className="doctor-header">

                    <div className="doctor-header-left">

                        <div className="doctor-header-title">
                            Clinic Management System
                        </div>

                    </div>


                    <div className="doctor-header-right">

                        <div className="doctor-header-user">

                            <div className="doctor-header-avatar">
                                <Stethoscope size={18} />
                            </div>

                            <div className="doctor-header-user-info">

                                <strong>
                                    {username}
                                </strong>

                                <span>
                                    Doctor
                                </span>

                            </div>

                        </div>

                        <button
                            className="doctor-header-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* CONTENT */}
                <main className="doctor-content">

                    {showBack && !isDashboard && (
                        <button
                            className="doctor-back-button"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={17} />
                            <span>Back</span>
                        </button>
                    )}


                    {title && (
                        <div className="doctor-page-heading">

                            <div>

                                <h1>
                                    {title}
                                </h1>

                                {subtitle && (
                                    <p>
                                        {subtitle}
                                    </p>
                                )}

                            </div>

                        </div>
                    )}


                    {children}

                </main>

            </div>

        </div>
    );
}

export default DoctorLayout;