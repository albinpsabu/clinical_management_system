import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/accounts/login/", {
                username,
                password,
            });

            const data = response.data;

            console.log("Login response:", data);

            // Save authentication information
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("username", data.user.username);

            // Redirect according to user role
            switch (data.user.role) {
                case "RECEPTIONIST":
                    navigate("/receptionist");
                    break;

                case "DOCTOR":
                    navigate("/doctor");
                    break;

                case "LAB_TECHNICIAN":
                    navigate("/laboratory");
                    break;

                case "PHARMACIST":
                    navigate("/pharmacist");
                    break;

                case "ADMIN":
                    navigate("/admin");
                    break;

                default:
                    localStorage.clear();
                    setError("Unknown user role.");
            }
        } catch (error) {
            console.error("LOGIN ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Response:", error.response.data);

                setError(
                    error.response.data?.detail ||
                    error.response.data?.error ||
                    `Login failed (${error.response.status})`
                );
            } else if (error.request) {
                console.log("No response received from Django.");
                console.log("Request:", error.request);

                setError(
                    "Django server is not responding. Check that the backend is running on port 8000."
                );
            } else {
                console.log(
                    "Request setup error:",
                    error.message
                );

                setError(`Request error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <div className="login-brand">
                    <div className="login-brand-icon">
                        +
                    </div>

                    <div>
                        <h1>Clinical Management System</h1>
                        <p>Healthcare management made simple</p>
                    </div>
                </div>

                <div className="login-heading">
                    <h2>Welcome back</h2>
                    <p>Sign in to continue to your account</p>
                </div>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>

                </form>

                <div className="login-footer">
                    <span>Secure clinical access</span>
                </div>

            </div>

        </div>
    );
}

export default Login;