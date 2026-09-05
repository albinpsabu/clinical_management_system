import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    FlaskConical,
    CreditCard,
    BarChart3,
    LogOut
} from "lucide-react";

function LaboratorySidebar() {
    const navigate = useNavigate();

   const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/laboratory"
    },
    {
        name: "Lab Tests",
        icon: FlaskConical,
        path: "/laboratory/tests"
    },
    {
        name: "Test Management",
        icon: FlaskConical,
        path: "/laboratory/test-management"
    },
    {
        name: "Billing",
        icon: CreditCard,
        path: "/laboratory/billing"
    }
]; 

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <aside className="laboratory-sidebar">

            <div className="sidebar-title">
                LABORATORY
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon
                                size={19}
                                strokeWidth={1.8}
                            />

                            <span>
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

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