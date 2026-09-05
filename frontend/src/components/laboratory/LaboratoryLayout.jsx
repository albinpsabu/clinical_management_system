import { Outlet } from "react-router-dom";

import LaboratorySidebar from "./LaboratorySidebar";
import LaboratoryHeader from "./LaboratoryHeader";

function LaboratoryLayout() {
    return (
        <div className="laboratory-layout">

            <LaboratorySidebar />

            <div className="laboratory-main">

                <LaboratoryHeader />

                <main className="laboratory-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default LaboratoryLayout;