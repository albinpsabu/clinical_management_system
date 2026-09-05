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

function DoctorDashboard() {
    return (
        <div>
            <h1>Doctor Dashboard</h1>
        </div>
    );
}
import LaboratoryDashboard from "./pages/laboratory/LabDashboard.jsx";
import TestManagement from "./pages/laboratory/TestManagement.jsx";
import LaboratoryBilling from "./pages/laboratory/Billing.jsx";
import LaboratoryLayout from "./components/laboratory/LaboratoryLayout";
import LabTests from "./pages/laboratory/LabTests";


function PharmacistDashboard() {
    return (
        <div>
            <h1>Pharmacist Dashboard</h1>
        </div>
    );
}

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
                        <ProtectedRoute
                            role="DOCTOR"
                        >
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ==================================================
                    LABORATORY
                ================================================== */}

                    {/* <Route
                        path="/laboratory"
                        element={
                            <ProtectedRoute
                                role="LAB_TECHNICIAN"
                            >
                                <LaboratoryDashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/laboratory/tests"
                        element={
                            <ProtectedRoute role="LAB_TECHNICIAN">
                                <TestManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/laboratory/billing"
                        element={
                            <ProtectedRoute role="LAB_TECHNICIAN">
                                <LaboratoryBilling />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/laboratory/sales"
                        element={
                            <ProtectedRoute role="LAB_TECHNICIAN">
                                <Sales />
                            </ProtectedRoute>
                        }
                    /> */}
                <Route
                    path="/laboratory"
                    element={
                        <ProtectedRoute role="LAB_TECHNICIAN">
                            <LaboratoryLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<LaboratoryDashboard />} />
                    <Route path="tests" element={<LabTests />} />
                    <Route path="test-management" element={<TestManagement />} />
                    <Route path="billing" element={<LaboratoryBilling />} />
                    
                </Route>

                {/* ==================================================
                    PHARMACIST
                ================================================== */}

                <Route
                    path="/pharmacist"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <PharmacistDashboard />
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