import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/laboratory/laboratory.css";

function Billing() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBills = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/laboratory/bills/");

                const data = response.data;

                setBills(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (error) {
                console.error("Error loading laboratory bills:", error);
                setError("Unable to load billing data.");
            } finally {
                setLoading(false);
            }
        };

        loadBills();
    }, []);

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="laboratory-content">
                    <div className="loading-message">
                        Loading billing...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="laboratory-page">
            <div className="laboratory-content">

                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>Laboratory Billing</h1>
                        <p>
                            View and manage laboratory bills and payments.
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Billing Card */}
                <div className="laboratory-card">

                    <div className="card-header">
                        <div>
                            <h2>Laboratory Bills</h2>
                            <p>
                                Bills generated for laboratory services
                            </p>
                        </div>

                        <span className="record-count">
                            {bills.length} Bills
                        </span>
                    </div>

                    {/* Billing Table */}
                    <div className="table-container">
                        <table className="laboratory-table">

                            <thead>
                                <tr>
                                    <th>Bill ID</th>
                                    <th>Patient</th>
                                    <th>Test</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bills.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="empty-table-message"
                                        >
                                            No laboratory bills found
                                        </td>
                                    </tr>
                                ) : (
                                    bills.map((bill) => (
                                        <tr key={bill.id}>

                                            <td>
                                                <strong>
                                                    {bill.id || "N/A"}
                                                </strong>
                                            </td>

                                            <td>
                                                {bill.patient_name || "N/A"}
                                            </td>

                                            <td>
                                                {bill.test_name || "N/A"}
                                            </td>

                                            <td>
                                                ₹{bill.amount || "0.00"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        bill.status ===
                                                        "PAID"
                                                            ? "status-completed"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    {bill.status || "PENDING"}
                                                </span>
                                            </td>

                                            <td>
                                                {bill.created_at
                                                    ? new Date(
                                                          bill.created_at
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Billing;