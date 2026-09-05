import { Outlet } from "react-router-dom";
import LaboratorySidebar from "./LaboratorySidebar";

function LaboratoryLayout() {
    return (
        <div className="laboratory-layout">
            <LaboratorySidebar />

            <main className="laboratory-main">
                <Outlet />
            </main>
        </div>
    );
}

export default LaboratoryLayout;