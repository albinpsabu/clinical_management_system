import { useEffect, useState } from "react";
import {
    Search,
    Users,
    Eye,
    Phone,
    CalendarDays,
} from "lucide-react";

import PharmacistLayout from "../../components/pharmacist/PharmacistLayout";

import {
    getPharmacistPatients,
} from "../../services/pharmacistApi";


function Patients() {
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

            setPatients(response.data || []);

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
    // SEARCH PATIENTS
    // ==========================================

    const filteredPatients = patients.filter(
        (patient) => {

            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {
                return true;
            }

            return (
                patient.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                patient.patient_id
                    ?.toLowerCase()
                    .includes(searchText) ||

                patient.phone
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );


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


                <div className="pharmacist-toolbar-count">

                    <Users size={17} />

                    <span>
                        {filteredPatients.length} patients
                    </span>

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

                                            {/* Patient ID */}

                                            <td>
                                                <strong>
                                                    {
                                                        patient.patient_id
                                                    }
                                                </strong>
                                            </td>


                                            {/* Name */}

                                            <td>

                                                <div className="pharmacist-patient-name">

                                                    <div className="pharmacist-patient-avatar">
                                                        {patient.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <span>
                                                        {
                                                            patient.name
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* Age */}

                                            <td>
                                                {
                                                    patient.age
                                                }
                                            </td>


                                            {/* Gender */}

                                            <td>
                                                {
                                                    patient.gender
                                                }
                                            </td>


                                            {/* Phone */}

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


                                            {/* Address */}

                                            <td>
                                                {
                                                    patient.address ||
                                                    "-"
                                                }
                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="pharmacist-action-button"
                                                    onClick={() =>
                                                        window.location.href =
                                                            `/pharmacist/patients/${patient.patient_id}`
                                                    }
                                                >
                                                    <Eye
                                                        size={
                                                            15
                                                        }
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
                                                No patients found.
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