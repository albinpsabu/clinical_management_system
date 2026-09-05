import { useEffect, useState } from "react";
import { getLabTests } from "../../services/laboratoryService";
import "../../styles/laboratory/laboratory.css";

function LabTests() {
    const [tests, setTests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTests = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getLabTests();

                setTests(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (error) {
                console.error("Error loading laboratory tests:", error);
                setError("Unable to load laboratory tests.");
            } finally {
                setLoading(false);
            }
        };

        loadTests();
    }, []);

    const filteredTests = tests.filter((test) => {
        const search = searchTerm.toLowerCase();

        return (
            test.test_id?.toLowerCase().includes(search) ||
            test.name?.toLowerCase().includes(search) ||
            test.description?.toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="laboratory-content">
                    <div className="loading-message">
                        Loading laboratory tests...
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
                        <h1>Lab Tests</h1>
                        <p>
                            View laboratory tests available in the system.
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Tests Card */}
                <div className="laboratory-card">

                    <div className="card-header">
                        <div>
                            <h2>Available Laboratory Tests</h2>
                            <p>
                                Tests entered by the administrator
                            </p>
                        </div>

                        <span className="record-count">
                            {filteredTests.length} Tests
                        </span>
                    </div>

                    {/* Search */}
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search laboratory tests..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                        />
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="laboratory-table">

                            <thead>
                                <tr>
                                    <th>Test ID</th>
                                    <th>Test Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="empty-table-message"
                                        >
                                            {searchTerm
                                                ? "No laboratory tests match your search."
                                                : "No laboratory tests found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTests.map((test) => (
                                        <tr key={test.id}>

                                            <td>
                                                <strong>
                                                    {test.test_id}
                                                </strong>
                                            </td>

                                            <td>
                                                {test.name}
                                            </td>

                                            <td>
                                                {test.description || "N/A"}
                                            </td>

                                            <td>
                                                ₹{test.price}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        test.status === "Active"
                                                            ? "status-completed"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    {test.status}
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LabTests;