import { useEffect, useMemo, useState } from "react";
import {
    RefreshCw,
    Search,
    IndianRupee,
    CheckCircle2,
    Clock3,
    FileText,
    ReceiptText,
    AlertCircle,
    UserRound,
} from "lucide-react";

import ReceptionistLayout from "./ReceptionistLayout";
import api from "../../services/api";

function BillingHistory() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchValue, setSearchValue] = useState("");

    // =========================================
    // LOAD BILLING HISTORY
    // =========================================

    const loadBills = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/receptionist/billing/");

            setBills(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "Error loading billing history:",
                err.response?.data || err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to view billing history."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load billing history."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBills();
    }, []);

    // =========================================
    // SEARCH
    // =========================================

    const filteredBills = useMemo(() => {
        const value = searchValue.trim().toLowerCase();

        if (!value) {
            return bills;
        }

        return bills.filter((bill) => {
            return (
                bill.bill_id
                    ?.toLowerCase()
                    .includes(value) ||

                bill.patient_name
                    ?.toLowerCase()
                    .includes(value) ||

                String(bill.patient || "")
                    .toLowerCase()
                    .includes(value) ||

                String(bill.appointment || "")
                    .toLowerCase()
                    .includes(value)
            );
        });
    }, [bills, searchValue]);

    // =========================================
    // STATISTICS
    // =========================================

    const totalBills = bills.length;

    const paidBills = bills.filter(
        (bill) =>
            bill.payment_status === "COMPLETED"
    ).length;

    const pendingBills = bills.filter(
        (bill) =>
            bill.payment_status !== "COMPLETED"
    ).length;

    const totalRevenue = bills.reduce(
        (total, bill) => {
            if (
                bill.payment_status === "COMPLETED"
            ) {
                return (
                    total +
                    Number(
                        bill.total_amount || 0
                    )
                );
            }

            return total;
        },
        0
    );

    // =========================================
    // STATUS BADGE
    // =========================================

    const getStatusBadge = (status) => {
        if (status === "COMPLETED") {
            return (
                <span className="status-badge paid">
                    <CheckCircle2 size={14} />
                    PAID
                </span>
            );
        }

        return (
            <span className="status-badge pending">
                <Clock3 size={14} />
                PENDING
            </span>
        );
    };

    // =========================================
    // DATE FORMAT
    // =========================================

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =========================================
    // PAGE
    // =========================================

    return (
        <ReceptionistLayout
            title="Billing History"
            subtitle="View consultation bills, payment status and transaction details."
        >
            {/* PAGE HEADER */}

            <div className="billing-history-heading">
                <div>
                    <h2>Billing History</h2>

                    <p>
                        View all billing records and
                        payment information.
                    </p>
                </div>

                <button
                    className="billing-refresh-button"
                    onClick={loadBills}
                    disabled={loading}
                >
                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "billing-refresh-spin"
                                : ""
                        }
                    />

                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>

            {/* ERROR */}

            {error && (
                <div className="billing-history-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* STATISTICS */}

            <div className="billing-stats-grid">

                <div className="billing-stat-card">
                    <div className="billing-stat-icon blue">
                        <FileText size={20} />
                    </div>

                    <div>
                        <span>Total Bills</span>

                        <strong>
                            {totalBills}
                        </strong>
                    </div>
                </div>


                <div className="billing-stat-card">
                    <div className="billing-stat-icon green">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Paid Bills</span>

                        <strong>
                            {paidBills}
                        </strong>
                    </div>
                </div>


                <div className="billing-stat-card">
                    <div className="billing-stat-icon orange">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Pending Bills</span>

                        <strong>
                            {pendingBills}
                        </strong>
                    </div>
                </div>


                <div className="billing-stat-card">
                    <div className="billing-stat-icon purple">
                        <IndianRupee size={20} />
                    </div>

                    <div>
                        <span>Total Revenue</span>

                        <strong>
                            ₹{totalRevenue.toFixed(2)}
                        </strong>
                    </div>
                </div>

            </div>

            {/* BILL LIST */}

            <section className="billing-history-card">

                <div className="billing-history-card-header">

                    <div>
                        <h3>
                            Bill List
                        </h3>

                        <p>
                            {filteredBills.length}{" "}
                            {filteredBills.length === 1
                                ? "bill"
                                : "bills"}{" "}
                            found
                        </p>
                    </div>


                    <div className="billing-search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search bill, patient or appointment..."
                            value={searchValue}
                            onChange={(e) =>
                                setSearchValue(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* TABLE */}

                <div className="billing-history-table-wrapper">

                    {loading ? (

                        <div className="billing-history-loading">

                            <div className="billing-loading-spinner" />

                            <p>
                                Loading billing history...
                            </p>

                        </div>

                    ) : filteredBills.length === 0 ? (

                        <div className="billing-history-empty">

                            <div className="billing-empty-icon">
                                <ReceiptText size={28} />
                            </div>

                            <h4>
                                No Bills Found
                            </h4>

                            <p>
                                {searchValue
                                    ? "No bills match your search."
                                    : "No billing records are available yet."}
                            </p>

                        </div>

                    ) : (

                        <div className="billing-table-scroll">

                            <table className="billing-history-table">

                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Bill ID</th>
                                        <th>Patient</th>
                                        <th>Appointment</th>
                                        <th>Registration</th>
                                        <th>Consultation</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {filteredBills.map(
                                        (bill, index) => (

                                            <tr
                                                key={
                                                    bill.id ||
                                                    bill.bill_id
                                                }
                                            >

                                                {/* NUMBER */}

                                                <td>
                                                    <span className="billing-row-number">
                                                        {index + 1}
                                                    </span>
                                                </td>


                                                {/* BILL ID */}

                                                <td>
                                                    <strong className="billing-bill-id">
                                                        {bill.bill_id}
                                                    </strong>
                                                </td>


                                                {/* PATIENT */}

                                                <td>

                                                    <div className="billing-patient-cell">

                                                        <div className="billing-patient-icon">
                                                            <UserRound
                                                                size={15}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {bill.patient_name ||
                                                                    `Patient #${bill.patient}`}
                                                            </strong>

                                                            <span>
                                                                Patient #
                                                                {bill.patient}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* APPOINTMENT */}

                                                <td>
                                                    <span className="billing-appointment-id">
                                                        #
                                                        {bill.appointment}
                                                    </span>
                                                </td>


                                                {/* REGISTRATION */}

                                                <td>
                                                    ₹
                                                    {Number(
                                                        bill.registration_fee ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>


                                                {/* CONSULTATION */}

                                                <td>
                                                    ₹
                                                    {Number(
                                                        bill.consultation_fee ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>


                                                {/* TOTAL */}

                                                <td>
                                                    <strong className="billing-total-value">
                                                        ₹
                                                        {Number(
                                                            bill.total_amount ||
                                                            0
                                                        ).toFixed(2)}
                                                    </strong>
                                                </td>


                                                {/* STATUS */}

                                                <td>
                                                    {getStatusBadge(
                                                        bill.payment_status
                                                    )}
                                                </td>


                                                {/* CREATED */}

                                                <td>
                                                    <span className="billing-created-date">
                                                        {formatDateTime(
                                                            bill.created_at
                                                        )}
                                                    </span>
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </section>

        </ReceptionistLayout>
    );
}

export default BillingHistory;