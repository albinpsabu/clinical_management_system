import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";


// ==================================================
// LOGIN
// ==================================================

import Login from "./pages/Login";


// ==================================================
// ADMIN PAGES
// ==================================================

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Staff from "./pages/admin/Staff";
import Departments from "./pages/admin/Departments";
import Doctors from "./pages/admin/Doctors";
import Medicines from "./pages/admin/Medicines";
import LabTests from "./pages/admin/LabTests";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";


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


// ==================================================
// DOCTOR PAGES
// ==================================================

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatientProfile from "./pages/doctor/DoctorPatientProfile";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";


// ==================================================
// LABORATORY PAGES
// ==================================================

import LaboratoryDashboard from "./pages/laboratory/LabDashboard.jsx";
import TestManagement from "./pages/laboratory/TestManagement.jsx";
import LaboratoryBilling from "./pages/laboratory/Billing.jsx";
import LaboratoryLayout from "./components/laboratory/LaboratoryLayout";
import LaboratoryTests from "./pages/laboratory/LabTests";
import LaboratorySales from "./pages/laboratory/Sales";


// ==================================================
// PHARMACIST PAGES
// ==================================================

import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";
import PharmacistMedicines from "./pages/pharmacist/Medicines";
import PharmacistPatients from "./pages/pharmacist/Patients";
import PatientPrescriptions from "./pages/pharmacist/PatientPrescriptions";
import Dispense from "./pages/pharmacist/Dispense";
import Bills from "./pages/pharmacist/Bills";
import SalesReports from "./pages/pharmacist/SalesReports";


// ==================================================
// STYLES
// ==================================================

import "./App.css";
import "./doctor.css";
import "./styles/pharmacist.css";
import "./styles/admin.css";
import "./styles/receptionist.css";


// ==================================================
// PROTECTED ROUTE
// ==================================================

function ProtectedRoute({
    children,
    role,
}) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    const userRole =
        localStorage.getItem(
            "role"
        );


    // --------------------------------------------------
    // USER IS NOT LOGGED IN
    // --------------------------------------------------

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // --------------------------------------------------
    // USER DOES NOT HAVE REQUIRED ROLE
    // --------------------------------------------------

    if (
        role &&
        userRole !== role
    ) {

        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );

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

                        window.location.href =
                            "/login";

                    }}
                >
                    Go to Login
                </button>

            </div>

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


                {/* ==================================================
                    HOME
                ================================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* ==================================================
                    LOGIN
                ================================================== */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* ==================================================
                    UNAUTHORIZED
                ================================================== */}

                <Route
                    path="/unauthorized"
                    element={
                        <Unauthorized />
                    }
                />


                {/* ==================================================
                    ADMIN
                ================================================== */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            role="ADMIN"
                        >
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* ADMIN DASHBOARD */}

                    <Route
                        index
                        element={
                            <AdminDashboard />
                        }
                    />


                    {/* ADMIN STAFF */}

                    <Route
                        path="staff"
                        element={
                            <Staff />
                        }
                    />


                    {/* ADMIN DEPARTMENTS */}

                    <Route
                        path="departments"
                        element={
                            <Departments />
                        }
                    />


                    {/* ADMIN DOCTORS */}

                    <Route
                        path="doctors"
                        element={
                            <Doctors />
                        }
                    />


                    {/* ADMIN MEDICINES */}

                    <Route
                        path="medicines"
                        element={
                            <Medicines />
                        }
                    />


                    {/* ADMIN LAB TESTS */}

                    <Route
                        path="lab-tests"
                        element={
                            <LabTests />
                        }
                    />


                    {/* ADMIN REPORTS */}

                    <Route
                        path="reports"
                        element={
                            <Reports />
                        }
                    />


                    {/* ADMIN SETTINGS */}

                    <Route
                        path="settings"
                        element={
                            <Settings />
                        }
                    />

                </Route>


                {/* ==================================================
                    RECEPTIONIST
                ================================================== */}


                {/* RECEPTIONIST DASHBOARD */}

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


                {/* RECEPTIONIST PATIENTS */}

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


                {/* RECEPTIONIST PATIENT DETAILS */}

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


                {/* RECEPTIONIST APPOINTMENTS */}

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


                {/* CREATE APPOINTMENT */}

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


                {/* RECEPTIONIST BILLING */}

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


                {/* RECEPTIONIST PAYMENT */}

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


                {/* RECEPTIONIST BILLING HISTORY */}

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


                {/* DOCTOR DASHBOARD */}

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


                {/* DOCTOR APPOINTMENTS */}

                <Route
                    path="/doctor/appointments"
                    element={
                        <ProtectedRoute
                            role="DOCTOR"
                        >
                            <DoctorAppointments />
                        </ProtectedRoute>
                    }
                />


                {/* DOCTOR PATIENT PROFILE */}

                <Route
                    path="/doctor/appointments/:appointmentId/patient"
                    element={
                        <ProtectedRoute
                            role="DOCTOR"
                        >
                            <DoctorPatientProfile />
                        </ProtectedRoute>
                    }
                />


                {/* DOCTOR CONSULTATION */}

                <Route
                    path="/doctor/appointments/:appointmentId/consult"
                    element={
                        <ProtectedRoute
                            role="DOCTOR"
                        >
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
                            <LaboratoryLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* LABORATORY DASHBOARD */}

                    <Route
                        index
                        element={
                            <LaboratoryDashboard />
                        }
                    />


                    {/* LABORATORY TESTS */}

                    <Route
                        path="tests"
                        element={
                            <LaboratoryTests />
                        }
                    />


                    {/* TEST MANAGEMENT */}

                    <Route
                        path="test-management"
                        element={
                            <TestManagement />
                        }
                    />


                    {/* LABORATORY BILLING */}

                    <Route
                        path="billing"
                        element={
                            <LaboratoryBilling />
                        }
                    />


                    {/* LABORATORY SALES */}

                    <Route
                        path="sales"
                        element={
                            <LaboratorySales />
                        }
                    />

                </Route>


                {/* ==================================================
                    PHARMACIST
                ================================================== */}


                {/* PHARMACIST DASHBOARD */}

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


                {/* PHARMACIST MEDICINES */}

                <Route
                    path="/pharmacist/medicines"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <PharmacistMedicines />
                        </ProtectedRoute>
                    }
                />


                {/* PHARMACIST PATIENTS */}

                <Route
                    path="/pharmacist/patients"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <PharmacistPatients />
                        </ProtectedRoute>
                    }
                />


                {/* PATIENT PRESCRIPTIONS */}

                <Route
                    path="/pharmacist/patients/:patientId"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <PatientPrescriptions />
                        </ProtectedRoute>
                    }
                />


                {/* DISPENSE MEDICINE */}

                <Route
                    path="/pharmacist/dispense/:prescriptionId"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <Dispense />
                        </ProtectedRoute>
                    }
                />


                {/* PHARMACIST BILLS */}

                <Route
                    path="/pharmacist/bills"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <Bills />
                        </ProtectedRoute>
                    }
                />


                {/* PHARMACIST SALES REPORTS */}

                <Route
                    path="/pharmacist/reports"
                    element={
                        <ProtectedRoute
                            role="PHARMACIST"
                        >
                            <SalesReports />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    UNKNOWN URL
                ================================================== */}

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