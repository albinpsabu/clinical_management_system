import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    User,
    Phone,
    CalendarDays,
    HeartPulse,
    MapPin,
    Stethoscope,
} from "lucide-react";

import DoctorLayout from "../../components/doctor/DoctorLayout";

import {
    getDoctorPatient,
    getDoctorAppointments,
} from "../../services/doctorApi";


function DoctorPatientProfile() {

    const location = useLocation();
    const navigate = useNavigate();
    const { appointmentId } = useParams();


    // =========================================================
    // APPOINTMENT FROM ROUTER STATE
    // =========================================================

    const locationAppointment =
        location.state?.appointment || null;


    const [appointment, setAppointment] = useState(
        locationAppointment
    );


    const [patient, setPatient] = useState(
        locationAppointment?.patient_details ||
        locationAppointment?.patient_data ||
        null
    );


    const [loading, setLoading] = useState(
        !patient
    );


    const [error, setError] = useState("");


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "-";
        }

        try {

            const date = new Date(dateValue);

            if (Number.isNaN(date.getTime())) {
                return dateValue;
            }

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return dateValue;

        }
    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (timeValue) => {

        if (!timeValue) {
            return "-";
        }

        try {

            /*
             * Backend may return:
             *
             * 10:30:00
             *
             * or
             *
             * 10:30
             */

            const parts =
                String(timeValue).split(":");

            const hours =
                parseInt(parts[0], 10);

            const minutes =
                parseInt(parts[1] || "0", 10);

            if (
                Number.isNaN(hours) ||
                Number.isNaN(minutes)
            ) {
                return timeValue;
            }

            const date = new Date();

            date.setHours(
                hours,
                minutes,
                0,
                0
            );

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }
            );

        } catch {

            return timeValue;

        }
    };


    // =========================================================
    // FORMAT APPOINTMENT TYPE
    // =========================================================

    const formatAppointmentType = (type) => {

        if (!type) {
            return "-";
        }

        switch (type) {

            case "WALK_IN":
                return "Walk-in";

            case "PRIOR_BOOKING":
                return "Prior Booking";

            default:
                return String(type)
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(
                        /\b\w/g,
                        (char) => char.toUpperCase()
                    );

        }
    };


    // =========================================================
    // FORMAT APPOINTMENT STATUS
    // =========================================================

    const formatStatus = (status) => {

        if (!status) {
            return "-";
        }

        switch (status) {

            case "BOOKED":
                return "CONFIRMED";

            case "CONSULTED":
                return "CONSULTED";

            case "CANCELLED":
                return "CANCELLED";

            default:
                return String(status)
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(
                        /\b\w/g,
                        (char) => char.toUpperCase()
                    );

        }
    };


    // =========================================================
    // LOAD LATEST APPOINTMENT
    // =========================================================

    /*
     * The appointment object passed through React Router
     * state can be old.
     *
     * Therefore, whenever this page opens, we request the
     * appointments from the backend and find the appointment
     * using the URL appointmentId.
     *
     * This ensures that the appointment status is current.
     */

    useEffect(() => {

        const loadAppointment = async () => {

            try {

                const response =
                    await getDoctorAppointments();


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.results || [];


                const currentAppointment =
                    data.find(
                        (item) =>
                            String(item.id) ===
                            String(appointmentId)
                    );


                if (currentAppointment) {

                    setAppointment(
                        currentAppointment
                    );

                }

            } catch (err) {

                console.error(
                    "Appointment error:",
                    err.response?.data || err
                );

            }

        };


        if (appointmentId) {

            loadAppointment();

        }

    }, [appointmentId]);


    // =========================================================
    // LOAD PATIENT
    // =========================================================

    useEffect(() => {

        const loadPatient = async () => {

            /*
             * Backend expects patient_id such as:
             *
             * PAT001
             */

            const patientId =
                appointment?.patient_id;


            /*
             * If patient information is already available,
             * there is no need to request it again.
             */

            if (!patientId || patient) {

                setLoading(false);

                return;

            }


            try {

                const response =
                    await getDoctorPatient(
                        patientId
                    );


                /*
                 * Backend returns:
                 *
                 * {
                 *     patient: {...},
                 *     consultations: [...]
                 * }
                 */

                setPatient(
                    response.data?.patient || null
                );


            } catch (err) {

                console.error(
                    "Patient error:",
                    err.response?.data || err
                );


                setError(
                    "Unable to load patient information."
                );


            } finally {

                setLoading(false);

            }

        };


        loadPatient();

    }, [appointment, patient]);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <DoctorLayout
                title="Patient Profile"
            >

                <div className="doctor-loading">

                    Loading patient information...

                </div>

            </DoctorLayout>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <DoctorLayout
            title="Patient Profile"
            subtitle="Review patient information before consultation."
        >

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="doctor-error">

                    {error}

                </div>

            )}


            <section className="doctor-patient-profile-card">


                {/* =================================================
                   PATIENT HEADER
                ================================================= */}

                <div className="doctor-profile-header">

                    <div className="doctor-profile-avatar">

                        <User size={30} />

                    </div>


                    <div>

                        <h2>

                            {patient?.name ||
                                appointment?.patient_name ||
                                "Patient"}

                        </h2>


                        <p>

                            Patient ID:{" "}

                            {patient?.patient_id ||
                                appointment?.patient_id ||
                                "-"}

                        </p>

                    </div>

                </div>


                {/* =================================================
                   PATIENT INFORMATION
                ================================================= */}

                <div className="doctor-patient-info-grid">


                    {/* =================================================
                       AGE
                    ================================================= */}

                    <div className="doctor-info-item">

                        <User size={18} />

                        <div>

                            <span>
                                Age
                            </span>

                            <strong>

                                {patient?.age || "-"}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                       GENDER
                    ================================================= */}

                    <div className="doctor-info-item">

                        <User size={18} />

                        <div>

                            <span>
                                Gender
                            </span>

                            <strong>

                                {patient?.gender || "-"}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                       BLOOD GROUP
                    ================================================= */}

                    <div className="doctor-info-item">

                        <HeartPulse size={18} />

                        <div>

                            <span>
                                Blood Group
                            </span>

                            <strong>

                                {patient?.blood_group || "-"}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                       PHONE
                    ================================================= */}

                    <div className="doctor-info-item">

                        <Phone size={18} />

                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>

                                {patient?.phone || "-"}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                       DATE OF BIRTH
                    ================================================= */}

                    <div className="doctor-info-item">

                        <CalendarDays size={18} />

                        <div>

                            <span>
                                Date of Birth
                            </span>

                            <strong>

                                {formatDate(
                                    patient?.dob
                                )}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                       ADDRESS
                    ================================================= */}

                    <div className="doctor-info-item">

                        <MapPin size={18} />

                        <div>

                            <span>
                                Address
                            </span>

                            <strong>

                                {patient?.address || "-"}

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   APPOINTMENT SUMMARY
                ================================================= */}

                <div className="doctor-appointment-summary">

                    <h3>
                        Appointment
                    </h3>


                    <div className="doctor-summary-grid">


                        {/* =================================================
                           DATE
                        ================================================= */}

                        <div>

                            <span>
                                Date
                            </span>

                            <strong>

                                {formatDate(
                                    appointment?.appointment_date
                                )}

                            </strong>

                        </div>


                        {/* =================================================
                           TIME
                        ================================================= */}

                        <div>

                            <span>
                                Time
                            </span>

                            <strong>

                                {formatTime(
                                    appointment?.appointment_time
                                )}

                            </strong>

                        </div>


                        {/* =================================================
                           TYPE
                        ================================================= */}

                        <div>

                            <span>
                                Type
                            </span>

                            <strong>

                                {formatAppointmentType(
                                    appointment?.appointment_type
                                )}

                            </strong>

                        </div>


                        {/* =================================================
                           STATUS
                        ================================================= */}

                        <div>

                            <span>
                                Status
                            </span>

                            <strong>

                                {formatStatus(
                                    appointment?.status
                                )}

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   ACTION BUTTONS
                ================================================= */}

                <div className="doctor-profile-actions">


                    {/* =================================================
                       BACK
                    ================================================= */}

                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() => navigate(-1)}
                    >

                        Back

                    </button>


                    {/* =================================================
                       CONSULT
                    ================================================= */}

                    <button
                        type="button"
                        className="doctor-consult-button"

                        disabled={
                            appointment?.status ===
                            "CONSULTED"
                        }

                        onClick={() =>
                            navigate(
                                `/doctor/appointments/${appointmentId}/consult`,
                                {
                                    state: {
                                        appointment,
                                        patient,
                                    },
                                }
                            )
                        }
                    >

                        <Stethoscope size={18} />


                        {appointment?.status ===
                        "CONSULTED"

                            ? "Already Consulted"

                            : "Consult"

                        }

                    </button>

                </div>

            </section>

        </DoctorLayout>

    );

}


export default DoctorPatientProfile;