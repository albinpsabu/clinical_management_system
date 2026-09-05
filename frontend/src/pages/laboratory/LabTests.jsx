import { useEffect, useState } from "react";

import {
    getLabTests,
} from "../../services/laboratoryService";

function LabTests() {
    const [tests, setTests] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTests = async () => {
            try {
                setLoading(true);

                const data = await getLabTests();

                setTests(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );

            } catch (error) {
                console.error(error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load laboratory tests."
                );

            } finally {
                setLoading(false);
            }
        };

        loadTests();
    }, []);

    const searchValue =
        search.trim().toLowerCase();

    const filteredTests = tests.filter(
        (test) =>
            test.test_id
                ?.toLowerCase()
                .includes(searchValue) ||
            test.name
                ?.toLowerCase()
                .includes(searchValue) ||
            test.description
                ?.toLowerCase()
                .includes(searchValue)
    );

    if (loading) {
        return (
            <div className="laboratory-page">
                <div className="loading-state">
                    Loading laboratory tests...
                </div>
            </div>
        );
    }

    return (
        <div className="laboratory-page">

            <div className="page-header">

                <div>
                    <h1>
                        Lab Tests
                    </h1>

                    <p>
                        View available laboratory tests
                        and their charges.
                    </p>
                </div>

            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="content-card">

                <div className="card-header">

                    <div>
                        <h2>
                            Available Tests
                        </h2>

                        <p>
                            Laboratory tests configured
                            by the administrator.
                        </p>
                    </div>

                    <span className="record-count">
                        {filteredTests.length} Tests
                    </span>

                </div>

                <div className="search-wrapper">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search tests..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

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
                                        className="empty-state"
                                    >
                                        No laboratory tests found.
                                    </td>
                                </tr>

                            ) : (

                                filteredTests.map(
                                    (test) => (

                                        <tr key={test.id}>

                                            <td>
                                                <span className="request-id">
                                                    {
                                                        test.test_id
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {test.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    test.description ||
                                                    "—"
                                                }
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    test.price || 0
                                                ).toFixed(2)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status ${
                                                        test.status ===
                                                        "Active"
                                                            ? "completed"
                                                            : "pending"
                                                    }`}
                                                >
                                                    {
                                                        test.status ||
                                                        "Active"
                                                    }
                                                </span>
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default LabTests;