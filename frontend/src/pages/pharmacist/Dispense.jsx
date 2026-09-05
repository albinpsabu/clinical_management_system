import { useEffect, useState } from "react";

import {
    Pill,
    User,
    CalendarDays,
    Package,
    Calculator,
    CheckCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getAppointmentPrescriptions,
    dispenseMedicine,
} from "../../services/pharmacistApi";


function Dispense() {
    const navigate = useNavigate();
    const { prescriptionId } = useParams();

    const [prescription, setPrescription] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ============================================================
    // LOAD PRESCRIPTION
    // ============================================================

    useEffect(() => {
        loadPrescription();
    }, [prescriptionId]);


    const loadPrescription = async () => {
        setLoading(true);
        setError("");

        try {
            const storedAppointmentId =
                sessionStorage.getItem(
                    "pharmacist_appointment_id"
                );

            if (!storedAppointmentId) {
                setError(
                    "Appointment information is missing. Please select the prescription again."
                );

                setLoading(false);
                return;
            }

            const response =
                await getAppointmentPrescriptions(
                    storedAppointmentId
                );

            const prescriptions =
                response.data || [];

            const foundPrescription =
                prescriptions.find(
                    (item) =>
                        String(item.id) ===
                        String(prescriptionId)
                );

            if (!foundPrescription) {
                setError("Prescription not found.");
                setLoading(false);
                return;
            }

            setPrescription(foundPrescription);

            // ====================================================
            // CHECK WHETHER ALREADY DISPENSED
            // ====================================================

            const alreadyDispensed =
                foundPrescription.is_dispensed === true ||
                foundPrescription.dispensing_status ===
                    "DISPENSED";

            if (alreadyDispensed) {
                setError(
                    "This prescription has already been dispensed."
                );
            }

            setQuantity(1);

        } catch (err) {
            console.error(
                "Prescription loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load prescription."
            );

        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // CALCULATE TOTAL
    // ============================================================

    const totalPrice =
        prescription
            ? Number(
                prescription.price_per_unit || 0
            ) * Number(quantity || 0)
            : 0;


    // ============================================================
    // HANDLE QUANTITY
    // ============================================================

    const handleQuantityChange = (e) => {
        const value = e.target.value;

        if (value === "") {
            setQuantity("");
            return;
        }

        const numberValue = Number(value);

        if (numberValue >= 1) {
            setQuantity(numberValue);
        }
    };


    // ============================================================
    // DISPENSE MEDICINE
    // ============================================================

    const handleDispense = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!prescription) {
            setError(
                "Prescription information is missing."
            );
            return;
        }

        // ========================================================
        // PREVENT DUPLICATE DISPENSING
        // ========================================================

        const alreadyDispensed =
            prescription.is_dispensed === true ||
            prescription.dispensing_status ===
                "DISPENSED";

        if (alreadyDispensed) {
            setError(
                "This prescription has already been dispensed."
            );
            return;
        }

        // ========================================================
        // VALIDATE QUANTITY
        // ========================================================

        if (
            quantity === "" ||
            Number(quantity) < 1
        ) {
            setError(
                "Quantity must be at least 1."
            );
            return;
        }

        const availableStock =
            Number(
                prescription.stock_quantity || 0
            );

        if (
            Number(quantity) >
            availableStock
        ) {
            setError(
                `Only ${availableStock} units are currently available in stock.`
            );
            return;
        }

        setSaving(true);

        try {
            const response =
                await dispenseMedicine({
                    prescription:
                        prescription.id,

                    quantity:
                        Number(quantity),
                });

            console.log(
                "Dispensing response:",
                response.data
            );

            setSuccess(
                "Medicine dispensed successfully. Bill created."
            );

            // ====================================================
            // MARK LOCALLY AS DISPENSED
            // ====================================================

            setPrescription(
                (previous) => ({
                    ...previous,

                    is_dispensed: true,

                    dispensing_status:
                        "DISPENSED",
                })
            );

            // ====================================================
            // GO TO BILLS
            // ====================================================

            setTimeout(() => {
                navigate(
                    "/pharmacist/bills"
                );
            }, 1200);

        } catch (err) {
            console.error(
                "Dispensing error:",
                err
            );

            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Unable to dispense medicine."
            );

        } finally {
            setSaving(false);
        }
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <PharmacistLayout
            title="Dispense Medicine"
            subtitle="Dispense medicine according to the doctor's prescription"
        >

            {/* ====================================================
                LOADING
            ==================================================== */}

            {loading && (
                <div className="pharmacist-loading">
                    Loading prescription...
                </div>
            )}


            {/* ====================================================
                ERROR
            ==================================================== */}

            {!loading && error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {/* ====================================================
                PRESCRIPTION
            ==================================================== */}

            {!loading && prescription && (

                <div className="pharmacist-dispense-grid">

                    {/* ==================================================
                        PRESCRIPTION DETAILS
                    ================================================== */}

                    <div className="pharmacist-card">

                        <div className="pharmacist-card-header">

                            <div>
                                <h2>
                                    Prescription Details
                                </h2>

                                <p>
                                    Review the doctor's prescription
                                </p>
                            </div>

                            <Pill size={21} />

                        </div>


                        {/* ==================================================
                            MEDICINE
                        ================================================== */}

                        <div className="pharmacist-dispense-medicine">

                            <div className="pharmacist-dispense-medicine-icon">
                                <Pill size={25} />
                            </div>

                            <div className="pharmacist-medicine-heading">

                                <strong>
                                    {prescription.medicine_name}
                                </strong>

                                <span>
                                    {prescription.medicine_code}
                                </span>

                            </div>

                        </div>


                        {/* ==================================================
                            PATIENT / APPOINTMENT / STOCK
                        ================================================== */}

                        <div className="pharmacist-detail-grid">

                            {/* Patient */}

                            <div className="pharmacist-detail-item">

                                <User size={18} />

                                <div className="pharmacist-detail-content">

                                    <span className="pharmacist-detail-label">
                                        Patient
                                    </span>

                                    <strong className="pharmacist-detail-value">
                                        {prescription.patient_name}
                                    </strong>

                                </div>

                            </div>


                            {/* Appointment */}

                            <div className="pharmacist-detail-item">

                                <CalendarDays size={18} />

                                <div className="pharmacist-detail-content">

                                    <span className="pharmacist-detail-label">
                                        Appointment
                                    </span>

                                    <strong className="pharmacist-detail-value">
                                        {prescription.appointment_id}
                                    </strong>

                                </div>

                            </div>


                            {/* Available Stock */}

                            <div className="pharmacist-detail-item">

                                <Package size={18} />

                                <div className="pharmacist-detail-content">

                                    <span className="pharmacist-detail-label">
                                        Available Stock
                                    </span>

                                    <strong className="pharmacist-detail-value">
                                        {prescription.stock_quantity}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            PRESCRIPTION INFORMATION
                        ================================================== */}

                        <div className="pharmacist-prescription-details">

                            {/* Dosage */}

                            <div className="pharmacist-prescription-detail-item">

                                <span className="pharmacist-prescription-detail-label">
                                    Dosage
                                </span>

                                <strong className="pharmacist-prescription-detail-value">
                                    {prescription.dosage}
                                </strong>

                            </div>


                            {/* Frequency */}

                            <div className="pharmacist-prescription-detail-item">

                                <span className="pharmacist-prescription-detail-label">
                                    Frequency
                                </span>

                                <strong className="pharmacist-prescription-detail-value">
                                    {prescription.frequency}
                                </strong>

                            </div>


                            {/* Duration */}

                            <div className="pharmacist-prescription-detail-item">

                                <span className="pharmacist-prescription-detail-label">
                                    Duration
                                </span>

                                <strong className="pharmacist-prescription-detail-value">
                                    {prescription.duration}
                                </strong>

                            </div>


                            {/* Route */}

                            <div className="pharmacist-prescription-detail-item">

                                <span className="pharmacist-prescription-detail-label">
                                    Route
                                </span>

                                <strong className="pharmacist-prescription-detail-value">
                                    {prescription.route || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* ==================================================
                            INSTRUCTIONS
                        ================================================== */}

                        {prescription.instructions && (

                            <div className="pharmacist-instructions">

                                <span className="pharmacist-instructions-label">
                                    Instructions
                                </span>

                                <p className="pharmacist-instructions-text">
                                    {prescription.instructions}
                                </p>

                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        DISPENSING FORM
                    ================================================== */}

                    <div className="pharmacist-card">

                        <div className="pharmacist-card-header">

                            <div>
                                <h2>
                                    Dispensing
                                </h2>

                                <p>
                                    Enter the quantity to dispense
                                </p>
                            </div>

                            <Calculator size={21} />

                        </div>


                        {/* ==================================================
                            ALREADY DISPENSED
                        ================================================== */}

                        {
                            (
                                prescription.is_dispensed === true ||
                                prescription.dispensing_status ===
                                    "DISPENSED"
                            ) ? (

                                <div className="pharmacist-success">

                                    <CheckCircle size={20} />

                                    <div>

                                        <strong>
                                            Medicine Already Dispensed
                                        </strong>

                                        <p>
                                            This prescription has already been dispensed and cannot be dispensed again.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <form
                                    onSubmit={handleDispense}
                                    className="pharmacist-dispensing-form"
                                >

                                    {/* ==================================================
                                        QUANTITY
                                    ================================================== */}

                                    <div className="pharmacist-form-group">

                                        <label htmlFor="quantity">
                                            Quantity
                                        </label>

                                        <input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            max={
                                                prescription.stock_quantity
                                            }
                                            value={quantity}
                                            onChange={
                                                handleQuantityChange
                                            }
                                            required
                                        />

                                        <small>
                                            Available stock:{" "}
                                            {prescription.stock_quantity}
                                        </small>

                                    </div>


                                    {/* ==================================================
                                        UNIT PRICE
                                    ================================================== */}

                                    <div className="pharmacist-price-row">

                                        <span>
                                            Price per unit
                                        </span>

                                        <strong>
                                            ₹
                                            {Number(
                                                prescription.price_per_unit ||
                                                    0
                                            ).toFixed(2)}
                                        </strong>

                                    </div>


                                    {/* ==================================================
                                        QUANTITY
                                    ================================================== */}

                                    <div className="pharmacist-price-row">

                                        <span>
                                            Quantity
                                        </span>

                                        <strong>
                                            {quantity || 0}
                                        </strong>

                                    </div>


                                    {/* ==================================================
                                        TOTAL
                                    ================================================== */}

                                    <div className="pharmacist-total-row">

                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>
                                            ₹
                                            {totalPrice.toFixed(2)}
                                        </strong>

                                    </div>


                                    {/* ==================================================
                                        ERROR
                                    ================================================== */}

                                    {error && (

                                        <div className="pharmacist-error">
                                            {error}
                                        </div>

                                    )}


                                    {/* ==================================================
                                        SUCCESS
                                    ================================================== */}

                                    {success && (

                                        <div className="pharmacist-success">

                                            <CheckCircle size={17} />

                                            {success}

                                        </div>

                                    )}


                                    {/* ==================================================
                                        BUTTONS
                                    ================================================== */}

                                    <div className="pharmacist-form-actions">

                                        <button
                                            type="button"
                                            className="pharmacist-secondary-button"
                                            onClick={() =>
                                                navigate(-1)
                                            }
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="submit"
                                            className="pharmacist-primary-button"
                                            disabled={
                                                saving ||
                                                quantity === "" ||
                                                Number(quantity) < 1 ||
                                                Number(quantity) >
                                                    Number(
                                                        prescription.stock_quantity
                                                    )
                                            }
                                        >

                                            <Package size={16} />

                                            {saving
                                                ? "Dispensing..."
                                                : "Dispense Medicine"}

                                        </button>

                                    </div>

                                </form>

                            )
                        }

                    </div>

                </div>

            )}

        </PharmacistLayout>
    );
}


export default Dispense;