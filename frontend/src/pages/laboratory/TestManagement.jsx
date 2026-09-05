import { useEffect, useState } from "react";

import {
    getLabPrescriptions,
    getLabResults,
    getLabBills,
    collectSample,
    saveLabResult,
    createLabBill,
} from "../../services/laboratoryService";

import PerformTestModal from "../../components/laboratory/PerformTestModal";

import "../../styles/laboratory/laboratory.css";

function TestManagement() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [results, setResults] = useState([]);
    const [bills, setBills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedPrescription, setSelectedPrescription] =
        useState(null);

    const [showPerformModal, setShowPerformModal] =
        useState(false);

    const [selectedResult, setSelectedResult] =
        useState(null);

    const [showResultModal, setShowResultModal] =
        useState(false);

    // ==================================================
    // LOAD DATA
    // ==================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                prescriptionResponse,
                resultResponse,
                billResponse,
            ] = await Promise.all([
                getLabPrescriptions(),
                getLabResults(),
                getLabBills(),
            ]);

            const prescriptionData =
                Array.isArray(prescriptionResponse.data)
                    ? prescriptionResponse.data
                    : prescriptionResponse.data?.results || [];

            const resultData =
                Array.isArray(resultResponse.data)
                    ? resultResponse.data
                    : resultResponse.data?.results || [];

            const billData =
                Array.isArray(billResponse.data)
                    ? billResponse.data
                    : billResponse.data?.results || [];

            setPrescriptions(prescriptionData);
            setResults(resultData);
            setBills(billData);

        } catch (error) {
            console.error(
                "Error loading laboratory test management data:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load test management data."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==================================================
    // FIND RESULT
    // ==================================================

    const getResultForPrescription = (prescriptionId) => {
        return results.find(
            (result) =>
                Number(result.lab_prescription) ===
                Number(prescriptionId)
        );
    };

    // ==================================================
    // FIND BILL
    // ==================================================

    const getBillForPrescription = (prescriptionId) => {
        return bills.find(
            (bill) =>
                Number(bill.lab_prescription) ===
                Number(prescriptionId)
        );
    };

    // ==================================================
    // COLLECT SAMPLE
    // ==================================================

    const handleCollectSample = async (prescription) => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            if (prescription.status !== "REQUESTED") {
                setError(
                    "This sample cannot be collected."
                );
                return;
            }

            await collectSample(prescription.id);

            setMessage(
                "Sample collected successfully."
            );

            await loadData();

        } catch (error) {
            console.error(
                "Sample collection error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to collect sample."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // ==================================================
    // OPEN PERFORM TEST
    // ==================================================

    const handlePerformTest = (prescription) => {
        setError("");
        setMessage("");

        if (prescription.status !== "SAMPLE_COLLECTED") {
            setError(
                "Sample must be collected before performing the test."
            );
            return;
        }

        const existingResult =
            getResultForPrescription(
                prescription.id
            );

        if (existingResult) {
            setError(
                "A result already exists for this test."
            );
            return;
        }

        setSelectedPrescription(prescription);
        setShowPerformModal(true);
    };

    // ==================================================
    // CLOSE PERFORM TEST MODAL
    // ==================================================

    const handleClosePerformModal = () => {
        if (actionLoading) {
            return;
        }

        setShowPerformModal(false);
        setSelectedPrescription(null);
    };

    // ==================================================
    // SAVE LAB RESULT
    // ==================================================

    const handleSaveResult = async (resultData) => {
        if (!selectedPrescription) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const resultId =
                `RES-${Date.now()}`;

            await saveLabResult({
                result_id: resultId,

                lab_prescription:
                    selectedPrescription.id,

                result:
                    resultData.result,

                remarks:
                    resultData.remarks || "",

                status:
                    "COMPLETED",
            });

            setShowPerformModal(false);
            setSelectedPrescription(null);

            setMessage(
                "Laboratory test completed successfully. You can now view the result and generate the bill."
            );

            await loadData();

        } catch (error) {
            console.error(
                "Error saving laboratory result:",
                error
            );

            const data =
                error.response?.data;

            let errorMessage =
                "Unable to submit laboratory test result.";

            if (data?.lab_prescription) {
                errorMessage = Array.isArray(
                    data.lab_prescription
                )
                    ? data.lab_prescription[0]
                    : data.lab_prescription;

            } else if (data?.detail) {
                errorMessage = data.detail;

            } else if (data?.message) {
                errorMessage = data.message;
            }

            setError(errorMessage);

            throw error;

        } finally {
            setActionLoading(false);
        }
    };

    // ==================================================
    // VIEW RESULT
    // ==================================================

    const handleViewResult = (prescription) => {
        const result =
            getResultForPrescription(
                prescription.id
            );

        if (!result) {
            setError(
                "Laboratory result could not be found."
            );
            return;
        }

        setSelectedResult(result);
        setShowResultModal(true);

        setError("");
        setMessage("");
    };

    // ==================================================
    // CLOSE RESULT MODAL
    // ==================================================

    const handleCloseResultModal = () => {
        if (actionLoading) {
            return;
        }

        setShowResultModal(false);
        setSelectedResult(null);
    };

    // ==================================================
    // GENERATE BILL
    // ==================================================

    const handleGenerateBill = async (prescription) => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const result =
                getResultForPrescription(
                    prescription.id
                );

            if (!result) {
                setError(
                    "Laboratory result is required before generating a bill."
                );
                return;
            }

            if (result.status !== "COMPLETED") {
                setError(
                    "The laboratory test must be completed before generating a bill."
                );
                return;
            }

            const existingBill =
                getBillForPrescription(
                    prescription.id
                );

            if (existingBill) {
                setMessage(
                    `Bill ${existingBill.bill_id} already exists.`
                );

                setShowResultModal(false);

                window.location.href =
                    "/laboratory/billing";

                return;
            }

            await createLabBill({
                lab_prescription:
                    prescription.id,
            });

            setShowResultModal(false);
            setSelectedResult(null);

            setMessage(
                "Laboratory bill generated successfully."
            );

            await loadData();

            /*
             * Give the user a short moment to see
             * the success message and then open Billing.
             */
            setTimeout(() => {
                window.location.href =
                    "/laboratory/billing";
            }, 700);

        } catch (error) {
            console.error(
                "Error generating laboratory bill:",
                error
            );

            const data =
                error.response?.data;

            let errorMessage =
                "Unable to generate laboratory bill.";

            if (data?.lab_prescription) {
                errorMessage = Array.isArray(
                    data.lab_prescription
                )
                    ? data.lab_prescription[0]
                    : data.lab_prescription;

            } else if (data?.detail) {
                errorMessage = data.detail;

            } else if (data?.message) {
                errorMessage = data.message;
            }

            setError(errorMessage);

        } finally {
            setActionLoading(false);
        }
    };

    // ==================================================
    // STATUS
    // ==================================================

    const getStatus = (prescription) => {
        const result =
            getResultForPrescription(
                prescription.id
            );

        if (
            prescription.status === "COMPLETED" ||
            result?.status === "COMPLETED"
        ) {
            return "COMPLETED";
        }

        if (
            prescription.status ===
            "SAMPLE_COLLECTED"
        ) {
            return "SAMPLE COLLECTED";
        }

        return "REQUESTED";
    };

    // ==================================================
    // LOADING
    // ==================================================

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

    // ==================================================
    // UI
    // ==================================================

    return (
        <div className="laboratory-page">

            <div className="laboratory-content">

                {/* PAGE HEADER */}

                <div className="page-header">

                    <div>

                        <h1>
                            Test Management
                        </h1>

                        <p>
                            View prescribed laboratory
                            tests, submit results and
                            generate bills.
                        </p>

                    </div>

                    <span className="record-count">
                        {prescriptions.length} Tests
                    </span>

                </div>

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* TEST MANAGEMENT CARD */}

                <div className="laboratory-card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Prescribed Laboratory Tests
                            </h2>

                            <p>
                                Laboratory tests prescribed
                                by doctors.
                            </p>

                        </div>

                    </div>

                    <div className="table-container">

                        <table className="laboratory-table">

                            <thead>

                                <tr>

                                    <th>
                                        Request ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Test
                                    </th>

                                    <th>
                                        Clinical Reason
                                    </th>

                                    <th>
                                        Instructions
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {prescriptions.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="empty-table-message"
                                        >
                                            No laboratory tests
                                            have been prescribed yet.
                                        </td>

                                    </tr>

                                ) : (

                                    prescriptions.map(
                                        (prescription) => {

                                            const status =
                                                getStatus(
                                                    prescription
                                                );

                                            const result =
                                                getResultForPrescription(
                                                    prescription.id
                                                );

                                            const bill =
                                                getBillForPrescription(
                                                    prescription.id
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        prescription.id
                                                    }
                                                >

                                                    {/* REQUEST ID */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                prescription.lab_request_id
                                                            }
                                                        </strong>

                                                    </td>

                                                    {/* PATIENT */}

                                                    <td>
                                                        {
                                                            prescription.patient_name ||
                                                            "N/A"
                                                        }
                                                    </td>

                                                    {/* TEST */}

                                                    <td>
                                                        {
                                                            prescription.test_name ||
                                                            "N/A"
                                                        }
                                                    </td>

                                                    {/* CLINICAL REASON */}

                                                    <td>
                                                        {
                                                            prescription.clinical_reason ||
                                                            "N/A"
                                                        }
                                                    </td>

                                                    {/* INSTRUCTIONS */}

                                                    <td>
                                                        {
                                                            prescription.instructions ||
                                                            "N/A"
                                                        }
                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`status-badge ${
                                                                status ===
                                                                "COMPLETED"
                                                                    ? "status-completed"
                                                                    : "status-pending"
                                                            }`}
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* ACTION */}

                                                    <td>

                                                        {status ===
                                                        "REQUESTED" ? (

                                                            <button
                                                                type="button"
                                                                className="perform-test-btn"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    handleCollectSample(
                                                                        prescription
                                                                    )
                                                                }
                                                            >
                                                                {actionLoading
                                                                    ? "Processing..."
                                                                    : "Collect Sample"}
                                                            </button>

                                                        ) : status ===
                                                          "SAMPLE COLLECTED" ? (

                                                            <button
                                                                type="button"
                                                                className="perform-test-btn"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    handlePerformTest(
                                                                        prescription
                                                                    )
                                                                }
                                                            >
                                                                Perform Test
                                                            </button>

                                                        ) : (

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap:
                                                                        "8px",
                                                                    flexWrap:
                                                                        "wrap",
                                                                }}
                                                            >

                                                                <button
                                                                    type="button"
                                                                    className="view-result-btn"
                                                                    onClick={() =>
                                                                        handleViewResult(
                                                                            prescription
                                                                        )
                                                                    }
                                                                >
                                                                    View Result
                                                                </button>

                                                                {bill ? (

                                                                    <span
                                                                        className="status-badge status-completed"
                                                                    >
                                                                        BILLED
                                                                    </span>

                                                                ) : result ? (

                                                                    <button
                                                                        type="button"
                                                                        className="perform-test-btn"
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                        onClick={() =>
                                                                            handleGenerateBill(
                                                                                prescription
                                                                            )
                                                                        }
                                                                    >
                                                                        Generate Bill
                                                                    </button>

                                                                ) : null}

                                                            </div>

                                                        )}

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            {/* ==================================================
                PERFORM TEST MODAL
            ================================================== */}

            {showPerformModal &&
                selectedPrescription && (

                    <PerformTestModal
                        prescription={
                            selectedPrescription
                        }
                        onSave={
                            handleSaveResult
                        }
                        onClose={
                            handleClosePerformModal
                        }
                    />

                )}

            {/* ==================================================
                RESULT MODAL
            ================================================== */}

            {showResultModal &&
                selectedResult && (

                    <div className="modal-overlay">

                        <div className="modal-content">

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        Laboratory Test Result
                                    </h2>

                                    <p>
                                        Detailed result
                                        information
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        handleCloseResultModal
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="result-details">

                                {/* BASIC INFORMATION */}

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

                                {/* RESULT */}

                                <div className="result-section">

                                    <h3>
                                        Result
                                    </h3>

                                    <div className="result-text">

                                        {
                                            selectedResult.result ||
                                            "No result recorded."
                                        }

                                    </div>

                                </div>

                                {/* REMARKS */}

                                <div className="result-section">

                                    <h3>
                                        Remarks
                                    </h3>

                                    <div className="result-text">

                                        {
                                            selectedResult.remarks ||
                                            "No remarks provided."
                                        }

                                    </div>

                                </div>

                            </div>

                            {/* RESULT MODAL FOOTER */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCloseResultModal
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    Close
                                </button>

                                {getBillForPrescription(
                                    selectedResult.lab_prescription
                                ) ? (

                                    <span className="status-badge status-completed">
                                        BILL GENERATED
                                    </span>

                                ) : (

                                    <button
                                        type="button"
                                        className="perform-test-btn"
                                        disabled={
                                            actionLoading
                                        }
                                        onClick={() =>
                                            handleGenerateBill(
                                                prescriptions.find(
                                                    (prescription) =>
                                                        Number(
                                                            prescription.id
                                                        ) ===
                                                        Number(
                                                            selectedResult.lab_prescription
                                                        )
                                                )
                                            )
                                        }
                                    >
                                        {actionLoading
                                            ? "Generating..."
                                            : "Generate Bill"}
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default TestManagement;