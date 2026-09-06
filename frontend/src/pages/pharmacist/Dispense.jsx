import { useEffect, useMemo, useState } from "react";

import {
    Pill,
    User,
    CalendarDays,
    Package,
    Calculator,
    CheckCircle,
    ArrowLeft,
    RefreshCw,
    IndianRupee,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getAppointmentPrescriptions,
    dispenseMedicine,
} from "../../services/pharmacistApi";


function Dispense() {
    const navigate = useNavigate();
    const { prescriptionId } = useParams();

    const [prescription, setPrescription] =
        useState(null);

    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ============================================================
    // LOAD PRESCRIPTION
    // ============================================================

    useEffect(() => {
        if (!prescriptionId) {
            setError(
                "Prescription ID is missing."
            );
            setLoading(false);
            return;
        }

        loadPrescription();
    }, [prescriptionId]);


    const loadPrescription = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

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
                Array.isArray(response.data)
                    ? response.data
                    : [];

            const foundPrescription =
                prescriptions.find(
                    (item) =>
                        String(item.id) ===
                        String(prescriptionId)
                );

            if (!foundPrescription) {
                setError(
                    "Prescription not found."
                );

                setLoading(false);
                return;
            }

            setPrescription(
                foundPrescription
            );

            setQuantity(1);

            // ----------------------------------------------------
            // CHECK ALREADY DISPENSED
            // ----------------------------------------------------

            const alreadyDispensed =
                foundPrescription.is_dispensed === true ||
                foundPrescription.dispensing_status ===
                    "DISPENSED";

            if (alreadyDispensed) {
                setError(
                    "This prescription has already been dispensed."
                );
            }

        } catch (err) {
            console.error(
                "Prescription loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to load prescription."
            );
        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // ALREADY DISPENSED
    // ============================================================

    const alreadyDispensed = useMemo(() => {
        if (!prescription) {
            return false;
        }

        return (
            prescription.is_dispensed === true ||
            prescription.dispensing_status ===
                "DISPENSED"
        );
    }, [prescription]);


    // ============================================================
    // STOCK
    // ============================================================

    const availableStock = Number(
        prescription?.stock_quantity || 0
    );


    // ============================================================
    // UNIT PRICE
    // ============================================================

    const unitPrice = Number(
        prescription?.price_per_unit || 0
    );


    // ============================================================
    // TOTAL
    // ============================================================

    const totalPrice =
        unitPrice *
        Number(quantity || 0);


    // ============================================================
    // QUANTITY CHANGE
    // ============================================================

    const handleQuantityChange = (e) => {
        const value = e.target.value;

        setError("");
        setSuccess("");

        if (value === "") {
            setQuantity("");
            return;
        }

        const numberValue = Number(value);

        if (
            Number.isInteger(numberValue) &&
            numberValue >= 1 &&
            numberValue <= availableStock
        ) {
            setQuantity(numberValue);
        }
    };


    // ============================================================
    // VALIDATE QUANTITY
    // ============================================================

    const validateQuantity = () => {
        if (
            quantity === "" ||
            quantity === null ||
            quantity === undefined
        ) {
            setError(
                "Please enter the quantity."
            );
            return false;
        }

        const numericQuantity =
            Number(quantity);

        if (
            !Number.isInteger(
                numericQuantity
            ) ||
            numericQuantity < 1
        ) {
            setError(
                "Quantity must be at least 1."
            );
            return false;
        }

        if (
            numericQuantity >
            availableStock
        ) {
            setError(
                `Only ${availableStock} units are currently available in stock.`
            );
            return false;
        }

        return true;
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

        // --------------------------------------------------------
        // PREVENT DUPLICATE DISPENSING
        // --------------------------------------------------------

        if (alreadyDispensed) {
            setError(
                "This prescription has already been dispensed."
            );
            return;
        }

        // --------------------------------------------------------
        // VALIDATE QUANTITY
        // --------------------------------------------------------

        if (!validateQuantity()) {
            return;
        }

        setSaving(true);

        try {
            /*
             * IMPORTANT:
             * No dispensing ID is generated here.
             *
             * The backend creates the dispensing/billing
             * record and its ID automatically.
             *
             * React sends only the fields required for
             * dispensing.
             */

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

            // ----------------------------------------------------
            // UPDATE LOCAL STATE
            // ----------------------------------------------------

            setPrescription(
                (previous) => ({
                    ...previous,

                    is_dispensed: true,

                    dispensing_status:
                        "DISPENSED",
                })
            );

            // ----------------------------------------------------
            // GO TO BILLS
            // ----------------------------------------------------

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
                err.response?.data?.message ||
                "Unable to dispense medicine."
            );
        } finally {
            setSaving(false);
        }
    };


    // ============================================================
    // DATE FORMATTER
    // ============================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    };


    // ============================================================
    // TIME FORMATTER
    // ============================================================

    const formatTime = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
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

                    <RefreshCw
                        size={22}
                        className="pharmacist-spin"
                    />

                    <span>
                        Loading prescription...
                    </span>

                </div>
            )}


            {/* ====================================================
                ERROR WHEN PRESCRIPTION IS NOT AVAILABLE
            ==================================================== */}

            {!loading &&
                !prescription &&
                error && (

                    <div className="pharmacist-error">
                        {error}
                    </div>
                )}


            {/* ====================================================
                PRESCRIPTION CONTENT
            ==================================================== */}

            {!loading &&
                prescription && (

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
                                        before dispensing
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
                                        {
                                            prescription.medicine_name ||
                                            "-"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            prescription.medicine_code ||
                                            "-"
                                        }
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
                                            {
                                                prescription.patient_name ||
                                                "-"
                                            }
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
                                            {
                                                prescription.appointment_id ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* Stock */}

                                <div className="pharmacist-detail-item">

                                    <Package size={18} />

                                    <div className="pharmacist-detail-content">

                                        <span className="pharmacist-detail-label">
                                            Available Stock
                                        </span>

                                        <strong className="pharmacist-detail-value">
                                            {
                                                availableStock
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                PRESCRIPTION DATE / TIME
                            ================================================== */}

                            {(prescription.created_at ||
                                prescription.prescribed_at) && (

                                <div className="pharmacist-detail-grid">

                                    <div className="pharmacist-detail-item">

                                        <CalendarDays
                                            size={18}
                                        />

                                        <div className="pharmacist-detail-content">

                                            <span className="pharmacist-detail-label">
                                                Prescription Date
                                            </span>

                                            <strong className="pharmacist-detail-value">
                                                {
                                                    formatDate(
                                                        prescription.prescribed_at ||
                                                        prescription.created_at
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="pharmacist-detail-item">

                                        <CalendarDays
                                            size={18}
                                        />

                                        <div className="pharmacist-detail-content">

                                            <span className="pharmacist-detail-label">
                                                Prescription Time
                                            </span>

                                            <strong className="pharmacist-detail-value">
                                                {
                                                    formatTime(
                                                        prescription.prescribed_at ||
                                                        prescription.created_at
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            )}


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
                                        {
                                            prescription.dosage ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                {/* Frequency */}

                                <div className="pharmacist-prescription-detail-item">

                                    <span className="pharmacist-prescription-detail-label">
                                        Frequency
                                    </span>

                                    <strong className="pharmacist-prescription-detail-value">
                                        {
                                            prescription.frequency ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                {/* Duration */}

                                <div className="pharmacist-prescription-detail-item">

                                    <span className="pharmacist-prescription-detail-label">
                                        Duration
                                    </span>

                                    <strong className="pharmacist-prescription-detail-value">
                                        {
                                            prescription.duration ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                {/* Route */}

                                <div className="pharmacist-prescription-detail-item">

                                    <span className="pharmacist-prescription-detail-label">
                                        Route
                                    </span>

                                    <strong className="pharmacist-prescription-detail-value">
                                        {
                                            prescription.route ||
                                            "-"
                                        }
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
                                        {
                                            prescription.instructions
                                        }
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

                            {alreadyDispensed ? (

                                <div className="pharmacist-success">

                                    <CheckCircle size={20} />

                                    <div>

                                        <strong>
                                            Medicine Already Dispensed
                                        </strong>

                                        <p>
                                            This prescription has already
                                            been dispensed and cannot be
                                            dispensed again.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <form
                                    onSubmit={
                                        handleDispense
                                    }
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
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            max={
                                                availableStock
                                            }
                                            step="1"
                                            value={
                                                quantity
                                            }
                                            onChange={
                                                handleQuantityChange
                                            }
                                            disabled={
                                                saving
                                            }
                                            required
                                        />

                                        <small>
                                            Available stock:{" "}
                                            {
                                                availableStock
                                            }
                                        </small>

                                    </div>


                                    {/* ==================================================
                                        PRICE PER UNIT
                                    ================================================== */}

                                    <div className="pharmacist-price-row">

                                        <span>
                                            Price per unit
                                        </span>

                                        <strong>
                                            <IndianRupee
                                                size={14}
                                            />

                                            {unitPrice.toFixed(
                                                2
                                            )}
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
                                            {
                                                quantity ||
                                                0
                                            }
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
                                            <IndianRupee
                                                size={17}
                                            />

                                            {
                                                totalPrice.toFixed(
                                                    2
                                                )
                                            }
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

                                            <CheckCircle
                                                size={17}
                                            />

                                            {success}

                                        </div>

                                    )}


                                    {/* ==================================================
                                        ACTION BUTTONS
                                    ================================================== */}

                                    <div className="pharmacist-form-actions">

                                        <button
                                            type="button"
                                            className="pharmacist-secondary-button"
                                            onClick={() =>
                                                navigate(-1)
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <ArrowLeft
                                                size={16}
                                            />

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
                                                    availableStock ||
                                                availableStock <= 0
                                            }
                                        >

                                            {saving ? (

                                                <>
                                                    <RefreshCw
                                                        size={16}
                                                        className="pharmacist-spin"
                                                    />

                                                    Dispensing...
                                                </>

                                            ) : (

                                                <>
                                                    <Package
                                                        size={16}
                                                    />

                                                    Dispense Medicine
                                                </>

                                            )}

                                        </button>

                                    </div>

                                </form>

                            )}

                        </div>

                    </div>

                )}

        </PharmacistLayout>
    );
}


export default Dispense;