import React, { useEffect, useState } from "react";

import {
    Users,
    UserRound,
    Stethoscope,
    Pill,
    FlaskConical,
    Building2,
} from "lucide-react";

import {
    getStaff,
    getDoctors,
    getDepartments,
    getMedicines,
    getLabTests,
} from "../../services/adminApi";

import "../../styles/admin.css";


const AdminDashboard = () => {

    const [staff, setStaff] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [
                    staffResponse,
                    doctorResponse,
                    departmentResponse,
                    medicineResponse,
                    labTestResponse,
                ] = await Promise.all([
                    getStaff(),
                    getDoctors(),
                    getDepartments(),
                    getMedicines(),
                    getLabTests(),
                ]);


                setStaff(
                    Array.isArray(staffResponse.data)
                        ? staffResponse.data
                        : staffResponse.data?.results || []
                );


                setDoctors(
                    Array.isArray(doctorResponse.data)
                        ? doctorResponse.data
                        : doctorResponse.data?.results || []
                );


                setDepartments(
                    Array.isArray(departmentResponse.data)
                        ? departmentResponse.data
                        : departmentResponse.data?.results || []
                );


                setMedicines(
                    Array.isArray(medicineResponse.data)
                        ? medicineResponse.data
                        : medicineResponse.data?.results || []
                );


                setLabTests(
                    Array.isArray(labTestResponse.data)
                        ? labTestResponse.data
                        : labTestResponse.data?.results || []
                );

            } catch (error) {

                console.error(
                    "Dashboard loading error:",
                    error.response?.data || error
                );

            } finally {

                setLoading(false);

            }

        };


        loadDashboard();

    }, []);


    const cards = [
        {
            title: "Total Staff",
            value: staff.length,
            icon: Users,
            className: "staff",
        },
        {
            title: "Total Doctors",
            value: doctors.length,
            icon: Stethoscope,
            className: "doctors",
        },
        {
            title: "Departments",
            value: departments.length,
            icon: Building2,
            className: "departments",
        },
        {
            title: "Medicines",
            value: medicines.length,
            icon: Pill,
            className: "medicines",
        },
        {
            title: "Lab Tests",
            value: labTests.length,
            icon: FlaskConical,
            className: "lab-tests",
        },
    ];


    return (
        <div className="admin-page">

            <div className="admin-page-heading">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome back, Admin. Here's what's happening today.
                    </p>

                </div>

                <div className="admin-date">
                    Administration Panel
                </div>

            </div>


            <div className="admin-stat-grid">

                {cards.map((card) => {

                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className={`admin-stat-card ${card.className}`}
                        >

                            <div className="admin-stat-icon">
                                <Icon size={24} />
                            </div>

                            <div>

                                <span>
                                    {card.title}
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : card.value}
                                </strong>

                            </div>

                        </div>
                    );

                })}

            </div>


            <div className="admin-dashboard-grid">

                <div className="admin-panel-card">

                    <div className="admin-panel-heading">

                        <div>
                            <h2>
                                System Overview
                            </h2>

                            <p>
                                Current records in the system
                            </p>
                        </div>

                    </div>


                    <div className="admin-overview-list">

                        <div>
                            <span>
                                <UserRound size={18} />
                                Staff
                            </span>

                            <strong>
                                {loading ? "..." : staff.length}
                            </strong>
                        </div>


                        <div>
                            <span>
                                <Stethoscope size={18} />
                                Doctors
                            </span>

                            <strong>
                                {loading ? "..." : doctors.length}
                            </strong>
                        </div>


                        <div>
                            <span>
                                <Building2 size={18} />
                                Departments
                            </span>

                            <strong>
                                {loading ? "..." : departments.length}
                            </strong>
                        </div>


                        <div>
                            <span>
                                <Pill size={18} />
                                Medicines
                            </span>

                            <strong>
                                {loading ? "..." : medicines.length}
                            </strong>
                        </div>


                        <div>
                            <span>
                                <FlaskConical size={18} />
                                Lab Tests
                            </span>

                            <strong>
                                {loading ? "..." : labTests.length}
                            </strong>
                        </div>

                    </div>

                </div>


                <div className="admin-panel-card">

                    <div className="admin-panel-heading">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Manage the clinical system
                            </p>

                        </div>

                    </div>


                    <div className="admin-quick-actions">

                        <a href="/admin/staff">
                            Add Staff
                        </a>

                        <a href="/admin/doctors">
                            Add Doctor
                        </a>

                        <a href="/admin/departments">
                            Manage Departments
                        </a>

                        <a href="/admin/medicines">
                            Manage Medicines
                        </a>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default AdminDashboard;