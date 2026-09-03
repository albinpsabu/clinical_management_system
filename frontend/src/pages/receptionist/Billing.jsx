import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    CalendarDays,
    CreditCard,
    UserRound,
    Clock3,
    FileText,
    IndianRupee,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    X,
} from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";

function Billing() {
    const location = useLocation();
    const navigate = useNavigate();

    /*
    ==================================================
    DATA FROM APPOINTMENT PAGE
    ==================================================
    */

    const appointment = location.state?.appointment;
    const patient = location.state?.patient;
    const doctor = location.state?.doctor;


    /*
    ==================================================
    BILLING STATE
    ==================================================
    */

    const [registrationFee, setRegistrationFee] =
        useState("100.00");

    const [consultationFee, setConsultationFee] =
        useState(
            doctor?.consultation_fee || "0.00"
        );

    const [creatingBill, setCreatingBill] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /*
    ==================================================
    FORMAT APPOINTMENT TYPE
    ==================================================
    */

    const formatAppointmentType = (type) => {
        if (type === "PRIOR_BOOKING") {
            return "Prior Booking";
        }

        if (type === "WALK_IN") {
            return "Walk-in";
        }

        return type || "-";
    };


    /*
    ==================================================
    FORMAT DATE
    ==================================================
    */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parts = date.split("-");

        if (parts.length !== 3) {
            return date;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };


    /*
    ==================================================
    FORMAT TIME
    ==================================================
    */

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        const [hours, minutes] = time.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    /*
    ==================================================
    TOTAL CALCULATION
    ==================================================
    */

    const registration =
        Number(registrationFee) || 0;

    const consultation =
        Number(consultationFee) || 0;

    const totalAmount =
        registration + consultation;


    /*
    ==================================================
    CREATE BILL
    ==================================================
    */

    const handleCreateBill = async () => {
        setError("");
        setSuccess("");

        /*
        ------------------------------
        VALIDATION
        ------------------------------
        */

        if (!appointment?.id) {
            setError(
                "Appointment ID is missing. Unable to create bill."
            );
            return;
        }

        if (!patient?.id) {
            setError(
                "Patient ID is missing. Unable to create bill."
            );
            return;
        }

        if (registration < 0) {
            setError(
                "Registration fee cannot be negative."
            );
            return;
        }

        if (consultation < 0) {
            setError(
                "Consultation fee cannot be negative."
            );
            return;
        }


        try {
            setCreatingBill(true);


            /*
            ------------------------------
            GENERATE BILL ID
            ------------------------------
            */

            const billId =
                "CB" +
                Date.now()
                    .toString()
                    .slice(-8);


            /*
            ------------------------------
            BILL DATA
            ------------------------------
            */

            const billData = {
                bill_id: billId,

                patient: patient.id,

                appointment: appointment.id,

                registration_fee:
                    registrationFee,

                consultation_fee:
                    consultationFee,

                payment_status:
                    "PENDING",
            };


            console.log(
                "Creating bill:",
                billData
            );


            /*
            ------------------------------
            CREATE BILL API
            ------------------------------
            */

            const response = await api.post(
                "/receptionist/billing/",
                billData
            );


            const createdBill =
                response.data;


            console.log(
                "Bill created:",
                createdBill
            );


            /*
            ------------------------------
            FINAL BILL ID
            ------------------------------
            */

            const finalBillId =
                createdBill.bill_id ||
                billId;


            setSuccess(
                "Bill created successfully."
            );


            /*
            ------------------------------
            GO TO PAYMENT
            ------------------------------
            */

            navigate(
                `/receptionist/payment/${finalBillId}`,
                {
                    state: {
                        bill: createdBill,
                        appointment: appointment,
                        patient: patient,
                        doctor: doctor,
                    },
                }
            );

        } catch (err) {

            console.error(
                "Billing error:",
                err.response?.data || err
            );


            /*
            ------------------------------
            UNAUTHORIZED
            ------------------------------
            */

            if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
                return;
            }


            /*
            ------------------------------
            FORBIDDEN
            ------------------------------
            */

            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to create bills."
                );
                return;
            }


            /*
            ------------------------------
            DUPLICATE BILL
            ------------------------------
            */

            const data =
                err.response?.data;


            if (
                data &&
                typeof data === "object"
            ) {

                const messages =
                    Object.entries(data)
                        .map(
                            ([field, message]) => {

                                if (
                                    Array.isArray(message)
                                ) {
                                    return `${field}: ${message.join(", ")}`;
                                }

                                if (
                                    typeof message === "object" &&
                                    message !== null
                                ) {
                                    return `${field}: ${JSON.stringify(message)}`;
                                }

                                return `${field}: ${message}`;
                            }
                        )
                        .join(" | ");


                setError(
                    messages ||
                    "Unable to create bill."
                );

            } else {

                setError(
                    "Unable to create bill."
                );
            }

        } finally {
            setCreatingBill(false);
        }
    };


    /*
    ==================================================
    MISSING APPOINTMENT DATA
    ==================================================
    */

    if (!appointment || !patient) {

        return (
            <ReceptionistLayout
                title="Billing"
                subtitle="Create consultation bill."
            >

                <div className="missing-card">

                    <div className="missing-icon">
                        <AlertCircle size={28} />
                    </div>


                    <h2>
                        Appointment Information Missing
                    </h2>


                    <p>
                        Appointment information is not
                        available. Please create an
                        appointment first before generating
                        a bill.
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/receptionist/appointments"
                            )
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Appointments
                    </button>

                </div>

            </ReceptionistLayout>
        );
    }


    /*
    ==================================================
    MAIN BILLING PAGE
    ==================================================
    */

    return (

        <ReceptionistLayout
            title="Billing"
            subtitle="Create consultation bill."
        >

            {/* =========================================
                WORKFLOW
            ========================================= */}

            <div className="billing-workflow">

                <div className="workflow-step completed">

                    <span>
                        1
                    </span>

                    Appointment

                </div>


                <div className="workflow-line completed-line" />


                <div className="workflow-step current">

                    <span>
                        2
                    </span>

                    Billing

                </div>


                <div className="workflow-line" />


                <div className="workflow-step">

                    <span>
                        3
                    </span>

                    Payment

                </div>

            </div>


            {/* =========================================
                ERROR MESSAGE
            ========================================= */}

            {error && (

                <div className="billing-alert billing-error">

                    <AlertCircle size={18} />


                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={15} />
                    </button>

                </div>

            )}


            {/* =========================================
                SUCCESS MESSAGE
            ========================================= */}

            {success && (

                <div className="billing-alert billing-success">

                    <CheckCircle2 size={18} />


                    <span>
                        {success}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={15} />
                    </button>

                </div>

            )}


            {/* =========================================
                PATIENT + APPOINTMENT DETAILS
            ========================================= */}

            <div className="billing-details-grid">


                {/* =====================================
                    PATIENT DETAILS
                ===================================== */}

                <section className="billing-details-card">

                    <div className="billing-card-heading">

                        <div className="billing-title-icon patient">

                            <UserRound size={18} />

                        </div>


                        <div>

                            <h2>
                                Patient Details
                            </h2>

                            <p>
                                Registered patient
                            </p>

                        </div>

                    </div>


                    <div className="billing-details-list">


                        <div className="billing-detail-row">

                            <span>
                                Patient ID
                            </span>

                            <strong>
                                {patient.patient_id}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Name
                            </span>

                            <strong>
                                {patient.name}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Mobile
                            </span>

                            <strong>
                                {patient.phone}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Gender
                            </span>

                            <strong>
                                {patient.gender || "-"}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Age
                            </span>

                            <strong>
                                {patient.age || "-"}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Blood Group
                            </span>

                            <strong>
                                {patient.blood_group || "-"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    APPOINTMENT DETAILS
                ===================================== */}

                <section className="billing-details-card">

                    <div className="billing-card-heading">

                        <div className="billing-title-icon appointment">

                            <CalendarDays size={18} />

                        </div>


                        <div>

                            <h2>
                                Appointment Details
                            </h2>

                            <p>
                                Consultation schedule
                            </p>

                        </div>

                    </div>


                    <div className="billing-details-list">


                        <div className="billing-detail-row">

                            <span>
                                Appointment ID
                            </span>

                            <strong>
                                #{appointment.id}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Doctor
                            </span>

                            <strong>
                                {doctor?.name ||
                                    appointment.doctor_name ||
                                    "Unknown Doctor"}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Doctor ID
                            </span>

                            <strong>
                                {doctor?.doctor_id ||
                                    appointment.doctor_code ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Specialization
                            </span>

                            <strong>
                                {doctor?.specialization ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Date
                            </span>

                            <strong>
                                {formatDate(
                                    appointment.appointment_date
                                )}
                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Time
                            </span>

                            <strong className="billing-time">

                                <Clock3 size={13} />

                                {formatTime(
                                    appointment.appointment_time
                                )}

                            </strong>

                        </div>


                        <div className="billing-detail-row">

                            <span>
                                Type
                            </span>

                            <strong>
                                {formatAppointmentType(
                                    appointment.appointment_type
                                )}
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* =========================================
                FEE DETAILS
            ========================================= */}

            <section className="billing-fee-card">


                <div className="billing-card-heading">

                    <div className="billing-title-icon fee">

                        <FileText size={18} />

                    </div>


                    <div>

                        <h2>
                            Fee Details
                        </h2>

                        <p>
                            Review and confirm billing
                            amounts.
                        </p>

                    </div>

                </div>


                <div className="billing-fee-body">


                    {/* =================================
                        FEE INPUTS
                    ================================= */}

                    <div className="billing-fee-grid">


                        {/* REGISTRATION FEE */}

                        <div className="billing-fee-field">

                            <label>
                                Registration Fee
                            </label>


                            <div className="billing-currency-input">

                                <span>
                                    ₹
                                </span>


                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={registrationFee}
                                    onChange={(e) => {

                                        setRegistrationFee(
                                            e.target.value
                                        );

                                        setError("");

                                    }}
                                />

                            </div>


                            <small>
                                Standard registration
                                charge
                            </small>

                        </div>


                        {/* CONSULTATION FEE */}

                        <div className="billing-fee-field">

                            <label>
                                Consultation Fee
                            </label>


                            <div className="billing-currency-input">

                                <span>
                                    ₹
                                </span>


                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={consultationFee}
                                    onChange={(e) => {

                                        setConsultationFee(
                                            e.target.value
                                        );

                                        setError("");

                                    }}
                                />

                            </div>


                            <small>
                                Doctor consultation
                                charge
                            </small>

                        </div>

                    </div>


                    {/* =================================
                        BILL SUMMARY
                    ================================= */}

                    <div className="billing-summary">


                        <div className="billing-summary-row">

                            <span>
                                Registration Fee
                            </span>

                            <strong>
                                ₹{registration.toFixed(2)}
                            </strong>

                        </div>


                        <div className="billing-summary-row">

                            <span>
                                Consultation Fee
                            </span>

                            <strong>
                                ₹{consultation.toFixed(2)}
                            </strong>

                        </div>


                        <div className="billing-total-row">

                            <div>

                                <span>
                                    Total Amount
                                </span>

                                <small>
                                    Amount payable
                                </small>

                            </div>


                            <strong>
                                ₹{totalAmount.toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    {/* =================================
                        PAYMENT NOTICE
                    ================================= */}

                    <div className="billing-payment-notice">


                        <div className="billing-notice-icon">

                            <IndianRupee size={17} />

                        </div>


                        <div>

                            <strong>
                                Payment Pending
                            </strong>


                            <p>
                                The bill will be created
                                as pending. You will be
                                redirected to the payment
                                screen after creating it.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        ACTION BUTTONS
                    ================================= */}

                    <div className="billing-actions">


                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(-1)
                            }
                            disabled={creatingBill}
                        >

                            <ArrowLeft size={16} />

                            Back

                        </button>


                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                handleCreateBill
                            }
                            disabled={creatingBill}
                        >

                            {creatingBill ? (

                                <>

                                    <span className="button-spinner" />

                                    Creating Bill...

                                </>

                            ) : (

                                <>

                                    <CreditCard size={16} />

                                    Proceed to Payment

                                </>

                            )}

                        </button>

                    </div>

                </div>

            </section>

        </ReceptionistLayout>
    );
}


export default Billing;