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


    // =========================================================
    // APPOINTMENT / PATIENT
    // =========================================================

    const appointment =
        location.state?.appointment || null;

    const patient =
        location.state?.patient || null;


    // =========================================================
    // OPTIONS
    // =========================================================

    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);


    const [loadingOptions, setLoadingOptions] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    // =========================================================
    // MESSAGES
    // =========================================================

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================================================
    // CONSULTATION FORM
    // =========================================================

    const [form, setForm] = useState({
        symptoms: "",
        diagnosis: "",
        clinical_notes: "",
        treatment_plan: "",
        follow_up_date: "",
    });


    // =========================================================
    // MEDICINE FORMS
    // =========================================================

    const [medicineForms, setMedicineForms] =
        useState([]);


    // =========================================================
    // LAB FORMS
    // =========================================================

    const [labForms, setLabForms] =
        useState([]);


    // =========================================================
    // TODAY STRING
    // =========================================================

    const getTodayString = () => {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    const todayString =
        getTodayString();


    // =========================================================
    // LOAD MEDICINES AND LAB TESTS
    // =========================================================

    useEffect(() => {

        const loadOptions = async () => {

            try {

                setLoadingOptions(true);
                setError("");

                const [
                    medicineResponse,
                    labResponse,
                ] = await Promise.all([
                    getMedicines(),
                    getLabTests(),
                ]);


                const medicineData =
                    Array.isArray(
                        medicineResponse.data
                    )
                        ? medicineResponse.data
                        : medicineResponse.data?.results || [];


                const labData =
                    Array.isArray(
                        labResponse.data
                    )
                        ? labResponse.data
                        : labResponse.data?.results || [];


                setMedicines(
                    medicineData
                );

                setLabTests(
                    labData
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


    // =========================================================
    // CLINICAL FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));


        if (error) {
            setError("");
        }

    };


    // =========================================================
    // ADD MEDICINE
    // =========================================================

    const addMedicine = () => {

        setMedicineForms((previous) => [

            ...previous,

            {
                id:
                    Date.now() +
                    Math.random(),

                medicine: "",
                dosage: "",
                frequency: "",
                duration: "",
                route: "",
                instructions: "",
            },

        ]);

    };


    // =========================================================
    // UPDATE MEDICINE
    // =========================================================

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


        if (error) {
            setError("");
        }

    };


    // =========================================================
    // REMOVE MEDICINE
    // =========================================================

    const removeMedicine = (id) => {

        setMedicineForms((previous) =>
            previous.filter(
                (medicine) =>
                    medicine.id !== id
            )
        );

    };


    // =========================================================
    // ADD LAB TEST
    // =========================================================

    const addLabTest = () => {

        setLabForms((previous) => [

            ...previous,

            {
                id:
                    Date.now() +
                    Math.random(),

                lab_test: "",
                clinical_reason: "",
                instructions: "",
            },

        ]);

    };


    // =========================================================
    // UPDATE LAB TEST
    // =========================================================

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


        if (error) {
            setError("");
        }

    };


    // =========================================================
    // REMOVE LAB TEST
    // =========================================================

    const removeLab = (id) => {

        setLabForms((previous) =>
            previous.filter(
                (lab) =>
                    lab.id !== id
            )
        );

    };


    // =========================================================
    // VALIDATE CONSULTATION
    // =========================================================

    const validateForm = () => {

        // -----------------------------------------------------
        // APPOINTMENT
        // -----------------------------------------------------

        if (!appointmentId) {

            return "Appointment ID is missing.";

        }


        // -----------------------------------------------------
        // SYMPTOMS
        // -----------------------------------------------------

        if (!form.symptoms.trim()) {

            return "Please enter the symptoms.";

        }


        // -----------------------------------------------------
        // DIAGNOSIS
        // -----------------------------------------------------

        if (!form.diagnosis.trim()) {

            return "Please enter the diagnosis.";

        }


        // -----------------------------------------------------
        // FOLLOW-UP DATE
        // -----------------------------------------------------

        if (form.follow_up_date) {

            if (
                form.follow_up_date <
                todayString
            ) {

                return (
                    "Follow-up date cannot be in the past."
                );

            }

        }


        // -----------------------------------------------------
        // MEDICINES
        // -----------------------------------------------------

        for (
            let index = 0;
            index < medicineForms.length;
            index++
        ) {

            const medicine =
                medicineForms[index];


            if (!medicine.medicine) {

                return (
                    `Please select Medicine ${index + 1}.`
                );

            }


            if (!medicine.dosage.trim()) {

                return (
                    `Please enter dosage for Medicine ${index + 1}.`
                );

            }


            if (!medicine.frequency.trim()) {

                return (
                    `Please enter frequency for Medicine ${index + 1}.`
                );

            }


            if (!medicine.duration.trim()) {

                return (
                    `Please enter duration for Medicine ${index + 1}.`
                );

            }

        }


        // -----------------------------------------------------
        // LAB TESTS
        // -----------------------------------------------------

        for (
            let index = 0;
            index < labForms.length;
            index++
        ) {

            const lab =
                labForms[index];


            if (!lab.lab_test) {

                return (
                    `Please select Lab Test ${index + 1}.`
                );

            }

        }


        return "";

    };


    // =========================================================
    // SAVE CONSULTATION
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");
        setSuccess("");


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );

            return;

        }


        // -----------------------------------------------------
        // START SAVING
        // -----------------------------------------------------

        try {

            setSaving(true);


            // =================================================
            // STEP 1
            // CREATE CONSULTATION
            // =================================================

            /*
             * IMPORTANT:
             *
             * Do NOT send consultation_id.
             *
             * The backend generates the business ID.
             *
             * Example:
             *
             * CON000001
             */

            const consultationResponse =
                await createConsultation({

                    appointment:
                        Number(appointmentId),

                    symptoms:
                        form.symptoms.trim(),

                    diagnosis:
                        form.diagnosis.trim(),

                    clinical_notes:
                        form.clinical_notes.trim(),

                    treatment_plan:
                        form.treatment_plan.trim(),

                    follow_up_date:
                        form.follow_up_date ||
                        null,

                    status:
                        "COMPLETED",

                });


            const consultation =
                consultationResponse.data;


            /*
             * Use the database primary key for
             * creating related prescriptions.
             *
             * This is NOT the business consultation ID.
             */

            const createdConsultationId =
                consultation.id;


            // =================================================
            // STEP 2
            // CREATE MEDICINE PRESCRIPTIONS
            // =================================================

            for (
                let index = 0;
                index < medicineForms.length;
                index++
            ) {

                const medicine =
                    medicineForms[index];


                /*
                 * Do NOT generate medicine prescription ID.
                 *
                 * Backend generates:
                 *
                 * MEDP000001
                 */

                await createMedicinePrescription({

                    consultation:
                        createdConsultationId,

                    medicine:
                        Number(
                            medicine.medicine
                        ),

                    dosage:
                        medicine.dosage.trim(),

                    frequency:
                        medicine.frequency.trim(),

                    duration:
                        medicine.duration.trim(),

                    route:
                        medicine.route.trim(),

                    instructions:
                        medicine.instructions.trim(),

                });

            }


            // =================================================
            // STEP 3
            // CREATE LAB PRESCRIPTIONS
            // =================================================

            for (
                let index = 0;
                index < labForms.length;
                index++
            ) {

                const lab =
                    labForms[index];


                /*
                 * Do NOT generate lab prescription ID.
                 *
                 * Backend generates:
                 *
                 * LABP000001
                 */

                await createLabPrescription({

                    consultation:
                        createdConsultationId,

                    lab_test:
                        Number(
                            lab.lab_test
                        ),

                    clinical_reason:
                        lab.clinical_reason.trim(),

                    instructions:
                        lab.instructions.trim(),

                    status:
                        "REQUESTED",

                });

            }


            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Consultation completed successfully."
            );


            /*
             * Navigate back after a short delay
             * so the success message is visible.
             */

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


    // =========================================================
    // UI
    // =========================================================

    return (

        <DoctorLayout
            title="Consultation"
            subtitle="Record clinical findings and prescribe medicines or lab tests."
        >

            {/* =================================================
                PATIENT HEADER
            ================================================= */}

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


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="doctor-error"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div
                    className="doctor-success"
                    role="status"
                >
                    {success}
                </div>

            )}


            <form
                className="doctor-consultation-form"
                onSubmit={handleSubmit}
            >

                {/* =================================================
                    CLINICAL ASSESSMENT
                ================================================= */}

                <section className="doctor-consultation-card">

                    <div className="doctor-section-heading">

                        <div>

                            <h2>
                                Clinical Assessment
                            </h2>

                            <p>
                                Record the patient's current
                                clinical condition.
                            </p>

                        </div>

                    </div>


                    <div className="doctor-form-grid">


                        {/* =================================================
                            SYMPTOMS
                        ================================================= */}

                        <div className="doctor-form-group full">

                            <label htmlFor="symptoms">
                                Symptoms
                                <span className="required-mark">
                                    *
                                </span>
                            </label>

                            <textarea
                                id="symptoms"
                                name="symptoms"
                                value={form.symptoms}
                                onChange={handleChange}
                                placeholder="Enter patient symptoms..."
                                rows="4"
                                required
                            />

                        </div>


                        {/* =================================================
                            DIAGNOSIS
                        ================================================= */}

                        <div className="doctor-form-group">

                            <label htmlFor="diagnosis">
                                Diagnosis
                                <span className="required-mark">
                                    *
                                </span>
                            </label>

                            <textarea
                                id="diagnosis"
                                name="diagnosis"
                                value={form.diagnosis}
                                onChange={handleChange}
                                placeholder="Enter diagnosis..."
                                rows="4"
                                required
                            />

                        </div>


                        {/* =================================================
                            CLINICAL NOTES
                        ================================================= */}

                        <div className="doctor-form-group">

                            <label htmlFor="clinical_notes">
                                Clinical Notes
                            </label>

                            <textarea
                                id="clinical_notes"
                                name="clinical_notes"
                                value={
                                    form.clinical_notes
                                }
                                onChange={handleChange}
                                placeholder="Enter clinical notes..."
                                rows="4"
                            />

                        </div>


                        {/* =================================================
                            TREATMENT PLAN
                        ================================================= */}

                        <div className="doctor-form-group full">

                            <label htmlFor="treatment_plan">
                                Treatment Plan
                            </label>

                            <textarea
                                id="treatment_plan"
                                name="treatment_plan"
                                value={
                                    form.treatment_plan
                                }
                                onChange={handleChange}
                                placeholder="Enter treatment plan..."
                                rows="4"
                            />

                        </div>


                        {/* =================================================
                            FOLLOW-UP DATE
                        ================================================= */}

                        <div className="doctor-form-group">

                            <label htmlFor="follow_up_date">
                                Follow-up Date
                            </label>

                            <input
                                id="follow_up_date"
                                type="date"
                                name="follow_up_date"
                                value={
                                    form.follow_up_date
                                }
                                min={todayString}
                                onChange={handleChange}
                                onClick={(e) =>
                                    e.currentTarget.showPicker?.()
                                }
                            />

                            <small className="doctor-field-help">
                                Select today or a future date.
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MEDICINES
                ================================================= */}

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

                                            <Trash2 size={16} />

                                            Remove

                                        </button>

                                    </div>


                                    <div className="doctor-form-grid">


                                        {/* =================================================
                                            MEDICINE
                                        ================================================= */}

                                        <div className="doctor-form-group full">

                                            <label>
                                                Medicine
                                                <span className="required-mark">
                                                    *
                                                </span>
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
                                                            key={item.id}
                                                            value={item.id}
                                                        >
                                                            {item.name}
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* =================================================
                                            DOSAGE
                                        ================================================= */}

                                        <div className="doctor-form-group">

                                            <label>
                                                Dosage
                                                <span className="required-mark">
                                                    *
                                                </span>
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


                                        {/* =================================================
                                            FREQUENCY
                                        ================================================= */}

                                        <div className="doctor-form-group">

                                            <label>
                                                Frequency
                                                <span className="required-mark">
                                                    *
                                                </span>
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


                                        {/* =================================================
                                            DURATION
                                        ================================================= */}

                                        <div className="doctor-form-group">

                                            <label>
                                                Duration
                                                <span className="required-mark">
                                                    *
                                                </span>
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


                                        {/* =================================================
                                            ROUTE
                                        ================================================= */}

                                        <div className="doctor-form-group">

                                            <label>
                                                Route
                                            </label>

                                            <select
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
                                            >

                                                <option value="">
                                                    Select Route
                                                </option>

                                                <option value="ORAL">
                                                    Oral
                                                </option>

                                                <option value="TOPICAL">
                                                    Topical
                                                </option>

                                                <option value="INJECTION">
                                                    Injection
                                                </option>

                                                <option value="INHALATION">
                                                    Inhalation
                                                </option>

                                                <option value="SUBLINGUAL">
                                                    Sublingual
                                                </option>

                                                <option value="RECTAL">
                                                    Rectal
                                                </option>

                                                <option value="OTHER">
                                                    Other
                                                </option>

                                            </select>

                                        </div>


                                        {/* =================================================
                                            INSTRUCTIONS
                                        ================================================= */}

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


                    <button
                        type="button"
                        className="doctor-add-item-button"
                        onClick={addMedicine}
                    >

                        <Plus size={17} />

                        Add Medicine

                    </button>

                </section>


                {/* =================================================
                    LAB TESTS
                ================================================= */}

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

                                            <Trash2 size={16} />

                                            Remove

                                        </button>

                                    </div>


                                    <div className="doctor-form-grid">


                                        {/* =================================================
                                            LAB TEST
                                        ================================================= */}

                                        <div className="doctor-form-group full">

                                            <label>
                                                Lab Test
                                                <span className="required-mark">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    lab.lab_test
                                                }
                                                onChange={(e) =>
                                                    updateLab(
                                                        lab.id,
                                                        "lab_test",
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
                                                            key={test.id}
                                                            value={test.id}
                                                        >
                                                            {test.name}
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* =================================================
                                            CLINICAL REASON
                                        ================================================= */}

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


                                        {/* =================================================
                                            INSTRUCTIONS
                                        ================================================= */}

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


                    <button
                        type="button"
                        className="doctor-add-item-button"
                        onClick={addLabTest}
                    >

                        <Plus size={17} />

                        Add Lab Test

                    </button>

                </section>


                {/* =================================================
                    SAVE / CANCEL
                ================================================= */}

                <div className="doctor-consultation-footer">

                    <button
                        type="button"
                        className="doctor-secondary-button"
                        onClick={() =>
                            navigate(-1)
                        }
                        disabled={saving}
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
                            : loadingOptions
                                ? "Loading..."
                                : "Complete Consultation"
                        }

                    </button>

                </div>

            </form>

        </DoctorLayout>

    );
}


export default DoctorConsultation;