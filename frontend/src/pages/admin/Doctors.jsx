import React, { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import {
    getDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDepartments,
} from "../../services/adminApi";

import "../../styles/admin.css";

const Doctors = () => {

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        specialization: "",
        department: "",
        consultation_fee: "",
        username: "",
        password: "",
        status: "Active",
    });


    // ============================================================
    // LOAD DOCTORS + DEPARTMENTS
    // ============================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                doctorsResponse,
                departmentsResponse,
            ] = await Promise.all([
                getDoctors(),
                getDepartments(),
            ]);

            const doctorData = Array.isArray(
                doctorsResponse.data
            )
                ? doctorsResponse.data
                : doctorsResponse.data?.results || [];

            const departmentData = Array.isArray(
                departmentsResponse.data
            )
                ? departmentsResponse.data
                : departmentsResponse.data?.results || [];

            setDoctors(doctorData);
            setDepartments(departmentData);

        } catch (error) {

            console.error(
                "Doctors loading error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to load doctors."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // ============================================================
    // FORM HANDLING
    // ============================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    const resetForm = () => {

        setForm({
            name: "",
            email: "",
            specialization: "",
            department: "",
            consultation_fee: "",
            username: "",
            password: "",
            status: "Active",
        });

        setEditingId(null);
        setShowForm(false);
        setError("");

    };


    // ============================================================
    // ADD DOCTOR
    // ============================================================

    const handleAdd = () => {

        resetForm();

        setShowForm(true);

    };


    // ============================================================
    // EDIT DOCTOR
    // ============================================================

    const handleEdit = (doctor) => {

        setEditingId(doctor.id);

        setForm({
            name: doctor.name || "",
            email: doctor.email || "",
            specialization: doctor.specialization || "",
            department:
                doctor.department?.id ||
                doctor.department ||
                "",
            consultation_fee:
                doctor.consultation_fee || "",
            username: doctor.username || "",
            password: "",
            status: doctor.status || "Active",
        });

        setShowForm(true);
        setError("");

    };


    // ============================================================
    // SAVE DOCTOR
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError("");

        try {

            const payload = {
                name: form.name,
                email: form.email,
                specialization: form.specialization,
                department: Number(form.department),
                consultation_fee: form.consultation_fee,
                status: form.status,
            };

            // Username/password are required when creating
            // a new doctor account.
            if (!editingId) {

                payload.username = form.username;
                payload.password = form.password;

            }

            if (editingId) {

                await updateDoctor(
                    editingId,
                    payload
                );

            } else {

                await createDoctor(payload);

            }

            await loadData();

            resetForm();

        } catch (error) {

            console.error(
                "Doctor save error:",
                error.response?.data || error
            );

            const responseData =
                error.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {

                const message =
                    Object.entries(responseData)
                        .map(([field, value]) =>
                            `${field}: ${
                                Array.isArray(value)
                                    ? value.join(", ")
                                    : value
                            }`
                        )
                        .join(" | ");

                setError(message);

            } else {

                setError(
                    "Failed to save doctor."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    // ============================================================
    // DELETE DOCTOR
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this doctor?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteDoctor(id);

            await loadData();

        } catch (error) {

            console.error(
                "Doctor delete error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to delete doctor."
            );

        }

    };


    // ============================================================
    // SEARCH
    // ============================================================

    const filteredDoctors = doctors.filter(
        (doctor) => {

            const searchText =
                search.toLowerCase();

            return (
                doctor.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                doctor.email
                    ?.toLowerCase()
                    .includes(searchText) ||

                doctor.doctor_id
                    ?.toLowerCase()
                    .includes(searchText) ||

                doctor.specialization
                    ?.toLowerCase()
                    .includes(searchText) ||

                String(
                    doctor.department?.name ||
                    doctor.department ||
                    ""
                )
                    .toLowerCase()
                    .includes(searchText)
            );

        }
    );


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="admin-page">

            <div className="admin-page-heading">

                <div>

                    <h1>Doctors</h1>

                    <p>
                        Manage doctors and their department assignments.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-primary-button"
                    onClick={handleAdd}
                >
                    <Plus size={18} />
                    Add Doctor
                </button>

            </div>


            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}


            <div className="admin-panel-card">

                <div className="admin-table-toolbar">

                    <div className="admin-search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search doctor..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading doctors...
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>#</th>
                                    <th>Doctor ID</th>
                                    <th>Doctor Name</th>
                                    <th>Email</th>
                                    <th>Specialization</th>
                                    <th>Department</th>
                                    <th>Contact</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredDoctors.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="admin-empty"
                                        >
                                            No doctors found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredDoctors.map(
                                        (doctor, index) => (

                                            <tr key={doctor.id}>

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    <strong>
                                                        {doctor.doctor_id}
                                                    </strong>

                                                </td>

                                                <td>
                                                    {doctor.name}
                                                </td>

                                                <td>
                                                    {doctor.email || "-"}
                                                </td>

                                                <td>
                                                    {doctor.specialization || "-"}
                                                </td>

                                                <td>
                                                    {doctor.department?.name ||
                                                        doctor.department ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {doctor.phone ||
                                                        doctor.contact ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    ₹{doctor.consultation_fee}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            doctor.status === "Active"
                                                                ? "admin-status active"
                                                                : "admin-status inactive"
                                                        }
                                                    >
                                                        {doctor.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="admin-action-buttons">

                                                        <button
                                                            type="button"
                                                            className="admin-icon-button edit"
                                                            onClick={() =>
                                                                handleEdit(doctor)
                                                            }
                                                            title="Edit"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-icon-button delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    doctor.id
                                                                )
                                                            }
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                DOCTOR FORM
            ===================================================== */}

            {showForm && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    {editingId
                                        ? "Edit Doctor"
                                        : "Add Doctor"}
                                </h2>

                                <p>
                                    Enter doctor information.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={resetForm}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            className="admin-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="admin-form-grid">


                                {/* DOCTOR NAME */}

                                <div className="admin-form-group">

                                    <label>
                                        Doctor Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="admin-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="doctor@example.com"
                                        required
                                    />

                                </div>


                                {/* SPECIALIZATION */}

                                <div className="admin-form-group">

                                    <label>
                                        Specialization
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        value={form.specialization}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* DEPARTMENT */}

                                <div className="admin-form-group">

                                    <label>
                                        Department
                                    </label>

                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name ||
                                                        department.department_name}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* CONSULTATION FEE */}

                                <div className="admin-form-group">

                                    <label>
                                        Consultation Fee
                                    </label>

                                    <input
                                        type="number"
                                        name="consultation_fee"
                                        value={form.consultation_fee}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />

                                </div>


                                {/* USERNAME + PASSWORD ONLY FOR NEW DOCTOR */}

                                {!editingId && (

                                    <>

                                        <div className="admin-form-group">

                                            <label>
                                                Username
                                            </label>

                                            <input
                                                type="text"
                                                name="username"
                                                value={form.username}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label>
                                                Password
                                            </label>

                                            <input
                                                type="password"
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                    </>

                                )}


                                {/* STATUS */}

                                <div className="admin-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>


                            </div>


                            <div className="admin-modal-actions">

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Doctor"
                                            : "Create Doctor"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );

};

export default Doctors;