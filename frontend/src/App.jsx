import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";

// ==================================================
// RECEPTIONIST PAGES
// ==================================================

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import Patients from "./pages/receptionist/Patients";
import PatientDetails from "./pages/receptionist/PatientDetails";
import Appointments from "./pages/receptionist/Appointments";
import AppointmentCreate from "./pages/receptionist/AppointmentCreate";
import Billing from "./pages/receptionist/Billing";
import Payment from "./pages/receptionist/Payment";
import BillingHistory from "./pages/receptionist/BillingHistory";

import "./App.css";
import "./doctor.css";

// ==================================================
// PROTECTED ROUTE
// ==================================================

function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("role");

    // User is not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // User does not have the required role
    if (role && userRole !== role) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

// ==================================================
// UNAUTHORIZED PAGE
// ==================================================

function Unauthorized() {
    return (
        <div className="unauthorized-page">
            <div className="unauthorized-box">
                <h2>
                    Access Denied
                </h2>

                <p>
                    You do not have permission
                    to access this page.
                </p>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
}

// ==================================================
// PLACEHOLDER PAGES
// ==================================================

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatientProfile from "./pages/doctor/DoctorPatientProfile";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";

function LaboratoryDashboard() {
    return (
        <div>
            <h1>Laboratory Dashboard</h1>
        </div>
    );
}

// ==================================================
// PHARMACIST PAGES
// ==================================================

import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";
import Medicines from "./pages/pharmacist/Medicines";
import PharmacistPatients from "./pages/pharmacist/Patients";
import PatientPrescriptions from "./pages/pharmacist/PatientPrescriptions";
import Dispense from "./pages/pharmacist/Dispense";
import Bills from "./pages/pharmacist/Bills";
import SalesReports from "./pages/pharmacist/SalesReports";

import "./styles/pharmacist.css";

// ==================================================
// APP
// ==================================================

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ==============================================
                    HOME
                ============================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* ==============================================
                    LOGIN
                ============================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* ==============================================
                    UNAUTHORIZED
                ============================================== */}

                <Route
                    path="/unauthorized"
                    element={
                        <Unauthorized />
                    }
                />

                {/* ==================================================
                    RECEPTIONIST
                ================================================== */}

                {/* ==============================================
                    RECEPTIONIST DASHBOARD
                ============================================== */}

                <Route
                    path="/receptionist"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <ReceptionistDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PATIENTS
                ============================================== */}

                <Route
                    path="/receptionist/patients"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <Patients />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PATIENT DETAILS
                ============================================== */}

                <Route
                    path="/receptionist/patients/:patientId"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <PatientDetails />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    APPOINTMENTS - VIEW / LIST
                ============================================== */}

                <Route
                    path="/receptionist/appointments"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <Appointments />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    CREATE APPOINTMENT
                ============================================== */}

                <Route
                    path="/receptionist/appointments/create"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <AppointmentCreate />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    BILLING
                ============================================== */}

                <Route
                    path="/receptionist/billing"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <Billing />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PAYMENT
                ============================================== */}

                <Route
                    path="/receptionist/payment/:billId"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <Payment />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    BILLING HISTORY
                ============================================== */}

                <Route
                    path="/receptionist/bills"
                    element={
                        <ProtectedRoute
                            role="RECEPTIONIST"
                        >
                            <BillingHistory />
                        </ProtectedRoute>
                    }
                />

                {/* ==================================================
                    DOCTOR
                ================================================== */}

                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute role="DOCTOR">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/appointments"
                    element={
                        <ProtectedRoute role="DOCTOR">
                            <DoctorAppointments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/appointments/:appointmentId/patient"
                    element={
                        <ProtectedRoute role="DOCTOR">
                            <DoctorPatientProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor/appointments/:appointmentId/consult"
                    element={
                        <ProtectedRoute role="DOCTOR">
                            <DoctorConsultation />
                        </ProtectedRoute>
                    }
                />

                {/* ==================================================
                    LABORATORY
                ================================================== */}

                <Route
                    path="/laboratory"
                    element={
                        <ProtectedRoute
                            role="LAB_TECHNICIAN"
                        >
                            <LaboratoryDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==================================================
                    PHARMACIST
                ================================================== */}

                {/* ==============================================
                    PHARMACIST DASHBOARD
                ============================================== */}

                <Route
                    path="/pharmacist"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <PharmacistDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    MEDICINES
                ============================================== */}

                <Route
                    path="/pharmacist/medicines"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <Medicines />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PATIENTS
                ============================================== */}

                <Route
                    path="/pharmacist/patients"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <PharmacistPatients />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    PATIENT PRESCRIPTIONS
                ============================================== */}

                <Route
                    path="/pharmacist/patients/:patientId"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <PatientPrescriptions />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    DISPENSE MEDICINE
                ============================================== */}

                <Route
                    path="/pharmacist/dispense/:prescriptionId"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <Dispense />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    BILLS
                ============================================== */}

                <Route
                    path="/pharmacist/bills"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <Bills />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    SALES REPORTS
                ============================================== */}

                <Route
                    path="/pharmacist/reports"
                    element={
                        <ProtectedRoute role="PHARMACIST">
                            <SalesReports />
                        </ProtectedRoute>
                    }
                />

                {/* ==============================================
                    UNKNOWN URL
                ============================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;