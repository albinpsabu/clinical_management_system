import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft } from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";


function AppointmentCreate() {

    const navigate = useNavigate();
    const location = useLocation();


    // ==================================================
    // PATIENT
    // ==================================================

    const patientFromState =
        location.state?.patient;


    const [patient, setPatient] =
        useState(patientFromState || null);


    // ==================================================
    // DOCTORS
    // ==================================================

    const [doctors, setDoctors] =
        useState([]);


    const [doctor, setDoctor] =
        useState("");


    // ==================================================
    // APPOINTMENT
    // ==================================================

    const [appointmentDate, setAppointmentDate] =
        useState("");


    const [appointmentTime, setAppointmentTime] =
        useState("");


    const [appointmentType, setAppointmentType] =
        useState("WALK_IN");


    // ==================================================
    // STATUS
    // ==================================================

    const [loading, setLoading] =
        useState(false);


    const [loadingDoctors, setLoadingDoctors] =
        useState(true);


    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD PATIENT
    // ==================================================

    useEffect(() => {

        const loadPatient = async () => {

            if (patientFromState) {

                setPatient(
                    patientFromState
                );

                return;

            }


            setError(
                "Patient information is missing."
            );

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

                setError("");


                const response =
                    await api.get(
                        "/receptionist/doctors/"
                    );


                setDoctors(
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );


            } catch (err) {

                console.error(
                    "Doctor loading error:",
                    err
                );


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
    // TODAY
    // ==================================================

    const today = new Date();

    const todayString =
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${String(
            today.getDate()
        ).padStart(2, "0")}`;


    // ==================================================
    // CURRENT TIME
    // ==================================================

    const currentTime =
        `${String(
            today.getHours()
        ).padStart(2, "0")}:${String(
            today.getMinutes()
        ).padStart(2, "0")}`;


    // ==================================================
    // DATE CHANGE
    // ==================================================

    const handleDateChange = (e) => {

        const value =
            e.target.value;


        setAppointmentDate(value);

        setError("");


        /*
         * If the user changes the date from
         * today to another day, there is no
         * reason to keep a previously selected
         * time restriction.
         */

        if (
            value !== todayString &&
            appointmentTime
        ) {

            setAppointmentTime(
                appointmentTime
            );

        }


        /*
         * If the selected date is today and
         * the existing time is already in the
         * past, clear it.
         */

        if (
            value === todayString &&
            appointmentTime &&
            appointmentTime < currentTime
        ) {

            setAppointmentTime("");

        }

    };


    // ==================================================
    // APPOINTMENT TIME OPTIONS
    // ==================================================

    const timeOptions = [];

    for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 17 && minute > 0) {
                continue;
            }

            const value =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            const displayHour = hour % 12 || 12;
            const period = hour >= 12 ? "PM" : "AM";

            timeOptions.push({
                value,
                label:
                    `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`,
            });
        }
    }


    // ==================================================
    // TIME CHANGE
    // ==================================================

    const handleTimeChange = (e) => {

        const value =
            e.target.value;


        setError("");


        /*
         * Prevent selecting a past time
         * when appointment date is today.
         */

        if (
            appointmentDate === todayString &&
            value < currentTime
        ) {

            setError(
                "Please select a future appointment time."
            );

            setAppointmentTime("");

            return;

        }


        setAppointmentTime(value);

    };


    // ==================================================
    // CREATE APPOINTMENT
    // ==================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (loading) {

            return;

        }


        setError("");


        // ----------------------------------------------
        // PATIENT
        // ----------------------------------------------

        if (!patient) {

            setError(
                "Patient information is missing."
            );

            return;

        }


        // ----------------------------------------------
        // DOCTOR
        // ----------------------------------------------

        if (!doctor) {

            setError(
                "Please select a doctor."
            );

            return;

        }


        const selectedDoctor =
            doctors.find(
                (item) =>
                    String(item.id) ===
                    String(doctor)
            );


        if (!selectedDoctor) {

            setError(
                "Selected doctor was not found."
            );

            return;

        }


        // ----------------------------------------------
        // DATE
        // ----------------------------------------------

        if (!appointmentDate) {

            setError(
                "Please select an appointment date."
            );

            return;

        }


        if (
            appointmentDate <
            todayString
        ) {

            setError(
                "Appointment date cannot be in the past."
            );

            return;

        }


        // ----------------------------------------------
        // TIME
        // ----------------------------------------------

        if (!appointmentTime) {

            setError(
                "Please select an appointment time."
            );

            return;

        }


        if (
            appointmentDate === todayString &&
            appointmentTime < currentTime
        ) {

            setError(
                "Please select a future appointment time."
            );

            return;

        }


        // ----------------------------------------------
        // APPOINTMENT TYPE
        // ----------------------------------------------

        if (!appointmentType) {

            setError(
                "Please select an appointment type."
            );

            return;

        }


        try {

            setLoading(true);


            // ------------------------------------------
            // CREATE
            // ------------------------------------------

            const response =
                await api.post(
                    "/receptionist/appointments/",
                    {
                        patient: patient.id,

                        doctor: Number(doctor),

                        appointment_date:
                            appointmentDate,

                        appointment_time:
                            appointmentTime,

                        appointment_type:
                            appointmentType,
                    }
                );


            const appointment =
                response.data;


            // ------------------------------------------
            // GO TO BILLING
            // ------------------------------------------

            navigate(
                "/receptionist/billing",
                {
                    state: {
                        appointment,
                        patient,
                        doctor:
                            selectedDoctor,
                    },
                }
            );


        } catch (err) {

            console.error(
                "Appointment creation error:",
                err
            );


            const responseData =
                err.response?.data;


            if (responseData) {

                if (
                    responseData.appointment_date
                ) {

                    setError(
                        Array.isArray(
                            responseData.appointment_date
                        )
                            ? responseData.appointment_date[0]
                            : responseData.appointment_date
                    );

                } else if (
                    responseData.appointment_time
                ) {

                    setError(
                        Array.isArray(
                            responseData.appointment_time
                        )
                            ? responseData.appointment_time[0]
                            : responseData.appointment_time
                    );

                } else if (
                    responseData.doctor
                ) {

                    setError(
                        Array.isArray(
                            responseData.doctor
                        )
                            ? responseData.doctor[0]
                            : responseData.doctor
                    );

                } else if (
                    responseData.appointment_type
                ) {

                    setError(
                        Array.isArray(
                            responseData.appointment_type
                        )
                            ? responseData.appointment_type[0]
                            : responseData.appointment_type
                    );

                } else if (
                    responseData.detail
                ) {

                    setError(
                        responseData.detail
                    );

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
    // RENDER
    // ==================================================

    return (

        <ReceptionistLayout
            title="Create Appointment"
            subtitle="Schedule an appointment for the selected patient."
            showBack={false}
        >

            {/* ==========================================
                BACK
            ========================================== */}

            <button
                className="back-button"
                onClick={() => navigate(-1)}
                type="button"
            >

                <ArrowLeft size={18} />

                <span>
                    Back
                </span>

            </button>


            {/* ==========================================
                PATIENT INFORMATION
            ========================================== */}

            {patient && (

                <div className="appointment-patient-card">

                    <div className="appointment-patient-header">

                        <div>

                            <h3>
                                Patient Information
                            </h3>

                            <p>
                                Selected patient for this appointment
                            </p>

                        </div>

                    </div>


                    <div className="appointment-patient-details">

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
                                Phone
                            </span>

                            <strong>
                                {patient.phone || "-"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Gender
                            </span>

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


                    {/* ==================================
                        DOCTOR
                    ================================== */}

                    <div className="form-group">

                        <label>
                            Doctor
                        </label>

                        <select
                            value={doctor}
                            onChange={(e) =>
                                setDoctor(
                                    e.target.value
                                )
                            }
                            disabled={
                                loadingDoctors ||
                                loading
                            }
                            required
                        >

                            <option value="">

                                {loadingDoctors
                                    ? "Loading doctors..."
                                    : "Select Doctor"}

                            </option>


                            {doctors.map(
                                (item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >

                                        {item.name}

                                        {" - "}

                                        {item.specialization}

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* ==================================
                        DATE + TIME
                    ================================== */}

                    <div className="form-row">


                        {/* DATE */}

                        <div className="form-group">

                            <label>
                                Appointment Date
                            </label>

                            <input
                                type="date"
                                value={
                                    appointmentDate
                                }
                                min={todayString}
                                onChange={
                                    handleDateChange
                                }
                                onClick={(e) =>
                                    e.currentTarget.showPicker?.()
                                }
                                disabled={loading}
                                required
                            />

                            <small>
                                Select today or a future date.
                            </small>

                        </div>


                        {/* TIME */}

                        <div className="form-group">

                            <label>
                                Appointment Time
                            </label>

                            <select
                                value={
                                    appointmentTime
                                }
                                onChange={
                                    handleTimeChange
                                }
                                disabled={
                                    loading ||
                                    !appointmentDate
                                }
                                required
                            >
                                <option value="">
                                    Select appointment time
                                </option>

                                {timeOptions
                                    .filter((time) => {
                                        if (
                                            appointmentDate ===
                                            todayString
                                        ) {
                                            return (
                                                time.value >=
                                                currentTime
                                            );
                                        }

                                        return true;
                                    })
                                    .map((time) => (
                                        <option
                                            key={time.value}
                                            value={time.value}
                                        >
                                            {time.label}
                                        </option>
                                    ))}
                            </select>

                            <small>
                                Select an available appointment time.
                            </small>

                        </div>

                    </div>


                    {/* ==================================
                        APPOINTMENT TYPE
                    ================================== */}

                    <div className="form-group">

                        <label>
                            Appointment Type
                        </label>

                        <select
                            value={
                                appointmentType
                            }
                            onChange={(e) =>
                                setAppointmentType(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                            required
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
                        onClick={() =>
                            navigate(-1)
                        }
                        disabled={loading}
                    >

                        Cancel

                    </button>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading ||
                            !patient ||
                            loadingDoctors
                        }
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