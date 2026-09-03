import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
    CalendarDays,
    Search,
    RefreshCw,
    UserRound,
    Stethoscope,
    Clock3,
    CheckCircle2,
    XCircle,
    Eye,
    X,
} from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";

function Appointments() {
    const location = useLocation();

    const [appointments, setAppointments] = useState([]);

    const [appointmentSearch, setAppointmentSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showTodayOnly, setShowTodayOnly] = useState(
        location.state?.showToday === true
    );

    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showCancelModal, setShowCancelModal] =
        useState(false);

    const [appointmentToCancel, setAppointmentToCancel] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    // ==================================================
    // TODAY
    // ==================================================

    const today = new Date()
        .toISOString()
        .split("T")[0];

    // ==================================================
    // LOAD APPOINTMENTS
    // ==================================================

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/receptionist/appointments/"
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "Appointment loading error:",
                err.response?.data || err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to access appointments."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
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

    // ==================================================
    // HANDLE DASHBOARD TODAY BUTTON
    // ==================================================

    useEffect(() => {
        if (location.state?.showToday === true) {
            setShowTodayOnly(true);
        }
    }, [location.state]);

    // ==================================================
    // VIEW APPOINTMENT
    // ==================================================

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setSelectedAppointment(null);
        setShowViewModal(false);
    };

    // ==================================================
    // TODAY FILTER
    // ==================================================

    const handleTodayClick = () => {
        setShowTodayOnly(true);
        setAppointmentSearch("");
        setStatusFilter("ALL");
        setError("");
        setSuccess("");
    };

    const handleAllAppointmentsClick = () => {
        setShowTodayOnly(false);
        setError("");
        setSuccess("");
    };

    // ==================================================
    // CANCEL APPOINTMENT
    // ==================================================

    const openCancelModal = (appointment) => {
        setError("");
        setSuccess("");

        if (appointment.status === "CONSULTED") {
            setError(
                "A consulted appointment cannot be cancelled."
            );
            return;
        }

        if (appointment.status === "CANCELLED") {
            setError(
                "This appointment is already cancelled."
            );
            return;
        }

        setAppointmentToCancel(appointment);
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        if (cancellingId !== null) {
            return;
        }

        setShowCancelModal(false);
        setAppointmentToCancel(null);
    };

    const handleCancelAppointment = async () => {
        if (!appointmentToCancel) {
            return;
        }

        try {
            setCancellingId(
                appointmentToCancel.id
            );

            setError("");
            setSuccess("");

            const response = await api.post(
                `/receptionist/appointments/${appointmentToCancel.id}/cancel/`
            );

            const updatedAppointment =
                response.data?.appointment;

            setAppointments((previous) =>
                previous.map((appointment) =>
                    appointment.id ===
                    appointmentToCancel.id
                        ? updatedAppointment || {
                              ...appointment,
                              status: "CANCELLED",
                          }
                        : appointment
                )
            );

            setSuccess(
                "Appointment cancelled successfully."
            );

            setShowCancelModal(false);
            setAppointmentToCancel(null);
        } catch (err) {
            console.error(
                "Cancel appointment error:",
                err.response?.data || err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your login session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to cancel appointments."
                );
            } else {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Unable to cancel appointment."
                );
            }
        } finally {
            setCancellingId(null);
        }
    };

    // ==================================================
    // FORMAT HELPERS
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

    const formatType = (type) => {
        if (type === "PRIOR_BOOKING") {
            return "Prior Booking";
        }

        if (type === "WALK_IN") {
            return "Walk-in";
        }

        return type || "-";
    };

    const formatStatus = (status) => {
        if (status === "BOOKED") {
            return "Booked";
        }

        if (status === "CONSULTED") {
            return "Consulted";
        }

        if (status === "CANCELLED") {
            return "Cancelled";
        }

        return status || "-";
    };

    // ==================================================
    // STATISTICS
    // ==================================================

    const statistics = useMemo(() => {
        return {
            today: appointments.filter(
                (item) =>
                    item.appointment_date === today
            ).length,

            booked: appointments.filter(
                (item) =>
                    item.status === "BOOKED"
            ).length,

            consulted: appointments.filter(
                (item) =>
                    item.status === "CONSULTED"
            ).length,

            cancelled: appointments.filter(
                (item) =>
                    item.status === "CANCELLED"
            ).length,
        };
    }, [appointments, today]);

    // ==================================================
    // FILTER APPOINTMENTS
    // ==================================================

    const filteredAppointments = useMemo(() => {
        const search =
            appointmentSearch
                .trim()
                .toLowerCase();

        return appointments.filter(
            (appointment) => {
                const matchesSearch =
                    !search ||
                    String(
                        appointment.patient_name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        appointment.doctor_name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        appointment.doctor_code || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        appointment.patient || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        appointment.id || ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    statusFilter === "ALL" ||
                    appointment.status ===
                        statusFilter;

                const matchesToday =
                    !showTodayOnly ||
                    appointment.appointment_date ===
                        today;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesToday
                );
            }
        );
    }, [
        appointments,
        appointmentSearch,
        statusFilter,
        showTodayOnly,
        today,
    ]);

    // ==================================================
    // PAGE
    // ==================================================

    return (
        <ReceptionistLayout
            title="Appointments"
            subtitle={
                showTodayOnly
                    ? "Today's appointments."
                    : "View and manage patient appointments."
            }
        >

            {/* =========================================
                ALERTS
            ========================================= */}

            {error && (
                <div className="appointment-alert appointment-error">

                    <XCircle size={18} />

                    <span>{error}</span>

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

            {success && (
                <div className="appointment-alert appointment-success">

                    <CheckCircle2 size={18} />

                    <span>{success}</span>

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
                TOP SUMMARY
            ========================================= */}

            <div className="appointment-top-actions">

                <div>
                    <h2 className="appointment-page-heading">
                        {showTodayOnly
                            ? "Today's Appointments"
                            : "Appointment List"}
                    </h2>

                    <p className="appointment-page-subheading">
                        {showTodayOnly
                            ? `Appointments scheduled for ${formatDate(
                                  today
                              )}.`
                            : "View, search and manage scheduled appointments."}
                    </p>
                </div>

                <div className="appointment-top-buttons">

                    {showTodayOnly ? (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleAllAppointmentsClick
                            }
                        >
                            <CalendarDays size={15} />
                            All Appointments
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                handleTodayClick
                            }
                        >
                            <CalendarDays size={15} />
                            Today's Appointments
                        </button>
                    )}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            loadAppointments
                        }
                        disabled={loading}
                    >
                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>

                </div>

            </div>

            {/* =========================================
                STATISTICS
            ========================================= */}

            <div className="appointment-stats">

                <div className="appointment-stat">

                    <div className="appointment-stat-icon blue">
                        <CalendarDays size={20} />
                    </div>

                    <div>
                        <span>
                            Today's Appointments
                        </span>

                        <strong>
                            {statistics.today}
                        </strong>
                    </div>

                </div>

                <div className="appointment-stat">

                    <div className="appointment-stat-icon green">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Booked</span>

                        <strong>
                            {statistics.booked}
                        </strong>
                    </div>

                </div>

                <div className="appointment-stat">

                    <div className="appointment-stat-icon purple">
                        <Stethoscope size={20} />
                    </div>

                    <div>
                        <span>Consulted</span>

                        <strong>
                            {statistics.consulted}
                        </strong>
                    </div>

                </div>

                <div className="appointment-stat">

                    <div className="appointment-stat-icon red">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Cancelled</span>

                        <strong>
                            {statistics.cancelled}
                        </strong>
                    </div>

                </div>

            </div>

            {/* =========================================
                APPOINTMENT LIST
            ========================================= */}

            <section className="page-card">

                <div className="card-heading">

                    <div>
                        <h2>
                            {showTodayOnly
                                ? "Today's Appointments"
                                : "Appointment List"}
                        </h2>

                        <p>
                            {filteredAppointments.length}{" "}
                            appointment
                            {filteredAppointments.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>

                </div>

                {/* =====================================
                    FILTER BAR
                ===================================== */}

                <div className="appointment-filter-bar">

                    <div className="appointment-list-search">

                        <Search size={16} />

                        <input
                            type="text"
                            value={
                                appointmentSearch
                            }
                            onChange={(e) =>
                                setAppointmentSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search patient, doctor or ID"
                        />

                        {appointmentSearch && (
                            <button
                                type="button"
                                className="clear-search"
                                onClick={() =>
                                    setAppointmentSearch(
                                        ""
                                    )
                                }
                            >
                                <X size={14} />
                            </button>
                        )}

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="BOOKED">
                            Booked
                        </option>

                        <option value="CONSULTED">
                            Consulted
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>

                </div>

                {/* =====================================
                    TABLE
                ===================================== */}

                {loading ? (

                    <div className="appointment-empty-state">

                        <div className="spinner-border text-primary" />

                        <p>
                            Loading appointments...
                        </p>

                    </div>

                ) : filteredAppointments.length ===
                  0 ? (

                    <div className="appointment-empty-state">

                        <CalendarDays size={35} />

                        <h3>
                            {showTodayOnly
                                ? "No appointments today"
                                : "No appointments found"}
                        </h3>

                        <p>
                            {showTodayOnly
                                ? "There are no appointments scheduled for today."
                                : "No appointments match your current search or filter."}
                        </p>

                        {showTodayOnly && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleAllAppointmentsClick
                                }
                            >
                                View All Appointments
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="simple-table appointments-table">

                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Type</th>
                                    <th>Token</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredAppointments.map(
                                    (appointment) => (

                                        <tr
                                            key={
                                                appointment.id
                                            }
                                        >

                                            {/* PATIENT */}

                                            <td>

                                                <div className="table-person">

                                                    <div className="person-icon patient-icon">
                                                        <UserRound
                                                            size={15}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                appointment.patient_name ||
                                                                `Patient #${appointment.patient}`
                                                            }
                                                        </strong>

                                                        <span>
                                                            ID:{" "}
                                                            {
                                                                appointment.patient
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* DOCTOR */}

                                            <td>

                                                <div className="table-person">

                                                    <div className="person-icon doctor-icon">
                                                        <Stethoscope
                                                            size={15}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                appointment.doctor_name ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                appointment.doctor_code ||
                                                                `Doctor #${appointment.doctor}`
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* DATE / TIME */}

                                            <td>

                                                <div className="appointment-date-cell">

                                                    <strong>
                                                        {formatDate(
                                                            appointment.appointment_date
                                                        )}
                                                    </strong>

                                                    <span>
                                                        <Clock3
                                                            size={12}
                                                        />

                                                        {formatTime(
                                                            appointment.appointment_time
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* TYPE */}

                                            <td>

                                                <span className="appointment-type-badge">
                                                    {
                                                        formatType(
                                                            appointment.appointment_type
                                                        )
                                                    }
                                                </span>

                                            </td>

                                            {/* TOKEN */}

                                            <td>

                                                {appointment.token_no ? (

                                                    <span className="appointment-token">
                                                        #
                                                        {
                                                            appointment.token_no
                                                        }
                                                    </span>

                                                ) : (

                                                    <span className="no-token">
                                                        -
                                                    </span>

                                                )}

                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        `appointment-status ${
                                                            appointment.status ===
                                                            "BOOKED"
                                                                ? "booked"
                                                                : appointment.status ===
                                                                  "CONSULTED"
                                                                    ? "consulted"
                                                                    : "cancelled"
                                                        }`
                                                    }
                                                >

                                                    {appointment.status ===
                                                        "BOOKED" && (
                                                        <span className="status-dot" />
                                                    )}

                                                    {appointment.status ===
                                                        "CONSULTED" && (
                                                        <CheckCircle2
                                                            size={13}
                                                        />
                                                    )}

                                                    {appointment.status ===
                                                        "CANCELLED" && (
                                                        <XCircle
                                                            size={13}
                                                        />
                                                    )}

                                                    {
                                                        formatStatus(
                                                            appointment.status
                                                        )
                                                    }

                                                </span>

                                            </td>

                                            {/* ACTION */}

                                            <td>

                                                <div className="appointment-actions">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        className="view-appointment-button"
                                                        onClick={() =>
                                                            handleViewAppointment(
                                                                appointment
                                                            )
                                                        }
                                                        title="View appointment"
                                                    >
                                                        <Eye
                                                            size={14}
                                                        />
                                                        View
                                                    </button>

                                                    {/* CANCEL */}

                                                    {appointment.status ===
                                                        "BOOKED" && (

                                                        <button
                                                            type="button"
                                                            className="cancel-appointment-button"
                                                            onClick={() =>
                                                                openCancelModal(
                                                                    appointment
                                                                )
                                                            }
                                                            disabled={
                                                                cancellingId ===
                                                                appointment.id
                                                            }
                                                        >

                                                            {cancellingId ===
                                                            appointment.id ? (
                                                                <>
                                                                    <span className="button-spinner" />
                                                                    Cancelling
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Cancel
                                                                </>
                                                            )}

                                                        </button>

                                                    )}

                                                    {appointment.status ===
                                                        "CONSULTED" && (

                                                        <span className="action-text">
                                                            Completed
                                                        </span>

                                                    )}

                                                    {appointment.status ===
                                                        "CANCELLED" && (

                                                        <span className="action-text">
                                                            Cancelled
                                                        </span>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

            {/* =========================================
                VIEW APPOINTMENT MODAL
            ========================================= */}

            {showViewModal &&
                selectedAppointment && (

                    <div
                        className="modal-overlay"
                        onClick={
                            closeViewModal
                        }
                    >

                        <div
                            className="appointment-view-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>
                                    <h2>
                                        Appointment Details
                                    </h2>

                                    <p>
                                        View appointment information
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <div className="appointment-view-body">

                                {/* APPOINTMENT ID */}

                                <div className="appointment-detail-highlight">

                                    <span>
                                        Appointment ID
                                    </span>

                                    <strong>
                                        #
                                        {
                                            selectedAppointment.id
                                        }
                                    </strong>

                                </div>

                                {/* PATIENT */}

                                <div className="appointment-detail-section">

                                    <h3>
                                        Patient Information
                                    </h3>

                                    <div className="appointment-detail-grid">

                                        <div>
                                            <span>
                                                Patient Name
                                            </span>

                                            <strong>
                                                {
                                                    selectedAppointment.patient_name ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Patient ID
                                            </span>

                                            <strong>
                                                {
                                                    selectedAppointment.patient
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                {/* DOCTOR */}

                                <div className="appointment-detail-section">

                                    <h3>
                                        Doctor Information
                                    </h3>

                                    <div className="appointment-detail-grid">

                                        <div>
                                            <span>
                                                Doctor
                                            </span>

                                            <strong>
                                                {
                                                    selectedAppointment.doctor_name ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Doctor ID
                                            </span>

                                            <strong>
                                                {
                                                    selectedAppointment.doctor_code ||
                                                    selectedAppointment.doctor
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                                {/* APPOINTMENT */}

                                <div className="appointment-detail-section">

                                    <h3>
                                        Appointment Information
                                    </h3>

                                    <div className="appointment-detail-grid">

                                        <div>
                                            <span>
                                                Date
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedAppointment.appointment_date
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Time
                                            </span>

                                            <strong>
                                                {formatTime(
                                                    selectedAppointment.appointment_time
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Type
                                            </span>

                                            <strong>
                                                {formatType(
                                                    selectedAppointment.appointment_type
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Token Number
                                            </span>

                                            <strong>
                                                {selectedAppointment.token_no
                                                    ? `#${selectedAppointment.token_no}`
                                                    : "Not assigned"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {formatStatus(
                                                    selectedAppointment.status
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                                {selectedAppointment.status ===
                                    "BOOKED" && (

                                    <button
                                        type="button"
                                        className="delete-confirm-button"
                                        onClick={() => {
                                            closeViewModal();
                                            openCancelModal(
                                                selectedAppointment
                                            );
                                        }}
                                    >
                                        <XCircle
                                            size={14}
                                        />
                                        Cancel Appointment
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>
                )}

            {/* =========================================
                CANCEL MODAL
            ========================================= */}

            {showCancelModal &&
                appointmentToCancel && (

                    <div
                        className="modal-overlay"
                        onClick={
                            closeCancelModal
                        }
                    >

                        <div
                            className="delete-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="delete-icon">
                                <XCircle size={24} />
                            </div>

                            <h2>
                                Cancel Appointment?
                            </h2>

                            <p>
                                Are you sure you want
                                to cancel this appointment?
                            </p>

                            <div className="appointment-cancel-details">

                                <div>
                                    <span>
                                        Patient
                                    </span>

                                    <strong>
                                        {
                                            appointmentToCancel.patient_name ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Doctor
                                    </span>

                                    <strong>
                                        {
                                            appointmentToCancel.doctor_name ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            appointmentToCancel.appointment_date
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Time
                                    </span>

                                    <strong>
                                        {formatTime(
                                            appointmentToCancel.appointment_time
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <div className="delete-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeCancelModal
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                >
                                    Keep Appointment
                                </button>

                                <button
                                    type="button"
                                    className="delete-confirm-button"
                                    onClick={
                                        handleCancelAppointment
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                >
                                    {cancellingId !==
                                    null
                                        ? "Cancelling..."
                                        : "Yes, Cancel"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </ReceptionistLayout>
    );
}

export default Appointments;