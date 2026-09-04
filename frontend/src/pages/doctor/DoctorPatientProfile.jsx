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
import { getDoctorPatient } from "../../services/doctorApi";

function DoctorPatientProfile() {

    const location = useLocation();
    const navigate = useNavigate();
    const { appointmentId } = useParams();

    const appointment = location.state?.appointment;

    const [patient, setPatient] = useState(
        appointment?.patient_details ||
        appointment?.patient_data ||
        null
    );

    const [loading, setLoading] = useState(!patient);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadPatient = async () => {

            // Backend expects patient_id such as PAT001
            const patientId = appointment?.patient_id;

            if (!patientId || patient) {
                setLoading(false);
                return;
            }

            try {

                const response = await getDoctorPatient(patientId);

                // Backend returns:
                // { patient: {...}, consultations: [...] }

                setPatient(response.data?.patient || null);

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


    /* =====================================================
       LOADING
       ===================================================== */

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


    /* =====================================================
       PAGE
       ===================================================== */

    return (

        <DoctorLayout
            title="Patient Profile"
            subtitle="Review patient information before consultation."
        >

            {/* ERROR */}

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


                    {/* AGE */}

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


                    {/* GENDER */}

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


                    {/* BLOOD GROUP */}

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


                    {/* PHONE */}

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


                    {/* DATE OF BIRTH */}

                    <div className="doctor-info-item">

                        <CalendarDays size={18} />

                        <div>

                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {patient?.dob || "-"}
                            </strong>

                        </div>

                    </div>


                    {/* ADDRESS */}

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


                        {/* DATE */}

                        <div>

                            <span>
                                Date
                            </span>

                            <strong>
                                {appointment?.appointment_date || "-"}
                            </strong>

                        </div>


                        {/* TIME */}

                        <div>

                            <span>
                                Time
                            </span>

                            <strong>
                                {appointment?.appointment_time || "-"}
                            </strong>

                        </div>


                        {/* TYPE */}

                        <div>

                            <span>
                                Type
                            </span>

                            <strong>
                                {appointment?.appointment_type || "-"}
                            </strong>

                        </div>


                        {/* STATUS */}

                        <div>

                            <span>
                                Status
                            </span>

                            <strong>
                                {appointment?.status || "-"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                   ACTION BUTTONS
                   ================================================= */}

                <div className="doctor-profile-actions">


                    {/* BACK */}

                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>


                    {/* CONSULT */}

                    <button
                        type="button"
                        className="doctor-consult-button"

                        disabled={
                            appointment?.status === "CONSULTED"
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

                        {appointment?.status === "CONSULTED"
                            ? "Already Consulted"
                            : "Consult"}

                    </button>

                </div>

            </section>

        </DoctorLayout>
    );
}

export default DoctorPatientProfile;