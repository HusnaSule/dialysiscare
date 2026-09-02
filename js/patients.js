// =====================================================
// DIALYSISCARE - PATIENT MANAGEMENT
// File: patients.js
// =====================================================

"use strict";

// =====================================================
// GOOGLE APPS SCRIPT API
// =====================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw7cBZYMen9KBQQduZ7WHraIqde7j0X3gTfqyqjYX-s9wCKeM_KB6hoZo7951P6uRqXQQ/exec";

// =====================================================
// ELEMENTS
// =====================================================

const patientForm =
    document.getElementById("patientForm");

const patientModal =
    document.getElementById("patientModal");

const patientTableBody =
    document.getElementById("patientTableBody");


// =====================================================
// GLOBAL
// =====================================================

let editingPatientId = null;


// =====================================================
// STORAGE KEY
// =====================================================

const PATIENT_STORAGE_KEY = "patients";


// =====================================================
// GET TODAY
// =====================================================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================================
// GET PATIENTS
// =====================================================

// =====================================================
// GET PATIENTS
// =====================================================

function getPatients() {

    try {

        const saved =
            localStorage.getItem(
                PATIENT_STORAGE_KEY
            );


        if (!saved) {

            return [];

        }


        const patients =
            JSON.parse(saved);


        if (
            !Array.isArray(patients)
        ) {

            return [];

        }


        return patients.map(
            patient => {

                return {

                    ...patient,

                    id:
                        String(
                            patient.id || ""
                        )
                        .trim()
                        .toUpperCase(),

                    name:
                        patient.name || "",

                    gender:
                        patient.gender || "",

                    panel:
                        patient.panel || "",

                    age:
                        patient.age || "",

                    phone:
                        patient.phone || "",

                    patientType:
                        patient.patientType || "",

                    causeOfCKD:
                        patient.causeOfCKD || "",

                    status:
                        normalizePatientStatus(
                            patient.status
                        ),

                    registrationDate:
                        patient.registrationDate || "",

                    remark:
                        patient.remark || ""

                };

            }
        );

    }

    catch (error) {

        console.error(
            "Error loading patients:",
            error
        );

        return [];

    }

}
// =====================================================
// LOAD PATIENTS FROM GOOGLE SHEETS
// =====================================================

async function loadPatientsFromGoogleSheet() {

    console.log("=================================");
    console.log("START LOADING PATIENTS");
    console.log("=================================");

    try {

        const url =
            GOOGLE_SCRIPT_URL +
            "?action=getPatients";

        console.log(
            "REQUEST URL:",
            url
        );


        const response =
            await fetch(url);


        console.log(
            "HTTP STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP ERROR: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "GOOGLE SHEETS RESPONSE:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load patients."
            );

        }


        const patients =
            Array.isArray(data.patients)
                ? data.patients
                : [];


        console.log(
            "NUMBER OF PATIENTS:",
            patients.length
        );


        console.log(
            "PATIENTS:",
            patients
        );


        // =============================================
        // SAVE TO LOCAL STORAGE
        // =============================================

        localStorage.setItem(
            PATIENT_STORAGE_KEY,
            JSON.stringify(patients)
        );


        // =============================================
        // DISPLAY
        // =============================================

        displayPatients();


        console.log(
            "PATIENTS DISPLAYED SUCCESSFULLY"
        );


        return patients;


    } catch (error) {

        console.error(
            "❌ GOOGLE SHEETS LOAD ERROR:",
            error
        );


        alert(
            "Unable to load patients from Google Sheets.\n\n" +
            error.message
        );

    }

}


// =====================================================
// SAVE PATIENTS
// =====================================================

function savePatients(
    patients
) {

    localStorage.setItem(
        PATIENT_STORAGE_KEY,
        JSON.stringify(patients)
    );

}
// =====================================================
// SAVE PATIENT TO GOOGLE SHEETS
// =====================================================

async function savePatientToGoogleSheet(patient) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "addPatient",

                            patient:
                                patient

                        })
                }
            );


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to save patient."
            );

        }


        console.log(
            "Patient saved to Google Sheets:",
            result
        );


        return result;

    }

    catch (error) {

        console.error(
            "Google Sheets Save Error:",
            error
        );

        throw error;

    }

}
// =====================================================
// UPDATE PATIENT IN GOOGLE SHEETS
// =====================================================

