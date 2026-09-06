import { useEffect, useState } from "react";

import {
    getLabBills,
} from "../../services/laboratoryService";

import "../../styles/laboratory/laboratory.css";

function Billing() {
    const [bills, setBills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBills = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getLabBills();

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

            setBills(data);

        } catch (error) {
            console.error(
                "Error loading laboratory bills:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load laboratory bills."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBills();
    }, []);

    const totalAmount = bills.reduce(
        (total, bill) =>
            total +
            Number(
                bill.total_amount || 0
            ),
        0
    );

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="laboratory-page billing-page">

                <div className="laboratory-content">

                    <div className="loading-message">
                        Loading laboratory bills...
                    </div>

                </div>

            </div>
        );
    }

    /* =========================================================
       MAIN UI
    ========================================================= */

    return (
        <div className="laboratory-page billing-page">

            <div className="laboratory-content">

                {/* =================================================
                   PAGE HEADER
                ================================================= */}

                <div className="page-header">

                    <div>

                        <h1>
                            Laboratory Billing
                        </h1>

                        <p>
                            View bills generated for
                            completed laboratory tests.
                        </p>

                    </div>

                    <span className="record-count">
                        {bills.length} Bills
                    </span>

                </div>

                {/* =================================================
                   ERROR MESSAGE
                ================================================= */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* =================================================
                   BILLING CARD
                ================================================= */}

                <div className="laboratory-card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Laboratory Bills
                            </h2>

                            <p>
                                Bills generated after
                                laboratory test completion.
                            </p>

                        </div>

                        <span className="record-count">
                            Total ₹
                            {totalAmount.toFixed(2)}
                        </span>

                    </div>

                    {/* =================================================
                       TABLE
                    ================================================= */}

                    <div className="table-container">

                        <table className="laboratory-table">

                            <thead>

                                <tr>

                                    <th>
                                        Bill ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Request ID
                                    </th>

                                    <th>
                                        Test
                                    </th>

                                    <th>
                                        Test Charge
                                    </th>

                                    <th>
                                        Total Amount
                                    </th>

                                    <th>
                                        Payment Status
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {bills.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="empty-table-message"
                                        >
                                            No laboratory bills
                                            found.
                                        </td>

                                    </tr>

                                ) : (

                                    bills.map((bill) => (

                                        <tr
                                            key={bill.id}
                                        >

                                            {/* =========================
                                               BILL ID
                                            ========================= */}

                                            <td>

                                                <strong>
                                                    {
                                                        bill.bill_id
                                                    }
                                                </strong>

                                            </td>

                                            {/* =========================
                                               PATIENT
                                            ========================= */}

                                            <td>

                                                {
                                                    bill.patient_name ||
                                                    "N/A"
                                                }

                                            </td>

                                            {/* =========================
                                               REQUEST ID
                                            ========================= */}

                                            <td>

                                                {
                                                    bill.lab_request_id ||
                                                    "N/A"
                                                }

                                            </td>

                                            {/* =========================
                                               TEST
                                            ========================= */}

                                            <td>

                                                {
                                                    bill.test_name ||
                                                    "N/A"
                                                }

                                            </td>

                                            {/* =========================
                                               TEST CHARGE
                                            ========================= */}

                                            <td>

                                                ₹
                                                {Number(
                                                    bill.test_charge ||
                                                    0
                                                ).toFixed(2)}

                                            </td>

                                            {/* =========================
                                               TOTAL AMOUNT
                                            ========================= */}

                                            <td>

                                                <strong>

                                                    ₹
                                                    {Number(
                                                        bill.total_amount ||
                                                        0
                                                    ).toFixed(2)}

                                                </strong>

                                            </td>

                                            {/* =========================
                                               PAYMENT STATUS
                                            ========================= */}

                                            <td>

                                                <span
                                                    className={`status-badge ${
                                                        bill.payment_status ===
                                                        "PAID"
                                                            ? "status-completed"
                                                            : "status-pending"
                                                    }`}
                                                >

                                                    {
                                                        bill.payment_status ||
                                                        "PENDING"
                                                    }

                                                </span>

                                            </td>

                                            {/* =========================
                                               DATE
                                            ========================= */}

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