import React, { useState } from "react";
import {
    User,
    Lock,
    ShieldCheck,
    LogOut,
    Eye,
    EyeOff,
    Save,
} from "lucide-react";

function Settings() {
    const username =
        localStorage.getItem("username") || "admin";

    const role =
        localStorage.getItem("role") || "ADMIN";

    const [profileName, setProfileName] =
        useState(username);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] =
        useState("");

    // ==================================================
    // SAVE PROFILE
    // ==================================================

    const handleProfileSave = (e) => {
        e.preventDefault();

        const value = profileName.trim();

        if (!value) {
            setMessage("Username cannot be empty.");
            setMessageType("error");
            return;
        }

        localStorage.setItem("username", value);

        setMessage("Profile updated successfully.");
        setMessageType("success");
    };

    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handlePasswordChange = (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!currentPassword) {
            setMessage("Please enter your current password.");
            setMessageType("error");
            return;
        }

        if (!newPassword) {
            setMessage("Please enter a new password.");
            setMessageType("error");
            return;
        }

        if (newPassword.length < 8) {
            setMessage(
                "Password must contain at least 8 characters."
            );
            setMessageType("error");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(
                "New password and confirmation password do not match."
            );
            setMessageType("error");
            return;
        }

        /*
         * The UI validation is handled here.
         *
         * Connect this section to the backend
         * /accounts/change-password/ endpoint when
         * password-change API handling is required.
         */

        setMessage(
            "Password details are valid. Password change API is not connected yet."
        );

        setMessageType("success");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    // ==================================================
    // INITIAL
    // ==================================================

    const initial =
        profileName?.charAt(0)?.toUpperCase() || "A";

    return (
        <div className="admin-settings-page">

            {/* ==================================================
                PAGE HEADING
            ================================================== */}

            <div className="admin-page-heading">
                <div>
                    <h1>Settings</h1>

                    <p>
                        Manage your administrator account
                        and security settings.
                    </p>
                </div>
            </div>


            {/* ==================================================
                MESSAGE
            ================================================== */}

            {message && (
                <div
                    className={`admin-settings-message ${
                        messageType === "error"
                            ? "error"
                            : "success"
                    }`}
                >
                    {message}
                </div>
            )}


            {/* ==================================================
                SETTINGS GRID
            ================================================== */}

            <div className="admin-settings-grid">

                {/* ==================================================
                    PROFILE SETTINGS
                ================================================== */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">
                            <User size={20} />
                        </div>

                        <div>
                            <h2>
                                Profile Settings
                            </h2>

                            <p>
                                Manage your administrator account.
                            </p>
                        </div>

                    </div>


                    {/* PROFILE */}
                    <div className="admin-settings-profile">

                        <div className="admin-settings-avatar">
                            {initial}
                        </div>

                        <div className="admin-settings-profile-info">

                            <strong>
                                {profileName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    {/* PROFILE FORM */}

                    <form
                        className="admin-settings-form"
                        onSubmit={handleProfileSave}
                    >

                        <div className="admin-settings-field">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) =>
                                    setProfileName(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter username"
                            />

                        </div>


                        <div className="admin-settings-field">

                            <label>
                                Role
                            </label>

                            <input
                                type="text"
                                value={role}
                                disabled
                            />

                        </div>


                        <div className="admin-settings-actions">

                            <button
                                type="submit"
                                className="admin-settings-button"
                            >
                                <Save size={16} />

                                <span>
                                    Save Profile
                                </span>
                            </button>

                        </div>

                    </form>

                </section>


                {/* ==================================================
                    SECURITY
                ================================================== */}

                <section className="admin-settings-card">

                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">
                            <ShieldCheck size={20} />
                        </div>

                        <div>
                            <h2>
                                Security
                            </h2>

                            <p>
                                Information about your current
                                administrator session.
                            </p>
                        </div>

                    </div>


                    <div className="admin-security-list">

                        <div className="admin-security-item">

                            <span>
                                Account Role
                            </span>

                            <strong>
                                {role}
                            </strong>

                        </div>


                        <div className="admin-security-item">

                            <span>
                                Authentication
                            </span>

                            <strong>
                                JWT
                            </strong>

                        </div>


                        <div className="admin-security-item">

                            <span>
                                Session
                            </span>

                            <strong className="active">
                                Active
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* ==================================================
                CHANGE PASSWORD
            ================================================== */}

            <section className="admin-settings-card admin-password-card">

                <div className="admin-settings-card-heading">

                    <div className="admin-settings-icon">
                        <Lock size={20} />
                    </div>

                    <div>
                        <h2>
                            Change Password
                        </h2>

                        <p>
                            Update your administrator password.
                        </p>
                    </div>

                </div>


                <form
                    className="admin-password-form"
                    onSubmit={handlePasswordChange}
                >

                    {/* CURRENT PASSWORD */}

                    <div className="admin-settings-field">

                        <label>
                            Current Password
                        </label>

                        <div className="admin-password-wrapper">

                            <input
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter current password"
                            />

                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        !showCurrentPassword
                                    )
                                }
                                aria-label={
                                    showCurrentPassword
                                        ? "Hide current password"
                                        : "Show current password"
                                }
                            >
                                {showCurrentPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>

                        </div>

                    </div>


                    {/* NEW PASSWORD */}

                    <div className="admin-settings-field">

                        <label>
                            New Password
                        </label>

                        <div className="admin-password-wrapper">

                            <input
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter new password"
                            />

                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() =>
                                    setShowNewPassword(
                                        !showNewPassword
                                    )
                                }
                                aria-label={
                                    showNewPassword
                                        ? "Hide new password"
                                        : "Show new password"
                                }
                            >
                                {showNewPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>

                        </div>

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="admin-settings-field">

                        <label>
                            Confirm New Password
                        </label>

                        <div className="admin-password-wrapper">

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm new password"
                            />

                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>

                        </div>

                    </div>


                    <div className="admin-password-footer">

                        <span>
                            Password must contain at least
                            8 characters.
                        </span>

                        <button
                            type="submit"
                            className="admin-settings-button"
                        >
                            <Lock size={16} />

                            <span>
                                Change Password
                            </span>
                        </button>

                    </div>

                </form>

            </section>


            {/* ==================================================
                LOGOUT
            ================================================== */}

            <section className="admin-settings-card admin-logout-card">

                <div className="admin-settings-card-heading">

                    <div className="admin-settings-icon">
                        <LogOut size={20} />
                    </div>

                    <div>
                        <h2>
                            Logout
                        </h2>

                        <p>
                            Sign out of the administrator account.
                        </p>
                    </div>

                </div>


                <div className="admin-logout-actions">

                    <button
                        type="button"
                        className="admin-danger-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Settings;