import { useEffect, useState } from "react";

import {
    FlaskConical,
    Clock3,
    CheckCircle2,
    CreditCard
} from "lucide-react";

import "../../styles/laboratory/laboratory.css";

import {
    getLabPrescriptions,
    getLabResults,
    getLabBills
} from "../../services/laboratoryService";


function LabDashboard() {

    // -----------------------------
    // State variables
    // -----------------------------

    const [prescriptions, setPrescriptions] = useState([]);
    const [results, setResults] = useState([]);
    const [bills, setBills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // -----------------------------
    // Get data from Django API
    // -----------------------------

    useEffect(() => {

        const loadDashboardData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    prescriptionData,
                    resultData,
                    billData
                ] = await Promise.all([
                    getLabPrescriptions(),
                    getLabResults(),
                    getLabBills()
                ]);


                // Handle normal array or DRF pagination

                setPrescriptions(
                    prescriptionData.results || prescriptionData
                );

                setResults(
                    resultData.results || resultData
                );

                setBills(
                    billData.results || billData
                );


            } catch (error) {

                console.error(
                    "Dashboard data error:",
                    error
                );

                setError(
                    "Unable to load laboratory dashboard data."
                );


            } finally {

                setLoading(false);

            }

        };


        loadDashboardData();

    }, []);


    // -----------------------------
    // Dashboard calculations
    // -----------------------------

    // Total laboratory test requests
    const totalTests = prescriptions.length;


    // Pending tests
    const pendingTests = prescriptions.filter(
        (test) =>
            test.status !== "COMPLETED"
    ).length;


    // Completed tests
    const completedTests = results.filter(
        (result) =>
            result.status === "COMPLETED"
    ).length;


    // Today's date
    const today = new Date()
        .toISOString()
        .split("T")[0];


    // Today's bills
    const todaysBills = bills.filter(
        (bill) =>
            bill.created_at &&
            bill.created_at.startsWith(today)
    );


    // Today's bill amount
    const todaysBillAmount = todaysBills.reduce(
        (total, bill) =>
            total + Number(bill.total_amount || 0),
        0
    );


    // Latest 5 tests
    const recentTests = prescriptions.slice(0, 5);


    // -----------------------------
    // Loading screen
    // -----------------------------

    if (loading) {

        return (
            <div className="lab-dashboard">

                <div className="page-heading">

                    <h1>
                        Laboratory Dashboard
                    </h1>

                    <p>
                        Loading laboratory data...
                    </p>

                </div>

            </div>
        );

    }


    // -----------------------------
    // Dashboard
    // -----------------------------

    return (

        <div className="lab-dashboard">


            {/* ==========================
                PAGE HEADING
            ========================== */}

            <div className="page-heading">

                <h1>
                    Laboratory Dashboard
                </h1>

                <p>
                    Overview of today's laboratory activity
                </p>

            </div>


            {/* ==========================
                ERROR MESSAGE
            ========================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* ==========================
                STATISTICS CARDS
            ========================== */}

            <div className="stats-grid">


                {/* Total Tests */}

                <div className="stat-card">

                    <div className="stat-icon blue">

                        <FlaskConical size={23} />

                    </div>


                    <div className="stat-content">

                        <span className="stat-title">
                            Total Tests
                        </span>


                        <strong>
                            {totalTests}
                        </strong>


                        <span className="stat-description">
                            Laboratory tests
                        </span>

                    </div>

                </div>



                {/* Pending Tests */}

                <div className="stat-card">

                    <div className="stat-icon orange">

                        <Clock3 size={23} />

                    </div>


                    <div className="stat-content">

                        <span className="stat-title">
                            Pending Tests
                        </span>


                        <strong>
                            {pendingTests}
                        </strong>


                        <span className="stat-description">
                            Awaiting completion
                        </span>

                    </div>

                </div>



                {/* Completed Tests */}

                <div className="stat-card">

                    <div className="stat-icon green">

                        <CheckCircle2 size={23} />

                    </div>


                    <div className="stat-content">

                        <span className="stat-title">
                            Completed Tests
                        </span>


                        <strong>
                            {completedTests}
                        </strong>


                        <span className="stat-description">
                            Completed tests
                        </span>

                    </div>

                </div>



                {/* Today's Bills */}

                <div className="stat-card">

                    <div className="stat-icon purple">

                        <CreditCard size={23} />

                    </div>


                    <div className="stat-content">

                        <span className="stat-title">
                            Today's Bills
                        </span>


                        <strong>
                            ₹{todaysBillAmount.toFixed(2)}
                        </strong>


                        <span className="stat-description">
                            Laboratory billing
                        </span>

                    </div>

                </div>

            </div>



            {/* ==========================
                RECENT LABORATORY TESTS
            ========================== */}

            <div className="content-card">


                {/* Card Header */}

                <div className="card-header">

                    <div>

                        <h2>
                            Recent Laboratory Tests
                        </h2>

                        <p>
                            Latest test requests
                        </p>

                    </div>


                    <button
                        className="view-all-button"
                    >
                        View All
                    </button>

                </div>



                {/* Table */}

                <div className="table-container">

                    <table>


                        {/* Table Header */}

                        <thead>

                            <tr>

                                <th>
                                    REQUEST ID
                                </th>

                                <th>
                                    PATIENT
                                </th>

                                <th>
                                    TEST
                                </th>

                                <th>
                                    STATUS
                                </th>

                                <th>
                                    ACTION
                                </th>

                            </tr>

                        </thead>



                        {/* Table Body */}

                        <tbody>


                            {/* No tests */}

                            {recentTests.length === 0 ? (

                                <tr>

                                    <td colSpan="5">

                                        No laboratory tests found.

                                    </td>

                                </tr>

                            ) : (


                                /* Display API data */

                                recentTests.map((test) => (

                                    <tr key={test.id}>


                                        {/* Request ID */}

                                        <td className="request-id">

                                            {test.lab_request_id}

                                        </td>


                                        {/* Patient */}

                                        <td>

                                            {test.patient_name}

                                        </td>


                                        {/* Test */}

                                        <td>

                                            {test.test_name}

                                        </td>


                                        {/* Status */}

                                        <td>

                                            <span
                                                className={`status ${
                                                    test.status === "COMPLETED"
                                                        ? "completed"
                                                        : "pending"
                                                }`}
                                            >

                                                {test.status}

                                            </span>

                                        </td>


                                        {/* Action */}

                                        <td>

                                            <button
                                                className="view-button"
                                            >
                                                View
                                            </button>

                                        </td>


                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}


export default LabDashboard;
