import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
    UserRound,
    CalendarDays,
    Phone,
    MapPin,
    Droplets,
    VenusAndMars,
    ArrowRight,
    Pencil,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";

function PatientDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patientId } = useParams();

    const [patient, setPatient] = useState(
        location.state?.patient || null
    );

    const [loading, setLoading] = useState(
        !location.state?.patient
    );

    const [error, setError] = useState("");

    // ==================================================
    // LOAD PATIENT
    // ==================================================

    const fetchPatient = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/receptionist/patients/${patientId}/`
            );

            setPatient(response.data);
        } catch (err) {
            console.error(
                "Patient details error:",
                err.response?.data || err
            );

            if (err.response?.status === 404) {
                setError("Patient not found.");
            } else if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to view this patient."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load patient details."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // LOAD ONLY IF PATIENT WAS NOT PASSED
    // ==================================================

    useEffect(() => {
        if (!location.state?.patient && patientId) {
            fetchPatient();
        }
    }, [patientId]);

    // ==================================================
    // EDIT PATIENT
    // ==================================================

    const handleEditPatient = () => {
        if (!patient) {
            return;
        }

        navigate("/receptionist/patients", {
            state: {
                editPatient: patient,
            },
        });
    };

    // ==================================================
    // CREATE APPOINTMENT
    // ==================================================

    const handleCreateAppointment = () => {
        if (!patient) {
            return;
        }

        navigate("/receptionist/appointments/create", {
            state: {
                patient,
            },
        });
    };

    // ==================================================
    // FORMAT DATE
    // ==================================================

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

    // ==================================================
    // PAGE
    // ==================================================

    return (
        <ReceptionistLayout
            title="Patient Details"
            subtitle={
                patient
                    ? `Patient ${patient.patient_id}`
                    : "View patient information."
            }
        >

            {/* =========================================
                LOADING
            ========================================= */}

            {loading && (
                <div className="patient-details-loading">

                    <div className="spinner-border text-primary" />

                    <p>
                        Loading patient details...
                    </p>

                </div>
            )}

            {/* =========================================
                ERROR
            ========================================= */}

            {!loading && error && (
                <div className="patient-details-error">

                    <AlertCircle size={20} />

                    <div>
                        <strong>
                            Unable to load patient
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={fetchPatient}
                    >
                        <RefreshCw size={15} />
                        Retry
                    </button>

                </div>
            )}

            {/* =========================================
                PATIENT DETAILS
            ========================================= */}

            {!loading && patient && (

                <>

                    {/* TOP ACTIONS */}

                    <div className="patient-details-actions">

                        <div>
                            <span className="patient-details-label">
                                Patient ID
                            </span>

                            <strong className="patient-details-id">
                                {patient.patient_id}
                            </strong>
                        </div>

                        <div className="patient-details-action-buttons">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleEditPatient
                                }
                            >
                                <Pencil size={15} />
                                Edit Patient
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={
                                    handleCreateAppointment
                                }
                            >
                                <CalendarDays size={15} />
                                Create Appointment
                                <ArrowRight size={15} />
                            </button>

                        </div>

                    </div>

                    {/* =====================================
                        MAIN PATIENT CARD
                    ===================================== */}

                    <div className="patient-details-card">

                        {/* PROFILE HEADER */}

                        <div className="patient-profile-header">

                            <div className="patient-profile-icon">
                                <UserRound size={30} />
                            </div>

                            <div className="patient-profile-info">

                                <h2>
                                    {patient.name}
                                </h2>

                                <p>
                                    Patient ID:{" "}
                                    <strong>
                                        {patient.patient_id}
                                    </strong>
                                </p>

                            </div>

                            <div>

                                {patient.status ===
                                "Active" ? (

                                    <span className="status-paid">
                                        Active
                                    </span>

                                ) : (

                                    <span className="status-danger">
                                        {patient.status}
                                    </span>

                                )}

                            </div>

                        </div>

                        {/* =================================
                            INFORMATION
                        ================================= */}

                        <div className="patient-information-section">

                            <h3>
                                Personal Information
                            </h3>

                            <div className="patient-information-grid">

                                {/* NAME */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <UserRound
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Full Name
                                        </span>

                                        <strong>
                                            {patient.name ||
                                                "-"}
                                        </strong>
                                    </div>

                                </div>

                                {/* DOB */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <CalendarDays
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Date of Birth
                                        </span>

                                        <strong>
                                            {formatDate(
                                                patient.dob
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                {/* AGE */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <CalendarDays
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Age
                                        </span>

                                        <strong>
                                            {patient.age !==
                                            null
                                                ? `${patient.age} years`
                                                : "-"}
                                        </strong>
                                    </div>

                                </div>

                                {/* GENDER */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <VenusAndMars
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Gender
                                        </span>

                                        <strong>
                                            {patient.gender ||
                                                "-"}
                                        </strong>
                                    </div>

                                </div>

                                {/* PHONE */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <Phone size={17} />
                                    </div>

                                    <div>
                                        <span>
                                            Mobile Number
                                        </span>

                                        <strong>
                                            {patient.phone ||
                                                "-"}
                                        </strong>
                                    </div>

                                </div>

                                {/* BLOOD GROUP */}

                                <div className="patient-information-item">

                                    <div className="patient-information-icon">
                                        <Droplets
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Blood Group
                                        </span>

                                        <strong>
                                            {patient.blood_group ||
                                                "-"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* =================================
                            ADDRESS
                        ================================= */}

                        <div className="patient-information-section">

                            <h3>
                                Address
                            </h3>

                            <div className="patient-address">

                                <div className="patient-information-icon">
                                    <MapPin size={17} />
                                </div>

                                <p>
                                    {patient.address ||
                                        "No address available."}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =====================================
                        CREATE APPOINTMENT NOTICE
                    ===================================== */}

                    <div className="patient-appointment-notice">

                        <div className="patient-appointment-notice-icon">
                            <CalendarDays size={20} />
                        </div>

                        <div>

                            <strong>
                                Ready to create an appointment?
                            </strong>

                            <p>
                                Create an appointment for{" "}
                                <strong>
                                    {patient.name}
                                </strong>{" "}
                                and continue to billing and payment.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                handleCreateAppointment
                            }
                        >
                            Create Appointment
                            <ArrowRight size={15} />
                        </button>

                    </div>

                </>
            )}

        </ReceptionistLayout>
    );
}

export default PatientDetails;