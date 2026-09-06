import React, { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../../services/adminApi";

import "../../styles/admin.css";


const emptyForm = {
    name: "",
    description: "",
    status: "Active",
};


const Departments = () => {

    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingDepartment, setEditingDepartment] =
        useState(null);

    const [form, setForm] = useState(emptyForm);


    const loadDepartments = async () => {

        try {

            setLoading(true);

            const response =
                await getDepartments();

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

            setDepartments(data);

        } catch (err) {

            console.error(
                "Department loading error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load departments."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadDepartments();
    }, []);


    const filteredDepartments = useMemo(() => {

        const term =
            search.trim().toLowerCase();

        if (!term) {
            return departments;
        }

        return departments.filter(
            (department) =>
                String(
                    department.name || ""
                )
                    .toLowerCase()
                    .includes(term)
        );

    }, [departments, search]);


    const openAddForm = () => {

        setEditingDepartment(null);

        setForm(emptyForm);

        setError("");

        setSuccess("");

        setShowForm(true);

    };


    const openEditForm = (department) => {

        setEditingDepartment(department);

        setForm({
            name: department.name || "",
            description:
                department.description || "",
            status:
                department.status || "Active",
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

        setEditingDepartment(null);

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


        if (!form.name.trim()) {
            setError(
                "Department name is required."
            );
            return;
        }


        try {

            setSaving(true);


            const payload = {
                name: form.name.trim(),
                description:
                    form.description.trim(),
                status: form.status,
            };


            if (editingDepartment) {

                await updateDepartment(
                    editingDepartment.id,
                    payload
                );

                setSuccess(
                    "Department updated successfully."
                );

            } else {

                await createDepartment(
                    payload
                );

                setSuccess(
                    "Department created successfully."
                );

            }


            await loadDepartments();

            setTimeout(
                closeForm,
                700
            );

        } catch (err) {

            console.error(
                "Department save error:",
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
                    "Unable to save department."
                );

            } else {

                setError(
                    "Unable to save department."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    const handleDelete = async (department) => {

        if (
            !window.confirm(
                `Delete "${department.name}"?`
            )
        ) {
            return;
        }


        try {

            setError("");

            await deleteDepartment(
                department.id
            );

            setSuccess(
                "Department deleted successfully."
            );

            await loadDepartments();

        } catch (err) {

            console.error(
                "Department delete error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to delete department."
            );

        }
    };


    return (
        <div className="admin-page">

            <div className="admin-page-heading">

                <div>

                    <h1>
                        Departments
                    </h1>

                    <p>
                        Manage clinical departments.
                    </p>

                </div>


                <button
                    className="admin-primary-button"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Department
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
                            placeholder="Search departments..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading departments...
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th>Department</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredDepartments.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="admin-empty"
                                        >
                                            No departments found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredDepartments.map(
                                        (department, index) => (

                                            <tr
                                                key={
                                                    department.id
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            department.name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        department.description ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    <span className="admin-status-badge">
                                                        {
                                                            department.status ||
                                                            "Active"
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="admin-actions">

                                                        <button
                                                            className="admin-icon-button edit"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    department
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
                                                                    department
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

                    <div className="admin-modal small">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h2>

                                <p>
                                    Enter department information.
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

                            <div className="admin-form-group">

                                <label>
                                    Department Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter department name"
                                />

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                    rows="4"
                                />

                            </div>


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
                                        : editingDepartment
                                            ? "Update Department"
                                            : "Create Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Departments;