import { useEffect, useState } from "react";
import {
    BarChart3,
    CalendarDays,
    IndianRupee,
    Receipt,
    TrendingUp,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getSalesReport,
} from "../../services/pharmacistApi";


function SalesReports() {
    const [period, setPeriod] = useState("daily");

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // LOAD REPORT
    // ==========================================

    useEffect(() => {
        loadReport();
    }, [period]);


    const loadReport = async () => {
        setLoading(true);
        setError("");

        try {
            const response =
                await getSalesReport(period);

            setReport(
                response.data || null
            );

        } catch (err) {
            console.error(
                "Sales report loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load sales report."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // SAFE VALUES
    // ==========================================

    const totalSales = Number(
        report?.total_sales ?? 0
    );


    const totalDispensed = Number(
        report?.total_items_sold ?? 0
    );


    const records = report?.records || [];


    // Number of dispensing records.
    // This represents the number of medicine
    // dispensing transactions in the selected period.
    const totalBills = records.length;


    return (
        <PharmacistLayout
            title="Sales Reports"
            subtitle="View pharmacy sales and dispensing statistics"
        >

            {/* =====================================
                PERIOD FILTER
            ====================================== */}

            <div className="pharmacist-toolbar">

                <div className="pharmacist-filter-title">

                    <CalendarDays size={18} />

                    <span>
                        Report Period
                    </span>

                </div>


                <div className="pharmacist-filter-group">

                    <button
                        type="button"
                        className={
                            period === "daily"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setPeriod("daily")
                        }
                    >
                        Daily
                    </button>


                    <button
                        type="button"
                        className={
                            period === "weekly"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setPeriod("weekly")
                        }
                    >
                        Weekly
                    </button>


                    <button
                        type="button"
                        className={
                            period === "monthly"
                                ? "pharmacist-filter-button active"
                                : "pharmacist-filter-button"
                        }
                        onClick={() =>
                            setPeriod("monthly")
                        }
                    >
                        Monthly
                    </button>

                </div>

            </div>


            {/* =====================================
                ERROR
            ====================================== */}

            {error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {/* =====================================
                LOADING
            ====================================== */}

            {loading ? (

                <div className="pharmacist-card">

                    <div className="pharmacist-loading">
                        Loading sales report...
                    </div>

                </div>

            ) : (

                <>

                    {/* =================================
                        STAT CARDS
                    ================================== */}

                    <div className="pharmacist-stats-grid">

                        {/* Total Sales */}

                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <IndianRupee size={22} />
                            </div>

                            <div className="pharmacist-stat-content">

                                <span>
                                    Total Sales
                                </span>

                                <strong>
                                    ₹
                                    {totalSales.toFixed(2)}
                                </strong>

                            </div>

                        </div>


                        {/* Bills / Transactions */}

                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <Receipt size={22} />
                            </div>

                            <div className="pharmacist-stat-content">

                                <span>
                                    Sales Transactions
                                </span>

                                <strong>
                                    {totalBills}
                                </strong>

                            </div>

                        </div>


                        {/* Dispensed */}

                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <TrendingUp size={22} />
                            </div>

                            <div className="pharmacist-stat-content">

                                <span>
                                    Medicines Dispensed
                                </span>

                                <strong>
                                    {totalDispensed}
                                </strong>

                            </div>

                        </div>


                        {/* Period */}

                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <BarChart3 size={22} />
                            </div>

                            <div className="pharmacist-stat-content">

                                <span>
                                    Selected Period
                                </span>

                                <strong
                                    style={{
                                        textTransform:
                                            "capitalize",
                                    }}
                                >
                                    {period}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        REPORT SUMMARY
                    ================================== */}

                    <div className="pharmacist-card">

                        <div className="pharmacist-card-header">

                            <div>

                                <h2>
                                    {period === "daily"
                                        ? "Daily Sales Report"
                                        : period === "weekly"
                                        ? "Weekly Sales Report"
                                        : "Monthly Sales Report"}
                                </h2>

                                <p>
                                    Pharmacy sales information
                                    for the selected period
                                </p>

                            </div>

                            <BarChart3 size={21} />

                        </div>


                        {report ? (

                            <div className="pharmacist-report-grid">

                                {/* Total Sales */}

                                <div className="pharmacist-report-item">

                                    <div className="pharmacist-report-icon">

                                        <IndianRupee
                                            size={19}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Total Sales
                                        </span>

                                        <strong>
                                            ₹
                                            {totalSales.toFixed(
                                                2
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* Transactions */}

                                <div className="pharmacist-report-item">

                                    <div className="pharmacist-report-icon">

                                        <Receipt
                                            size={19}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Sales Transactions
                                        </span>

                                        <strong>
                                            {totalBills}
                                        </strong>

                                    </div>

                                </div>


                                {/* Dispensing */}

                                <div className="pharmacist-report-item">

                                    <div className="pharmacist-report-icon">

                                        <TrendingUp
                                            size={19}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Medicines Dispensed
                                        </span>

                                        <strong>
                                            {totalDispensed}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        ) : (

                            <div className="pharmacist-empty">

                                <BarChart3
                                    size={30}
                                />

                                <span>
                                    No sales data available
                                    for this period.
                                </span>

                            </div>

                        )}

                    </div>


                    {/* =================================
                        SALES DETAILS
                    ================================== */}

                    <div className="pharmacist-card">

                        <div className="pharmacist-card-header">

                            <div>

                                <h2>
                                    Sales Details
                                </h2>

                                <p>
                                    Detailed medicine dispensing
                                    records for the selected period
                                </p>

                            </div>

                            <Receipt size={21} />

                        </div>


                        {records.length === 0 ? (

                            <div className="pharmacist-empty">

                                <BarChart3
                                    size={30}
                                />

                                <span>
                                    No sales data available
                                    for this period.
                                </span>

                            </div>

                        ) : (

                            <div className="pharmacist-table-wrapper">

                                <table className="pharmacist-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Dispensing ID
                                            </th>

                                            <th>
                                                Medicine
                                            </th>

                                            <th>
                                                Patient
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Unit Price
                                            </th>

                                            <th>
                                                Total
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {records.map(
                                            (item, index) => (

                                                <tr
                                                    key={
                                                        item.dispensing_id ||
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    {/* Date */}

                                                    <td>

                                                        {item.dispensed_at
                                                            ? new Date(
                                                                item.dispensed_at
                                                            ).toLocaleString()
                                                            : "-"}

                                                    </td>


                                                    {/* Dispensing ID */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                item.dispensing_id ||
                                                                "-"
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* Medicine */}

                                                    <td>

                                                        {
                                                            item.medicine ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* Patient */}

                                                    <td>

                                                        {
                                                            item.patient ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* Quantity */}

                                                    <td>

                                                        {
                                                            item.quantity ??
                                                            0
                                                        }

                                                    </td>


                                                    {/* Unit Price */}

                                                    <td>

                                                        ₹
                                                        {Number(
                                                            item.unit_price ??
                                                            0
                                                        ).toFixed(2)}

                                                    </td>


                                                    {/* Total */}

                                                    <td>

                                                        <strong>

                                                            ₹
                                                            {Number(
                                                                item.total_price ??
                                                                0
                                                            ).toFixed(2)}

                                                        </strong>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>

            )}

        </PharmacistLayout>
    );
}


export default SalesReports;