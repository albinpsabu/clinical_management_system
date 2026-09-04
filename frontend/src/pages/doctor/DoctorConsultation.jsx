import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Plus,
    Trash2,
    Pill,
    FlaskConical,
    Save,
} from "lucide-react";

import DoctorLayout from "../../components/doctor/DoctorLayout";

import {
    createConsultation,
    createMedicinePrescription,
    createLabPrescription,
    getMedicines,
    getLabTests,
} from "../../services/doctorApi";

function DoctorConsultation() {

    const location = useLocation();
    const navigate = useNavigate();
    const { appointmentId } = useParams();

    const appointment =
        location.state?.appointment;

    const patient =
        location.state?.patient;

    const [medicines, setMedicines] =
        useState([]);

    const [labTests, setLabTests] =
        useState([]);

    const [loadingOptions, setLoadingOptions] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [consultationId, setConsultationId] =
        useState("");

    const [form, setForm] = useState({
        consultation_id:
            `CONS${Date.now()}`,
        symptoms: "",
        diagnosis: "",
        clinical_notes: "",
        treatment_plan: "",
        follow_up_date: "",
        status: "IN_PROGRESS",
    });

    const [medicineForms, setMedicineForms] =
        useState([]);

    const [labForms, setLabForms] =
        useState([]);

    useEffect(() => {

        const loadOptions = async () => {

            try {

                setLoadingOptions(true);

                const [
                    medicineResponse,
                    labResponse,
                ] = await Promise.all([
                    getMedicines(),
                    getLabTests(),
                ]);

                setMedicines(
                    Array.isArray(
                        medicineResponse.data
                    )
                        ? medicineResponse.data
                        : medicineResponse.data?.results ||
                          []
                );

                setLabTests(
                    Array.isArray(
                        labResponse.data
                    )
                        ? labResponse.data
                        : labResponse.data?.results ||
                          []
                );

            } catch (err) {

                console.error(
                    "Prescription options error:",
                    err.response?.data || err
                );

                setError(
                    "Unable to load medicines and lab tests."
                );

            } finally {

                setLoadingOptions(false);

            }
        };

        loadOptions();

    }, []);

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const addMedicine = () => {

        setMedicineForms((previous) => [
            ...previous,
            {
                id: Date.now(),
                medicine: "",
                dosage: "",
                frequency: "",
                duration: "",
                route: "",
                instructions: "",
            },
        ]);
    };

    const updateMedicine = (
        id,
        field,
        value
    ) => {

        setMedicineForms((previous) =>
            previous.map((medicine) =>
                medicine.id === id
                    ? {
                          ...medicine,
                          [field]: value,
                      }
                    : medicine
            )
        );
    };

    const removeMedicine = (id) => {

        setMedicineForms((previous) =>
            previous.filter(
                (medicine) =>
                    medicine.id !== id
            )
        );
    };

    const addLabTest = () => {

        setLabForms((previous) => [
            ...previous,
            {
                id: Date.now(),
                test_name: "",
                clinical_reason: "",
                instructions: "",
            },
        ]);
    };

    const updateLab = (
        id,
        field,
        value
    ) => {

        setLabForms((previous) =>
            previous.map((lab) =>
                lab.id === id
                    ? {
                          ...lab,
                          [field]: value,
                      }
                    : lab
            )
        );
    };

    const removeLab = (id) => {

        setLabForms((previous) =>
            previous.filter(
                (lab) =>
                    lab.id !== id
            )
        );
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!appointmentId) {
            setError(
                "Appointment ID is missing."
            );
            return;
        }

        if (!form.symptoms.trim()) {
            setError(
                "Please enter the symptoms."
            );
            return;
        }

        if (!form.diagnosis.trim()) {
            setError(
                "Please enter the diagnosis."
            );
            return;
        }

        try {

            setSaving(true);

            /*
             * STEP 1
             * Create consultation.
             *
             * Patient is derived by the backend
             * from the appointment.
             */

            const consultationResponse =
                await createConsultation({
                    ...form,
                    appointment:
                        Number(appointmentId),
                });

            const consultation =
                consultationResponse.data;

            const createdConsultationId =
                consultation.id;

            setConsultationId(
                createdConsultationId
            );

            /*
             * STEP 2
             * Create medicines.
             */

            for (
                let index = 0;
                index < medicineForms.length;
                index++
            ) {

                const medicine =
                    medicineForms[index];

                if (!medicine.medicine) {
                    continue;
                }

                await createMedicinePrescription({
                    prescription_id:
                        `MEDP${Date.now()}${index}`,

                    consultation:
                        createdConsultationId,

                    medicine:
                        Number(
                            medicine.medicine
                        ),

                    dosage:
                        medicine.dosage,

                    frequency:
                        medicine.frequency,

                    duration:
                        medicine.duration,

                    route:
                        medicine.route,

                    instructions:
                        medicine.instructions,
                });
            }

            /*
             * STEP 3
             * Create lab prescriptions.
             */

            for (
                let index = 0;
                index < labForms.length;
                index++
            ) {

                const lab =
                    labForms[index];

                if (!lab.test_name) {
                    continue;
                }

                await createLabPrescription({
                    lab_request_id:
                        `LABP${Date.now()}${index}`,

                    consultation:
                        createdConsultationId,

                    test_name:
                        lab.test_name,

                    clinical_reason:
                        lab.clinical_reason,

                    instructions:
                        lab.instructions,

                    status:
                        "REQUESTED",
                });
            }

            setSuccess(
                "Consultation completed successfully."
            );

            setTimeout(() => {

                navigate(
                    "/doctor/appointments"
                );

            }, 1200);

        } catch (err) {

            console.error(
                "Consultation error:",
                err.response?.data || err
            );

            const data =
                err.response?.data;

            if (
                data &&
                typeof data === "object"
            ) {

                const message =
                    Object.entries(data)
                        .map(
                            ([field, value]) =>
                                `${field}: ${
                                    Array.isArray(value)
                                        ? value.join(", ")
                                        : value
                                }`
                        )
                        .join(" | ");

                setError(
                    message ||
                    "Unable to save consultation."
                );

            } else {

                setError(
                    "Unable to save consultation."
                );

            }

        } finally {

            setSaving(false);

        }
    };

    return (
        <DoctorLayout
            title="Consultation"
            subtitle="Record clinical findings and prescribe medicines or lab tests."
        >

            {/* PATIENT HEADER */}
            <section className="doctor-consultation-patient">

                <div>

                    <span>
                        Patient
                    </span>

                    <strong>
                        {patient?.name ||
                            appointment?.patient_name ||
                            "Patient"}
                    </strong>

                </div>

                <div>

                    <span>
                        Patient ID
                    </span>

                    <strong>
                        {patient?.patient_id ||
                            appointment?.patient_id ||
                            appointment?.patient ||
                            "-"}
                    </strong>

                </div>

                <div>

                    <span>
                        Appointment
                    </span>

                    <strong>
                        #{appointmentId}
                    </strong>

                </div>

            </section>

            {error && (
                <div className="doctor-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="doctor-success">
                    {success}
                </div>
            )}

            <form
                className="doctor-consultation-form"
                onSubmit={handleSubmit}
            >

                {/* CLINICAL ASSESSMENT */}
                <section className="doctor-consultation-card">

                    <div className="doctor-section-heading">

                        <div>
                            <h2>
                                Clinical Assessment
                            </h2>

                            <p>
                                Record the patient's
                                current clinical condition.
                            </p>
                        </div>

                    </div>

                    <div className="doctor-form-grid">

                        <div className="doctor-form-group full">

                            <label>
                                Symptoms
                            </label>

                            <textarea
                                name="symptoms"
                                value={form.symptoms}
                                onChange={handleChange}
                                placeholder="Enter patient symptoms..."
                                rows="4"
                                required
                            />

                        </div>

                        <div className="doctor-form-group">

                            <label>
                                Diagnosis
                            </label>

                            <textarea
                                name="diagnosis"
                                value={form.diagnosis}
                                onChange={handleChange}
                                placeholder="Enter diagnosis..."
                                rows="4"
                                required
                            />

                        </div>

                        <div className="doctor-form-group">

                            <label>
                                Clinical Notes
                            </label>

                            <textarea
                                name="clinical_notes"
                                value={
                                    form.clinical_notes
                                }
                                onChange={handleChange}
                                placeholder="Enter clinical notes..."
                                rows="4"
                            />

                        </div>

                        <div className="doctor-form-group full">

                            <label>
                                Treatment Plan
                            </label>

                            <textarea
                                name="treatment_plan"
                                value={
                                    form.treatment_plan
                                }
                                onChange={handleChange}
                                placeholder="Enter treatment plan..."
                                rows="4"
                            />

                        </div>

                        <div className="doctor-form-group">

                            <label>
                                Follow-up Date
                            </label>

                            <input
                                type="date"
                                name="follow_up_date"
                                value={
                                    form.follow_up_date
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </section>

                {/* MEDICINES */}
                <section className="doctor-consultation-card">

                    <div className="doctor-section-heading">

                        <div className="doctor-section-title-with-icon">

                            <div className="doctor-section-icon medicine">
                                <Pill size={19} />
                            </div>

                            <div>
                                <h2>
                                    Medicines
                                </h2>

                                <p>
                                    Add medicines prescribed
                                    during this consultation.
                                </p>
                            </div>

                        </div>

                    </div>

                    {medicineForms.length === 0 && (
                        <div className="doctor-no-items">
                            No medicines added.
                        </div>
                    )}

                    <div className="doctor-medicine-list">

                        {medicineForms.map(
                            (medicine, index) => (

                                <div
                                    className="doctor-medicine-form"
                                    key={medicine.id}
                                >

                                    <div className="doctor-item-heading">

                                        <strong>
                                            Medicine {index + 1}
                                        </strong>

                                        <button
                                            type="button"
                                            className="doctor-remove-button"
                                            onClick={() =>
                                                removeMedicine(
                                                    medicine.id
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={16}
                                            />
                                            Remove
                                        </button>

                                    </div>

                                    <div className="doctor-form-grid">

                                        <div className="doctor-form-group full">

                                            <label>
                                                Medicine
                                            </label>

                                            <select
                                                value={
                                                    medicine.medicine
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "medicine",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Medicine
                                                </option>

                                                {medicines.map(
                                                    (item) => (

                                                        <option
                                                            key={
                                                                item.id
                                                            }
                                                            value={
                                                                item.id
                                                            }
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                        <div className="doctor-form-group">

                                            <label>
                                                Dosage
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    medicine.dosage
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "dosage",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 500 mg"
                                                required
                                            />

                                        </div>

                                        <div className="doctor-form-group">

                                            <label>
                                                Frequency
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    medicine.frequency
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "frequency",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Twice daily"
                                                required
                                            />

                                        </div>

                                        <div className="doctor-form-group">

                                            <label>
                                                Duration
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    medicine.duration
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "duration",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 5 days"
                                                required
                                            />

                                        </div>

                                        <div className="doctor-form-group">

                                            <label>
                                                Route
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    medicine.route
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "route",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Oral"
                                            />

                                        </div>

                                        <div className="doctor-form-group full">

                                            <label>
                                                Instructions
                                            </label>

                                            <textarea
                                                value={
                                                    medicine.instructions
                                                }
                                                onChange={(e) =>
                                                    updateMedicine(
                                                        medicine.id,
                                                        "instructions",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Take after food."
                                                rows="2"
                                            />

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                    {/* BUTTON UNDER MEDICINES */}
                    <button
                        type="button"
                        className="doctor-add-item-button"
                        onClick={addMedicine}
                    >
                        <Plus size={17} />
                        Add Another Medicine
                    </button>

                </section>

                {/* LAB TESTS */}
                <section className="doctor-consultation-card">

                    <div className="doctor-section-heading">

                        <div className="doctor-section-title-with-icon">

                            <div className="doctor-section-icon lab">
                                <FlaskConical size={19} />
                            </div>

                            <div>
                                <h2>
                                    Lab Tests
                                </h2>

                                <p>
                                    Request laboratory tests
                                    for this patient.
                                </p>
                            </div>

                        </div>

                    </div>

                    {labForms.length === 0 && (
                        <div className="doctor-no-items">
                            No lab tests added.
                        </div>
                    )}

                    <div className="doctor-lab-list">

                        {labForms.map(
                            (lab, index) => (

                                <div
                                    className="doctor-lab-form"
                                    key={lab.id}
                                >

                                    <div className="doctor-item-heading">

                                        <strong>
                                            Lab Test {index + 1}
                                        </strong>

                                        <button
                                            type="button"
                                            className="doctor-remove-button"
                                            onClick={() =>
                                                removeLab(
                                                    lab.id
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={16}
                                            />
                                            Remove
                                        </button>

                                    </div>

                                    <div className="doctor-form-grid">

                                        <div className="doctor-form-group full">

                                            <label>
                                                Lab Test
                                            </label>

                                            <select
                                                value={
                                                    lab.test_name
                                                }
                                                onChange={(e) =>
                                                    updateLab(
                                                        lab.id,
                                                        "test_name",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Lab Test
                                                </option>

                                                {labTests.map(
                                                    (test) => (

                                                        <option
                                                            key={
                                                                test.id
                                                            }
                                                            value={
                                                                test.name ||
                                                                test.test_name
                                                            }
                                                        >
                                                            {
                                                                test.name ||
                                                                test.test_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                        <div className="doctor-form-group full">

                                            <label>
                                                Clinical Reason
                                            </label>

                                            <textarea
                                                value={
                                                    lab.clinical_reason
                                                }
                                                onChange={(e) =>
                                                    updateLab(
                                                        lab.id,
                                                        "clinical_reason",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Why is this test required?"
                                                rows="3"
                                            />

                                        </div>

                                        <div className="doctor-form-group full">

                                            <label>
                                                Instructions
                                            </label>

                                            <textarea
                                                value={
                                                    lab.instructions
                                                }
                                                onChange={(e) =>
                                                    updateLab(
                                                        lab.id,
                                                        "instructions",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Sample collection instructions..."
                                                rows="3"
                                            />

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                    {/* BUTTON UNDER LAB TESTS */}
                    <button
                        type="button"
                        className="doctor-add-item-button"
                        onClick={addLabTest}
                    >
                        <Plus size={17} />
                        Add Another Lab Test
                    </button>

                </section>

                {/* SAVE */}
                <div className="doctor-consultation-footer">

                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="doctor-complete-button"
                        disabled={
                            saving ||
                            loadingOptions
                        }
                    >
                        <Save size={18} />

                        {saving
                            ? "Saving..."
                            : "Complete Consultation"}
                    </button>

                </div>

            </form>

        </DoctorLayout>
    );
}

export default DoctorConsultation;