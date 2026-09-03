import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ReceiptText,
    LogOut,
    ArrowLeft,
} from "lucide-react";

function ReceptionistLayout({
    children,
    title,
    subtitle,
    showBack = true,
}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="receptionist-layout">

            <aside className="receptionist-sidebar">

                <div className="sidebar-title">
                    RECEPTIONIST
                </div>

                <nav>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/receptionist")
                        }
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/receptionist/patients")
                        }
                    >
                        <Users size={18} />
                        Patients
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate(
                                "/receptionist/appointments"
                            )
                        }
                    >
                        <CalendarDays size={18} />
                        Appointments
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/receptionist/bills")
                        }
                    >
                        <ReceiptText size={18} />
                        Billing History
                    </button>

                </nav>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    Logout
                </button>

            </aside>

            <div className="receptionist-main">

                <header className="receptionist-header">

                    <div className="system-name">
                        Clinic Management System
                    </div>

                    <div className="header-right">

                        <span>
                            Receptionist
                        </span>

                        <button
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>

                <main className="receptionist-content">

                    {showBack && (
                        <button
                            className="back-button"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                    )}

                    {title && (
                        <div className="page-title">

                            <h1>
                                {title}
                            </h1>

                            {subtitle && (
                                <p>
                                    {subtitle}
                                </p>
                            )}

                        </div>
                    )}

                    {children}

                </main>

            </div>

        </div>
    );
}

export default ReceptionistLayout;