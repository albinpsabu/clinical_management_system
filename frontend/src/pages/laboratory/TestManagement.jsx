import { useEffect, useState } from "react";
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
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showPerformModal, setShowPerformModal] = useState(false);

    const [selectedResult, setSelectedResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);

    // Load prescriptions and results
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

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
            console.error(
                "Error loading laboratory test management data:",
                error
            );
            setError("Unable to load test management data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Open Perform Test modal
    const handlePerformTest = (prescription) => {
        setSelectedPrescription(prescription);
        setShowPerformModal(true);
        setMessage("");
        setError("");
    };

    // Close Perform Test modal
    const handleClosePerformModal = () => {
        setShowPerformModal(false);
        setSelectedPrescription(null);
    };

    // Submit result
    const handleSaveResult = async (resultData) => {
        try {
            setError("");
            setMessage("");

            if (!selectedPrescription) {
                return;
            }

            // Generate a unique result ID
            const resultId = `RES-${Date.now()}`;

            await saveLabResult({
                result_id: resultId,
                lab_prescription: selectedPrescription.id,
                result: resultData.result,
                remarks: resultData.remarks || "",
                status: "COMPLETED",
            });

            setMessage(
                "Laboratory test result submitted successfully."
            );

            handleClosePerformModal();

            // Reload prescriptions and results
            await loadData();
        } catch (error) {
            console.error("Error saving laboratory result:", error);

            const backendMessage =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to submit laboratory test result.";

            setError(backendMessage);
        }
    };

    // Find result belonging to a prescription
    const getResultForPrescription = (prescriptionId) => {
        return results.find(
            (result) =>
                Number(result.lab_prescription) === Number(prescriptionId)
        );
    };

    // Check whether prescription has a result
    const hasResult = (prescription) => {
        return Boolean(
            getResultForPrescription(prescription.id)
        );
    };

    // Get display status
    const getStatus = (prescription) => {
        if (
            prescription.status === "COMPLETED" ||
            hasResult(prescription)
        ) {
            return "COMPLETED";
        }

        if (prescription.status === "SAMPLE_COLLECTED") {
            return "SAMPLE COLLECTED";
        }

        return "REQUESTED";
    };

    // View detailed result
    const handleViewResult = (prescription) => {
        const result = getResultForPrescription(prescription.id);

        if (!result) {
            setError("Laboratory result could not be found.");
            return;
        }

        setSelectedResult(result);
        setShowResultModal(true);
        setError("");
        setMessage("");
    };

    // Close result modal
    const handleCloseResultModal = () => {
        setShowResultModal(false);
        setSelectedResult(null);
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

                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>Test Management</h1>
                        <p>
                            View prescribed laboratory tests, submit
                            results and view completed test results.
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Test Management Card */}
                <div className="laboratory-card">

                    <div className="card-header">
                        <div>
                            <h2>Prescribed Laboratory Tests</h2>
                            <p>
                                Laboratory tests prescribed by doctors
                            </p>
                        </div>

                        <span className="record-count">
                            {prescriptions.length} Tests
                        </span>
                    </div>

                    <div className="table-container">
                        <table className="laboratory-table">

                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Patient</th>
                                    <th>Test</th>
                                    <th>Clinical Reason</th>
                                    <th>Instructions</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {prescriptions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="empty-table-message"
                                        >
                                            No laboratory tests have been
                                            prescribed yet.
                                        </td>
                                    </tr>
                                ) : (
                                    prescriptions.map((prescription) => {

                                        const status =
                                            getStatus(prescription);

                                        const completed =
                                            status === "COMPLETED";

                                        return (
                                            <tr
                                                key={prescription.id}
                                            >

                                                {/* Request ID */}
                                                <td>
                                                    <strong>
                                                        {
                                                            prescription.lab_request_id
                                                        }
                                                    </strong>
                                                </td>

                                                {/* Patient */}
                                                <td>
                                                    {
                                                        prescription.patient_name ||
                                                        "N/A"
                                                    }
                                                </td>

                                                {/* Test */}
                                                <td>
                                                    {
                                                        prescription.test_name ||
                                                        "N/A"
                                                    }
                                                </td>

                                                {/* Clinical Reason */}
                                                <td>
                                                    {
                                                        prescription.clinical_reason ||
                                                        "N/A"
                                                    }
                                                </td>

                                                {/* Instructions */}
                                                <td>
                                                    {
                                                        prescription.instructions ||
                                                        "N/A"
                                                    }
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            completed
                                                                ? "status-completed"
                                                                : "status-pending"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td>
                                                    {completed ? (
                                                        <button
                                                            type="button"
                                                            className="action-button"
                                                            onClick={() =>
                                                                handleViewResult(
                                                                    prescription
                                                                )
                                                            }
                                                        >
                                                            View Result
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="action-button"
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
                                    })
                                )}

                            </tbody>

                        </table>
                    </div>

                </div>
            </div>

            {/* Perform Test Modal */}
            {showPerformModal && selectedPrescription && (
                <PerformTestModal
                    prescription={selectedPrescription}
                    onSave={handleSaveResult}
                    onClose={handleClosePerformModal}
                />
            )}

            {/* Detailed Result Modal */}
            {showResultModal && selectedResult && (
                <div className="modal-overlay">

                    <div className="modal-content">

                        <div className="modal-header">
                            <div>
                                <h2>Laboratory Test Result</h2>
                                <p>
                                    Detailed result information
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={handleCloseResultModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="result-details">

                            {/* Basic Information */}
                            <div className="result-info-grid">

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Patient
                                    </span>

                                    <span className="result-value">
                                        {
                                            selectedResult.patient_name ||
                                            "N/A"
                                        }
                                    </span>
                                </div>

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Test
                                    </span>

                                    <span className="result-value">
                                        {
                                            selectedResult.test_name ||
                                            "N/A"
                                        }
                                    </span>
                                </div>

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Request ID
                                    </span>

                                    <span className="result-value">
                                        {
                                            selectedResult.lab_request_id ||
                                            "N/A"
                                        }
                                    </span>
                                </div>

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Result ID
                                    </span>

                                    <span className="result-value">
                                        {
                                            selectedResult.result_id ||
                                            "N/A"
                                        }
                                    </span>
                                </div>

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Status
                                    </span>

                                    <span className="result-value">
                                        <span className="status-badge status-completed">
                                            {
                                                selectedResult.status ||
                                                "COMPLETED"
                                            }
                                        </span>
                                    </span>
                                </div>

                                <div className="result-info-item">
                                    <span className="result-label">
                                        Completed At
                                    </span>

                                    <span className="result-value">
                                        {selectedResult.completed_at
                                            ? new Date(
                                                  selectedResult.completed_at
                                              ).toLocaleString()
                                            : "N/A"}
                                    </span>
                                </div>

                            </div>

                            {/* Result */}
                            <div className="result-section">

                                <h3>Result</h3>

                                <div className="result-text">
                                    {selectedResult.result ||
                                        "No result recorded."}
                                </div>

                            </div>

                            {/* Remarks */}
                            <div className="result-section">

                                <h3>Remarks</h3>

                                <div className="result-text">
                                    {selectedResult.remarks ||
                                        "No remarks provided."}
                                </div>

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleCloseResultModal}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}

export default TestManagement;