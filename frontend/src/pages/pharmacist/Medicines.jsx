import { useEffect, useState } from "react";

import {
    Search,
    Package,
    Edit3,
    X,
    Save,
    CalendarDays,
    RefreshCw,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistMedicines,
    updateMedicineStock,
} from "../../services/pharmacistApi";


function Medicines() {

    // =========================================================
    // STATE
    // =========================================================

    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedMedicine, setSelectedMedicine] =
        useState(null);

    const [stockQuantity, setStockQuantity] =
        useState("");

    const [batchNumber, setBatchNumber] =
        useState("");

    const [expiryDate, setExpiryDate] =
        useState("");


    // =========================================================
    // LOAD MEDICINES
    // =========================================================

    useEffect(() => {
        loadMedicines();
    }, []);


    const loadMedicines = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await getPharmacistMedicines();

            setMedicines(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

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


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const value =
            String(date).split("T")[0];

        const parts =
            value.split("-");

        if (parts.length !== 3) {
            return date;
        }

        const parsedDate = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const openEditModal = (medicine) => {

        setSelectedMedicine(medicine);

        setStockQuantity(
            medicine.stock_quantity ?? ""
        );

        setBatchNumber(
            medicine.batch_number || ""
        );

        setExpiryDate(
            medicine.expiry_date
                ? String(
                    medicine.expiry_date
                ).split("T")[0]
                : ""
        );

        setError("");
        setSuccess("");

        setShowModal(true);
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

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
        setSuccess("");
    };


    // =========================================================
    // UPDATE STOCK
    // =========================================================

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


        if (!selectedMedicine) {

            setError(
                "Medicine information is missing."
            );

            return;
        }


        setSaving(true);


        try {

            /*
             * IMPORTANT:
             *
             * No medicine ID is generated here.
             *
             * The backend/database ID is only used
             * to identify the existing medicine.
             */

            const response =
                await updateMedicineStock(
                    selectedMedicine.id,
                    {
                        stock_quantity:
                            Number(stockQuantity),

                        batch_number:
                            batchNumber.trim(),

                        expiry_date:
                            expiryDate || null,
                    }
                );


            const updatedMedicine =
                response.data;


            setMedicines(
                (currentMedicines) =>
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

                setStockQuantity("");
                setBatchNumber("");
                setExpiryDate("");

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


    // =========================================================
    // SEARCH
    // =========================================================

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
                    .includes(searchText)

                ||

                medicine.medicine_id
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.generic_name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.medicine_type
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.manufacturer
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.batch_number
                    ?.toLowerCase()
                    .includes(searchText)
            );
        });


    // =========================================================
    // STOCK STATUS
    // =========================================================

    const getStockStatus = (quantity) => {

        const stock =
            Number(quantity);


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


    // =========================================================
    // UPDATE STOCK MODAL INLINE STYLES
    // These styles intentionally live here so the popup is not
    // affected by conflicting/duplicate global CSS rules.
    // =========================================================

    const stockModalStyles = {
        overlay: {
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "rgba(15, 23, 42, 0.52)",
            zIndex: 99999,
            overflowY: "auto",
            boxSizing: "border-box",
        },

        modal: {
            position: "relative",
            width: "100%",
            maxWidth: "560px",
            maxHeight: "calc(100vh - 48px)",
            margin: "auto",
            backgroundColor: "#ffffff",
            border: "1px solid #dbe3ec",
            borderRadius: "14px",
            boxShadow: "0 20px 55px rgba(15, 23, 42, 0.22)",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
        },

        header: {
            width: "100%",
            minHeight: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "16px 22px",
            borderBottom: "1px solid #e2e8f0",
            boxSizing: "border-box",
        },

        titleArea: {
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: "4px",
            margin: 0,
            padding: 0,
        },

        title: {
            margin: 0,
            color: "#102a43",
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: 1.25,
        },

        medicineName: {
            margin: 0,
            color: "#627d98",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.35,
        },

        close: {
            flex: "0 0 36px",
            width: "36px",
            height: "36px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
            padding: 0,
            border: "1px solid #d9e2ec",
            borderRadius: "7px",
            backgroundColor: "#ffffff",
            color: "#64748b",
            cursor: "pointer",
        },

        form: {
            width: "100%",
            margin: 0,
            padding: "18px 22px 0",
            boxSizing: "border-box",
        },

        medicineInfo: {
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            margin: 0,
            padding: "0 0 18px",
            boxSizing: "border-box",
        },

        infoRow: {
            minHeight: "66px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: "5px",
            padding: "12px 14px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxSizing: "border-box",
        },

        infoLabel: {
            margin: 0,
            color: "#64748b",
            fontSize: "11px",
            fontWeight: 600,
            lineHeight: 1.2,
            textTransform: "uppercase",
            letterSpacing: "0.35px",
        },

        infoValue: {
            margin: 0,
            color: "#102a43",
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: 1.3,
        },

        fields: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
        },

        field: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "7px",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
        },

        label: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            margin: 0,
            padding: 0,
            color: "#334e68",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1.3,
        },

        input: {
            width: "100%",
            height: "44px",
            minHeight: "44px",
            display: "block",
            margin: 0,
            padding: "0 12px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            color: "#243b53",
            fontFamily: "inherit",
            fontSize: "14px",
            lineHeight: "44px",
            outline: "none",
            boxSizing: "border-box",
        },

        dateWrapper: {
            width: "100%",
            position: "relative",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
        },

        message: {
            width: "100%",
            margin: "16px 0 0",
            padding: "10px 12px",
            borderRadius: "8px",
            boxSizing: "border-box",
            fontSize: "13px",
            lineHeight: 1.4,
        },

        actions: {
            width: "100%",
            minHeight: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            margin: "20px 0 0",
            padding: "14px 0 18px",
            borderTop: "1px solid #e2e8f0",
            boxSizing: "border-box",
        },

        cancel: {
            width: "125px",
            minWidth: "125px",
            height: "42px",
            minHeight: "42px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
            padding: "0 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "#334155",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1,
            cursor: "pointer",
            boxSizing: "border-box",
        },

        save: {
            width: "145px",
            minWidth: "145px",
            height: "42px",
            minHeight: "42px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            margin: 0,
            padding: "0 14px",
            border: "1px solid #2563eb",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1,
            cursor: "pointer",
            boxSizing: "border-box",
        },
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <PharmacistLayout
            title="Medicines"
            subtitle="Manage pharmacy inventory and stock"
        >

            {/* =================================================
                TOOLBAR
                ================================================= */}

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


                <div
                    className="pharmacist-toolbar-count"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >

                    <Package size={17} />

                    <span>
                        {filteredMedicines.length} medicines
                    </span>


                    <button
                        type="button"
                        className="pharmacist-action-button"
                        onClick={loadMedicines}
                        disabled={loading}
                        title="Refresh medicines"
                    >

                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "pharmacist-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
                ================================================= */}

            {success && !showModal && (

                <div className="pharmacist-success">

                    {success}

                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
                ================================================= */}

            {error && !showModal && (

                <div className="pharmacist-error">

                    {error}

                </div>
            )}


            {/* =================================================
                MEDICINE TABLE
                ================================================= */}

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

                                    <th>
                                        Medicine
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Manufacturer
                                    </th>

                                    <th>
                                        Batch
                                    </th>

                                    <th>
                                        Expiry
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

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

                                                {/* MEDICINE */}

                                                <td>

                                                    <div className="pharmacist-medicine-name">

                                                        <strong>
                                                            {
                                                                medicine.name ||
                                                                "-"
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


                                                {/* CODE */}

                                                <td>

                                                    {
                                                        medicine.medicine_id ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* TYPE */}

                                                <td>

                                                    {
                                                        medicine.medicine_type ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* MANUFACTURER */}

                                                <td>

                                                    {
                                                        medicine.manufacturer ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* BATCH */}

                                                <td>

                                                    {
                                                        medicine.batch_number ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* EXPIRY */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            medicine.expiry_date
                                                        )
                                                    }

                                                </td>


                                                {/* PRICE */}

                                                <td>

                                                    ₹
                                                    {Number(
                                                        medicine.price_per_unit ||
                                                        0
                                                    ).toFixed(2)}

                                                </td>


                                                {/* STOCK */}

                                                <td>

                                                    <strong>

                                                        {
                                                            medicine.stock_quantity ??
                                                            0
                                                        }

                                                    </strong>

                                                </td>


                                                {/* STATUS */}

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


                                                {/* ACTION */}

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
                                                            size={15}
                                                        />

                                                        Edit Stock

                                                    </button>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}


                                {/* EMPTY */}

                                {filteredMedicines.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="pharmacist-empty"
                                        >

                                            <Package size={30} />

                                            <span>
                                                No medicines found.
                                            </span>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                UPDATE STOCK MODAL
                ================================================= */}

            {showModal && selectedMedicine && (

                <div
                    className="stock-modal-overlay" style={stockModalStyles.overlay}

                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget &&
                            !saving
                        ) {

                            closeModal();
                        }

                    }}
                >

                    <div className="stock-modal" style={stockModalStyles.modal}>


                        {/* =================================================
                            MODAL HEADER
                            ================================================= */}

                        <div className="stock-modal-header" style={stockModalStyles.header}>

                            <div className="stock-modal-title-area" style={stockModalStyles.titleArea}>

                                <h2 style={stockModalStyles.title}>
                                    Update Stock
                                </h2>

                                <p style={stockModalStyles.medicineName}>
                                    {
                                        selectedMedicine.name
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="stock-modal-close" style={stockModalStyles.close}
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                            ================================================= */}

                        <form
                            className="stock-modal-form" style={stockModalStyles.form}
                            onSubmit={handleUpdateStock}
                        >


                            {/* =================================================
                                MEDICINE INFORMATION
                                ================================================= */}

                            <div className="stock-medicine-info" style={stockModalStyles.medicineInfo}>


                                <div className="stock-info-row" style={stockModalStyles.infoRow}>

                                    <span style={stockModalStyles.infoLabel}>
                                        Medicine Code
                                    </span>

                                    <strong style={stockModalStyles.infoValue}>
                                        {
                                            selectedMedicine.medicine_id ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div className="stock-info-row" style={stockModalStyles.infoRow}>

                                    <span style={stockModalStyles.infoLabel}>
                                        Price / Unit
                                    </span>

                                    <strong style={stockModalStyles.infoValue}>

                                        ₹
                                        {Number(
                                            selectedMedicine.price_per_unit ||
                                            0
                                        ).toFixed(2)}

                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                FORM FIELDS
                                ================================================= */}

                            <div className="stock-modal-fields" style={stockModalStyles.fields}>


                                {/* STOCK QUANTITY */}

                                <div className="stock-field" style={stockModalStyles.field}>

                                    <label
                                        htmlFor="stockQuantity"
                                        style={stockModalStyles.label}
                                    >

                                        Stock Quantity

                                    </label>


                                    <input
                                        id="stockQuantity"
                                        style={stockModalStyles.input}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={stockQuantity}
                                        onChange={(e) =>
                                            setStockQuantity(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                {/* BATCH NUMBER */}

                                <div className="stock-field" style={stockModalStyles.field}>

                                    <label
                                        htmlFor="batchNumber"
                                        style={stockModalStyles.label}
                                    >

                                        Batch Number

                                    </label>


                                    <input
                                        id="batchNumber"
                                        style={stockModalStyles.input}
                                        type="text"
                                        value={batchNumber}
                                        onChange={(e) =>
                                            setBatchNumber(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter batch number"
                                        maxLength="100"
                                    />

                                </div>


                                {/* EXPIRY DATE */}

                                <div className="stock-field" style={stockModalStyles.field}>

                                    <label
                                        htmlFor="expiryDate"
                                        style={stockModalStyles.label}
                                    >

                                        <CalendarDays
                                            size={15}
                                        />

                                        <span>
                                            Expiry Date
                                        </span>

                                    </label>


                                    <div className="stock-date-wrapper" style={stockModalStyles.dateWrapper}>

                                        <input
                                            id="expiryDate"
                                        style={stockModalStyles.input}
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) =>
                                                setExpiryDate(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                ERROR
                                ================================================= */}

                            {error && (

                                <div className="stock-modal-error" style={{ ...stockModalStyles.message, color: "#b42318", backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}>

                                    {error}

                                </div>

                            )}


                            {/* =================================================
                                SUCCESS
                                ================================================= */}

                            {success && (

                                <div className="stock-modal-success" style={{ ...stockModalStyles.message, color: "#166534", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>

                                    {success}

                                </div>

                            )}


                            {/* =================================================
                                ACTIONS
                                ================================================= */}

                            <div className="stock-modal-actions" style={stockModalStyles.actions}>


                                <button
                                    type="button"
                                    className="stock-cancel-button" style={stockModalStyles.cancel}
                                    onClick={closeModal}
                                    disabled={saving}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="stock-save-button" style={stockModalStyles.save}
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