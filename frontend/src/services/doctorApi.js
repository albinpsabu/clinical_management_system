import api from "./api";

/* =========================================================
   DOCTOR APPOINTMENTS
   ========================================================= */

export const getDoctorAppointments = () => {
    return api.get("/doctor/appointments/");
};


/* =========================================================
   DOCTOR PATIENT DETAILS
   ========================================================= */

export const getDoctorPatient = (patientId) => {
    return api.get(`/doctor/patients/${patientId}/`);
};


/* =========================================================
   CONSULTATIONS
   ========================================================= */

export const getConsultations = () => {
    return api.get("/doctor/consultations/");
};

export const createConsultation = (data) => {
    return api.post("/doctor/consultations/", data);
};


/* =========================================================
   MEDICINE PRESCRIPTIONS
   ========================================================= */

export const getMedicinePrescriptions = () => {
    return api.get("/doctor/prescriptions/medicines/");
};

export const createMedicinePrescription = (data) => {
    return api.post(
        "/doctor/prescriptions/medicines/",
        data
    );
};


/* =========================================================
   LAB PRESCRIPTIONS
   ========================================================= */

export const getLabPrescriptions = () => {
    return api.get("/doctor/prescriptions/labs/");
};

export const createLabPrescription = (data) => {
    return api.post(
        "/doctor/prescriptions/labs/",
        data
    );
};


/* =========================================================
   DOCTOR - AVAILABLE MEDICINES
   ========================================================= */

export const getDoctorMedicines = () => {
    return api.get("/doctor/medicines/");
};
export const getMedicines = () => {
    return api.get("/doctor/medicines/");
};


/* =========================================================
   DOCTOR - AVAILABLE LAB TESTS
   ========================================================= */

export const getDoctorLabTests = () => {
    return api.get("/doctor/lab-tests/");
};




export const getLabTests = () => {
    return api.get("/doctor/lab-tests/");
};



