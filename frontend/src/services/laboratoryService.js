import api from "./api";

// Get laboratory prescriptions
export const getLabPrescriptions = async () => {
    const response = await api.get("/laboratory/prescriptions/");
    return response.data;
};
export const getLabTests = async () => {
    const response = await api.get("/laboratory/tests/");
    return response.data;
};

// Get laboratory results
export const getLabResults = async () => {
    const response = await api.get("/laboratory/results/");
    return response.data;
};

// Get laboratory bills
export const getLabBills = async () => {
    const response = await api.get("/laboratory/bills/");
    return response.data;
};

export const saveLabResult = async (resultData) => {
    const response = await api.post(
        "/laboratory/results/",
        resultData
    );
    return response.data;
};