async function updatePatientInGoogleSheet(patient) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "updatePatient",

                            patient:
                                patient

                        })
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to update patient."
            );

        }


        console.log(
            "Patient updated in Google Sheets:",
            result
        );


        return result;

    }

    catch (error) {

        console.error(
            "Google Sheets Update Error:",
            error
        );

        throw error;

    }

}
// =====================================================
// DELETE PATIENT FROM GOOGLE SHEETS
// =====================================================

async function deletePatientFromGoogleSheet(patientId) {

    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "deletePatient",

                            patientId:
                                patientId

                        })
                }
            );


        const result =
            await response.json();


        console.log(
            "Google Sheets Delete Response:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to delete patient."
            );

        }


        return result;

    }

    catch (error) {

        console.error(
            "Google Sheets Delete Error:",
            error
        );

        throw error;

    }

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizePatientStatus(
    status
) {

    const value =
        String(
            status || "Active"
        )
        .trim()
        .toLowerCase();


    if (
        value === "death"
    ) {

        return "Death";

    }


    if (
        value === "transfer"
    ) {

        return "Transfer";

    }


    return "Active";

}


// =====================================================
// NORMALIZE PATIENT TYPE
// =====================================================

function normalizePatientType(
    type
) {

    const value =
        String(
            type || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "new" ||
        value === "new patient"
    ) {

        return "New Patient";

    }


    if (
        value === "old" ||
        value === "old patient"
    ) {

        return "Old Patient";

    }


    return "";

}


// =====================================================
// OPEN PATIENT FORM
// =====================================================

function openPatientForm() {

    editingPatientId = null;


    if (patientForm) {

        patientForm.reset();

    }


    if (patientModal) {

        patientModal.classList.add("show");

        patientModal.style.display = "flex";

    }


    const title =
        document.getElementById(
            "patientFormTitle"
        );

    if (title) {

        title.textContent =
            "Add New Patient";

    }


    const description =
        document.getElementById(
            "patientFormDescription"
        );

    if (description) {

        description.textContent =
            "Enter patient information below.";

    }


    const saveText =
        document.getElementById(
            "savePatientText"
        );

    if (saveText) {

        saveText.textContent =
            "Save Patient";

    }


    const registrationDate =
        document.getElementById(
            "registrationDate"
        );

    if (registrationDate) {

        registrationDate.value =
            getToday();

    }

}


// =====================================================
// CLOSE PATIENT FORM
// =====================================================

function closePatientForm() {

    if (patientModal) {

        patientModal.classList.remove("show");

        patientModal.style.display = "none";

    }


    if (patientForm) {

        patientForm.reset();

    }


    editingPatientId = null;

}


// =====================================================
// SAVE PATIENT
// =====================================================

