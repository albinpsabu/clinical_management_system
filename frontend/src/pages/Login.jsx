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
                username: username.trim(),
                password: password,
            });

            const data = response.data;

            console.log("LOGIN RESPONSE:", data);
            console.log("USER:", data.user);
            console.log("ROLE FROM SERVER:", data.user?.role);

            // =====================================================
            // VALIDATE RESPONSE
            // =====================================================

            if (!data.access || !data.refresh || !data.user) {
                setError("Invalid response received from server.");
                return;
            }

            // =====================================================
            // GET ROLE
            // =====================================================

            const role = String(data.user.role || "")
                .trim()
                .toUpperCase();

            const loggedInUsername = data.user.username;

            console.log("FINAL ROLE:", role);
            console.log("USERNAME:", loggedInUsername);

            // =====================================================
            // SAVE LOGIN INFORMATION
            // =====================================================

            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            localStorage.setItem("role", role);
            localStorage.setItem("username", loggedInUsername);

            console.log(
                "ACCESS TOKEN SAVED:",
                !!localStorage.getItem("access_token")
            );

            console.log(
                "ROLE SAVED:",
                localStorage.getItem("role")
            );

            console.log(
                "USERNAME SAVED:",
                localStorage.getItem("username")
            );

            // =====================================================
            // ADMIN
            // =====================================================

            if (role === "ADMIN") {
                console.log("ADMIN ROLE DETECTED");
                console.log("REDIRECTING TO /admin");

                /*
                 * Use browser navigation here.
                 *
                 * The authentication information has already been
                 * saved to localStorage, so the Admin page can read it
                 * after the reload.
                 */
                window.location.replace("/admin");

                return;
            }

            // =====================================================
            // RECEPTIONIST
            // =====================================================

            if (role === "RECEPTIONIST") {
                console.log("REDIRECTING TO /receptionist");

                window.location.replace("/receptionist");

                return;
            }

            // =====================================================
            // DOCTOR
            // =====================================================

            if (role === "DOCTOR") {
                console.log("REDIRECTING TO /doctor");

                window.location.replace("/doctor");

                return;
            }

            // =====================================================
            // LAB TECHNICIAN
            // =====================================================

            if (role === "LAB_TECHNICIAN") {
                console.log("REDIRECTING TO /laboratory");

                window.location.replace("/laboratory");

                return;
            }

            // =====================================================
            // PHARMACIST
            // =====================================================

            if (role === "PHARMACIST") {
                console.log("REDIRECTING TO /pharmacist");

                window.location.replace("/pharmacist");

                return;
            }

            // =====================================================
            // UNKNOWN ROLE
            // =====================================================

            console.error("UNKNOWN ROLE:", role);

            localStorage.clear();

            setError(
                `Unknown user role: ${role || "No role received"}`
            );

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            if (error.response) {

                console.log(
                    "STATUS:",
                    error.response.status
                );

                console.log(
                    "RESPONSE:",
                    error.response.data
                );

                setError(
                    error.response.data?.detail ||
                    error.response.data?.error ||
                    error.response.data?.message ||
                    `Login failed (${error.response.status})`
                );

            } else if (error.request) {

                console.log(
                    "NO RESPONSE RECEIVED FROM DJANGO"
                );

                setError(
                    "Django server is not responding. Check that the backend is running on port 8000."
                );

            } else {

                console.log(
                    "REQUEST ERROR:",
                    error.message
                );

                setError(
                    `Request error: ${error.message}`
                );
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
                        <h1>
                            Clinical Management System
                        </h1>
                    </div>

                </div>


                <div className="login-heading">
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
                    <span>
                        Secure clinical access
                    </span>
                </div>

            </div>

        </div>
    );
}

export default Login;