import { useEffect, useState } from "react";
import {
    CalendarDays,
    Pill,
    User,
    ArrowRight,
    Package,
    CheckCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPatientAppointments,
    getAppointmentPrescriptions,
} from "../../services/pharmacistApi";


function PatientPrescriptions() {
    const navigate = useNavigate();
    const { patientId } = useParams();

    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [loadingAppointments, setLoadingAppointments] =
        useState(true);

    const [loadingPrescriptions, setLoadingPrescriptions] =
        useState(false);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD PATIENT APPOINTMENTS
    // ==========================================

    useEffect(() => {
        loadAppointments();
    }, [patientId]);


    const loadAppointments = async () => {
        setLoadingAppointments(true);
        setError("");

        try {
            const response =
                await getPatientAppointments(patientId);

            setAppointments(
                response.data || []
            );

        } catch (err) {
            console.error(
                "Appointment loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load patient appointments."
            );

        } finally {
            setLoadingAppointments(false);
        }
    };


    // ==========================================
    // LOAD PRESCRIPTIONS
    // ==========================================

    const handleAppointmentSelect = async (
        appointment
    ) => {
        setSelectedAppointment(appointment);

        // Save appointment ID so Dispense.jsx can use it
        sessionStorage.setItem(
            "pharmacist_appointment_id",
            appointment.id
        );

        // Save patient ID as well
        sessionStorage.setItem(
            "pharmacist_patient_id",
            patientId
        );

        setPrescriptions([]);
        setError("");
        setLoadingPrescriptions(true);

        try {
            const response =
                await getAppointmentPrescriptions(
                    appointment.id
                );

            setPrescriptions(
                response.data || []
            );

        } catch (err) {
            console.error(
                "Prescription loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load prescriptions."
            );

        } finally {
            setLoadingPrescriptions(false);
        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        const [hours, minutes] =
            time.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // ==========================================
    // STOCK STATUS
    // ==========================================

    const getStockStatus = (stock) => {
        const quantity = Number(stock);

        if (quantity === 0) {
            return {
                label: "Out of Stock",
                className:
                    "pharmacist-stock-badge out",
            };
        }

        if (quantity <= 10) {
            return {
                label: "Low Stock",
                className:
                    "pharmacist-stock-badge low",
            };
        }

        return {
            label: "Available",
            className:
                "pharmacist-stock-badge good",
        };
    };


    // ==========================================
    // DISPENSE BUTTON
    // ==========================================

    const handleDispense = (prescription) => {

        // --------------------------------------
        // PREVENT DUPLICATE DISPENSING
        // --------------------------------------

        if (prescription.is_dispensed) {
            setError(
                "This prescription has already been dispensed."
            );

            return;
        }


        if (!selectedAppointment) {
            setError(
                "Please select an appointment first."
            );

            return;
        }


        // --------------------------------------
        // CHECK STOCK
        // --------------------------------------

        if (
            Number(
                prescription.stock_quantity
            ) <= 0
        ) {
            setError(
                "This medicine is out of stock."
            );

            return;
        }


        // --------------------------------------
        // STORE APPOINTMENT ID
        // --------------------------------------

        sessionStorage.setItem(
            "pharmacist_appointment_id",
            selectedAppointment.id
        );


        // --------------------------------------
        // STORE PATIENT ID
        // --------------------------------------

        sessionStorage.setItem(
            "pharmacist_patient_id",
            patientId
        );


        // --------------------------------------
        // OPEN DISPENSE PAGE
        // --------------------------------------

        navigate(
            `/pharmacist/dispense/${prescription.id}`
        );
    };


    return (
        <PharmacistLayout
            title="Patient Prescriptions"
            subtitle="View appointments and medicines prescribed by the doctor"
        >

            {/* =====================================
                ERROR
            ====================================== */}

            {error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {/* =====================================
                APPOINTMENTS
            ====================================== */}

            <div className="pharmacist-card">

                <div className="pharmacist-card-header">

                    <div>

                        <h2>
                            Patient Appointments
                        </h2>

                        <p>
                            Select an appointment to view prescriptions
                        </p>

                    </div>

                    <CalendarDays size={21} />

                </div>


                {loadingAppointments ? (

                    <div className="pharmacist-loading">
                        Loading appointments...
                    </div>

                ) : appointments.length === 0 ? (

                    <div className="pharmacist-empty">

                        <CalendarDays size={30} />

                        <span>
                            No appointments found for this patient.
                        </span>

                    </div>

                ) : (

                    <div className="pharmacist-appointment-list">

                        {appointments.map(
                            (appointment) => {

                                const isSelected =
                                    selectedAppointment?.id ===
                                    appointment.id;

                                return (
                                    <button
                                        type="button"
                                        key={appointment.id}
                                        className={`pharmacist-appointment-card ${
                                            isSelected
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleAppointmentSelect(
                                                appointment
                                            )
                                        }
                                    >

                                        {/* Appointment Icon */}

                                        <div className="pharmacist-appointment-icon">

                                            <CalendarDays
                                                size={19}
                                            />

                                        </div>


                                        {/* Appointment Information */}

                                        <div className="pharmacist-appointment-info">

                                            <strong>
                                                {formatDate(
                                                    appointment.appointment_date
                                                )}
                                            </strong>

                                            <span>
                                                {formatTime(
                                                    appointment.appointment_time
                                                )}
                                            </span>

                                            <small>
                                                {appointment.doctor_name}
                                            </small>

                                        </div>


                                        {/* Status */}

                                        <div className="pharmacist-appointment-status">

                                            <span
                                                className={`pharmacist-status-badge ${
                                                    appointment.status
                                                        ?.toLowerCase()
                                                }`}
                                            >
                                                {
                                                    appointment.status
                                                }
                                            </span>

                                        </div>


                                        {/* Arrow */}

                                        <ArrowRight
                                            size={18}
                                        />

                                    </button>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* =====================================
                SELECTED APPOINTMENT
            ====================================== */}

            {selectedAppointment && (

                <div className="pharmacist-card">

                    <div className="pharmacist-card-header">

                        <div>

                            <h2>
                                Prescribed Medicines
                            </h2>

                            <p>
                                Appointment on{" "}
                                {formatDate(
                                    selectedAppointment.appointment_date
                                )}
                            </p>

                        </div>

                        <Pill size={21} />

                    </div>


                    {loadingPrescriptions ? (

                        <div className="pharmacist-loading">
                            Loading prescriptions...
                        </div>

                    ) : prescriptions.length === 0 ? (

                        <div className="pharmacist-empty">

                            <Pill size={30} />

                            <span>
                                No medicine prescriptions found
                                for this appointment.
                            </span>

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
                                            Dosage
                                        </th>

                                        <th>
                                            Frequency
                                        </th>

                                        <th>
                                            Duration
                                        </th>

                                        <th>
                                            Route
                                        </th>

                                        <th>
                                            Stock
                                        </th>

                                        <th>
                                            Price
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

                                    {prescriptions.map(
                                        (prescription) => {

                                            const stockStatus =
                                                getStockStatus(
                                                    prescription.stock_quantity
                                                );

                                            const isDispensed =
                                                prescription.is_dispensed ===
                                                    true ||
                                                prescription.dispensing_status ===
                                                    "DISPENSED";

                                            return (
                                                <tr
                                                    key={
                                                        prescription.id
                                                    }
                                                >

                                                    {/* Medicine */}

                                                    <td>

                                                        <div className="pharmacist-medicine-name">

                                                            <strong>
                                                                {
                                                                    prescription.medicine_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    prescription.prescription_id
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Medicine Code */}

                                                    <td>
                                                        {
                                                            prescription.medicine_code
                                                        }
                                                    </td>


                                                    {/* Dosage */}

                                                    <td>
                                                        {
                                                            prescription.dosage
                                                        }
                                                    </td>


                                                    {/* Frequency */}

                                                    <td>
                                                        {
                                                            prescription.frequency
                                                        }
                                                    </td>


                                                    {/* Duration */}

                                                    <td>
                                                        {
                                                            prescription.duration
                                                        }
                                                    </td>


                                                    {/* Route */}

                                                    <td>
                                                        {
                                                            prescription.route ||
                                                            "-"
                                                        }
                                                    </td>


                                                    {/* Stock */}

                                                    <td>

                                                        <div className="pharmacist-stock-cell">

                                                            <strong>
                                                                {
                                                                    prescription.stock_quantity
                                                                }
                                                            </strong>

                                                            <span
                                                                className={
                                                                    stockStatus.className
                                                                }
                                                            >
                                                                {
                                                                    stockStatus.label
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Price */}

                                                    <td>
                                                        ₹
                                                        {Number(
                                                            prescription.price_per_unit
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </td>


                                                    {/* Dispensing Status */}

                                                    <td>

                                                        {isDispensed ? (

                                                            <span className="pharmacist-status-badge paid">

                                                                <CheckCircle
                                                                    size={14}
                                                                />

                                                                DISPENSED

                                                            </span>

                                                        ) : (

                                                            <span className="pharmacist-status-badge pending">

                                                                <Package
                                                                    size={14}
                                                                />

                                                                PENDING

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* Action */}

                                                    <td>

                                                        {isDispensed ? (

                                                            <span className="pharmacist-paid-label">

                                                                <CheckCircle
                                                                    size={15}
                                                                />

                                                                Dispensed

                                                            </span>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                className="pharmacist-primary-button pharmacist-small-button"
                                                                disabled={
                                                                    Number(
                                                                        prescription.stock_quantity
                                                                    ) === 0
                                                                }
                                                                onClick={() =>
                                                                    handleDispense(
                                                                        prescription
                                                                    )
                                                                }
                                                            >

                                                                <Package
                                                                    size={15}
                                                                />

                                                                Dispense

                                                            </button>

                                                        )}

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}


            {/* =====================================
                PATIENT INFORMATION
            ====================================== */}

            {prescriptions.length > 0 && (

                <div className="pharmacist-card">

                    <div className="pharmacist-card-header">

                        <div>

                            <h2>
                                Patient Information
                            </h2>

                            <p>
                                Prescription patient details
                            </p>

                        </div>

                        <User size={21} />

                    </div>


                    <div className="pharmacist-patient-summary">

                        {/* Patient ID */}

                        <div>

                            <span>
                                Patient ID
                            </span>

                            <strong>
                                {
                                    prescriptions[0]
                                        .patient_id
                                }
                            </strong>

                        </div>


                        {/* Patient Name */}

                        <div>

                            <span>
                                Patient Name
                            </span>

                            <strong>
                                {
                                    prescriptions[0]
                                        .patient_name
                                }
                            </strong>

                        </div>


                        {/* Appointment */}

                        <div>

                            <span>
                                Appointment
                            </span>

                            <strong>
                                {
                                    prescriptions[0]
                                        .appointment_id
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            )}

        </PharmacistLayout>
    );
}


export default PatientPrescriptions;