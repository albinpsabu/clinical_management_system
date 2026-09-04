import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CalendarDays,
    Clock3,
    CheckCircle2,
    Users,
    Eye,
    RefreshCw,
} from "lucide-react";

import DoctorLayout from "../../components/doctor/DoctorLayout";
import { getDoctorAppointments } from "../../services/doctorApi";

function DoctorDashboard() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // TODAY
    // =====================================================

    const todayString = useMemo(() => {

        const today = new Date();

        return (
            today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0")
        );

    }, []);

    // =====================================================
    // LOAD APPOINTMENTS
    // =====================================================

    const loadAppointments = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getDoctorAppointments();

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

            setAppointments(data);

        } catch (err) {

            console.error(
                "Doctor dashboard error:",
                err.response?.data || err
            );

            if (err.response?.status === 401) {

                setError(
                    "Session expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You do not have permission to access this dashboard."
                );

            } else {

                setError(
                    err.response?.data?.error ||
                    "Unable to load appointments."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadAppointments();

    }, []);

    // =====================================================
    // TODAY'S APPOINTMENTS
    // =====================================================

    const todaysAppointments = useMemo(() => {

        return appointments
            .filter(
                (appointment) =>
                    appointment.appointment_date ===
                    todayString
            )
            .sort(
                (a, b) =>
                    String(
                        a.appointment_time || ""
                    ).localeCompare(
                        String(
                            b.appointment_time || ""
                        )
                    )
            );

    }, [appointments, todayString]);

    // =====================================================
    // COUNTS
    // =====================================================

    const pendingCount =
        appointments.filter(
            (appointment) =>
                appointment.status === "BOOKED"
        ).length;

    const completedCount =
        appointments.filter(
            (appointment) =>
                appointment.status === "CONSULTED"
        ).length;

    // =====================================================
    // STATUS
    // =====================================================

    const getStatus = (status) => {

        switch (status) {

            case "BOOKED":
                return "CONFIRMED";

            case "CONSULTED":
                return "CONSULTED";

            case "CANCELLED":
                return "CANCELLED";

            default:
                return status || "UNKNOWN";
        }

    };

    const getStatusClass = (status) => {

        switch (status) {

            case "BOOKED":
                return "doctor-status-booked";

            case "CONSULTED":
                return "doctor-status-consulted";

            case "CANCELLED":
                return "doctor-status-cancelled";

            default:
                return "doctor-status-in-progress";
        }

    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DoctorLayout
            title="Doctor Dashboard"
            showBack={false}
        >

            <div className="doctor-dashboard">

                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="doctor-alert doctor-alert-error">
                        {error}
                    </div>

                )}

                {/* =========================================
                    STATISTICS
                ========================================= */}

                <div className="doctor-dashboard-stats">

                    {/* TODAY */}

                    <button
                        type="button"
                        className="doctor-dashboard-stat"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        <div className="doctor-dashboard-stat-icon doctor-blue">
                            <CalendarDays size={21} />
                        </div>

                        <div className="doctor-dashboard-stat-content">

                            <span>
                                Today's Appointments
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : todaysAppointments.length}
                            </strong>

                            <small>
                                Scheduled today
                            </small>

                        </div>

                    </button>


                    {/* PENDING */}

                    <button
                        type="button"
                        className="doctor-dashboard-stat"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        <div className="doctor-dashboard-stat-icon doctor-orange">
                            <Clock3 size={21} />
                        </div>

                        <div className="doctor-dashboard-stat-content">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : pendingCount}
                            </strong>

                            <small>
                                Awaiting consultation
                            </small>

                        </div>

                    </button>


                    {/* COMPLETED */}

                    <button
                        type="button"
                        className="doctor-dashboard-stat"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        <div className="doctor-dashboard-stat-icon doctor-green">
                            <CheckCircle2 size={21} />
                        </div>

                        <div className="doctor-dashboard-stat-content">

                            <span>
                                Completed
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : completedCount}
                            </strong>

                            <small>
                                Consultations completed
                            </small>

                        </div>

                    </button>


                    {/* TOTAL */}

                    <button
                        type="button"
                        className="doctor-dashboard-stat"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        <div className="doctor-dashboard-stat-icon doctor-purple">
                            <Users size={21} />
                        </div>

                        <div className="doctor-dashboard-stat-content">

                            <span>
                                Total Appointments
                            </span>

                            <strong>
                                {loading
                                    ? "..."
                                    : appointments.length}
                            </strong>

                            <small>
                                All appointments
                            </small>

                        </div>

                    </button>

                </div>


                {/* =========================================
                    TODAY'S APPOINTMENTS
                ========================================= */}

                <section className="doctor-dashboard-card">

                    <div className="doctor-dashboard-section-header">

                        <div>

                            <h2>
                                Today's Appointments
                            </h2>

                            <p>
                                {todaysAppointments.length} appointment
                                {todaysAppointments.length !== 1
                                    ? "s"
                                    : ""}
                            </p>

                        </div>


                        <div className="doctor-dashboard-header-actions">

                            <button
                                type="button"
                                className="doctor-dashboard-refresh"
                                onClick={loadAppointments}
                                disabled={loading}
                                title="Refresh"
                            >

                                <RefreshCw
                                    size={15}
                                    className={
                                        loading
                                            ? "doctor-refresh-spin"
                                            : ""
                                    }
                                />

                                {loading
                                    ? "Refreshing..."
                                    : "Refresh"}

                            </button>


                            <button
                                type="button"
                                className="doctor-dashboard-view-all"
                                onClick={() =>
                                    navigate(
                                        "/doctor/appointments"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>

                    </div>


                    {/* =====================================
                        TABLE
                    ===================================== */}

                    <div className="doctor-dashboard-table-container">

                        <table className="doctor-dashboard-table">

                            <thead>

                                <tr>

                                    <th>
                                        Time
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Token
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

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="doctor-dashboard-empty"
                                        >
                                            Loading appointments...
                                        </td>

                                    </tr>

                                ) : todaysAppointments.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="doctor-dashboard-empty"
                                        >

                                            <CalendarDays
                                                size={30}
                                            />

                                            <span>
                                                No appointments today
                                            </span>

                                        </td>

                                    </tr>

                                ) : (

                                    todaysAppointments
                                        .slice(0, 6)
                                        .map(
                                            (appointment) => (

                                                <tr
                                                    key={
                                                        appointment.id
                                                    }
                                                >

                                                    {/* TIME */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                appointment.appointment_time
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* PATIENT */}

                                                    <td>

                                                        <div className="doctor-dashboard-patient">

                                                            <div className="doctor-dashboard-avatar">

                                                                <Users
                                                                    size={16}
                                                                />

                                                            </div>

                                                            <strong>
                                                                {
                                                                    appointment.patient_name ||
                                                                    `Patient #${appointment.patient}`
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    {/* PATIENT ID */}

                                                    <td>

                                                        {
                                                            appointment.patient_id ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                        {
                                                            appointment.appointment_type ===
                                                            "WALK_IN"
                                                                ? "Walk-in"
                                                                : appointment.appointment_type ===
                                                                  "PRIOR_BOOKING"
                                                                ? "Prior Booking"
                                                                : appointment.appointment_type ||
                                                                  "-"
                                                        }

                                                    </td>


                                                    {/* TOKEN */}

                                                    <td>

                                                        {
                                                            appointment.token_no ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`doctor-dashboard-status ${getStatusClass(
                                                                appointment.status
                                                            )}`}
                                                        >
                                                            {
                                                                getStatus(
                                                                    appointment.status
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="doctor-dashboard-view-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/doctor/appointments/${appointment.id}/patient`,
                                                                    {
                                                                        state: {
                                                                            appointment,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={14}
                                                            />

                                                            View

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </div>

        </DoctorLayout>

    );

}

export default DoctorDashboard;