function LaboratoryHeader() {
    return (
        <header className="laboratory-header">

            <div className="header-title">
                Clinic Management System
            </div>

            <div className="header-right">

                <span className="user-role">
                    Lab Technician
                </span>

                <button className="logout-button">
                    Logout
                </button>

            </div>

        </header>
    );
}

export default LaboratoryHeader;