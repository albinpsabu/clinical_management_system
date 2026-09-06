import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Users,
    Eye,
    Phone,
    RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistPatients,
} from "../../services/pharmacistApi";


function Patients() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // LOAD PATIENTS
    // ==========================================

    useEffect(() => {
        loadPatients();
    }, []);


    const loadPatients = async () => {
        setLoading(true);
        setError("");

        try {
            const response =
                await getPharmacistPatients();

            setPatients(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            console.error(
                "Patient loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                "Unable to load patients."
            );
        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // FILTER PATIENTS
    // ==========================================

    const filteredPatients = useMemo(() => {

        const searchText =
            search.toLowerCase().trim();

        if (!searchText) {
            return patients;
        }

        return patients.filter(
            (patient) =>
                patient.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                patient.patient_id
                    ?.toLowerCase()
                    .includes(searchText) ||

                patient.phone
                    ?.toLowerCase()
                    .includes(searchText) ||

                patient.gender
                    ?.toLowerCase()
                    .includes(searchText)
        );

    }, [patients, search]);


    // ==========================================
    // VIEW PATIENT
    // ==========================================

    const handleViewPatient = (patient) => {

        if (!patient.patient_id) {
            setError(
                "Patient ID is not available."
            );
            return;
        }

        navigate(
            `/pharmacist/patients/${patient.patient_id}`
        );
    };


    return (
        <PharmacistLayout
            title="Patients"
            subtitle="Search patients and view their prescriptions"
        >

            {/* =====================================
                TOOLBAR
            ====================================== */}

            <div className="pharmacist-toolbar">

                <div className="pharmacist-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search by name, patient ID or phone..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div
                    className="pharmacist-toolbar-count"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >

                    <Users size={17} />

                    <span>
                        {filteredPatients.length} patients
                    </span>


                    <button
                        type="button"
                        className="pharmacist-action-button"
                        onClick={loadPatients}
                        disabled={loading}
                        title="Refresh patients"
                    >

                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "pharmacist-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </div>


            {/* =====================================
                ERROR
            ====================================== */}

            {error && (
                <div className="pharmacist-error">
                    {error}
                </div>
            )}


            {/* =====================================
                PATIENT TABLE
            ====================================== */}

            <div className="pharmacist-card">

                {loading ? (

                    <div className="pharmacist-loading">
                        Loading patients...
                    </div>

                ) : (

                    <div className="pharmacist-table-wrapper">

                        <table className="pharmacist-table">

                            <thead>

                                <tr>
                                    <th>Patient ID</th>
                                    <th>Patient Name</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Action</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredPatients.map(
                                    (patient) => (

                                        <tr
                                            key={
                                                patient.id
                                            }
                                        >

                                            {/* PATIENT ID */}

                                            <td>

                                                <strong>
                                                    {
                                                        patient.patient_id ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            {/* NAME */}

                                            <td>

                                                <div className="pharmacist-patient-name">

                                                    <div className="pharmacist-patient-avatar">

                                                        {patient.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "P"}

                                                    </div>

                                                    <span>
                                                        {
                                                            patient.name ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* AGE */}

                                            <td>
                                                {
                                                    patient.age ??
                                                    "-"
                                                }
                                            </td>


                                            {/* GENDER */}

                                            <td>
                                                {
                                                    patient.gender ||
                                                    "-"
                                                }
                                            </td>


                                            {/* PHONE */}

                                            <td>

                                                <div className="pharmacist-table-detail">

                                                    <Phone
                                                        size={14}
                                                    />

                                                    {
                                                        patient.phone ||
                                                        "-"
                                                    }

                                                </div>

                                            </td>


                                            {/* ADDRESS */}

                                            <td>
                                                {
                                                    patient.address ||
                                                    "-"
                                                }
                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="pharmacist-action-button"
                                                    onClick={() =>
                                                        handleViewPatient(
                                                            patient
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={15}
                                                    />

                                                    View

                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}


                                {/* EMPTY */}

                                {filteredPatients.length ===
                                    0 && (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="pharmacist-empty"
                                        >

                                            <Users
                                                size={30}
                                            />

                                            <span>
                                                {search.trim()
                                                    ? "No patients match your search."
                                                    : "No patients found."}
                                            </span>

                                        </td>

                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </PharmacistLayout>
    );
}


export default Patients;