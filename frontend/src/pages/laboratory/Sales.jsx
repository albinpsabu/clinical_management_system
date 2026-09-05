import { useState } from "react";
import "../../styles/laboratory/laboratory.css";

function Sales() {
    const [sales] = useState([]);

    return (
        <div className="laboratory-page">
            <div className="laboratory-content">

                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>Laboratory Sales</h1>
                        <p>
                            View and manage laboratory test sales and transactions.
                        </p>
                    </div>
                </div>

                {/* Sales Card */}
                <div className="laboratory-card">

                    <div className="card-header">
                        <div>
                            <h2>Sales Transactions</h2>
                            <p>
                                Laboratory tests and services sold to patients
                            </p>
                        </div>

                        <span className="record-count">
                            {sales.length} Sales
                        </span>
                    </div>

                    {/* Sales Table */}
                    <div className="table-container">
                        <table className="laboratory-table">

                            <thead>
                                <tr>
                                    <th>Sale ID</th>
                                    <th>Patient</th>
                                    <th>Test</th>
                                    <th>Quantity</th>
                                    <th>Amount</th>
                                    <th>Payment Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sales.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="empty-table-message"
                                        >
                                            No sales transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.id}>

                                            <td>
                                                <strong>
                                                    {sale.id || "N/A"}
                                                </strong>
                                            </td>

                                            <td>
                                                {sale.patient_name || "N/A"}
                                            </td>

                                            <td>
                                                {sale.test_name || "N/A"}
                                            </td>

                                            <td>
                                                {sale.quantity || 0}
                                            </td>

                                            <td>
                                                ₹{sale.amount || "0.00"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        sale.payment_status ===
                                                        "PAID"
                                                            ? "status-completed"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    {sale.payment_status ||
                                                        "PENDING"}
                                                </span>
                                            </td>

                                            <td>
                                                {sale.created_at
                                                    ? new Date(
                                                          sale.created_at
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

export default Sales;