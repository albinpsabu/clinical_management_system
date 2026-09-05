import { useEffect, useState } from "react";
import {
    Search,
    Package,
    Edit3,
    X,
    Save,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistMedicines,
    updateMedicineStock,
} from "../../services/pharmacistApi";


function Medicines() {
    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedMedicine, setSelectedMedicine] =
        useState(null);

    const [stockQuantity, setStockQuantity] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");


    // ==========================================
    // LOAD MEDICINES
    // ==========================================

    useEffect(() => {
        loadMedicines();
    }, []);


    const loadMedicines = async () => {
        setLoading(true);
        setError("");

        try {
            const response =
                await getPharmacistMedicines();

            setMedicines(response.data || []);

        } catch (err) {
            console.error(
                "Medicine loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load medicines."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // OPEN STOCK EDIT MODAL
    // ==========================================

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);

        setStockQuantity(
            medicine.stock_quantity ?? ""
        );

        setBatchNumber(
            medicine.batch_number || ""
        );

        setExpiryDate(
            medicine.expiry_date || ""
        );

        setError("");
        setSuccess("");

        setShowModal(true);
    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setSelectedMedicine(null);

        setStockQuantity("");
        setBatchNumber("");
        setExpiryDate("");

        setError("");
    };


    // ==========================================
    // UPDATE STOCK
    // ==========================================

    const handleUpdateStock = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            stockQuantity === "" ||
            Number(stockQuantity) < 0
        ) {
            setError(
                "Stock quantity cannot be negative."
            );
            return;
        }

        setSaving(true);

        try {
            const response =
                await updateMedicineStock(
                    selectedMedicine.id,
                    {
                        stock_quantity:
                            Number(stockQuantity),

                        batch_number:
                            batchNumber,

                        expiry_date:
                            expiryDate || null,
                    }
                );

            const updatedMedicine =
                response.data;

            setMedicines((currentMedicines) =>
                currentMedicines.map(
                    (medicine) =>
                        medicine.id ===
                        updatedMedicine.id
                            ? updatedMedicine
                            : medicine
                )
            );

            setSuccess(
                "Medicine stock updated successfully."
            );

            setTimeout(() => {
                setShowModal(false);
                setSelectedMedicine(null);
                setSuccess("");
            }, 1000);

        } catch (err) {
            console.error(
                "Stock update error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to update medicine stock."
            );

        } finally {
            setSaving(false);
        }
    };


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredMedicines =
        medicines.filter((medicine) => {

            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {
                return true;
            }

            return (
                medicine.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                medicine.medicine_id
                    ?.toLowerCase()
                    .includes(searchText) ||

                medicine.generic_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                medicine.medicine_type
                    ?.toLowerCase()
                    .includes(searchText)
            );
        });


    // ==========================================
    // STOCK STATUS
    // ==========================================

    const getStockStatus = (quantity) => {
        const stock = Number(quantity);

        if (stock === 0) {
            return {
                label: "Out of Stock",
                className:
                    "pharmacist-stock-badge out",
            };
        }

        if (stock <= 10) {
            return {
                label: "Low Stock",
                className:
                    "pharmacist-stock-badge low",
            };
        }

        return {
            label: "In Stock",
            className:
                "pharmacist-stock-badge good",
        };
    };


    return (
        <PharmacistLayout
            title="Medicines"
            subtitle="Manage pharmacy inventory and stock"
        >

            {/* =====================================
                TOOLBAR
            ====================================== */}

            <div className="pharmacist-toolbar">

                <div className="pharmacist-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search medicine..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="pharmacist-toolbar-count">

                    <Package size={17} />

                    <span>
                        {filteredMedicines.length} medicines
                    </span>

                </div>

            </div>


            {/* =====================================
                SUCCESS MESSAGE
            ====================================== */}

            {success && !showModal && (
                <div className="pharmacist-success">
                    {success}
                </div>
            )}


            {/* =====================================
                ERROR MESSAGE
            ====================================== */}

            {error && !showModal && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {/* =====================================
                MEDICINE TABLE
            ====================================== */}

            <div className="pharmacist-card">

                {loading ? (

                    <div className="pharmacist-loading">
                        Loading medicines...
                    </div>

                ) : (

                    <div className="pharmacist-table-wrapper">

                        <table className="pharmacist-table">

                            <thead>

                                <tr>
                                    <th>Medicine</th>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Manufacturer</th>
                                    <th>Batch</th>
                                    <th>Expiry</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredMedicines.map(
                                    (medicine) => {

                                        const stockStatus =
                                            getStockStatus(
                                                medicine.stock_quantity
                                            );

                                        return (
                                            <tr
                                                key={
                                                    medicine.id
                                                }
                                            >

                                                <td>
                                                    <div className="pharmacist-medicine-name">

                                                        <strong>
                                                            {
                                                                medicine.name
                                                            }
                                                        </strong>

                                                        {medicine.generic_name && (
                                                            <span>
                                                                {
                                                                    medicine.generic_name
                                                                }
                                                            </span>
                                                        )}

                                                    </div>
                                                </td>


                                                <td>
                                                    {
                                                        medicine.medicine_id
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        medicine.medicine_type
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        medicine.manufacturer ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        medicine.batch_number ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        medicine.expiry_date ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    ₹
                                                    {
                                                        Number(
                                                            medicine.price_per_unit
                                                        ).toFixed(
                                                            2
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    <strong>
                                                        {
                                                            medicine.stock_quantity
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    <span
                                                        className={
                                                            stockStatus.className
                                                        }
                                                    >
                                                        {
                                                            stockStatus.label
                                                        }
                                                    </span>
                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="pharmacist-action-button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                medicine
                                                            )
                                                        }
                                                    >
                                                        <Edit3
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        Edit Stock
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}


                                {!filteredMedicines.length && (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="pharmacist-empty"
                                        >
                                            No medicines found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================
                EDIT STOCK MODAL
            ====================================== */}

            {showModal && selectedMedicine && (

                <div className="pharmacist-modal-overlay">

                    <div className="pharmacist-modal">

                        {/* HEADER */}

                        <div className="pharmacist-modal-header">

                            <div>

                                <h2>
                                    Update Stock
                                </h2>

                                <p>
                                    {
                                        selectedMedicine.name
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="pharmacist-modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleUpdateStock
                            }
                        >

                            {/* Medicine information */}

                            <div className="pharmacist-modal-info">

                                <div>
                                    <span>
                                        Medicine Code
                                    </span>

                                    <strong>
                                        {
                                            selectedMedicine.medicine_id
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Price / Unit
                                    </span>

                                    <strong>
                                        ₹
                                        {
                                            Number(
                                                selectedMedicine.price_per_unit
                                            ).toFixed(
                                                2
                                            )
                                        }
                                    </strong>
                                </div>

                            </div>


                            {/* Stock */}

                            <div className="pharmacist-form-group">

                                <label>
                                    Stock Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        stockQuantity
                                    }
                                    onChange={(e) =>
                                        setStockQuantity(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* Batch */}

                            <div className="pharmacist-form-group">

                                <label>
                                    Batch Number
                                </label>

                                <input
                                    type="text"
                                    value={
                                        batchNumber
                                    }
                                    onChange={(e) =>
                                        setBatchNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter batch number"
                                />

                            </div>


                            {/* Expiry */}

                            <div className="pharmacist-form-group">

                                <label>
                                    Expiry Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        expiryDate
                                    }
                                    onChange={(e) =>
                                        setExpiryDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* Error */}

                            {error && (
                                <div className="pharmacist-error">
                                    {error}
                                </div>
                            )}


                            {/* Success */}

                            {success && (
                                <div className="pharmacist-success">
                                    {success}
                                </div>
                            )}


                            {/* ACTIONS */}

                            <div className="pharmacist-modal-actions">

                                <button
                                    type="button"
                                    className="pharmacist-secondary-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="pharmacist-primary-button"
                                    disabled={saving}
                                >

                                    <Save size={16} />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </PharmacistLayout>
    );
}


export default Medicines;