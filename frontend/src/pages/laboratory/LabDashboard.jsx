import { useEffect, useState } from "react";

import {
    getLabPrescriptions,
    getLabBills,
} from "../../services/laboratoryService";

function LabDashboard() {
    const [prescriptions, setPrescriptions] =
        useState([]);

    const [bills, setBills] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [
                    prescriptionData,
                    billData,
                ] = await Promise.all([
                    getLabPrescriptions(),
                    getLabBills(),
                ]);

                setPrescriptions(
                    Array.isArray(prescriptionData)
                        ? prescriptionData
                        : prescriptionData.results || []
                );

                setBills(
                    Array.isArray(billData)
                        ? billData
                        : billData.results || []
                );

            } catch (error) {
                console.error(error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load dashboard."
                );

            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const requested =
        prescriptions.filter(
            (item) =>
                item.status === "REQUESTED"
        ).length;

    const sampleCollected =
        prescriptions.filter(
            (item) =>
                item.status === "SAMPLE_COLLECTED"
        ).length;

    const completed =
        prescriptions.filter(
            (item) =>
                item.status === "COMPLETED"
        ).length;

    const pendingBills =
        bills.filter(
            (bill) =>
                bill.payment_status === "PENDING"
        ).length;

    const totalRevenue =
        bills.reduce(
            (sum, bill) =>
                sum +
                Number(
                    bill.total_amount || 0
                ),
            0
        );

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="loading-state">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="laboratory-page">

            <div className="page-header">

                <div>
                    <h1>
                        Laboratory Dashboard
                    </h1>

                    <p>
                        Overview of laboratory operations.
                    </p>
                </div>

            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon blue">
                        LAB
                    </div>

                    <div className="stat-content">
                        <span>
                            Requested
                        </span>

                        <strong>
                            {requested}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        SMP
                    </div>

                    <div className="stat-content">
                        <span>
                            Sample Collected
                        </span>

                        <strong>
                            {sampleCollected}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        ✓
                    </div>

                    <div className="stat-content">
                        <span>
                            Completed
                        </span>

                        <strong>
                            {completed}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        ₹
                    </div>

                    <div className="stat-content">
                        <span>
                            Total Billing
                        </span>

                        <strong>
                            ₹{totalRevenue.toFixed(2)}
                        </strong>
                    </div>
                </div>

            </div>

            <div className="content-card">

                <div className="card-header">

                    <div>
                        <h2>
                            Recent Laboratory Requests
                        </h2>

                        <p>
                            Latest test prescriptions.
                        </p>
                    </div>

                    <span className="record-count">
                        {pendingBills} Pending Bills
                    </span>

                </div>

                <div className="table-container">

                    <table className="laboratory-table">

                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Patient</th>
                                <th>Test</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {prescriptions.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="4"
                                        className="empty-state"
                                    >
                                        No laboratory requests found.
                                    </td>
                                </tr>

                            ) : (

                                prescriptions
                                    .slice(0, 8)
                                    .map(
                                        (item) => (

                                            <tr
                                                key={item.id}
                                            >

                                                <td>
                                                    <span className="request-id">
                                                        {
                                                            item.lab_request_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        item.patient_name ||
                                                        "N/A"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.test_name ||
                                                        "N/A"
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status ${
                                                            item.status ===
                                                            "COMPLETED"
                                                                ? "completed"
                                                                : item.status ===
                                                                  "SAMPLE_COLLECTED"
                                                                ? "progress"
                                                                : "pending"
                                                        }`}
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </span>
                                                </td>

                                            </tr>

                                        )
                                    )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default LabDashboard;