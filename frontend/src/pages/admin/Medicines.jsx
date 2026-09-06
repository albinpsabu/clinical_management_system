import React, { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
} from "../../services/adminApi";

import "../../styles/admin.css";


const Medicines = () => {

    // ============================================================
    // STATE
    // ============================================================

    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        medicine_type: "",
        manufacturer: "",
        batch_number: "",
        manufacture_date: "",
        expiry_date: "",
        price_per_unit: "",
        stock_quantity: "",
    });


    // ============================================================
    // LOAD MEDICINES
    // ============================================================

    const loadMedicines = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getMedicines();

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            /*
             * Only Active medicines are shown in the active
             * medicine management list.
             *
             * If a used medicine is "deleted", the backend
             * changes its status to Inactive. Therefore it
             * disappears from this list while historical
             * records remain safe.
             */

            const activeMedicines = data.filter(
                (medicine) =>
                    !medicine.status ||
                    medicine.status === "Active"
            );

            setMedicines(activeMedicines);

        } catch (error) {

            console.error(
                "Medicines loading error:",
                error.response?.data || error
            );

            const responseData = error.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {

                setError(
                    responseData.detail ||
                    responseData.error ||
                    "Failed to load medicines."
                );

            } else {

                setError(
                    "Failed to load medicines."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadMedicines();

    }, []);


    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setForm({
            name: "",
            medicine_type: "",
            manufacturer: "",
            batch_number: "",
            manufacture_date: "",
            expiry_date: "",
            price_per_unit: "",
            stock_quantity: "",
        });

        setEditingId(null);

        setShowForm(false);

        setError("");

        setMessage("");
    };


    // ============================================================
    // ADD MEDICINE
    // ============================================================

    const handleAdd = () => {

        setForm({
            name: "",
            medicine_type: "",
            manufacturer: "",
            batch_number: "",
            manufacture_date: "",
            expiry_date: "",
            price_per_unit: "",
            stock_quantity: "",
        });

        setEditingId(null);

        setError("");

        setMessage("");

        setShowForm(true);
    };


    // ============================================================
    // EDIT MEDICINE
    // ============================================================

    const handleEdit = (medicine) => {

        setEditingId(medicine.id);

        setForm({
            name: medicine.name || "",

            medicine_type:
                medicine.medicine_type ||
                medicine.type ||
                "",

            manufacturer:
                medicine.manufacturer ||
                "",

            batch_number:
                medicine.batch_number ||
                medicine.batch_no ||
                "",

            manufacture_date:
                medicine.manufacture_date ||
                "",

            expiry_date:
                medicine.expiry_date ||
                "",

            price_per_unit:
                medicine.price_per_unit ??
                "",

            stock_quantity:
                medicine.stock_quantity ??
                medicine.stock_qty ??
                "",
        });

        setError("");

        setMessage("");

        setShowForm(true);
    };


    // ============================================================
    // SAVE MEDICINE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        setError("");

        setMessage("");

        try {

            /*
             * IMPORTANT:
             *
             * Backend model field is:
             *
             * medicine_type
             *
             * NOT:
             *
             * type
             *
             * medicine_id is NOT included because Django
             * generates it automatically.
             */

            const payload = {
                name: form.name.trim(),

                medicine_type:
                    form.medicine_type.trim(),

                manufacturer:
                    form.manufacturer.trim(),

                batch_number:
                    form.batch_number.trim(),

                manufacture_date:
                    form.manufacture_date || null,

                expiry_date:
                    form.expiry_date || null,

                price_per_unit:
                    form.price_per_unit,

                stock_quantity:
                    form.stock_quantity,
            };


            if (editingId) {

                await updateMedicine(
                    editingId,
                    payload
                );

                setMessage(
                    "Medicine updated successfully."
                );

            } else {

                await createMedicine(
                    payload
                );

                setMessage(
                    "Medicine created successfully."
                );
            }


            await loadMedicines();

            setShowForm(false);

            setEditingId(null);

            setForm({
                name: "",
                medicine_type: "",
                manufacturer: "",
                batch_number: "",
                manufacture_date: "",
                expiry_date: "",
                price_per_unit: "",
                stock_quantity: "",
            });

        } catch (error) {

            console.error(
                "Medicine save error:",
                error.response?.data || error
            );

            const responseData =
                error.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {

                const messageText =
                    Object.entries(responseData)
                        .map(([field, value]) => {

                            if (Array.isArray(value)) {

                                return `${field}: ${value.join(", ")}`;

                            }

                            return `${field}: ${value}`;
                        })
                        .join(" | ");

                setError(
                    messageText ||
                    "Failed to save medicine."
                );

            } else {

                setError(
                    "Failed to save medicine."
                );
            }

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // DELETE MEDICINE
    // ============================================================

    const handleDelete = async (id) => {

        const medicine =
            medicines.find(
                (item) => item.id === id
            );

        const medicineName =
            medicine?.name ||
            "this medicine";


        const confirmed = window.confirm(
            `Are you sure you want to delete ${medicineName}?`
        );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(id);

            setError("");

            setMessage("");


            /*
             * Backend behavior:
             *
             * 1. If medicine has no medical records:
             *    permanently deletes it.
             *
             * 2. If medicine is used in prescriptions or
             *    dispensing:
             *    changes status to Inactive.
             *
             * In both cases, it should no longer appear in
             * the Active Medicines list.
             */

            const response =
                await deleteMedicine(id);


            // ----------------------------------------------------
            // Remove immediately from current UI.
            // ----------------------------------------------------

            setMedicines((previous) =>
                previous.filter(
                    (item) => item.id !== id
                )
            );


            // ----------------------------------------------------
            // Show backend message if available.
            // ----------------------------------------------------

            const backendMessage =
                response?.data?.message;


            setMessage(
                backendMessage ||
                "Medicine removed successfully."
            );


            // ----------------------------------------------------
            // Reload to make sure frontend matches backend.
            // ----------------------------------------------------

            await loadMedicines();


        } catch (error) {

            console.error(
                "Medicine delete error:",
                error.response?.data || error
            );


            const responseData =
                error.response?.data;


            if (
                responseData &&
                typeof responseData === "object"
            ) {

                if (responseData.message) {

                    setError(
                        responseData.message
                    );

                } else if (responseData.detail) {

                    setError(
                        responseData.detail
                    );

                } else {

                    const messageText =
                        Object.entries(responseData)
                            .map(([field, value]) => {

                                if (Array.isArray(value)) {

                                    return `${field}: ${value.join(", ")}`;

                                }

                                return `${field}: ${value}`;
                            })
                            .join(" | ");

                    setError(
                        messageText ||
                        "Failed to delete medicine."
                    );
                }

            } else {

                setError(
                    "Failed to delete medicine."
                );
            }

        } finally {

            setDeletingId(null);
        }
    };


    // ============================================================
    // SEARCH
    // ============================================================

    const searchText =
        search.trim().toLowerCase();


    const filteredMedicines =
        medicines.filter((medicine) => {

            return (

                medicine.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.medicine_id
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.medicine_type
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                medicine.type
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


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="admin-page">


            {/* ====================================================
                PAGE HEADER
            ==================================================== */}

            <div className="admin-page-heading">

                <div>

                    <h1>
                        Medicines
                    </h1>

                    <p>
                        Manage medicine inventory and stock information.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-primary-button"
                    onClick={handleAdd}
                >

                    <Plus size={18} />

                    Add Medicine

                </button>

            </div>


            {/* ====================================================
                SUCCESS MESSAGE
            ==================================================== */}

            {message && (

                <div className="admin-success">

                    {message}

                </div>

            )}


            {/* ====================================================
                ERROR MESSAGE
            ==================================================== */}

            {error && (

                <div className="admin-error">

                    {error}

                </div>

            )}


            {/* ====================================================
                MEDICINE TABLE CARD
            ==================================================== */}

            <div className="admin-panel-card">


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="admin-table-toolbar">

                    <div className="admin-search-box">

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

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="admin-loading">

                        Loading medicines...

                    </div>

                ) : (


                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Medicine ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Manufacturer
                                    </th>

                                    <th>
                                        Batch No.
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Price / Unit
                                    </th>

                                    <th>
                                        Expiry Date
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                {filteredMedicines.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="admin-empty"
                                        >

                                            No active medicines found.

                                        </td>

                                    </tr>

                                ) : (


                                    filteredMedicines.map(
                                        (medicine, index) => (

                                            <tr
                                                key={medicine.id}
                                            >


                                                {/* NUMBER */}

                                                <td>

                                                    {index + 1}

                                                </td>


                                                {/* MEDICINE ID */}

                                                <td>

                                                    <strong>
                                                        {medicine.medicine_id}
                                                    </strong>

                                                </td>


                                                {/* NAME */}

                                                <td>

                                                    {medicine.name}

                                                </td>


                                                {/* TYPE */}

                                                <td>

                                                    {medicine.medicine_type ||
                                                        medicine.type ||
                                                        "-"}

                                                </td>


                                                {/* MANUFACTURER */}

                                                <td>

                                                    {medicine.manufacturer ||
                                                        "-"}

                                                </td>


                                                {/* BATCH */}

                                                <td>

                                                    {medicine.batch_number ||
                                                        medicine.batch_no ||
                                                        "-"}

                                                </td>


                                                {/* STOCK */}

                                                <td>

                                                    {medicine.stock_quantity ??
                                                        medicine.stock_qty ??
                                                        0}

                                                </td>


                                                {/* PRICE */}

                                                <td>

                                                    ₹
                                                    {medicine.price_per_unit ??
                                                        "0.00"}

                                                </td>


                                                {/* EXPIRY */}

                                                <td>

                                                    {medicine.expiry_date ||
                                                        "-"}

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="admin-action-buttons">


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            className="admin-icon-button edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    medicine
                                                                )
                                                            }
                                                            title="Edit"
                                                            disabled={
                                                                deletingId ===
                                                                medicine.id
                                                            }
                                                        >

                                                            <Pencil
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            className="admin-icon-button delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    medicine.id
                                                                )
                                                            }
                                                            title="Delete"
                                                            disabled={
                                                                deletingId ===
                                                                medicine.id
                                                            }
                                                        >

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        </button>


                                                    </div>

                                                </td>


                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ====================================================
                MEDICINE FORM MODAL
            ==================================================== */}

            {showForm && (

                <div className="admin-modal-overlay">


                    <div className="admin-modal">


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="admin-modal-header">

                            <div>

                                <h2>

                                    {editingId
                                        ? "Edit Medicine"
                                        : "Add Medicine"}

                                </h2>

                                <p>

                                    Enter medicine inventory information.

                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={resetForm}
                                disabled={saving}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="admin-form"
                            onSubmit={handleSubmit}
                        >


                            <div className="admin-form-grid">


                                {/* =================================================
                                    MEDICINE NAME
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Medicine Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter medicine name"
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    MEDICINE TYPE
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Medicine Type
                                    </label>

                                    <input
                                        type="text"
                                        name="medicine_type"
                                        value={form.medicine_type}
                                        onChange={handleChange}
                                        placeholder="Tablet / Capsule / Syrup"
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    MANUFACTURER
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Manufacturer
                                    </label>

                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={form.manufacturer}
                                        onChange={handleChange}
                                        placeholder="Enter manufacturer"
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    BATCH NUMBER
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Batch Number
                                    </label>

                                    <input
                                        type="text"
                                        name="batch_number"
                                        value={form.batch_number}
                                        onChange={handleChange}
                                        placeholder="Enter batch number"
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    MANUFACTURE DATE
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Manufacture Date
                                    </label>

                                    <input
                                        type="date"
                                        name="manufacture_date"
                                        value={form.manufacture_date}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    EXPIRY DATE
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Expiry Date
                                    </label>

                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={form.expiry_date}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    PRICE PER UNIT
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Price Per Unit
                                    </label>

                                    <input
                                        type="number"
                                        name="price_per_unit"
                                        value={form.price_per_unit}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    STOCK QUANTITY
                                ================================================= */}

                                <div className="admin-form-group">

                                    <label>
                                        Stock Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={form.stock_quantity}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="Enter quantity"
                                        required
                                    />

                                </div>


                            </div>


                            {/* =================================================
                                MODAL ACTIONS
                            ================================================= */}

                            <div className="admin-modal-actions">


                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Medicine"
                                            : "Create Medicine"}

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            )}

        </div>
    );
};


export default Medicines;