import api from "./api";

// ===============================
// MEDICINES
// ===============================

export const getPharmacistMedicines = () =>
    api.get("/pharmacist/medicines/");

export const updateMedicineStock = (medicineId, data) =>
    api.patch(
        `/pharmacist/medicines/${medicineId}/stock/`,
        data
    );


// ===============================
// PATIENTS
// ===============================

export const getPharmacistPatients = (search = "") =>
    api.get("/pharmacist/patients/", {
        params: { search },
    });


// ===============================
// PATIENT APPOINTMENTS
// ===============================

export const getPatientAppointments = (patientId) =>
    api.get(
        `/pharmacist/patients/${patientId}/appointments/`
    );


// ===============================
// PRESCRIPTIONS
// ===============================

export const getAppointmentPrescriptions = (appointmentId) =>
    api.get(
        `/pharmacist/appointments/${appointmentId}/prescriptions/`
    );


// ===============================
// DISPENSING
// ===============================

export const dispenseMedicine = (data) =>
    api.post("/pharmacist/dispense/", data);

export const getDispensingHistory = () =>
    api.get("/pharmacist/dispensing/");


// ===============================
// BILLS
// ===============================

export const getPharmacistBills = () =>
    api.get("/pharmacist/bills/");

export const payPharmacistBill = (billId) =>
    api.patch(
        `/pharmacist/bills/${billId}/pay/`
    );


// ===============================
// SALES REPORTS
// ===============================

export const getSalesReport = (period) =>
    api.get(
        "/pharmacist/reports/sales/",
        {
            params: { period },
        }
    );