if (patientForm) {

   patientForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        // code yako iliyobaki...

            const patients =
                getPatients();


            // =========================================
            // PATIENT ID NUMBER
            // =========================================

            const idNumber =
                document
                    .getElementById(
                        "patientIdNumber"
                    )
                    ?.value
                    .trim();


            if (!idNumber) {

                alert(
                    "Please enter Patient ID."
                );

                return;

            }


            if (
                !/^\d+$/.test(idNumber)
            ) {

                alert(
                    "Patient ID must contain numbers only."
                );

                return;

            }


            const patientId =
                "NSKAMH-" +
                idNumber;


            // =========================================
            // FORM DATA
            // =========================================

            const name =
                document
                    .getElementById(
                        "patientName"
                    )
                    ?.value
                    .trim();


            const gender =
                document
                    .getElementById(
                        "patientGender"
                    )
                    ?.value;


            const panel =
                document
                    .getElementById(
                        "patientPanel"
                    )
                    ?.value;


            const age =
                document
                    .getElementById(
                        "patientAge"
                    )
                    ?.value;


            const phone =
                document
                    .getElementById(
                        "patientPhone"
                    )
                    ?.value
                    .trim();


            const registrationDate =
                document
                    .getElementById(
                        "registrationDate"
                    )
                    ?.value;


            const patientType =
                normalizePatientType(
                    document
                        .getElementById(
                            "patientType"
                        )
                        ?.value
                );


            const causeOfCKD =
                document
                    .getElementById(
                        "causeOfCKD"
                    )
                    ?.value;


            // =========================================
            // VALIDATION
            // =========================================

            if (!name) {

                alert(
                    "Please enter patient name."
                );

                return;

            }


            if (!gender) {

                alert(
                    "Please select gender."
                );

                return;

            }


            if (!panel) {

                alert(
                    "Please select panel."
                );

                return;

            }


            if (!age) {

                alert(
                    "Please enter patient age."
                );

                return;

            }


            if (!registrationDate) {

                alert(
                    "Please select registration date."
                );

                return;

            }


            if (!patientType) {

                alert(
                    "Please select Patient Type."
                );

                return;

            }


            if (!causeOfCKD) {

                alert(
                    "Please select Cause of CKD."
                );

                return;

            }


            // =========================================
            // UPDATE EXISTING PATIENT
            // =========================================

           // =========================================
// UPDATE EXISTING PATIENT
// =========================================

if (
    editingPatientId !== null
) {

    const index =
        patients.findIndex(
            patient =>
                String(
                    patient.id
                ) ===
                String(
                    editingPatientId
                )
        );


    if (index === -1) {

        alert(
            "Patient not found."
        );

        return;

    }

const updatedPatient = {

    id:
        editingPatientId,

    name:
        name,

    gender:
        gender,

    panel:
        panel,

    age:
        age,

    phone:
        phone,

    registrationDate:
        registrationDate,

    patientType:
        patientType,

    causeOfCKD:
        causeOfCKD,

    remark:
        patients[index].remark || "",

    status:
        normalizePatientStatus(
            patients[index].status
        )

};


    // =========================================
    // UPDATE PATIENT IN GOOGLE SHEETS
    // =========================================

    try {

        await updatePatientInGoogleSheet({

            patientId:
                updatedPatient.id,

            patientName:
                updatedPatient.name,

            gender:
                updatedPatient.gender,

            age:
                updatedPatient.age,

            phone:
                updatedPatient.phone,

            panel:
                updatedPatient.panel,

            patientType:
                updatedPatient.patientType,

            causeOfCKD:
                updatedPatient.causeOfCKD,

            status:
                updatedPatient.status,

            registrationDate:
                updatedPatient.registrationDate,

            remark:
                updatedPatient.remark || ""

        });


        // =========================================
        // UPDATE LOCAL COPY
        // =========================================

        patients[index] =
            updatedPatient;


        savePatients(
            patients
        );


        alert(
            "Patient updated successfully! ✅"
        );


    }
    catch (error) {

        console.error(
            "Google Sheets Update Error:",
            error
        );


        alert(
            "Patient was NOT updated ❌\n\n" +
            error.message
        );


        return;

    }

}


            // =========================================
            // NEW PATIENT
            // =========================================

                      else {

                const duplicate =
                    patients.find(
                        patient =>

                            String(
                                patient.id
                            )
                            .trim()
                            .toUpperCase() ===

                            patientId
                                .trim()
                                .toUpperCase()
                    );


                if (duplicate) {

                    alert(
                        "This Patient ID already exists."
                    );

                    return;

                }


                const newPatient = {

                    id:
                        patientId,

                    name:
                        name,

                    gender:
                        gender,

                    panel:
                        panel,

                    age:
                        age,

                    phone:
                        phone,

                    registrationDate:
                        registrationDate,

                    patientType:
                        patientType,

                    causeOfCKD:
                        causeOfCKD,

                    // =================================
                    // AUTOMATIC ACTIVE STATUS
                    // =================================

                    status:
                        "Active"

                };


                // =========================================
                // SAVE PATIENT TO GOOGLE SHEETS
                // =========================================

                try {

                    await savePatientToGoogleSheet({

                        patientId:
                            newPatient.id,

                        patientName:
                            newPatient.name,

                        gender:
                            newPatient.gender,

                        age:
                            newPatient.age,

                        phone:
                            newPatient.phone,

                        panel:
                            newPatient.panel,

                        patientType:
                            newPatient.patientType,

                        causeOfCKD:
                            newPatient.causeOfCKD,

                        status:
                            newPatient.status,

                        registrationDate:
                            newPatient.registrationDate,

                        remark:
                            newPatient.remark || ""

                    });


                    // =========================================
                    // SAVE LOCAL COPY
                    // =========================================

                    patients.push(
    newPatient
);

savePatients(
    patients
);


// Reload latest data from Google Sheets

await loadPatientsFromGoogleSheet();


                    // =========================================
                    // SUCCESS MESSAGE
                    // =========================================

                    alert(

                        "Patient registered successfully! ✅\n\n" +

                        "Patient ID: " +
                        patientId +

                        "\n\n" +

                        "Patient Type: " +
                        patientType +

                        "\n\n" +

                        "Status: Active"

                    );


                }
                catch (error) {

                    console.error(
                        "Google Sheets Error:",
                        error
                    );


                    alert(

                        "Patient was NOT saved ❌\n\n" +

                        "Google Sheets Error:\n" +

                        error.message

                    );


                    return;

                }

            }


            closePatientForm();

            displayPatients();

        }
    );

}


