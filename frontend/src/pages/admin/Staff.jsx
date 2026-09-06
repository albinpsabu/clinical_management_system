import React, { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import {
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff,
} from "../../services/adminApi";

import "../../styles/admin.css";


const emptyForm = {
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "RECEPTIONIST",
};


const Staff = () => {

    const [staff, setStaff] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingStaff, setEditingStaff] = useState(null);

    const [form, setForm] = useState(emptyForm);


    const loadStaff = async () => {

        try {

            setLoading(true);

            const response = await getStaff();

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setStaff(data);

        } catch (err) {

            console.error(
                "Staff loading error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load staff."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadStaff();
    }, []);


    const filteredStaff = useMemo(() => {

        const term = search
            .trim()
            .toLowerCase();

        if (!term) {
            return staff;
        }

        return staff.filter((person) => {

            const fullName = `
                ${person.first_name || ""}
                ${person.last_name || ""}
            `.toLowerCase();

            return (
                fullName.includes(term) ||
                String(person.username || "")
                    .toLowerCase()
                    .includes(term) ||
                String(person.phone || "")
                    .toLowerCase()
                    .includes(term) ||
                String(person.role || "")
                    .toLowerCase()
                    .includes(term)
            );

        });

    }, [staff, search]);


    const openAddForm = () => {

        setEditingStaff(null);

        setForm(emptyForm);

        setError("");

        setSuccess("");

        setShowForm(true);

    };


    const openEditForm = (person) => {

        setEditingStaff(person);

        setForm({
            username: person.username || "",
            password: "",
            first_name: person.first_name || "",
            last_name: person.last_name || "",
            email: person.email || "",
            phone: person.phone || "",
            role: person.role || "RECEPTIONIST",
        });

        setError("");

        setSuccess("");

        setShowForm(true);

    };


    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setEditingStaff(null);

        setForm(emptyForm);

    };


    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");


        if (!form.username.trim()) {
            setError("Username is required.");
            return;
        }


        if (!editingStaff && !form.password.trim()) {
            setError("Password is required.");
            return;
        }


        if (!form.first_name.trim()) {
            setError("First name is required.");
            return;
        }


        if (!form.last_name.trim()) {
            setError("Last name is required.");
            return;
        }


        if (!form.phone.trim()) {
            setError("Phone number is required.");
            return;
        }


        try {

            setSaving(true);


            const payload = {
                username: form.username.trim(),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: form.role,
            };


            if (form.password.trim()) {
                payload.password = form.password;
            }


            if (editingStaff) {

                await updateStaff(
                    editingStaff.id,
                    payload
                );

                setSuccess(
                    "Staff updated successfully."
                );

            } else {

                await createStaff(payload);

                setSuccess(
                    "Staff created successfully."
                );

            }


            await loadStaff();

            setTimeout(() => {
                closeForm();
            }, 700);

        } catch (err) {

            console.error(
                "Staff save error:",
                err.response?.data || err
            );


            const data =
                err.response?.data;


            if (
                data &&
                typeof data === "object"
            ) {

                const message =
                    Object.entries(data)
                        .map(
                            ([field, value]) =>
                                `${field}: ${
                                    Array.isArray(value)
                                        ? value.join(", ")
                                        : value
                                }`
                        )
                        .join(" | ");

                setError(
                    message ||
                    "Unable to save staff."
                );

            } else {

                setError(
                    "Unable to save staff."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    const handleDelete = async (person) => {

        const confirmed =
            window.confirm(
                `Delete staff account "${person.username}"?`
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            await deleteStaff(person.id);

            setSuccess(
                "Staff deleted successfully."
            );

            await loadStaff();

        } catch (err) {

            console.error(
                "Staff delete error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to delete staff."
            );

        }
    };


    return (
        <div className="admin-page">

            <div className="admin-page-heading">

                <div>

                    <h1>
                        Staff Management
                    </h1>

                    <p>
                        Create and manage staff accounts.
                    </p>

                </div>


                <button
                    className="admin-primary-button"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Staff
                </button>

            </div>


            {error && (
                <div className="admin-alert error">
                    {error}
                </div>
            )}


            {success && (
                <div className="admin-alert success">
                    {success}
                </div>
            )}


            <div className="admin-table-card">

                <div className="admin-table-toolbar">

                    <div className="admin-search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading staff...
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredStaff.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="admin-empty"
                                        >
                                            No staff found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredStaff.map(
                                        (person, index) => (

                                            <tr
                                                key={person.id}
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            person.username
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        person.first_name
                                                    }{" "}
                                                    {
                                                        person.last_name
                                                    }
                                                </td>

                                                <td>
                                                    <span className="admin-role-badge">
                                                        {
                                                            person.role
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        person.phone ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        person.email ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <div className="admin-actions">

                                                        <button
                                                            className="admin-icon-button edit"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    person
                                                                )
                                                            }
                                                        >
                                                            <Pencil
                                                                size={17}
                                                            />
                                                        </button>


                                                        <button
                                                            className="admin-icon-button delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    person
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={17}
                                                            />
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


            {showForm && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    {editingStaff
                                        ? "Edit Staff"
                                        : "Add Staff"}
                                </h2>

                                <p>
                                    {editingStaff
                                        ? "Update staff account details."
                                        : "Create a new staff account."}
                                </p>

                            </div>


                            <button
                                className="admin-close-button"
                                onClick={closeForm}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            className="admin-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="admin-form-grid">

                                <div className="admin-form-group">

                                    <label>
                                        Username
                                    </label>

                                    <input
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        disabled={!!editingStaff}
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Password
                                        {!editingStaff && (
                                            <span className="required">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder={
                                            editingStaff
                                                ? "Leave blank to keep current password"
                                                : "Enter password"
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                    >

                                        <option value="RECEPTIONIST">
                                            Receptionist
                                        </option>

                                        <option value="PHARMACIST">
                                            Pharmacist
                                        </option>

                                        <option value="LAB_TECHNICIAN">
                                            Lab Technician
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {error && (
                                <div className="admin-form-error">
                                    {error}
                                </div>
                            )}


                            <div className="admin-form-actions">

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
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
                                        : editingStaff
                                            ? "Update Staff"
                                            : "Create Staff"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Staff;