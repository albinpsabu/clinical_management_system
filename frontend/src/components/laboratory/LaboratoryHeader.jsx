import { LogOut, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LaboratoryHeader() {
    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") || "Lab Technician";

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <header className="laboratory-header">

            <div className="header-title">
                Clinic Management System
            </div>

            <div className="header-right">

                <div className="laboratory-user">

                    <div className="laboratory-user-icon">
                        <FlaskConical size={18} />
                    </div>

                    <div className="laboratory-user-details">
                        <strong>
                            {username}
                        </strong>

                        <span>
                            Lab Technician
                        </span>
                    </div>

                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    Logout
                </button>

            </div>

        </header>
    );
}

export default LaboratoryHeader;