// =====================================================
// DISPLAY PATIENTS
// =====================================================

function displayPatients(
    searchTerm = ""
) {

    if (!patientTableBody) {

        return;

    }


    const patients =
        getPatients();


    patientTableBody.innerHTML =
        "";


    // =================================================
    // SEARCH
    // =================================================

    const search =
        String(
            searchTerm || ""
        )
        .trim()
        .toLowerCase();


    // =================================================
    // PATIENT TYPE FILTER
    // =================================================

    const typeFilter =
        document.getElementById(
            "patientTypeFilter"
        );


    const selectedType =
        typeFilter
            ? typeFilter.value
            : "All";


    // =================================================
    // STATUS FILTER
    // =================================================

    const statusFilter =
        document.getElementById(
            "patientStatusFilter"
        );


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    // =================================================
    // FILTER
    // =================================================

    const filteredPatients =
        patients.filter(
            patient => {

                const patientName =
                    String(
                        patient.name || ""
                    )
                    .toLowerCase();


                const patientId =
                    String(
                        patient.id || ""
                    )
                    .toLowerCase();


                const patientType =
                    normalizePatientType(
                        patient.patientType
                    );


                const patientStatus =
                    normalizePatientStatus(
                        patient.status
                    );


                // SEARCH

                const matchesSearch =

                    patientName.includes(
                        search
                    )

                    ||

                    patientId.includes(
                        search
                    );


                // TYPE

                const matchesType =

                    selectedType === "All"

                    ||

                    patientType ===
                    selectedType;


                // STATUS

                const matchesStatus =

                    selectedStatus === "All"

                    ||

                    patientStatus ===
                    selectedStatus;


                return (

                    matchesSearch

                    &&

                    matchesType

                    &&

                    matchesStatus

                );

            }
        );


    // =================================================
    // NO PATIENTS
    // =================================================

    if (
        filteredPatients.length === 0
    ) {

        patientTableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#6b7280;
                    "
                >

                    No patient found.

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // CREATE TABLE
    // =================================================

    filteredPatients.forEach(
        patient => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                normalizePatientStatus(
                    patient.status
                );


            const patientType =
                normalizePatientType(
                    patient.patientType
                );


            row.innerHTML = `

                <!-- PATIENT ID -->

                <td>

                    <strong>
                        ${escapeHTML(
                            patient.id
                        )}
                    </strong>

                </td>


                <!-- NAME -->

                <td>

                    <strong>
                        ${escapeHTML(
                            patient.name
                        )}
                    </strong>

                </td>


                <!-- GENDER -->

                <td>

                    ${escapeHTML(
                        patient.gender ||
                        "-"
                    )}

                </td>


                <!-- PANEL -->

                <td>

                    ${escapeHTML(
                        patient.panel ||
                        "-"
                    )}

                </td>


                <!-- AGE -->

                <td>

                    ${escapeHTML(
                        patient.age ||
                        "-"
                    )}

                </td>


                <!-- PATIENT TYPE -->

                <td>

                    ${
                        patientType
                            ? `

                                <span
                                    class="
                                        patient-type-badge
                                        ${
                                            patientType ===
                                            "New Patient"

                                                ? "patient-new"

                                                : "patient-old"
                                        }
                                    "
                                >

                                    ${escapeHTML(
                                        patientType
                                    )}

                                </span>

                            `
                            : "-"

                    }

                </td>


                <!-- CAUSE OF CKD -->

                <td
                    title="${escapeHTML(
                        patient.causeOfCKD ||
                        ""
                    )}"
                >

                    ${
                        patient.causeOfCKD
                            ? escapeHTML(
                                patient.causeOfCKD
                            )
                            : "-"
                    }

                </td>


                <!-- STATUS -->

                <td>

                    <select
                        class="
                            status-select
                            status-${status.toLowerCase()}
                        "
                        onchange="
                            changePatientStatus(
                                '${escapeAttribute(
                                    patient.id
                                )}',
                                this.value
                            )
                        "
                    >

                        <option
                            value="Active"
                            ${
                                status ===
                                "Active"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Active
                        </option>


                        <option
                            value="Transfer"
                            ${
                                status ===
                                "Transfer"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Transfer
                        </option>


                        <option
                            value="Death"
                            ${
                                status ===
                                "Death"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Death
                        </option>

                    </select>

                </td>


                <!-- ACTION -->

                <td class="action-buttons">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        onclick="
                            viewPatient(
                                '${escapeAttribute(
                                    patient.id
                                )}'
                            )
                        "
                    >
                        View
                    </button>


                    <button
                        type="button"
                        class="action-btn update-btn"
                        onclick="
                            editPatient(
                                '${escapeAttribute(
                                    patient.id
                                )}'
                            )
                        "
                    >
                        Update
                    </button>


                    <button
                        type="button"
                        class="action-btn delete-btn"
                        onclick="
                            deletePatient(
                                '${escapeAttribute(
                                    patient.id
                                )}'
                            )
                        "
                    >
                        🗑️
                    </button>

                </td>

            `;


            patientTableBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// SEARCH
// =====================================================

function searchPatients() {

    const searchInput =
        document.getElementById(
            "searchPatient"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
            : "";


    displayPatients(
        searchTerm
    );

}


// =====================================================
// CHANGE STATUS
// =====================================================

// =====================================================
// CHANGE STATUS
// =====================================================

async function changePatientStatus(
    patientId,
    newStatus
) {

    const patients =
        getPatients();


    const searchId =
        String(
            patientId || ""
        )
        .trim()
        .toUpperCase();


    const patient =
        patients.find(
            item =>
                String(
                    item.id || ""
                )
                .trim()
                .toUpperCase()
                ===
                searchId
        );


    if (!patient) {

        alert(
            "Patient not found."
        );

        return;

    }


    const status =
        normalizePatientStatus(
            newStatus
        );


    // =================================================
    // DEATH CONFIRMATION
    // =================================================

    if (
        status === "Death"
    ) {

        const confirmed =
            confirm(

                "⚠️ IMPORTANT\n\n" +

                "Are you sure you want to mark\n\n" +

                (
                    patient.name ||
                    "this patient"
                ) +

                "\n\nas DEATH?"

            );


        if (!confirmed) {

            displayPatients(
                document
                    .getElementById(
                        "searchPatient"
                    )
                    ?.value ||
                    ""
            );

            return;

        }

    }


    // =================================================
    // UPDATE GOOGLE SHEETS
    // =================================================

    try {

        await updatePatientInGoogleSheet({

            patientId:
                patient.id,

            patientName:
                patient.name,

            gender:
                patient.gender,

            age:
                patient.age,

            phone:
                patient.phone,

            panel:
                patient.panel,

            patientType:
                patient.patientType,

            causeOfCKD:
                patient.causeOfCKD,

            status:
                status,

            registrationDate:
                patient.registrationDate,

            remark:
                patient.remark || ""

        });


        // =================================================
        // UPDATE LOCAL COPY
        // =================================================

        patient.status =
            status;


        savePatients(
            patients
        );


        searchPatients();


    }
    catch (error) {

        console.error(
            "Google Sheets Status Update Error:",
            error
        );


        alert(
            "Status was NOT updated ❌\n\n" +
            error.message
        );

        return;

    }

}

 // =====================================================
// EDIT PATIENT
// =====================================================

function editPatient(patientId) {

    // =========================================
    // GET PATIENTS FROM LOCAL STORAGE
    // =========================================

    const patients =
        getPatients();


    // =========================================
    // NORMALIZE PATIENT ID
    // =========================================

    const searchId =
        String(
            patientId || ""
        )
        .trim()
        .toUpperCase();


    // =========================================
    // FIND PATIENT
    // =========================================

    const patient =
        patients.find(
            item =>

                String(
                    item.id || ""
                )
                .trim()
                .toUpperCase()
                ===
                searchId
        );


    // =========================================
    // CHECK PATIENT
    // =========================================

    if (!patient) {

        alert(
            "Patient not found."
        );

        return;

    }


    // =========================================
    // SET EDITING PATIENT ID
    // =========================================

    editingPatientId =
        patient.id;


    // =========================================
    // OPEN PATIENT MODAL
    // =========================================

    if (patientModal) {

        patientModal.classList.add(
            "show"
        );

        patientModal.style.display =
            "flex";

    }


    // =========================================
    // TITLE
    // =========================================

    const title =
        document.getElementById(
            "patientFormTitle"
        );


    if (title) {

        title.textContent =
            "Update Patient";

    }


    // =========================================
    // DESCRIPTION
    // =========================================

    const description =
        document.getElementById(
            "patientFormDescription"
        );


    if (description) {

        description.textContent =
            "Update patient information below.";

    }


    // =========================================
    // SAVE BUTTON TEXT
    // =========================================

    const saveText =
        document.getElementById(
            "savePatientText"
        );


    if (saveText) {

        saveText.textContent =
            "Update Patient";

    }


    // =========================================
    // PATIENT ID
    // =========================================

    let idNumber =
        String(
            patient.id || ""
        );


    if (
        idNumber
            .toUpperCase()
            .startsWith(
                "NSKAMH-"
            )
    ) {

        idNumber =
            idNumber.substring(
                7
            );

    }


    setValue(
        "patientIdNumber",
        idNumber
    );


    setValue(
        "patientId",
        patient.id || ""
    );


    // =========================================
    // BASIC INFORMATION
    // =========================================

    setValue(
        "patientName",
        patient.name || ""
    );


    setValue(
        "patientGender",
        patient.gender || ""
    );


    setValue(
        "patientPanel",
        patient.panel || ""
    );


    setValue(
        "patientAge",
        patient.age || ""
    );


    setValue(
        "patientPhone",
        patient.phone || ""
    );


    setValue(
        "registrationDate",
        patient.registrationDate ||
        getToday()
    );


    // =========================================
    // PATIENT TYPE
    // =========================================

    setValue(
        "patientType",
        normalizePatientType(
            patient.patientType
        )
    );


    // =========================================
    // CAUSE OF CKD
    // =========================================

    setValue(
        "causeOfCKD",
        patient.causeOfCKD || ""
    );

}


// =====================================================
// VIEW PATIENT
// =====================================================

function viewPatient(
    patientId
) {

    const patients =
        getPatients();


   const searchId =
    String(
        patientId || ""
    )
    .trim()
    .toUpperCase();


const patient =
    patients.find(
        item =>
            String(
                item.id || ""
            )
            .trim()
            .toUpperCase()
            ===
            searchId
    );


    if (!patient) {

        alert(
            "Patient not found."
        );

        return;

    }


    alert(

        "PATIENT INFORMATION\n\n" +

        "Patient ID: " +
        (
            patient.id ||
            "-"
        ) +

        "\n\n" +

        "Name: " +
        (
            patient.name ||
            "-"
        ) +

        "\n\n" +

        "Gender: " +
        (
            patient.gender ||
            "-"
        ) +

        "\n\n" +

        "Panel: " +
        (
            patient.panel ||
            "-"
        ) +

        "\n\n" +

        "Age: " +
        (
            patient.age ||
            "-"
        ) +

        "\n\n" +

        "Phone: " +
        (
            patient.phone ||
            "-"
        ) +

        "\n\n" +

        "Registration Date: " +
        (
            patient.registrationDate ||
            "-"
        ) +

        "\n\n" +

        "Patient Type: " +
        (
            normalizePatientType(
                patient.patientType
            ) ||
            "-"
        ) +

        "\n\n" +

        "Cause of CKD: " +
        (
            patient.causeOfCKD ||
            "-"
        ) +

        "\n\n" +

        "Status: " +
        normalizePatientStatus(
            patient.status
        )

    );

}


// =====================================================
// DELETE PATIENT
// =====================================================

// =====================================================
// DELETE PATIENT
// =====================================================

async function deletePatient(patientId) {

    // =========================================
    // GET LOCAL PATIENTS
    // =========================================

    const patients =
        getPatients();


    // =========================================
    // NORMALIZE PATIENT ID
    // =========================================

    const searchId =
        String(
            patientId || ""
        )
        .trim()
        .toUpperCase();


    // =========================================
    // FIND PATIENT
    // =========================================

    const patient =
        patients.find(
            item =>

                String(
                    item.id || ""
                )
                .trim()
                .toUpperCase()
                ===
                searchId
        );


    // =========================================
    // CHECK PATIENT
    // =========================================

    if (!patient) {

        alert(
            "Patient not found."
        );

        return;

    }


    // =========================================
    // CONFIRM DELETE
    // =========================================

    const confirmed =
        confirm(

            "⚠️ DELETE PATIENT\n\n" +

            "Are you sure you want to delete:\n\n" +

            (
                patient.name ||
                "this patient"
            ) +

            "\n\nPatient ID: " +

            (
                patient.id ||
                "-"
            ) +

            "\n\nThis action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    // =========================================
    // DELETE FROM GOOGLE SHEETS
    // FIRST
    // =========================================

    try {

        console.log(
            "Deleting patient from Google Sheets:",
            patient.id
        );


        await deletePatientFromGoogleSheet(
            patient.id
        );


        // =========================================
        // DELETE FROM LOCAL STORAGE
        // ONLY AFTER GOOGLE SUCCESS
        // =========================================

        const updatedPatients =
            patients.filter(
                item =>

                    String(
                        item.id || ""
                    )
                    .trim()
                    .toUpperCase()
                    !==
                    searchId
            );


        savePatients(
            updatedPatients
        );


        // =========================================
        // REFRESH TABLE
        // =========================================

        searchPatients();


        // =========================================
        // SUCCESS
        // =========================================

        alert(
            "Patient deleted successfully. 🗑️"
        );


        console.log(
            "Patient deleted successfully:",
            patient.id
        );

    }

    catch (error) {

        console.error(
            "Delete Patient Error:",
            error
        );


        alert(

            "Patient was NOT deleted ❌\n\n" +

            "Google Sheets Error:\n" +

            error.message

        );


        return;

    }

}


// =====================================================
// SET VALUE
// =====================================================

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// =====================================================
// MODAL OUTSIDE CLICK
// =====================================================

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            patientModal
        ) {

            closePatientForm();

        }

    }
);


// =====================================================
// ESCAPE KEY
// =====================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closePatientForm();

        }

    }
);


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.openPatientForm =
    openPatientForm;

window.closePatientForm =
    closePatientForm;

window.searchPatients =
    searchPatients;

window.changePatientStatus =
    changePatientStatus;

window.editPatient =
    editPatient;

window.viewPatient =
    viewPatient;

window.deletePatient =
    deletePatient;


// =====================================================
// INITIALIZE
// =====================================================

async function initializePatientsPage() {

    // First show existing local data
    displayPatients();

    // Then load latest data from Google Sheets
    await loadPatientsFromGoogleSheet();

}


// Start Patients Page

initializePatientsPage();
