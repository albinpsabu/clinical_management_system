import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Users,
    Search,
    Plus,
    Eye,
    Pencil,
    Trash2,
    RefreshCw,
    X,
} from "lucide-react";

import api from "../../services/api";
import ReceptionistLayout from "./ReceptionistLayout";


function Patients() {

    const navigate = useNavigate();
    const location = useLocation();


    // =========================================
    // STATE
    // =========================================

    const [patients, setPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");


    const [showForm, setShowForm] =
        useState(false);

    const [editingPatient, setEditingPatient] =
        useState(null);


    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [patientToDelete, setPatientToDelete] =
        useState(null);


    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [formError, setFormError] =
        useState("");


    const [formData, setFormData] = useState({

        name: "",

        dob: "",

        gender: "",

        age: "",

        address: "",

        phone: "",

        blood_group: "",

        status: "Active",

    });


    // =========================================
    // LOAD PATIENTS
    // =========================================

    const fetchPatients = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/receptionist/patients/"
            );


            setPatients(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Patients API error:",
                err.response?.data || err
            );


            if (err.response?.status === 401) {

                setError(
                    "Your login session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You do not have permission to view patients."
                );

            } else {

                setError(
                    err.response?.data?.detail ||
                    "Unable to load patients."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchPatients();

    }, []);


    // =========================================
    // OPEN EDIT FORM FROM PATIENT DETAILS
    // =========================================

    useEffect(() => {

        const editPatient =
            location.state?.editPatient;


        if (editPatient) {

            openEditForm(editPatient);


            navigate(
                "/receptionist/patients",
                {
                    replace: true,
                    state: {},
                }
            );
        }

    }, [location.state, navigate]);


    // =========================================
    // SEARCH
    // =========================================

    const filteredPatients = useMemo(() => {

        const search = searchTerm
            .trim()
            .toLowerCase();


        if (!search) {

            return patients;

        }


        return patients.filter((patient) => {

            return (

                String(
                    patient.patient_id || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    patient.phone || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    patient.name || ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });

    }, [patients, searchTerm]);


    // =========================================
    // VIEW PATIENT
    // =========================================

    const handleViewPatient = (patient) => {

        navigate(
            `/receptionist/patients/${patient.patient_id}`,
            {
                state: {
                    patient,
                },
            }
        );

    };


    // =========================================
    // OPEN ADD FORM
    // =========================================

    const openAddForm = () => {

        setEditingPatient(null);


        setFormData({

            name: "",

            dob: "",

            gender: "",

            age: "",

            address: "",

            phone: "",

            blood_group: "",

            status: "Active",

        });


        setFormError("");

        setShowForm(true);

    };


    // =========================================
    // OPEN EDIT FORM
    // =========================================

    const openEditForm = (patient) => {

        setEditingPatient(patient);


        setFormData({

            name: patient.name || "",

            dob: patient.dob || "",

            gender: patient.gender || "",

            age: patient.age || "",

            address: patient.address || "",

            phone: patient.phone || "",

            blood_group:
                patient.blood_group || "",

            status:
                patient.status || "Active",

        });


        setFormError("");

        setShowForm(true);

    };


    // =========================================
    // CLOSE FORM
    // =========================================

    const closeForm = () => {

        if (saving) {

            return;

        }


        setShowForm(false);

        setEditingPatient(null);

        setFormError("");

    };


    // =========================================
    // CALCULATE AGE
    // =========================================

    const calculateAge = (dob) => {

        if (!dob) {

            return "";

        }


        const birthDate =
            new Date(`${dob}T00:00:00`);

        const today =
            new Date();


        if (
            Number.isNaN(
                birthDate.getTime()
            )
        ) {

            return "";

        }


        let age =
            today.getFullYear() -
            birthDate.getFullYear();


        const monthDifference =
            today.getMonth() -
            birthDate.getMonth();


        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() <
                    birthDate.getDate()
            )
        ) {

            age--;

        }


        return age >= 0
            ? age
            : "";

    };


    // =========================================
    // INPUT CHANGE
    // =========================================

    const handleInputChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        // ------------------------------
        // DATE OF BIRTH
        // ------------------------------

        if (name === "dob") {

            const calculatedAge =
                calculateAge(value);


            setFormData((previous) => ({

                ...previous,

                dob: value,

                age: calculatedAge,

            }));


            setFormError("");

            return;

        }


        // ------------------------------
        // PHONE
        // ------------------------------

        if (name === "phone") {

            const digitsOnly =
                value.replace(/\D/g, "");


            setFormData((previous) => ({

                ...previous,

                phone:
                    digitsOnly.slice(0, 10),

            }));


            setFormError("");

            return;

        }


        // ------------------------------
        // NAME
        // ------------------------------

        if (name === "name") {

            setFormData((previous) => ({

                ...previous,

                name: value,

            }));


            setFormError("");

            return;

        }


        // ------------------------------
        // OTHER FIELDS
        // ------------------------------

        setFormData((previous) => ({

            ...previous,

            [name]: value,

        }));


        setFormError("");

    };


    // =========================================
    // SAVE PATIENT
    // =========================================

    const handleSavePatient = async (e) => {

        e.preventDefault();


        setFormError("");


        // ------------------------------
        // NAME
        // ------------------------------

        const patientName =
            formData.name.trim();


        if (!patientName) {

            setFormError(
                "Patient name is required."
            );

            return;

        }


        if (patientName.length < 2) {

            setFormError(
                "Patient name must contain at least 2 characters."
            );

            return;

        }


        if (
            !/^[A-Za-z\s.'-]+$/.test(
                patientName
            )
        ) {

            setFormError(
                "Patient name can contain letters, spaces, dots, apostrophes and hyphens only."
            );

            return;

        }


        // ------------------------------
        // DATE OF BIRTH
        // ------------------------------

        if (!formData.dob) {

            setFormError(
                "Date of birth is required."
            );

            return;

        }


        const birthDate =
            new Date(
                `${formData.dob}T00:00:00`
            );


        const today =
            new Date();


        if (birthDate > today) {

            setFormError(
                "Date of birth cannot be in the future."
            );

            return;

        }


        // ------------------------------
        // AGE
        // ------------------------------

        const calculatedAge =
            calculateAge(formData.dob);


        if (
            calculatedAge === "" ||
            calculatedAge < 0
        ) {

            setFormError(
                "Unable to calculate patient age."
            );

            return;

        }


        if (calculatedAge > 150) {

            setFormError(
                "Please enter a valid date of birth."
            );

            return;

        }


        // ------------------------------
        // GENDER
        // ------------------------------

        if (!formData.gender) {

            setFormError(
                "Please select gender."
            );

            return;

        }


        // ------------------------------
        // ADDRESS
        // ------------------------------

        if (!formData.address.trim()) {

            setFormError(
                "Address is required."
            );

            return;

        }


        if (
            formData.address.trim().length < 5
        ) {

            setFormError(
                "Please enter a valid address."
            );

            return;

        }


        // ------------------------------
        // PHONE
        // ------------------------------

        const phone =
            formData.phone.trim();


        if (!phone) {

            setFormError(
                "Mobile number is required."
            );

            return;

        }


        if (!/^[6-9]\d{9}$/.test(phone)) {

            setFormError(
                "Enter a valid 10-digit Indian mobile number."
            );

            return;

        }


        // ------------------------------
        // BLOOD GROUP
        // ------------------------------

        if (!formData.blood_group) {

            setFormError(
                "Please select blood group."
            );

            return;

        }


        try {

            setSaving(true);


            /*
             * IMPORTANT:
             *
             * patient_id is NOT sent here.
             *
             * Django generates it automatically.
             */

            const payload = {

                name: patientName,

                dob: formData.dob,

                gender: formData.gender,

                age: Number(calculatedAge),

                address:
                    formData.address.trim(),

                phone,

                blood_group:
                    formData.blood_group,

                status:
                    formData.status,

            };


            // ------------------------------
            // UPDATE
            // ------------------------------

            if (editingPatient) {

                await api.patch(

                    `/receptionist/patients/${editingPatient.patient_id}/`,

                    payload

                );

            }

            // ------------------------------
            // CREATE
            // ------------------------------

            else {

                const response =
                    await api.post(

                        "/receptionist/patients/",

                        payload

                    );


                /*
                 * Backend returns the newly
                 * generated patient_id.
                 */

                console.log(
                    "Patient created:",
                    response.data
                );

            }


            await fetchPatients();


            setShowForm(false);

            setEditingPatient(null);

            setFormError("");


        } catch (err) {

            console.error(
                "Save patient error:",
                err.response?.data || err
            );


            const backendError =
                err.response?.data;


            if (
                backendError &&
                typeof backendError === "object"
            ) {

                const firstError =
                    Object.values(
                        backendError
                    )[0];


                if (
                    Array.isArray(firstError)
                ) {

                    setFormError(
                        firstError[0]
                    );

                } else if (
                    typeof firstError ===
                    "string"
                ) {

                    setFormError(
                        firstError
                    );

                } else {

                    setFormError(
                        "Unable to save patient."
                    );

                }

            } else {

                setFormError(
                    "Unable to save patient."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    // =========================================
    // DELETE
    // =========================================

    const openDeleteModal = (patient) => {

        setPatientToDelete(patient);

        setShowDeleteModal(true);

    };


    const closeDeleteModal = () => {

        if (deleting) {

            return;

        }


        setPatientToDelete(null);

        setShowDeleteModal(false);

    };


    const handleDeletePatient = async () => {

        if (!patientToDelete) {

            return;

        }


        try {

            setDeleting(true);

            setError("");


            await api.delete(

                `/receptionist/patients/${patientToDelete.patient_id}/`

            );


            await fetchPatients();


            setPatientToDelete(null);

            setShowDeleteModal(false);


        } catch (err) {

            console.error(
                "Delete patient error:",
                err.response?.data || err
            );


            setError(

                err.response?.data?.error ||

                err.response?.data?.detail ||

                "Unable to delete patient."

            );

        } finally {

            setDeleting(false);

        }

    };


    // =========================================
    // TODAY FOR DATE PICKER
    // =========================================

    const todayDate =
        new Date();


    const todayString =
        `${todayDate.getFullYear()}-${String(
            todayDate.getMonth() + 1
        ).padStart(2, "0")}-${String(
            todayDate.getDate()
        ).padStart(2, "0")}`;


    // =========================================
    // PAGE
    // =========================================

    return (

        <ReceptionistLayout
            title="Patients"
            subtitle="Search and manage registered patients."
        >

            {/* =========================================
                TOP ACTIONS
            ========================================= */}

            <div className="patients-top-bar">

                <div className="patients-search">

                    <Search size={17} />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        placeholder="Search by patient ID, name or mobile"
                    />


                    {searchTerm && (

                        <button
                            onClick={() =>
                                setSearchTerm("")
                            }
                            className="clear-search"
                            type="button"
                        >

                            <X size={15} />

                        </button>

                    )}

                </div>


                <button
                    className="primary-button"
                    onClick={openAddForm}
                    type="button"
                >

                    <Plus size={16} />

                    Add Patient

                </button>


                <button
                    className="secondary-button"
                    onClick={fetchPatients}
                    disabled={loading}
                    type="button"
                >

                    <RefreshCw size={15} />

                    Refresh

                </button>

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* =========================================
                PATIENT COUNT
            ========================================= */}

            <div className="patients-list-header">

                <div>

                    <strong>
                        Patient List
                    </strong>

                    <span>
                        {filteredPatients.length}{" "}
                        patient
                        {filteredPatients.length !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {searchTerm && (

                    <small>
                        Search results for "{searchTerm}"
                    </small>

                )}

            </div>


            {/* =========================================
                PATIENT TABLE
            ========================================= */}

            <div className="page-card">

                {loading ? (

                    <div className="simple-loading">

                        <div className="spinner-border text-primary" />

                        <p>
                            Loading patients...
                        </p>

                    </div>

                ) : filteredPatients.length === 0 ? (

                    <div className="simple-empty">

                        <Users size={35} />

                        <h3>

                            {searchTerm
                                ? "No patients found"
                                : "No patients registered"}

                        </h3>

                        <p>

                            {searchTerm
                                ? "Try another patient ID, name or mobile number."
                                : "Add your first patient to get started."}

                        </p>


                        {!searchTerm && (

                            <button
                                className="primary-button"
                                onClick={openAddForm}
                                type="button"
                            >

                                <Plus size={16} />

                                Add Patient

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="simple-table">

                            <thead>

                                <tr>

                                    <th>#</th>

                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Date of Birth
                                    </th>

                                    <th>
                                        Gender
                                    </th>

                                    <th>
                                        Age
                                    </th>

                                    <th>
                                        Mobile
                                    </th>

                                    <th>
                                        Blood Group
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredPatients.map(
                                    (
                                        patient,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                patient.id ||
                                                patient.patient_id
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>


                                            <td>

                                                <strong className="patient-id">

                                                    {
                                                        patient.patient_id
                                                    }

                                                </strong>

                                            </td>


                                            <td>

                                                <strong>
                                                    {patient.name}
                                                </strong>

                                            </td>


                                            <td>
                                                {patient.dob}
                                            </td>


                                            <td>
                                                {patient.gender}
                                            </td>


                                            <td>
                                                {patient.age}
                                            </td>


                                            <td>
                                                {patient.phone}
                                            </td>


                                            <td>

                                                <span className="blood-group">

                                                    {
                                                        patient.blood_group
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {patient.status ===
                                                "Active" ? (

                                                    <span className="status-paid">
                                                        Active
                                                    </span>

                                                ) : (

                                                    <span className="status-danger">
                                                        {
                                                            patient.status
                                                        }
                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <div className="patient-actions">

                                                    <button
                                                        className="view-button"
                                                        title="View patient"
                                                        onClick={() =>
                                                            handleViewPatient(
                                                                patient
                                                            )
                                                        }
                                                        type="button"
                                                    >

                                                        <Eye size={15} />

                                                    </button>


                                                    <button
                                                        className="edit-button"
                                                        title="Edit patient"
                                                        onClick={() =>
                                                            openEditForm(
                                                                patient
                                                            )
                                                        }
                                                        type="button"
                                                    >

                                                        <Pencil size={15} />

                                                    </button>


                                                    <button
                                                        className="delete-button"
                                                        title="Delete patient"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                patient
                                                            )
                                                        }
                                                        type="button"
                                                    >

                                                        <Trash2 size={15} />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =========================================
                ADD / EDIT MODAL
            ========================================= */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="simple-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingPatient
                                        ? "Edit Patient"
                                        : "Add Patient"}

                                </h2>

                                <p>

                                    {editingPatient
                                        ? "Update patient information."
                                        : "Enter patient information."}

                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                type="button"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <form
                            onSubmit={handleSavePatient}
                        >

                            <div className="modal-body">


                                {/* FORM ERROR */}

                                {formError && (

                                    <div className="alert alert-danger">

                                        {formError}

                                    </div>

                                )}


                                <div className="form-grid">


                                    {/* =================================
                                        PATIENT ID
                                    ================================= */}

                                    {editingPatient && (

                                        <div className="form-group">

                                            <label>
                                                Patient ID
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editingPatient.patient_id
                                                }
                                                disabled
                                            />

                                            <small>
                                                Patient ID is generated automatically and cannot be changed.
                                            </small>

                                        </div>

                                    )}


                                    {/* =================================
                                        NAME
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter patient name"
                                            autoComplete="name"
                                            required
                                        />

                                    </div>


                                    {/* =================================
                                        DOB
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Date of Birth
                                        </label>

                                        <input
                                            type="date"
                                            name="dob"
                                            value={
                                                formData.dob
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            onClick={(e) =>
                                                e.currentTarget.showPicker?.()
                                            }
                                            max={
                                                todayString
                                            }
                                            required
                                        />

                                    </div>


                                    {/* =================================
                                        AGE
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Age
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.age === ""
                                                    ? ""
                                                    : `${formData.age} years`
                                            }
                                            placeholder="Select date of birth"
                                            disabled
                                            readOnly
                                        />

                                        <small>
                                            Age is calculated automatically from date of birth.
                                        </small>

                                    </div>


                                    {/* =================================
                                        GENDER
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Gender
                                        </label>

                                        <select
                                            name="gender"
                                            value={
                                                formData.gender
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select gender
                                            </option>

                                            <option value="Male">
                                                Male
                                            </option>

                                            <option value="Female">
                                                Female
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>

                                        </select>

                                    </div>


                                    {/* =================================
                                        PHONE
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Mobile Number
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            inputMode="numeric"
                                            maxLength="10"
                                            placeholder="9876543210"
                                            autoComplete="tel"
                                            required
                                        />

                                        <small>
                                            Enter a 10-digit mobile number.
                                        </small>

                                    </div>


                                    {/* =================================
                                        BLOOD GROUP
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Blood Group
                                        </label>

                                        <select
                                            name="blood_group"
                                            value={
                                                formData.blood_group
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select blood group
                                            </option>

                                            <option value="A+">
                                                A+
                                            </option>

                                            <option value="A-">
                                                A-
                                            </option>

                                            <option value="B+">
                                                B+
                                            </option>

                                            <option value="B-">
                                                B-
                                            </option>

                                            <option value="AB+">
                                                AB+
                                            </option>

                                            <option value="AB-">
                                                AB-
                                            </option>

                                            <option value="O+">
                                                O+
                                            </option>

                                            <option value="O-">
                                                O-
                                            </option>

                                        </select>

                                    </div>


                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <div className="form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                formData.status
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                !editingPatient
                                            }
                                        >

                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>

                                        </select>

                                        {!editingPatient && (

                                            <small>
                                                New patients are active by default.
                                            </small>

                                        )}

                                    </div>


                                    {/* =================================
                                        ADDRESS
                                    ================================= */}

                                    <div className="form-group form-full">

                                        <label>
                                            Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows="3"
                                            placeholder="Enter patient address"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingPatient
                                            ? "Update Patient"
                                            : "Add Patient"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =========================================
                DELETE MODAL
            ========================================= */}

            {showDeleteModal &&
                patientToDelete && (

                    <div className="modal-overlay">

                        <div className="delete-modal">

                            <div className="delete-icon">

                                <Trash2 size={23} />

                            </div>


                            <h2>
                                Delete Patient?
                            </h2>


                            <p>

                                Are you sure you want
                                to delete{" "}

                                <strong>
                                    {
                                        patientToDelete.name
                                    }
                                </strong>

                                ?

                            </p>


                            <small>
                                This action cannot be undone.
                            </small>


                            <div className="delete-actions">

                                <button
                                    className="secondary-button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deleting
                                    }
                                    type="button"
                                >
                                    Cancel
                                </button>


                                <button
                                    className="delete-confirm-button"
                                    onClick={
                                        handleDeletePatient
                                    }
                                    disabled={
                                        deleting
                                    }
                                    type="button"
                                >

                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Patient"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </ReceptionistLayout>

    );

}

export default Patients;