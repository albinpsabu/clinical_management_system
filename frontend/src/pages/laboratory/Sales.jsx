import { useEffect, useState } from "react";

import {
    getLabSales,
} from "../../services/laboratoryService";

function Sales() {
    const [sales, setSales] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSales = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getLabSales();

            setSales(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to load laboratory sales."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, []);

    const totalSales = sales.reduce(
        (sum, sale) =>
            sum +
            Number(
                sale.total_amount || 0
            ),
        0
    );

    const paidSales = sales
        .filter(
            (sale) =>
                sale.payment_status === "PAID"
        )
        .reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.total_amount || 0
                ),
            0
        );

    const pendingSales = totalSales - paidSales;

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="loading-state">
                    Loading sales...
                </div>
            </div>
        );
    }

    return (
        <div className="laboratory-page">

            <div className="page-header">

                <div>
                    <h1>
                        Laboratory Sales
                    </h1>

                    <p>
                        View laboratory billing transactions
                        and sales information.
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
                    <div className="stat-content">
                        <span>Total Sales</span>

                        <strong>
                            ₹{totalSales.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span>Paid Sales</span>

                        <strong>
                            ₹{paidSales.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span>Pending</span>

                        <strong>
                            ₹{pendingSales.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span>Transactions</span>

                        <strong>
                            {sales.length}
                        </strong>
                    </div>
                </div>

            </div>

            <div className="content-card">

                <div className="card-header">

                    <div>
                        <h2>
                            Sales Transactions
                        </h2>

                        <p>
                            Laboratory bills generated
                            for completed tests.
                        </p>
                    </div>

                </div>

                <div className="table-container">

                    <table className="laboratory-table">

                        <thead>
                            <tr>
                                <th>Bill ID</th>
                                <th>Patient</th>
                                <th>Request ID</th>
                                <th>Test</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>

                            {sales.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        No sales transactions found.
                                    </td>
                                </tr>

                            ) : (

                                sales.map((sale) => (

                                    <tr key={sale.id}>

                                        <td>
                                            <span className="request-id">
                                                {sale.bill_id}
                                            </span>
                                        </td>

                                        <td>
                                            {
                                                sale.patient_name ||
                                                "N/A"
                                            }
                                        </td>

                                        <td>
                                            {
                                                sale.lab_request_id ||
                                                "N/A"
                                            }
                                        </td>

                                        <td>
                                            {
                                                sale.test_name ||
                                                "N/A"
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                sale.total_amount || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <span
                                                className={`status ${
                                                    sale.payment_status ===
                                                    "PAID"
                                                        ? "completed"
                                                        : "pending"
                                                }`}
                                            >
                                                {
                                                    sale.payment_status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            {sale.created_at
                                                ? new Date(
                                                      sale.created_at
                                                  ).toLocaleDateString()
                                                : "—"}
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

export default Sales;