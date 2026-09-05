import { useEffect, useState } from "react";
import {
    Receipt,
    Search,
    CheckCircle,
    Clock,
    IndianRupee,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistBills,
    payPharmacistBill,
} from "../../services/pharmacistApi";


function Bills() {
    const [bills, setBills] = useState([]);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ==========================================
    // LOAD BILLS
    // ==========================================

    useEffect(() => {
        loadBills();
    }, []);


    const loadBills = async () => {
        setLoading(true);
        setError("");

        try {
            const response =
                await getPharmacistBills();

            setBills(response.data || []);

        } catch (err) {
            console.error(
                "Bills loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load pharmacy bills."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // PAY BILL
    // ==========================================

    const handlePayment = async (bill) => {

        if (bill.payment_status === "PAID") {
            return;
        }

        const confirmed = window.confirm(
            `Mark bill ${bill.bill_id} as paid?`
        );

        if (!confirmed) {
            return;
        }

        setPaying(true);
        setError("");
        setSuccess("");

        try {
            const response =
                await payPharmacistBill(
                    bill.bill_id
                );

            const updatedBill =
                response.data;

            setBills((currentBills) =>
                currentBills.map(
                    (currentBill) =>
                        currentBill.bill_id ===
                        updatedBill.bill_id
                            ? updatedBill
                            : currentBill
                )
            );

            setSuccess(
                `Bill ${bill.bill_id} has been marked as paid.`
            );

        } catch (err) {
            console.error(
                "Payment error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to complete payment."
            );

        } finally {
            setPaying(false);
        }
    };


    // ==========================================
    // SEARCH + FILTER
    // ==========================================

    const filteredBills = bills.filter(
        (bill) => {

            const searchText =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                bill.bill_id
                    ?.toLowerCase()
                    .includes(searchText) ||
                bill.patient_id
                    ?.toLowerCase()
                    .includes(searchText) ||
                bill.patient_name
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesFilter =
                filter === "ALL" ||
                bill.payment_status === filter;

            return (
                matchesSearch &&
                matchesFilter
            );
        }
    );


    // ==========================================
    // COUNTS
    // ==========================================

    const totalBills = bills.length;

    const pendingBills =
        bills.filter(
            (bill) =>
                bill.payment_status === "PENDING"
        ).length;

    const paidBills =
        bills.filter(
            (bill) =>
                bill.payment_status === "PAID"
        ).length;


    return (
        <PharmacistLayout
            title="Pharmacy Bills"
            subtitle="View and manage medicine billing"
        >

            {/* =====================================
                STAT CARDS
            ====================================== */}

            <div className="pharmacist-stats-grid">

                <div className="pharmacist-stat-card">

                    <div className="pharmacist-stat-icon">
                        <Receipt size={22} />
                    </div>

                    <div className="pharmacist-stat-content">

                        <span>
                            Total Bills
                        </span>

                        <strong>
                            {totalBills}
                        </strong>

                    </div>

                </div>


                <div className="pharmacist-stat-card">

                    <div className="pharmacist-stat-icon">
                        <Clock size={22} />
                    </div>

                    <div className="pharmacist-stat-content">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingBills}
                        </strong>

                    </div>

                </div>


                <div className="pharmacist-stat-card">

                    <div className="pharmacist-stat-icon">
                        <CheckCircle size={22} />
                    </div>

                    <div className="pharmacist-stat-content">

                        <span>
                            Paid
                        </span>

                        <strong>
                            {paidBills}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =====================================
                MESSAGES
            ====================================== */}

            {error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {success && (
                <div className="pharmacist-success">
                    {success}
                </div>
            )}


            {/* =====================================
                TOOLBAR
            ====================================== */}

            <div className="pharmacist-toolbar">

                <div className="pharmacist-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search bill, patient ID or patient name..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <div className="pharmacist-filter-group">

                    <button
                        type="button"
                        className={
                            filter === "ALL"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setFilter("ALL")
                        }
                    >
                        All
                    </button>


                    <button
                        type="button"
                        className={
                            filter === "PENDING"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setFilter("PENDING")
                        }
                    >
                        Pending
                    </button>


                    <button
                        type="button"
                        className={
                            filter === "PAID"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setFilter("PAID")
                        }
                    >
                        Paid
                    </button>

                </div>

            </div>


            {/* =====================================
                BILLS TABLE
            ====================================== */}

            <div className="pharmacist-card">

                {loading ? (

                    <div className="pharmacist-loading">
                        Loading bills...
                    </div>

                ) : (

                    <div className="pharmacist-table-wrapper">

                        <table className="pharmacist-table">

                            <thead>

                                <tr>
                                    <th>Bill ID</th>
                                    <th>Patient</th>
                                    <th>Patient ID</th>
                                    <th>Appointment</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredBills.map(
                                    (bill) => (

                                        <tr
                                            key={
                                                bill.id ||
                                                bill.bill_id
                                            }
                                        >

                                            {/* Bill ID */}

                                            <td>

                                                <strong>
                                                    {
                                                        bill.bill_id
                                                    }
                                                </strong>

                                            </td>


                                            {/* Patient */}

                                            <td>
                                                {
                                                    bill.patient_name ||
                                                    "-"
                                                }
                                            </td>


                                            {/* Patient ID */}

                                            <td>
                                                {
                                                    bill.patient_id ||
                                                    "-"
                                                }
                                            </td>


                                            {/* Appointment */}

                                            <td>
                                                {
                                                    bill.appointment ||
                                                    "-"
                                                }
                                            </td>


                                            {/* Amount */}

                                            <td>

                                                <div className="pharmacist-amount">

                                                    <IndianRupee
                                                        size={14}
                                                    />

                                                    <strong>
                                                        {
                                                            Number(
                                                                bill.total_amount ||
                                                                0
                                                            ).toFixed(
                                                                2
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            {/* Date */}

                                            <td>
                                                {
                                                    bill.created_at
                                                        ? new Date(
                                                            bill.created_at
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }
                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={`pharmacist-status-badge ${
                                                        bill.payment_status ===
                                                        "PAID"
                                                            ? "paid"
                                                            : "pending"
                                                    }`}
                                                >

                                                    {bill.payment_status ===
                                                    "PAID" ? (
                                                        <>
                                                            <CheckCircle
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            Paid
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            Pending
                                                        </>
                                                    )}

                                                </span>

                                            </td>


                                            {/* Action */}

                                            <td>

                                                {bill.payment_status ===
                                                "PAID" ? (

                                                    <span className="pharmacist-paid-label">

                                                        <CheckCircle
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        Paid

                                                    </span>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        className="pharmacist-primary-button pharmacist-small-button"
                                                        onClick={() =>
                                                            handlePayment(
                                                                bill
                                                            )
                                                        }
                                                        disabled={
                                                            paying
                                                        }
                                                    >

                                                        <CheckCircle
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        {paying
                                                            ? "Processing..."
                                                            : "Mark Paid"}

                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}


                                {/* EMPTY */}

                                {filteredBills.length ===
                                    0 && (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="pharmacist-empty"
                                        >

                                            <Receipt
                                                size={30}
                                            />

                                            <span>
                                                No bills found.
                                            </span>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </PharmacistLayout>
    );
}


export default Bills;