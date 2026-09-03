import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft } from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";

function AppointmentCreate() {
    const navigate = useNavigate();
    const location = useLocation();

    const patientFromState = location.state?.patient;

    const [patient, setPatient] = useState(patientFromState || null);
    const [doctors, setDoctors] = useState([]);

    const [doctor, setDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [appointmentType, setAppointmentType] = useState("WALK_IN");

    const [loading, setLoading] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [error, setError] = useState("");

    // ==================================================
    // LOAD PATIENT IF NOT PASSED THROUGH STATE
    // ==================================================

    useEffect(() => {
        const loadPatient = async () => {
            if (patientFromState) {
                setPatient(patientFromState);
                return;
            }

            setError("Patient information is missing.");
        };

        loadPatient();
    }, [patientFromState]);

    // ==================================================
    // LOAD ACTIVE DOCTORS
    // ==================================================

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoadingDoctors(true);

                const response = await api.get(
                    "/receptionist/doctors/"
                );

                setDoctors(response.data);
            } catch (err) {
                console.error("Doctor loading error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Unable to load doctors."
                );
            } finally {
                setLoadingDoctors(false);
            }
        };

        loadDoctors();
    }, []);

    // ==================================================
    // CREATE APPOINTMENT
    // ==================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!patient) {
            setError("Patient information is missing.");
            return;
        }

        if (!doctor) {
            setError("Please select a doctor.");
            return;
        }

        if (!appointmentDate) {
            setError("Please select an appointment date.");
            return;
        }

        if (!appointmentTime) {
            setError("Please select an appointment time.");
            return;
        }

        try {
            setLoading(true);

            const selectedDoctor = doctors.find(
                (item) => String(item.id) === String(doctor)
            );

            if (!selectedDoctor) {
                setError("Selected doctor was not found.");
                return;
            }

            const response = await api.post(
                "/receptionist/appointments/",
                {
                    patient: patient.id,
                    doctor: Number(doctor),
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    appointment_type: appointmentType,
                }
            );

            const appointment = response.data;

            // Go directly to billing after appointment creation
            navigate("/receptionist/billing", {
                state: {
                    appointment,
                    patient,
                    doctor: selectedDoctor,
                },
            });

        } catch (err) {
            console.error(
                "Appointment creation error:",
                err
            );

            const responseData = err.response?.data;

            if (responseData) {
                if (responseData.appointment_date) {
                    setError(
                        Array.isArray(responseData.appointment_date)
                            ? responseData.appointment_date[0]
                            : responseData.appointment_date
                    );
                } else if (responseData.doctor) {
                    setError(
                        Array.isArray(responseData.doctor)
                            ? responseData.doctor[0]
                            : responseData.doctor
                    );
                } else if (responseData.detail) {
                    setError(responseData.detail);
                } else {
                    setError(
                        "Unable to create appointment."
                    );
                }
            } else {
                setError(
                    "Unable to connect to the server."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // TODAY
    // ==================================================

    const today = new Date()
        .toISOString()
        .split("T")[0];

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <ReceptionistLayout
            title="Create Appointment"
            subtitle="Schedule an appointment for the selected patient."
            showBack={false}
        >

            <button
                className="back-button"
                onClick={() => navigate(-1)}
                type="button"
            >
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>

            {/* ==========================================
                PATIENT INFORMATION
            ========================================== */}

            {patient && (
                <div className="appointment-patient-card">

                    <div className="appointment-patient-header">
                        <div>
                            <h3>Patient Information</h3>
                            <p>
                                Selected patient for this appointment
                            </p>
                        </div>
                    </div>

                    <div className="appointment-patient-details">

                        <div>
                            <span>Patient ID</span>
                            <strong>
                                {patient.patient_id}
                            </strong>
                        </div>

                        <div>
                            <span>Name</span>
                            <strong>
                                {patient.name}
                            </strong>
                        </div>

                        <div>
                            <span>Phone</span>
                            <strong>
                                {patient.phone || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>Gender</span>
                            <strong>
                                {patient.gender || "-"}
                            </strong>
                        </div>

                    </div>

                </div>
            )}

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            {/* ==========================================
                APPOINTMENT FORM
            ========================================== */}

            <form
                className="appointment-create-form"
                onSubmit={handleSubmit}
            >

                <div className="form-section">

                    <div className="form-section-title">
                        Appointment Details
                    </div>

                    {/* Doctor */}

                    <div className="form-group">

                        <label>
                            Doctor
                        </label>

                        <select
                            value={doctor}
                            onChange={(e) =>
                                setDoctor(e.target.value)
                            }
                            disabled={loadingDoctors}
                        >

                            <option value="">
                                {loadingDoctors
                                    ? "Loading doctors..."
                                    : "Select Doctor"}
                            </option>

                            {doctors.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                    {" - "}
                                    {item.specialization}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Date */}

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Appointment Date
                            </label>

                            <input
                                type="date"
                                value={appointmentDate}
                                min={today}
                                onChange={(e) =>
                                    setAppointmentDate(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {/* Time */}

                        <div className="form-group">

                            <label>
                                Appointment Time
                            </label>

                            <input
                                type="time"
                                value={appointmentTime}
                                onChange={(e) =>
                                    setAppointmentTime(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* Appointment Type */}

                    <div className="form-group">

                        <label>
                            Appointment Type
                        </label>

                        <select
                            value={appointmentType}
                            onChange={(e) =>
                                setAppointmentType(
                                    e.target.value
                                )
                            }
                        >

                            <option value="WALK_IN">
                                Walk-in
                            </option>

                            <option value="PRIOR_BOOKING">
                                Prior Booking
                            </option>

                        </select>

                    </div>

                </div>

                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div className="appointment-form-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading || !patient}
                    >
                        <CalendarPlus size={16} />

                        {loading
                            ? "Creating..."
                            : "Create Appointment"}
                    </button>

                </div>

            </form>

        </ReceptionistLayout>
    );
}

export default AppointmentCreate;