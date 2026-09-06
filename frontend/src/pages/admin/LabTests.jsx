import React, { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import {
    getLabTests,
    createLabTest,
    updateLabTest,
    deleteLabTest,
    getDepartments,
} from "../../services/adminApi";

import "../../styles/admin.css";

const LabTests = () => {

    const [labTests, setLabTests] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        department: "",
        unit: "",
        sample_required: "",
        normal_range: "",
        price: "",
    });


    // ============================================================
    // LOAD DATA
    // ============================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                testResponse,
                departmentResponse,
            ] = await Promise.all([
                getLabTests(),
                getDepartments(),
            ]);

            const tests = Array.isArray(
                testResponse.data
            )
                ? testResponse.data
                : testResponse.data?.results || [];

            const departmentData =
                Array.isArray(
                    departmentResponse.data
                )
                    ? departmentResponse.data
                    : departmentResponse.data?.results || [];

            setLabTests(tests);
            setDepartments(departmentData);

        } catch (error) {

            console.error(
                "Lab tests loading error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to load lab tests."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // ============================================================
    // FORM
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
            department: "",
            unit: "",
            sample_required: "",
            normal_range: "",
            price: "",
        });

        setEditingId(null);
        setShowForm(false);
        setError("");
    };


    // ============================================================
    // ADD
    // ============================================================

    const handleAdd = () => {

        resetForm();

        setShowForm(true);
    };


    // ============================================================
    // EDIT
    // ============================================================

    const handleEdit = (test) => {

        setEditingId(test.id);

        setForm({
            name: test.name || "",
            department:
                test.department?.id ||
                test.department ||
                "",
            unit: test.unit || "",
            sample_required:
                test.sample_required || "",
            normal_range:
                test.normal_range || "",
            price:
                test.price || "",
        });

        setShowForm(true);
        setError("");
    };


    // ============================================================
    // SAVE
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError("");

        try {

            const payload = {
                name: form.name,
                department: Number(form.department),
                unit: form.unit,
                sample_required:
                    form.sample_required,
                normal_range:
                    form.normal_range,
                price: form.price,
            };


            if (editingId) {

                await updateLabTest(
                    editingId,
                    payload
                );

            } else {

                await createLabTest(payload);

            }


            await loadData();

            resetForm();

        } catch (error) {

            console.error(
                "Lab test save error:",
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
                    "Failed to save lab test."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this lab test?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteLabTest(id);

            await loadData();

        } catch (error) {

            console.error(
                "Lab test delete error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to delete lab test."
            );
        }
    };


    // ============================================================
    // SEARCH
    // ============================================================

    const filteredTests =
        labTests.filter((test) => {

            const searchText =
                search.toLowerCase();

            return (
                test.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                test.test_id
                    ?.toLowerCase()
                    .includes(searchText) ||

                test.unit
                    ?.toLowerCase()
                    .includes(searchText) ||

                String(
                    test.department?.name ||
                    test.department ||
                    ""
                )
                    .toLowerCase()
                    .includes(searchText)
            );
        });


    return (
        <div className="admin-page">

            <div className="admin-page-heading">

                <div>

                    <h1>Lab Tests</h1>

                    <p>
                        Manage laboratory test definitions and charges.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-primary-button"
                    onClick={handleAdd}
                >
                    <Plus size={18} />
                    Add Lab Test
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
                            placeholder="Search lab test..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading lab tests...
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>#</th>
                                    <th>Test ID</th>
                                    <th>Test Name</th>
                                    <th>Department</th>
                                    <th>Unit</th>
                                    <th>Sample Required</th>
                                    <th>Normal Range</th>
                                    <th>Price</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredTests.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="9"
                                            className="admin-empty"
                                        >
                                            No lab tests found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredTests.map(
                                        (test, index) => (

                                            <tr
                                                key={test.id}
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {test.test_id}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {test.name}
                                                </td>

                                                <td>
                                                    {test.department?.name ||
                                                        test.department ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {test.unit || "-"}
                                                </td>

                                                <td>
                                                    {test.sample_required ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {test.normal_range ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    ₹{test.price}
                                                </td>

                                                <td>

                                                    <div className="admin-action-buttons">

                                                        <button
                                                            type="button"
                                                            className="admin-icon-button edit"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    test
                                                                )
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
                                                                    test.id
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
                LAB TEST FORM
            ===================================================== */}

            {showForm && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    {editingId
                                        ? "Edit Lab Test"
                                        : "Add Lab Test"}
                                </h2>

                                <p>
                                    Enter laboratory test information.
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

                                <div className="admin-form-group">

                                    <label>
                                        Test Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


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


                                <div className="admin-form-group">

                                    <label>
                                        Unit
                                    </label>

                                    <input
                                        type="text"
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        placeholder="mg/dL, %, etc."
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Sample Required
                                    </label>

                                    <input
                                        type="text"
                                        name="sample_required"
                                        value={form.sample_required}
                                        onChange={handleChange}
                                        placeholder="Blood / Urine / Serum"
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Normal Range
                                    </label>

                                    <input
                                        type="text"
                                        name="normal_range"
                                        value={form.normal_range}
                                        onChange={handleChange}
                                        placeholder="70 - 100"
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />

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
                                            ? "Update Lab Test"
                                            : "Create Lab Test"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default LabTests;