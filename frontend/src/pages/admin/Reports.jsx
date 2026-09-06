import React, {
    useEffect,
    useState,
} from "react";

import {
    Users,
    UserRound,
    Stethoscope,
    Pill,
    FlaskConical,
    CalendarDays,
    Receipt,
    RefreshCw,
} from "lucide-react";

import api from "../../services/api";


function Reports() {

    // ==================================================
    // STATE
    // ==================================================

    const [patients, setPatients] =
        useState([]);

    const [doctors, setDoctors] =
        useState([]);

    const [staff, setStaff] =
        useState([]);

    const [medicines, setMedicines] =
        useState([]);

    const [labTests, setLabTests] =
        useState([]);

    const [appointments, setAppointments] =
        useState([]);

    const [bills, setBills] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==================================================
    // RESPONSE HELPER
    // ==================================================

    const getList = (response) => {

        const data = response?.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };


    // ==================================================
    // LOAD REPORT DATA
    // ==================================================

    const loadReports = async () => {

        try {

            setLoading(true);
            setError("");

            const responses =
                await Promise.allSettled([
                    api.get(
                        "/receptionist/patients/"
                    ),

                    api.get(
                        "/admin-panel/doctors/"
                    ),

                    api.get(
                        "/admin-panel/staff/"
                    ),

                    api.get(
                        "/admin-panel/medicines/"
                    ),

                    api.get(
                        "/admin-panel/lab-tests/"
                    ),

                    api.get(
                        "/receptionist/appointments/"
                    ),

                    api.get(
                        "/receptionist/billing/"
                    ),
                ]);


            const [
                patientsResponse,
                doctorsResponse,
                staffResponse,
                medicinesResponse,
                labTestsResponse,
                appointmentsResponse,
                billsResponse,
            ] = responses;


            if (
                patientsResponse.status ===
                "fulfilled"
            ) {
                setPatients(
                    getList(
                        patientsResponse.value
                    )
                );
            }


            if (
                doctorsResponse.status ===
                "fulfilled"
            ) {
                setDoctors(
                    getList(
                        doctorsResponse.value
                    )
                );
            }


            if (
                staffResponse.status ===
                "fulfilled"
            ) {
                setStaff(
                    getList(
                        staffResponse.value
                    )
                );
            }


            if (
                medicinesResponse.status ===
                "fulfilled"
            ) {
                setMedicines(
                    getList(
                        medicinesResponse.value
                    )
                );
            }


            if (
                labTestsResponse.status ===
                "fulfilled"
            ) {
                setLabTests(
                    getList(
                        labTestsResponse.value
                    )
                );
            }


            if (
                appointmentsResponse.status ===
                "fulfilled"
            ) {
                setAppointments(
                    getList(
                        appointmentsResponse.value
                    )
                );
            }


            if (
                billsResponse.status ===
                "fulfilled"
            ) {
                setBills(
                    getList(
                        billsResponse.value
                    )
                );
            }

        } catch (err) {

            console.error(
                "Reports loading error:",
                err
            );

            setError(
                "Unable to load report data."
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        loadReports();
    }, []);


    // ==================================================
    // CALCULATIONS
    // ==================================================

    const totalPatients =
        patients.length;

    const totalDoctors =
        doctors.length;

    const totalStaff =
        staff.length;

    const totalMedicines =
        medicines.length;

    const totalLabTests =
        labTests.length;

    const totalAppointments =
        appointments.length;

    const totalBills =
        bills.length;


    const pendingBills =
        bills.filter(
            (bill) =>
                bill.payment_status ===
                    "PENDING" ||
                bill.payment_status ===
                    "Pending"
        ).length;


    const completedBills =
        bills.filter(
            (bill) =>
                bill.payment_status ===
                    "COMPLETED" ||
                bill.payment_status ===
                    "PAID" ||
                bill.payment_status ===
                    "Completed"
        ).length;


    // ==================================================
    // REPORT CARDS
    // ==================================================

    const reportCards = [
        {
            title: "Total Patients",
            value: totalPatients,
            icon: Users,
        },

        {
            title: "Total Doctors",
            value: totalDoctors,
            icon: Stethoscope,
        },

        {
            title: "Total Staff",
            value: totalStaff,
            icon: UserRound,
        },

        {
            title: "Total Medicines",
            value: totalMedicines,
            icon: Pill,
        },

        {
            title: "Lab Tests",
            value: totalLabTests,
            icon: FlaskConical,
        },

        {
            title: "Appointments",
            value: totalAppointments,
            icon: CalendarDays,
        },

        {
            title: "Total Bills",
            value: totalBills,
            icon: Receipt,
        },

        {
            title: "Completed Bills",
            value: completedBills,
            icon: Receipt,
        },
    ];


    // ==================================================
    // PAGE
    // ==================================================

    return (
        <div className="admin-reports-page">

            {/* ==================================================
                PAGE HEADING
            ================================================== */}

            <div className="admin-page-heading">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Overview of the clinical
                        management system.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-report-refresh"
                    onClick={loadReports}
                    disabled={loading}
                >
                    <RefreshCw
                        size={15}
                        className={
                            loading
                                ? "admin-report-spin"
                                : ""
                        }
                    />

                    <span>
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </span>

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="admin-alert error">
                    {error}
                </div>
            )}


            {/* ==================================================
                REPORT CARDS
            ================================================== */}

            <div className="admin-reports-grid">

                {reportCards.map(
                    (item) => {

                        const Icon =
                            item.icon;

                        return (
                            <div
                                className="admin-report-card"
                                key={item.title}
                            >

                                <div className="admin-report-icon">
                                    <Icon size={21} />
                                </div>

                                <div className="admin-report-content">

                                    <span>
                                        {item.title}
                                    </span>

                                    <strong>
                                        {loading
                                            ? "..."
                                            : item.value}
                                    </strong>

                                </div>

                            </div>
                        );
                    }
                )}

            </div>


            {/* ==================================================
                SYSTEM SUMMARY
            ================================================== */}

            <section className="admin-report-summary">

                <div className="admin-report-summary-header">

                    <div>

                        <h2>
                            System Summary
                        </h2>

                        <p>
                            Current system statistics
                        </p>

                    </div>

                </div>


                <div className="admin-report-summary-grid">

                    <div className="admin-report-summary-item">

                        <span>
                            Registered Patients
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalPatients}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Active Doctors
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalDoctors}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Staff Accounts
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalStaff}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Medicine Master Records
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalMedicines}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Laboratory Tests
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalLabTests}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Appointments
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalAppointments}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Pending Bills
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : pendingBills}
                        </strong>

                    </div>


                    <div className="admin-report-summary-item">

                        <span>
                            Completed Bills
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : completedBills}
                        </strong>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Reports;