import api from "./api";


// ============================================================
// STAFF
// ============================================================

export const getStaff = () => {
    return api.get("/admin-panel/staff/");
};


export const createStaff = (data) => {
    return api.post("/admin-panel/staff/", data);
};


export const updateStaff = (id, data) => {
    return api.put(
        `/admin-panel/staff/${id}/`,
        data
    );
};


export const deleteStaff = (id) => {
    return api.delete(
        `/admin-panel/staff/${id}/`
    );
};


// ============================================================
// DOCTORS
// ============================================================

export const getDoctors = () => {
    return api.get("/admin-panel/doctors/");
};


export const createDoctor = (data) => {
    return api.post("/admin-panel/doctors/", data);
};


export const updateDoctor = (id, data) => {
    return api.put(
        `/admin-panel/doctors/${id}/`,
        data
    );
};


export const deleteDoctor = (id) => {
    return api.delete(
        `/admin-panel/doctors/${id}/`
    );
};


// ============================================================
// DEPARTMENTS
// ============================================================

export const getDepartments = () => {
    return api.get("/admin-panel/departments/");
};


export const createDepartment = (data) => {
    return api.post(
        "/admin-panel/departments/",
        data
    );
};


export const updateDepartment = (id, data) => {
    return api.put(
        `/admin-panel/departments/${id}/`,
        data
    );
};


export const deleteDepartment = (id) => {
    return api.delete(
        `/admin-panel/departments/${id}/`
    );
};


// ============================================================
// MEDICINES
// ============================================================

export const getMedicines = () => {
    return api.get("/admin-panel/medicines/");
};


export const createMedicine = (data) => {
    return api.post(
        "/admin-panel/medicines/",
        data
    );
};


export const updateMedicine = (id, data) => {
    return api.put(
        `/admin-panel/medicines/${id}/`,
        data
    );
};


export const deleteMedicine = (id) => {
    return api.delete(
        `/admin-panel/medicines/${id}/`
    );
};


// ============================================================
// LAB TESTS
// ============================================================

export const getLabTests = () => {
    return api.get("/admin-panel/lab-tests/");
};


export const createLabTest = (data) => {
    return api.post(
        "/admin-panel/lab-tests/",
        data
    );
};


export const updateLabTest = (id, data) => {
    return api.put(
        `/admin-panel/lab-tests/${id}/`,
        data
    );
};


export const deleteLabTest = (id) => {
    return api.delete(
        `/admin-panel/lab-tests/${id}/`
    );
};