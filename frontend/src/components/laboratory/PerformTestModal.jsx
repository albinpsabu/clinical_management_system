import React, { useState } from "react";

function PerformTestModal({ prescription, onClose, onSave }) {

    const [result, setResult] = useState("");
    const [remarks, setRemarks] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!result.trim()) {
            alert("Please enter the test result.");
            return;
        }

        try {
            setSaving(true);

            await onSave({
                result: result.trim(),
                remarks: remarks.trim(),
            });

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="perform-test-modal">

                <div className="modal-header">
                    <div>
                        <h2>Perform Laboratory Test</h2>
                        <p>
                            Enter the result for the prescribed test.
                        </p>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="test-information">

                    <div>
                        <label>Request ID</label>
                        <p>
                            {prescription.lab_request_id}
                        </p>
                    </div>

                    <div>
                        <label>Patient</label>
                        <p>
                            {prescription.patient_name || "N/A"}
                        </p>
                    </div>

                    <div>
                        <label>Test</label>
                        <p>
                            {prescription.test_name || "N/A"}
                        </p>
                    </div>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Test Result
                            <span className="required">*</span>
                        </label>

                        <textarea
                            value={result}
                            onChange={(e) =>
                                setResult(e.target.value)
                            }
                            placeholder="Enter laboratory test result..."
                            rows="5"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Remarks
                        </label>

                        <textarea
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(e.target.value)
                            }
                            placeholder="Enter additional remarks..."
                            rows="4"
                        />

                    </div>

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-result-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Result"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default PerformTestModal;