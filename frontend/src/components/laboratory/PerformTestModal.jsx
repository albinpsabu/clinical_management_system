import { useState } from "react";

function PerformTestModal({
    prescription,
    onSave,
    onClose,
}) {
    const [result, setResult] = useState("");
    const [remarks, setRemarks] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!result.trim()) {
            setError(
                "Please enter the laboratory result."
            );
            return;
        }

        try {
            setSaving(true);

            await onSave({
                result: result.trim(),
                remarks: remarks.trim(),
            });

        } catch (error) {
            console.error(
                "Result submission error:",
                error
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal-content">

                {/* HEADER */}

                <div className="modal-header">

                    <div>

                        <h2>
                            Perform Laboratory Test
                        </h2>

                        <p>
                            Enter the result for the
                            prescribed laboratory test.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>

                </div>

                {/* TEST INFORMATION */}

                <div className="result-info-grid">

                    <div className="result-info-item">

                        <span className="result-label">
                            Patient
                        </span>

                        <span className="result-value">
                            {
                                prescription?.patient_name ||
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
                                prescription?.test_name ||
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
                                prescription?.lab_request_id ||
                                "N/A"
                            }
                        </span>

                    </div>

                    <div className="result-info-item">

                        <span className="result-label">
                            Status
                        </span>

                        <span className="result-value">

                            <span className="status-badge status-pending">
                                SAMPLE COLLECTED
                            </span>

                        </span>

                    </div>

                </div>

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="result-section">

                        <h3>
                            Result
                        </h3>

                        <textarea
                            value={result}
                            onChange={(e) =>
                                setResult(
                                    e.target.value
                                )
                            }
                            placeholder="Enter laboratory test result..."
                            rows={6}
                            disabled={saving}
                        />

                    </div>

                    <div className="result-section">

                        <h3>
                            Remarks
                        </h3>

                        <textarea
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(
                                    e.target.value
                                )
                            }
                            placeholder="Enter remarks if required..."
                            rows={4}
                            disabled={saving}
                        />

                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* FOOTER */}

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="perform-test-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Complete Test"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default PerformTestModal;