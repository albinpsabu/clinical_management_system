import { useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    FlaskConical,
    CreditCard,
    BarChart3,
    LogOut
} from "lucide-react";

function LaboratorySidebar({ activePage, setActivePage }) {

    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            page: "dashboard",
            path: "/laboratory"
        },
        {
            name: "Test Management",
            icon: FlaskConical,
            page: "tests",
            path: "/laboratory/tests"
        },
        {
            name: "Billing",
            icon: CreditCard,
            page: "billing",
            path: "/laboratory/billing"
        },
        {
            name: "Sales",
            icon: BarChart3,
            page: "sales",
            path: "/laboratory/sales"
        }
    ];

    const handleNavigation = (item) => {
        setActivePage(item.page);
        navigate(item.path);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <aside className="laboratory-sidebar">

            {/* Sidebar Title */}
            <div className="sidebar-title">
                LABORATORY
            </div>

            {/* Menu */}
            <nav className="sidebar-menu">

                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (
                        <button
                            key={item.page}
                            className={`sidebar-item ${
                                activePage === item.page
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => handleNavigation(item)}
                        >
                            <Icon
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>
                                {item.name}
                            </span>
                        </button>
                    );

                })}

            </nav>

            {/* Logout */}
            <button
                className="sidebar-item logout-item"
                onClick={handleLogout}
            >
                <LogOut
                    size={19}
                    strokeWidth={1.8}
                />

                <span>
                    Logout
                </span>
            </button>

        </aside>
    );
}

export default LaboratorySidebar;