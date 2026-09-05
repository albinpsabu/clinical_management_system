import {
    LayoutDashboard,
    FlaskConical,
    ClipboardList,
    Receipt,
    BarChart3,
    LogOut,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

function LaboratorySidebar() {
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/laboratory",
            icon: LayoutDashboard,
            end: true,
        },
        {
            name: "Lab Tests",
            path: "/laboratory/tests",
            icon: FlaskConical,
        },
        {
            name: "Test Management",
            path: "/laboratory/test-management",
            icon: ClipboardList,
        },
        {
            name: "Billing",
            path: "/laboratory/billing",
            icon: Receipt,
        },
        {
            name: "Sales",
            path: "/laboratory/sales",
            icon: BarChart3,
        },
    ];

    const handleLogout = () => {
        localStorage.clear();

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <aside className="laboratory-sidebar">

            <div className="sidebar-brand">
                <FlaskConical size={22} />

                <div>
                    <strong>
                        CLINIC
                    </strong>

                    <span>
                        LABORATORY
                    </span>
                </div>
            </div>

            <nav className="sidebar-menu">

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-item ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >
                            <Icon size={18} />

                            <span>
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}

            </nav>

            <button
                type="button"
                className="sidebar-logout"
                onClick={handleLogout}
            >
                <LogOut size={18} />

                <span>
                    Logout
                </span>
            </button>

        </aside>
    );
}

export default LaboratorySidebar;