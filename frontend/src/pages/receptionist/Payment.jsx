import { useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    CalendarDays,
    CreditCard,
    UserRound,
    Clock3,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Ticket,
    X,
    LayoutDashboard,
} from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";
function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { billId } = useParams();

    const bill = location.state?.bill;
    const appointment = location.state?.appointment;
    const patient = location.state?.patient;
    const doctor = location.state?.doctor;

    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    // =========================================
    // FORMAT DATE
    // =========================================

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

    // =========================================
    // FORMAT TIME
    // =========================================

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

    // =========================================
    // FORMAT APPOINTMENT TYPE
    // =========================================

    const formatAppointmentType = (type) => {
        if (type === "PRIOR_BOOKING") {
            return "Prior Booking";
        }

        if (type === "WALK_IN") {
            return "Walk-in";
        }

        return type || "-";
    };

    // =========================================
    // BACK
    // =========================================

    const handleBackToBilling = () => {
        navigate(
            "/receptionist/billing",
            {
                state: {
                    bill,
                    appointment,
                    patient,
                    doctor,
                },
            }
        );
    };

    // =========================================
    // COMPLETE PAYMENT
    // =========================================

    const handlePayment = async () => {
        setError("");

        if (!billId) {
            setError("Bill ID is missing.");
            return;
        }

        try {
            setPaying(true);

            const response = await api.post(
                `/receptionist/billing/${billId}/pay/`
            );

            console.log(
                "Payment completed:",
                response.data
            );

            setPaymentData(response.data);
            setPaymentSuccess(true);

        } catch (err) {
            console.error(
                "Payment error:",
                err.response?.data || err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
                return;
            }

            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to complete this payment."
                );
                return;
            }

            const data = err.response?.data;

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
                                    typeof message ===
                                        "object" &&
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
                    "Unable to complete payment."
                );
            } else {
                setError(
                    "Unable to complete payment."
                );
            }

        } finally {
            setPaying(false);
        }
    };

    // =========================================
    // MISSING DATA
    // =========================================

    if (
        !bill ||
        !patient ||
        !appointment
    ) {
        return (
            <ReceptionistLayout
                title="Payment"
                subtitle="Complete appointment payment."
            >
                <div className="missing-card">

                    <div className="missing-icon">
                        <AlertCircle size={28} />
                    </div>

                    <h2>
                        Payment Information Missing
                    </h2>

                    <p>
                        Payment information is not
                        available. Please create an
                        appointment and bill before
                        proceeding to payment.
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

    // =========================================
    // SUCCESS
    // =========================================

    if (paymentSuccess) {
        const token =
            paymentData?.token_no ??
            paymentData?.token ??
            appointment?.token_no;

        const finalBillId =
            paymentData?.bill_id ||
            bill?.bill_id ||
            billId;

        const amountPaid =
            paymentData?.total_amount ||
            bill?.total_amount ||
            "0.00";

        return (
            <ReceptionistLayout
                title="Payment Complete"
                subtitle="Payment successfully processed."
                showBack={false}
            >

                {/* SUCCESS */}

                <div className="payment-success-header">

                    <div className="payment-success-icon">
                        <CheckCircle2 size={38} />
                    </div>

                    <h2>
                        Payment Successful
                    </h2>

                    <p>
                        The appointment payment has
                        been completed successfully.
                    </p>

                </div>


                {/* TOKEN */}

                <section className="token-card">

                    <div className="token-icon">
                        <Ticket size={27} />
                    </div>

                    <span>
                        TOKEN NUMBER
                    </span>

                    <strong>
                        {token || "—"}
                    </strong>

                    <small>
                        Patient's consultation token
                    </small>

                </section>


                {/* PAYMENT DETAILS */}

                <section className="success-details-card">

                    <div className="success-card-header">

                        <div>
                            <h3>
                                Payment Details
                            </h3>

                            <p>
                                Transaction summary
                            </p>
                        </div>

                        <span className="paid-badge">
                            <CheckCircle2 size={13} />
                            PAID
                        </span>

                    </div>


                    <div className="success-details-grid">

                        <div className="success-detail">
                            <span>Bill ID</span>
                            <strong>
                                {finalBillId}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Amount Paid</span>
                            <strong className="amount-value">
                                ₹{amountPaid}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Patient</span>
                            <strong>
                                {patient.patient_id}
                                {" - "}
                                {patient.name}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Mobile</span>
                            <strong>
                                {patient.phone}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Doctor</span>
                            <strong>
                                {doctor?.doctor_id || "-"}
                                {" - "}
                                {doctor?.name || "-"}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Specialization</span>
                            <strong>
                                {doctor?.specialization || "-"}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Appointment Date</span>
                            <strong>
                                {formatDate(
                                    appointment.appointment_date
                                )}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Appointment Time</span>
                            <strong className="success-time">
                                <Clock3 size={13} />
                                {formatTime(
                                    appointment.appointment_time
                                )}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Appointment Type</span>
                            <strong>
                                {formatAppointmentType(
                                    appointment.appointment_type
                                )}
                            </strong>
                        </div>

                        <div className="success-detail">
                            <span>Payment Status</span>
                            <strong className="paid-text">
                                PAID
                            </strong>
                        </div>

                    </div>

                </section>


                {/* NEXT STEP */}

                <div className="next-step-card">

                    <div className="next-step-icon">
                        <CalendarDays size={18} />
                    </div>

                    <div>

                        <strong>
                            Appointment Ready
                        </strong>

                        <p>
                            The patient can now proceed
                            for the consultation using
                            the displayed token number.
                        </p>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="success-actions">

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/receptionist/appointments"
                            )
                        }
                    >
                        <CalendarDays size={17} />
                        Appointments
                    </button>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/receptionist"
                            )
                        }
                    >
                        <LayoutDashboard size={17} />
                        Dashboard
                    </button>

                </div>

            </ReceptionistLayout>
        );
    }

    // =========================================
    // PAYMENT PAGE
    // =========================================

    return (
        <ReceptionistLayout
            title="Payment"
            subtitle="Complete appointment payment."
        >

            {/* WORKFLOW */}

            <div className="billing-workflow">

                <div className="workflow-step completed">
                    <span>1</span>
                    Appointment
                </div>

                <div className="workflow-line completed-line" />

                <div className="workflow-step completed">
                    <span>2</span>
                    Billing
                </div>

                <div className="workflow-line completed-line" />

                <div className="workflow-step current">
                    <span>3</span>
                    Payment
                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="billing-alert billing-error">

                    <AlertCircle size={18} />

                    <span>{error}</span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={15} />
                    </button>

                </div>
            )}


            {/* PATIENT + APPOINTMENT */}

            <div className="payment-summary-grid">

                {/* PATIENT */}

                <section className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon patient">
                            <UserRound size={18} />
                        </div>

                        <div>
                            <h3>
                                Patient
                            </h3>

                            <span>
                                Patient information
                            </span>
                        </div>

                    </div>


                    <div className="summary-details">

                        <div>
                            <span>
                                Patient ID
                            </span>

                            <strong>
                                {patient.patient_id}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Name
                            </span>

                            <strong>
                                {patient.name}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Mobile
                            </span>

                            <strong>
                                {patient.phone}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Blood Group
                            </span>

                            <strong>
                                {patient.blood_group || "-"}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* APPOINTMENT */}

                <section className="summary-card">

                    <div className="summary-card-header">

                        <div className="summary-icon appointment">
                            <CalendarDays size={18} />
                        </div>

                        <div>
                            <h3>
                                Appointment
                            </h3>

                            <span>
                                Consultation schedule
                            </span>
                        </div>

                    </div>


                    <div className="summary-details">

                        <div>
                            <span>
                                Appointment ID
                            </span>

                            <strong>
                                #{appointment.id}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Doctor
                            </span>

                            <strong>
                                {doctor?.name || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Date
                            </span>

                            <strong>
                                {formatDate(
                                    appointment.appointment_date
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Time
                            </span>

                            <strong className="success-time">
                                <Clock3 size={13} />
                                {formatTime(
                                    appointment.appointment_time
                                )}
                            </strong>
                        </div>

                    </div>

                </section>

            </div>


            {/* BILL SUMMARY */}

            <section className="bill-summary-card">

                <div className="bill-header">

                    <div className="summary-card-header">

                        <div className="summary-icon billing">
                            <FileText size={18} />
                        </div>

                        <div>
                            <h3>
                                Bill Summary
                            </h3>

                            <span>
                                Bill ID:{" "}
                                {bill.bill_id || billId}
                            </span>
                        </div>

                    </div>

                    <span className="pending-badge">
                        <Clock3 size={13} />
                        PAYMENT PENDING
                    </span>

                </div>


                <div className="bill-lines">

                    <div className="bill-line">
                        <span>
                            Registration Fee
                        </span>

                        <strong>
                            ₹{bill.registration_fee || "0.00"}
                        </strong>
                    </div>

                    <div className="bill-line">
                        <span>
                            Consultation Fee
                        </span>

                        <strong>
                            ₹{bill.consultation_fee || "0.00"}
                        </strong>
                    </div>

                    <div className="bill-total">

                        <div>
                            <span>
                                Total Amount
                            </span>

                            <small>
                                Amount payable
                            </small>
                        </div>

                        <strong>
                            ₹{bill.total_amount || "0.00"}
                        </strong>

                    </div>

                </div>

            </section>


            {/* CONFIRMATION */}

            <div className="payment-confirmation">

                <div className="confirmation-icon">
                    <CreditCard size={19} />
                </div>

                <div>

                    <strong>
                        Confirm Payment
                    </strong>

                    <p>
                        By clicking "Pay Now", the bill
                        will be marked as completed and
                        a consultation token number will
                        be generated for this appointment.
                    </p>

                </div>

            </div>


            {/* ACTIONS */}

            <div className="payment-actions">

                <button
                    className="secondary-button"
                    onClick={handleBackToBilling}
                    disabled={paying}
                >
                    <ArrowLeft size={16} />
                    Back to Billing
                </button>

                <button
                    className="pay-button"
                    onClick={handlePayment}
                    disabled={paying}
                >

                    {paying ? (
                        <>
                            <span className="button-spinner" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={18} />
                            Pay Now
                        </>
                    )}

                </button>

            </div>

        </ReceptionistLayout>
    );
}

export default Payment;