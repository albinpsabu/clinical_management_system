import React, { useEffect, useState } from "react";
import {
    getLabPrescriptions,
    getLabResults,
    saveLabResult,
} from "../../services/laboratoryService";

import PerformTestModal from "../../components/laboratory/PerformTestModal";

import "../../styles/laboratory/laboratory.css";

function TestManagement() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);

            const [prescriptionData, resultData] = await Promise.all([
                getLabPrescriptions(),
                getLabResults(),
            ]);

            setPrescriptions(
                Array.isArray(prescriptionData)
                    ? prescriptionData
                    : prescriptionData.results || []
            );

            setResults(
                Array.isArray(resultData)
                    ? resultData
                    : resultData.results || []
            );
        } catch (error) {
            console.error("Error loading test management:", error);
            setMessage("Unable to load test management data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handlePerformTest = (prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPrescription(null);
    };

    const handleSaveResult = async (resultData) => {
        try {
            await saveLabResult({
                lab_prescription: selectedPrescription.id,
                result: resultData.result,
                remarks: resultData.remarks,
                status: "COMPLETED",
            });

            setMessage("Result saved successfully");

            handleCloseModal();

            await loadData();
        } catch (error) {
            console.error("Error saving result:", error);

            setMessage(
                error.response?.data?.detail ||
                "Failed to save laboratory result."
            );
        }
    };

    const hasResult = (prescriptionId) => {
        return results.some(
            (result) =>
                Number(result.lab_prescription) === Number(prescriptionId)
        );
    };

    const getStatus = (prescription) => {
        if (hasResult(prescription.id)) {
            return "COMPLETED";
        }

        return prescription.status || "PENDING";
    };

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="laboratory-content">
                    <div className="loading-message">
                        Loading test management...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="laboratory-page">
            <div className="laboratory-content">

                <div className="page-header">
                    <div>
                        <h1>Test Management</h1>
                        <p>
                            View and perform laboratory tests prescribed by
                            doctors.
                        </p>
                    </div>
                </div>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                <div className="laboratory-card">

                    <div className="card-header">
                        <div>
                            <h2>Laboratory Test Requests</h2>
                            <p>
                                Tests assigned to the laboratory technician
                            </p>
                        </div>

                        <span className="record-count">
                            {prescriptions.length} Tests
                        </span>
                    </div>

                    {prescriptions.length === 0 ? (
                        <div className="empty-state">
                            <h3>No laboratory tests found</h3>
                            <p>
                                There are currently no laboratory
                                prescriptions assigned.
                            </p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="laboratory-table">

                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Patient</th>
                                        <th>Test</th>
                                        <th>Reason</th>
                                        <th>Instructions</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {prescriptions.map((prescription) => {
                                        const status =
                                            getStatus(prescription);

                                        return (
                                            <tr key={prescription.id}>

                                                <td>
                                                    <strong>
                                                        {
                                                            prescription.lab_request_id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {prescription.patient_name ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    {prescription.test_name ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    {prescription.clinical_reason ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    {prescription.instructions ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            status ===
                                                            "COMPLETED"
                                                                ? "status-completed"
                                                                : "status-pending"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {status === "COMPLETED" ? (
                                                        <button
                                                            className="view-result-btn"
                                                            disabled
                                                        >
                                                            Completed
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="perform-test-btn"
                                                            onClick={() =>
                                                                handlePerformTest(
                                                                    prescription
                                                                )
                                                            }
                                                        >
                                                            Perform Test
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>
                        </div>
                    )}

                </div>
            </div>

            {showModal && selectedPrescription && (
                <PerformTestModal
                    prescription={selectedPrescription}
                    onClose={handleCloseModal}
                    onSave={handleSaveResult}
                />
            )}
        </div>
    );
}

export default TestManagement;