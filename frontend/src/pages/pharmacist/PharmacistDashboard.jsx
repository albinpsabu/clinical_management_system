import { useEffect, useState } from "react";
import {
    Package,
    Users,
    FileText,
    Receipt,
    AlertTriangle,
    Pill,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistMedicines,
    getPharmacistPatients,
    getPharmacistBills,
} from "../../services/pharmacistApi";


function PharmacistDashboard() {
    const [medicines, setMedicines] = useState([]);
    const [patients, setPatients] = useState([]);
    const [bills, setBills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                medicinesResponse,
                patientsResponse,
                billsResponse,
            ] = await Promise.all([
                getPharmacistMedicines(),
                getPharmacistPatients(),
                getPharmacistBills(),
            ]);

            setMedicines(
                medicinesResponse.data || []
            );

            setPatients(
                patientsResponse.data || []
            );

            setBills(
                billsResponse.data || []
            );

        } catch (err) {
            console.error("Dashboard loading error:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load dashboard data."
            );

        } finally {
            setLoading(false);
        }
    };


    const totalMedicines = medicines.length;

    const lowStockMedicines = medicines.filter(
        (medicine) =>
            Number(medicine.stock_quantity) > 0 &&
            Number(medicine.stock_quantity) <= 10
    ).length;

    const outOfStockMedicines = medicines.filter(
        (medicine) =>
            Number(medicine.stock_quantity) === 0
    ).length;

    const totalPatients = patients.length;

    const pendingBills = bills.filter(
        (bill) =>
            bill.payment_status === "PENDING"
    ).length;


    return (
        <PharmacistLayout
            title="Pharmacist Dashboard"
            subtitle="Overview of pharmacy operations and inventory"
        >

            {loading && (
                <div className="pharmacist-loading">
                    Loading dashboard...
                </div>
            )}


            {!loading && error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {!loading && !error && (
                <>

                    {/* =========================
                        STAT CARDS
                    ========================== */}

                    <div className="pharmacist-stats-grid">

                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <Pill size={22} />
                            </div>

                            <div className="pharmacist-stat-content">
                                <span>Total Medicines</span>
                                <strong>
                                    {totalMedicines}
                                </strong>
                            </div>

                        </div>


                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <Users size={22} />
                            </div>

                            <div className="pharmacist-stat-content">
                                <span>Total Patients</span>
                                <strong>
                                    {totalPatients}
                                </strong>
                            </div>

                        </div>


                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <AlertTriangle size={22} />
                            </div>

                            <div className="pharmacist-stat-content">
                                <span>Low Stock</span>
                                <strong>
                                    {lowStockMedicines}
                                </strong>
                            </div>

                        </div>


                        <div className="pharmacist-stat-card">

                            <div className="pharmacist-stat-icon">
                                <Receipt size={22} />
                            </div>

                            <div className="pharmacist-stat-content">
                                <span>Pending Bills</span>
                                <strong>
                                    {pendingBills}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* =========================
                        DASHBOARD CONTENT
                    ========================== */}

                    <div className="pharmacist-dashboard-grid">


                        {/* INVENTORY SUMMARY */}

                        <div className="pharmacist-card">

                            <div className="pharmacist-card-header">

                                <div>
                                    <h2>
                                        Inventory Summary
                                    </h2>

                                    <p>
                                        Current medicine stock status
                                    </p>
                                </div>

                                <Package size={21} />

                            </div>


                            <div className="pharmacist-summary-list">

                                <div className="pharmacist-summary-row">
                                    <span>
                                        Total medicines
                                    </span>

                                    <strong>
                                        {totalMedicines}
                                    </strong>
                                </div>


                                <div className="pharmacist-summary-row">
                                    <span>
                                        Low stock medicines
                                    </span>

                                    <strong>
                                        {lowStockMedicines}
                                    </strong>
                                </div>


                                <div className="pharmacist-summary-row">
                                    <span>
                                        Out of stock
                                    </span>

                                    <strong>
                                        {outOfStockMedicines}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* LOW STOCK MEDICINES */}

                        <div className="pharmacist-card">

                            <div className="pharmacist-card-header">

                                <div>
                                    <h2>
                                        Low Stock Medicines
                                    </h2>

                                    <p>
                                        Medicines requiring attention
                                    </p>
                                </div>

                                <AlertTriangle size={21} />

                            </div>


                            <div className="pharmacist-dashboard-table-wrapper">

                                <table className="pharmacist-table">

                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Code</th>
                                            <th>Stock</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {medicines
                                            .filter(
                                                (medicine) =>
                                                    Number(
                                                        medicine.stock_quantity
                                                    ) <= 10
                                            )
                                            .slice(0, 5)
                                            .map((medicine) => (

                                                <tr key={medicine.id}>

                                                    <td>
                                                        {medicine.name}
                                                    </td>

                                                    <td>
                                                        {medicine.medicine_id}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                Number(
                                                                    medicine.stock_quantity
                                                                ) === 0
                                                                    ? "pharmacist-stock-badge out"
                                                                    : "pharmacist-stock-badge low"
                                                            }
                                                        >
                                                            {
                                                                medicine.stock_quantity
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>

                                            ))}


                                        {medicines.filter(
                                            (medicine) =>
                                                Number(
                                                    medicine.stock_quantity
                                                ) <= 10
                                        ).length === 0 && (

                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="pharmacist-empty"
                                                >
                                                    All medicines have
                                                    sufficient stock.
                                                </td>
                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* BILL SUMMARY */}

                        <div className="pharmacist-card">

                            <div className="pharmacist-card-header">

                                <div>
                                    <h2>
                                        Billing Summary
                                    </h2>

                                    <p>
                                        Pharmacy payment status
                                    </p>
                                </div>

                                <FileText size={21} />

                            </div>


                            <div className="pharmacist-summary-list">

                                <div className="pharmacist-summary-row">
                                    <span>
                                        Total bills
                                    </span>

                                    <strong>
                                        {bills.length}
                                    </strong>
                                </div>


                                <div className="pharmacist-summary-row">
                                    <span>
                                        Pending bills
                                    </span>

                                    <strong>
                                        {pendingBills}
                                    </strong>
                                </div>


                                <div className="pharmacist-summary-row">
                                    <span>
                                        Paid bills
                                    </span>

                                    <strong>
                                        {
                                            bills.filter(
                                                (bill) =>
                                                    bill.payment_status ===
                                                    "PAID"
                                            ).length
                                        }
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </>

            )}

        </PharmacistLayout>
    );
}


export default PharmacistDashboard;