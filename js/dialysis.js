// =====================================================
// DIALYSISCARE
// DIALYSIS SESSION MANAGEMENT
// File: dialysis.js
// =====================================================

"use strict";


// =====================================================
// STORAGE
// =====================================================

const SESSION_STORAGE_KEY =
    "dialysisSessions";

const PATIENT_STORAGE_KEY =
    "patients";

const MACHINE_STORAGE_KEY =
    "dialysisMachines";
    // =====================================================
// GOOGLE SHEETS API
// =====================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbw3wh8zwYbQAKLQK0kqlRyHND6dY1QDv9JLFdknFxhTp4r1MRtkQPgwN25fF6swmTxZMg/exec";
// =====================================================
// LOAD MACHINES FROM GOOGLE SHEETS
// =====================================================

async function loadMachinesFromGoogleSheet() {

    try {

        const response = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getMachines`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                data.error ||
                "Failed to load machines."
            );
        }

        const machines =
            Array.isArray(data.machines)
                ? data.machines
                : [];

        // Save Google Sheets data
        // into localStorage cache
        localStorage.setItem(
            MACHINE_STORAGE_KEY,
            JSON.stringify(machines)
        );

        console.log(
            "Machines loaded from Google Sheets:",
            machines.length
        );

        return machines;

    } catch (error) {

    console.error(
        "Failed to update dialysis session:",
        error
    );

    alert(
        "Failed to update dialysis session in Google Sheets.\n\n" +
        "Changes were NOT saved."
    );

}
}

// =====================================================
// LOAD SESSIONS FROM GOOGLE SHEETS
// =====================================================

async function loadDialysisSessionsFromGoogleSheet() {

    try {

        const response = await fetch(
            `${GOOGLE_SCRIPT_URL}?action=getDialysisSessions`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.error ||
                "Failed to load dialysis sessions."
            );

        }

        const sessions =
            Array.isArray(data.sessions)
                ? data.sessions
                : [];

        // Save Google Sheets data
        // into localStorage cache
        saveDialysisSessions(
            sessions
        );

        console.log(
            "Dialysis sessions loaded from Google Sheets:",
            sessions.length
        );

        return sessions;

    } catch (error) {

        console.error(
            "Google Sheets dialysis session load failed:",
            error
        );

        // Offline fallback
        return getDialysisSessions();

    }

}


// =====================================================
// POST SESSION TO GOOGLE SHEETS
// =====================================================

async function postDialysisSessionToGoogleSheet(
    action,
    payload
) {

    const response =
        await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    action: action,
                    ...payload
                })
            }
        );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    if (!data.success) {

        throw new Error(
            data.error ||
            "Google Sheets request failed."
        );

    }


    return data;

}


// =====================================================
// GLOBAL STATE
// =====================================================

let currentShift = null;

let selectedStartDate = "";

let selectedEndDate = "";

let selectedSessionId = null;


// =====================================================
// ELEMENTS
// =====================================================

const dialysisForm =
    document.getElementById(
        "dialysisForm"
    );

const dialysisModal =
    document.getElementById(
        "dialysisModal"
    );

const updateSessionModal =
    document.getElementById(
        "updateSessionModal"
    );

const dialysisTableBody =
    document.getElementById(
        "dialysisTableBody"
    );

const dialysisEmptyState =
    document.getElementById(
        "dialysisEmptyState"
    );

const dialysisRecordsArea =
    document.getElementById(
        "dialysisRecordsArea"
    );

const dialysisStartDate =
    document.getElementById(
        "dialysisStartDate"
    );

const dialysisEndDate =
    document.getElementById(
        "dialysisEndDate"
    );

const searchSession =
    document.getElementById(
        "searchSession"
    );


// =====================================================
// GET TODAY
// =====================================================

function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// =====================================================
// GET CURRENT TIME
// =====================================================

function getCurrentTime() {

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    return `${hours}:${minutes}`;

}


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
            JSON.parse(
                saved
            );

        return Array.isArray(
            patients
        )
            ? patients
            : [];

    }

    catch (error) {

        console.error(
            "Error reading patients:",
            error
        );

        return [];

    }

}


// =====================================================
// GET SESSIONS
// =====================================================

function getDialysisSessions() {

    try {

        const saved =
            localStorage.getItem(
                SESSION_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const sessions =
            JSON.parse(
                saved
            );

        return Array.isArray(
            sessions
        )
            ? sessions
            : [];

    }

    catch (error) {

        console.error(
            "Error reading dialysis sessions:",
            error
        );

        return [];

    }

}


// =====================================================
// SAVE SESSIONS
// =====================================================

function saveDialysisSessions(
    sessions
) {

    localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(
            sessions
        )
    );

}


// =====================================================
// GET MACHINES
// =====================================================

function getMachines() {

    try {

        const saved =
            localStorage.getItem(
                MACHINE_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const machines =
            JSON.parse(
                saved
            );

        return Array.isArray(
            machines
        )
            ? machines
            : [];

    }

    catch (error) {

        console.error(
            "Error reading machines:",
            error
        );

        return [];

    }

}


// =====================================================
// LOAD MACHINE DROPDOWN
// =====================================================

function loadMachineDropdown(
    selectedMachine = ""
) {

    const select =
        document.getElementById(
            "sessionMachine"
        );

    if (!select) {

        return;

    }


    const machines =
        getMachines();


    select.innerHTML = `

        <option value="">
            Select machine
        </option>

    `;


    let availableMachines =
        0;


    machines.forEach(
        machine => {

            const status =
                machine.status ||
                "Available";


            if (
                String(
                    status
                )
                .trim()
                .toLowerCase() ===
                "maintenance"
            ) {

                return;

            }


            availableMachines++;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                machine.name;


            option.textContent =
                machine.code
                    ? `${machine.name} (${machine.code})`
                    : machine.name;


            if (
                String(
                    selectedMachine
                )
                .trim()
                .toLowerCase() ===
                String(
                    machine.name
                )
                .trim()
                .toLowerCase()
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );


    if (
        availableMachines === 0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "No machines registered";


        option.disabled =
            true;


        select.appendChild(
            option
        );

    }

}


// =====================================================
// NORMALIZE PATIENT ID
// =====================================================

function normalizePatientId(
    id
) {

    if (!id) {

        return "";

    }


    return String(
        id
    )
    .trim()
    .toUpperCase();

}


// =====================================================
// FULL PATIENT ID
// =====================================================

function getFullPatientId(
    value
) {

    if (!value) {

        return "";

    }


    let id =
        String(
            value
        )
        .trim()
        .toUpperCase();


    if (
        id.startsWith(
            "NSKAMH-"
        )
    ) {

        return id;

    }


    return "NSKAMH-" + id;

}


// =====================================================
// FIND PATIENT
// =====================================================

function findPatient(
    patientId
) {

    const patients =
        getPatients();


    const fullId =
        getFullPatientId(
            patientId
        );


    return patients.find(
        patient => {

            return (
                normalizePatientId(
                    patient.id
                ) ===
                fullId
            );

        }
    );

}


// =====================================================
// SYNC SESSIONS WITH PATIENTS
// =====================================================

// =====================================================
// SYNC SESSIONS WITH PATIENTS
// =====================================================

function syncDialysisWithPatients() {

    const patients =
        getPatients();

    const sessions =
        getDialysisSessions();


    // =====================================================
    // NO SESSIONS
    // =====================================================

    if (
        !Array.isArray(sessions) ||
        sessions.length === 0
    ) {

        return;

    }


    // =====================================================
    // IMPORTANT
    // DO NOT DELETE DIALYSIS SESSIONS
    // IF PATIENT CACHE IS EMPTY
    // =====================================================

    if (
        !Array.isArray(patients) ||
        patients.length === 0
    ) {

        console.log(
            "Patient cache is empty. Dialysis sessions preserved:",
            sessions.length
        );

        return;

    }


    // =====================================================
    // CREATE PATIENT MAP
    // =====================================================

    const patientMap =
        new Map();


    patients.forEach(
        patient => {

            if (!patient.id) {
                return;
            }

            patientMap.set(
                normalizePatientId(
                    patient.id
                ),
                patient
            );

        }
    );


    // =====================================================
    // UPDATE EXISTING SESSIONS
    // DO NOT FILTER / DELETE SESSIONS
    // =====================================================

    let changed =
        false;


    const updatedSessions =
        sessions.map(
            session => {

                const patient =
                    patientMap.get(
                        normalizePatientId(
                            session.patientId
                        )
                    );


                // =================================================
                // PATIENT NOT FOUND
                // KEEP SESSION AS IT IS
                // =================================================

                if (!patient) {

                    return session;

                }


                // =================================================
                // UPDATE PATIENT NAME
                // =================================================

                const newName =
                    patient.name ||
                    "";


                if (
                    session.patientName !==
                    newName
                ) {

                    session.patientName =
                        newName;

                    changed =
                        true;

                }


                // =================================================
                // UPDATE PANEL
                // =================================================

                const newPanel =
                    patient.panel ||
                    "";


                if (
                    session.panel !==
                    newPanel
                ) {

                    session.panel =
                        newPanel;

                    changed =
                        true;

                }


                return session;

            }
        );


    // =====================================================
    // SAVE ONLY IF DATA CHANGED
    // =====================================================

    if (changed) {

        saveDialysisSessions(
            updatedSessions
        );

    }

}


// =====================================================
// OPEN NEW SESSION FORM
// =====================================================

function openDialysisForm(
    patientId = ""
) {

    if (!dialysisForm) {

        return;

    }


    dialysisForm.reset();


    const patientIdElement =
        document.getElementById(
            "sessionPatientId"
        );


    const patientIdNumberElement =
        document.getElementById(
            "sessionPatientIdNumber"
        );


    const patientNameElement =
        document.getElementById(
            "sessionPatientName"
        );


    const panelElement =
        document.getElementById(
            "sessionPanel"
        );


    const sessionDate =
        document.getElementById(
            "sessionDate"
        );


    if (patientIdElement) {

        patientIdElement.value =
            "";

    }


    if (patientIdNumberElement) {

        patientIdNumberElement.value =
            "";

    }


    if (patientNameElement) {

        patientNameElement.value =
            "";

    }


    if (panelElement) {

        panelElement.value =
            "";

    }


    if (sessionDate) {

        sessionDate.value =
            selectedStartDate ||
            getToday();

    }


    const shiftInput =
        document.getElementById(
            "sessionShift"
        );


    if (shiftInput) {

        shiftInput.value =
            currentShift &&
            currentShift !== "All"
                ? currentShift
                : "";

    }


    loadMachineDropdown();


    if (dialysisModal) {

        dialysisModal.classList.add(
            "show"
        );

    }


    if (patientId) {

        loadPatientIntoForm(
            patientId
        );

    }

}


// =====================================================
// CLOSE NEW SESSION FORM
// =====================================================

function closeDialysisForm() {

    if (dialysisModal) {

        dialysisModal.classList.remove(
            "show"
        );

    }

}


// =====================================================
// LOAD PATIENT INTO FORM
// =====================================================

function loadPatientIntoForm(
    patientId
) {

    const patient =
        findPatient(
            patientId
        );


    if (!patient) {

        alert(
            "Patient not found."
        );

        return;

    }


    const fullId =
        normalizePatientId(
            patient.id
        );


    const idNumber =
        fullId.replace(
            /^NSKAMH-/i,
            ""
        );


    const idNumberElement =
        document.getElementById(
            "sessionPatientIdNumber"
        );


    const hiddenIdElement =
        document.getElementById(
            "sessionPatientId"
        );


    const nameElement =
        document.getElementById(
            "sessionPatientName"
        );


    const panelElement =
        document.getElementById(
            "sessionPanel"
        );


    if (idNumberElement) {

        idNumberElement.value =
            idNumber;

    }


    if (hiddenIdElement) {

        hiddenIdElement.value =
            fullId;

    }


    if (nameElement) {

        nameElement.value =
            patient.name ||
            "";

    }


    if (panelElement) {

        panelElement.value =
            patient.panel ||
            "";

    }

}


// =====================================================
// PATIENT ID INPUT
// =====================================================

const patientIdInput =
    document.getElementById(
        "sessionPatientIdNumber"
    );


if (patientIdInput) {

    patientIdInput.addEventListener(
        "input",
        function () {

            let idNumber =
                this.value
                .trim();


            idNumber =
                idNumber.replace(
                    /\D/g,
                    ""
                );


            this.value =
                idNumber;


            const hiddenId =
                document.getElementById(
                    "sessionPatientId"
                );


            const nameInput =
                document.getElementById(
                    "sessionPatientName"
                );


            const panelInput =
                document.getElementById(
                    "sessionPanel"
                );


            if (!idNumber) {

                if (hiddenId) {

                    hiddenId.value =
                        "";

                }


                if (nameInput) {

                    nameInput.value =
                        "";

                }


                if (panelInput) {

                    panelInput.value =
                        "";

                }


                return;

            }


            const fullId =
                getFullPatientId(
                    idNumber
                );


            if (hiddenId) {

                hiddenId.value =
                    fullId;

            }


            const patient =
                findPatient(
                    fullId
                );


            if (patient) {

                if (nameInput) {

                    nameInput.value =
                        patient.name ||
                        "";

                }


                if (panelInput) {

                    panelInput.value =
                        patient.panel ||
                        "";

                }

            }

            else {

                if (nameInput) {

                    nameInput.value =
                        "";

                }


                if (panelInput) {

                    panelInput.value =
                        "";

                }

            }

        }
    );

}


// =====================================================
// SAVE NEW DIALYSIS SESSION
// =====================================================

if (dialysisForm) {

    dialysisForm.addEventListener(
        "submit",
       async function (event) {

            event.preventDefault();


            const patientId =
                normalizePatientId(
                    document.getElementById(
                        "sessionPatientId"
                    )?.value
                );


            const patientType =
                document.getElementById(
                    "patientType"
                )?.value;


            const accessType =
                document.getElementById(
                    "accessType"
                )?.value;


            const shift =
                document.getElementById(
                    "sessionShift"
                )?.value;


            const date =
                document.getElementById(
                    "sessionDate"
                )?.value;


            const machine =
                document.getElementById(
                    "sessionMachine"
                )?.value
                .trim();


            const patient =
                findPatient(
                    patientId
                );


            if (!patient) {

                alert(
                    "Patient not found.\n\n" +
                    "Please enter a registered patient ID."
                );

                return;

            }


            if (!patientType) {

                alert(
                    "Please select patient type."
                );

                return;

            }


            if (!accessType) {

                alert(
                    "Please select dialysis access type."
                );

                return;

            }


            if (!shift) {

                alert(
                    "Please select dialysis shift."
                );

                return;

            }


            if (!date) {

                alert(
                    "Please select dialysis date."
                );

                return;

            }


            if (!machine) {

                alert(
                    "Please select dialysis machine."
                );

                return;

            }


            const machines =
                getMachines();


            const selectedMachine =
                machines.find(
                    item => {

                        return (
                            String(
                                item.name ||
                                ""
                            )
                            .trim()
                            .toLowerCase() ===
                            machine
                            .trim()
                            .toLowerCase()
                        );

                    }
                );


            if (!selectedMachine) {

                alert(
                    "Selected machine is not registered."
                );

                return;

            }


            if (
                String(
                    selectedMachine.status ||
                    ""
                )
                .trim()
                .toLowerCase() ===
                "maintenance"
            ) {

                alert(
                    "This machine is currently under maintenance."
                );

                return;

            }
            


           const session = {

    sessionId:
        Date.now() +
        Math.floor(
            Math.random() * 1000
        ),

    patientId:
        normalizePatientId(
            patient.id
        ),

    patientName:
        patient.name ||
        "",

    panel:
        patient.panel ||
        "",

    patientType:
        patientType,

    accessType:
        accessType,

    erythropoietin:
        document.getElementById(
            "epoGiven"
        )?.value || "No",

    shift:
        shift,

    date:
        date,

    machine:
        selectedMachine.name,

    machineCode:
        selectedMachine.code ||
        "",

    // ==============================
    // WORKFLOW FIELDS
    // ==============================

    startTime:
        "",

    endTime:
        "",

    doctorResponseTime:
        "",

    approvalStatus:
        "Pending",

    approvalTime:
        "",

    remark:
        "",

    // ==============================
    // CLINICAL FIELDS
    // ==============================

    weightBefore:
        document.getElementById(
            "weightBefore"
        )?.value || "",

    weightAfter:
        document.getElementById(
            "weightAfter"
        )?.value || "",

    notes:
        document.getElementById(
            "sessionNotes"
        )?.value?.trim() || "",

    // ==============================
    // TIMESTAMPS
    // ==============================

    createdAt:
        new Date().toISOString(),

    updatedAt:
        ""
};


// =====================================================
// SAVE TO GOOGLE SHEETS
// =====================================================

try {

    console.log(
        "Saving dialysis session to Google Sheets...",
        session
    );


    await postDialysisSessionToGoogleSheet(
        "addDialysisSession",
        {
            session: session
        }
    );


    // =================================================
    // GOOGLE SHEETS SUCCESS
    // UPDATE LOCAL CACHE
    // =================================================

    const existingSessions =
        getDialysisSessions();


    existingSessions.push(
        session
    );


    saveDialysisSessions(
        existingSessions
    );


    console.log(
        "Dialysis session saved to Google Sheets successfully."
    );


    alert(
        "Dialysis session saved successfully! ✓"
    );


    closeDialysisForm();


    updateAllStatistics();


    if (currentShift) {

        displayDialysisSessions();

    }


} catch (error) {

    console.error(
        "Error saving dialysis session:",
        error
    );


    alert(
                    "Failed to save dialysis session to Google Sheets.\n\n" +
                    error.message
                );

            }

        }
    );

}


// =====================================================
// GET SESSIONS FOR DATE RANGE
// =====================================================

function getSessionsForSelectedDateRange() {

    const sessions =
        getDialysisSessions();


    if (
        !selectedStartDate ||
        !selectedEndDate
    ) {

        return [];

    }


    return sessions.filter(
        session => {

            if (!session.date) {

                return false;

            }


            return (
                session.date >=
                selectedStartDate
                &&
                session.date <=
                selectedEndDate
            );

        }
    );

}


// =====================================================
// UNIQUE PATIENT COUNT
// =====================================================

function getUniquePatientCount(
    shift = "All"
) {

    const sessions =
        getSessionsForSelectedDateRange();


    const patientIds =
        new Set();


    sessions.forEach(
        session => {

            if (
                shift === "All" ||
                session.shift === shift
            ) {

                if (
                    session.patientId
                ) {

                    patientIds.add(
                        normalizePatientId(
                            session.patientId
                        )
                    );

                }

            }

        }
    );


    return patientIds.size;

}


// =====================================================
// SESSION COUNT
// =====================================================

function getSessionCount(
    shift = "All"
) {

    const sessions =
        getSessionsForSelectedDateRange();


    if (
        shift === "All"
    ) {

        return sessions.length;

    }


    return sessions.filter(
        session =>
            session.shift ===
            shift
    ).length;

}


// =====================================================
// MACHINE COUNT
// =====================================================

function getMachineCount() {

    const sessions =
        getSessionsForSelectedDateRange();


    const machineSet =
        new Set();


    sessions.forEach(
        session => {

            if (
                session.machine
            ) {

                machineSet.add(
                    session.machine
                );

            }

        }
    );


    return machineSet.size;

}


// =====================================================
// UPDATE SHIFT COUNTS
// =====================================================

function updateShiftCounts() {

    const shifts = [

        "First",

        "Second",

        "Third",

        "Fourth",

        "All"

    ];


    const buttons = {

        First:
            "firstShiftBtn",

        Second:
            "secondShiftBtn",

        Third:
            "thirdShiftBtn",

        Fourth:
            "fourthShiftBtn",

        All:
            "allShiftBtn"

    };


    shifts.forEach(
        shift => {

            const button =
                document.getElementById(
                    buttons[shift]
                );


            if (!button) {

                return;

            }


            const patients =
                getUniquePatientCount(
                    shift
                );


            const sessions =
                getSessionCount(
                    shift
                );


            const patientText =
                patients === 1
                    ? "Patient"
                    : "Patients";


            const sessionText =
                sessions === 1
                    ? "Session"
                    : "Sessions";


            const number =
                shift === "First"
                    ? "1"
                    : shift === "Second"
                        ? "2"
                        : shift === "Third"
                            ? "3"
                            : shift === "Fourth"
                                ? "4"
                                : "ALL";


            button.innerHTML = `

                <span class="shift-icon">
                    ${number}
                </span>

                <span class="shift-content">

                    <strong>
                        ${
                            shift === "All"
                                ? "All Shifts"
                                : shift + " Shift"
                        }
                    </strong>

                    <small>
                        ${patients}
                        ${patientText}
                        ·
                        ${sessions}
                        ${sessionText}
                    </small>

                </span>

            `;

        }
    );

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateDailySummary() {

    const totalPatients =
        getUniquePatientCount(
            "All"
        );


    const totalSessions =
        getSessionCount(
            "All"
        );


    const machinesUsed =
        getMachineCount();


    setText(
        "totalPatients",
        totalPatients
    );


    setText(
        "totalSessions",
        totalSessions
    );


    setText(
        "machinesUsed",
        machinesUsed
    );


    const dateElement =
        document.getElementById(
            "selectedDateDisplay"
        );


    if (!dateElement) {

        return;

    }


    if (
        selectedStartDate ===
        selectedEndDate
    ) {

        dateElement.textContent =
            formatDisplayDate(
                selectedStartDate
            );

    }

    else {

        dateElement.textContent =
            `${formatDisplayDate(
                selectedStartDate
            )} - ${formatDisplayDate(
                selectedEndDate
            )}`;

    }

}


// =====================================================
// UPDATE EVERYTHING
// =====================================================

function updateAllStatistics() {

    syncDialysisWithPatients();

    updateShiftCounts();

    updateDailySummary();

}


// =====================================================
// FILTER BY SHIFT
// =====================================================

function filterByShift(
    shift
) {

    currentShift =
        shift;


    document
        .querySelectorAll(
            ".shift-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const buttonMap = {

        First:
            "firstShiftBtn",

        Second:
            "secondShiftBtn",

        Third:
            "thirdShiftBtn",

        Fourth:
            "fourthShiftBtn",

        All:
            "allShiftBtn"

    };


    const selectedButton =
        document.getElementById(
            buttonMap[shift]
        );


    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }


    if (dialysisEmptyState) {

        dialysisEmptyState.style.display =
            "none";

    }


    if (dialysisRecordsArea) {

        dialysisRecordsArea.style.display =
            "block";

    }


    const title =
        document.getElementById(
            "currentShiftTitle"
        );


    const description =
        document.getElementById(
            "currentShiftDescription"
        );


    if (title) {

        title.textContent =
            shift === "All"
                ? "All Dialysis Shifts"
                : shift + " Shift";

    }


    if (description) {

        if (
            selectedStartDate ===
            selectedEndDate
        ) {

            description.textContent =
                shift === "All"

                    ? "Showing all dialysis sessions for " +
                      formatDisplayDate(
                          selectedStartDate
                      ) +
                      "."

                    : "Showing dialysis sessions for the " +
                      shift.toLowerCase() +
                      " shift on " +
                      formatDisplayDate(
                          selectedStartDate
                      ) +
                      ".";

        }

        else {

            description.textContent =
                shift === "All"

                    ? "Showing all dialysis sessions from " +
                      formatDisplayDate(
                          selectedStartDate
                      ) +
                      " to " +
                      formatDisplayDate(
                          selectedEndDate
                      ) +
                      "."

                    : "Showing dialysis sessions for the " +
                      shift.toLowerCase() +
                      " shift from " +
                      formatDisplayDate(
                          selectedStartDate
                      ) +
                      " to " +
                      formatDisplayDate(
                          selectedEndDate
                      ) +
                      ".";

        }

    }


    displayDialysisSessions();

}


// =====================================================
// DISPLAY SESSIONS
// =====================================================

function displayDialysisSessions(
    searchTerm = ""
) {

    if (!dialysisTableBody) {

        return;

    }


    if (!currentShift) {

        dialysisTableBody.innerHTML =
            "";

        return;

    }


    const sessions =
        getSessionsForSelectedDateRange();


    let filteredSessions =
        sessions.filter(
            session => {

                if (
                    currentShift ===
                    "All"
                ) {

                    return true;

                }


                return (
                    session.shift ===
                    currentShift
                );

            }
        );


    const search =
        String(
            searchTerm
        )
        .trim()
        .toLowerCase();


    if (search) {

        filteredSessions =
            filteredSessions.filter(
                session => {

                    const searchableText = [

                        session.patientId,

                        session.patientName,

                        session.panel,

                        session.patientType,

                        session.accessType,

                        session.shift,

                        session.date,

                        session.machine,

                        session.approvalStatus,

                        session.remark

                    ]
                    .map(
                        value =>
                            String(
                                value ||
                                ""
                            )
                            .toLowerCase()
                    )
                    .join(" ");


                    return searchableText.includes(
                        search
                    );

                }
            );

    }


    dialysisTableBody.innerHTML =
        "";


    if (
        filteredSessions.length ===
        0
    ) {

        const row =
            document.createElement(
                "tr"
            );


        const message =
            selectedStartDate ===
            selectedEndDate

                ? `No dialysis sessions found for ${formatDisplayDate(
                    selectedStartDate
                )}.`

                : `No dialysis sessions found from ${formatDisplayDate(
                    selectedStartDate
                )} to ${formatDisplayDate(
                    selectedEndDate
                )}.`;


        row.innerHTML = `

            <td
                colspan="14"
                style="
                    text-align:center;
                    padding:30px;
                "
            >

                ${escapeHTML(
                    message
                )}

            </td>

        `;


        dialysisTableBody.appendChild(
            row
        );


        return;

    }


    filteredSessions.sort(
        (a, b) => {

            const dateA =
                new Date(
                    `${a.date}T${
                        a.startTime ||
                        "00:00"
                    }`
                );


            const dateB =
                new Date(
                    `${b.date}T${
                        b.startTime ||
                        "00:00"
                    }`
                );


            return dateB - dateA;

        }
    );


    filteredSessions.forEach(
        session => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <!-- PATIENT ID -->

                <td>

                    <strong>
                        ${escapeHTML(
                            session.patientId ||
                            "-"
                        )}
                    </strong>

                </td>


                <!-- NAME -->

                <td>

                    <strong>
                        ${escapeHTML(
                            session.patientName ||
                            "-"
                        )}
                    </strong>

                </td>


                <!-- PANEL -->

                <td>

                    ${escapeHTML(
                        session.panel ||
                        "-"
                    )}

                </td>


                <!-- PATIENT TYPE -->

                <td>

                    <span class="patient-type-badge">
                        ${escapeHTML(
                            session.patientType ||
                            "-"
                        )}
                    </span>

                </td>


                <!-- ACCESS -->

                <td>

                    <span class="access-badge ${
                        session.accessType ===
                        "AVF"
                            ? "access-avf"
                            : "access-catheter"
                    }">

                        ${escapeHTML(
                            session.accessType ||
                            "-"
                        )}

                    </span>

                </td>


                <!-- SHIFT -->

                <td>

                    <span class="shift-badge">

                        ${escapeHTML(
                            session.shift ||
                            "-"
                        )}

                    </span>

                </td>


                <!-- DATE -->

                <td>

                    ${escapeHTML(
                        formatDisplayDate(
                            session.date
                        )
                    )}

                </td>


                <!-- MACHINE -->

                <td>

                    ${escapeHTML(
                        session.machine ||
                        "-"
                    )}

                </td>


                <!-- START -->

                <td>

                    <span class="workflow-time ${
                        session.startTime
                            ? "time-complete"
                            : "time-pending"
                    }">

                        ${
                            session.startTime
                                ? escapeHTML(
                                    session.startTime
                                )
                                : "—"
                        }

                    </span>

                </td>


                <!-- END -->

                <td>

                    <span class="workflow-time ${
                        session.endTime
                            ? "time-complete"
                            : "time-pending"
                    }">

                        ${
                            session.endTime
                                ? escapeHTML(
                                    session.endTime
                                )
                                : "—"
                        }

                    </span>

                </td>


                <!-- DOCTOR RESPONSE -->

                <td>

                    <span class="workflow-time ${
                        session.doctorResponseTime
                            ? "time-complete"
                            : "time-pending"
                    }">

                        ${
                            session.doctorResponseTime
                                ? escapeHTML(
                                    session.doctorResponseTime
                                )
                                : "—"
                        }

                    </span>

                </td>


                <!-- APPROVAL -->

                <td>

                    ${getApprovalBadge(
                        session.approvalStatus
                    )}

                </td>


                <!-- APPROVAL TIME -->

                <td>

                    <span class="workflow-time ${
                        session.approvalTime
                            ? "time-complete"
                            : "time-pending"
                    }">

                        ${
                            session.approvalTime
                                ? escapeHTML(
                                    session.approvalTime
                                )
                                : "—"
                        }

                    </span>

                </td>


               <!-- ACTION -->

<td class="action-buttons">

    <button
        type="button"
        class="action-btn view-btn"
    >
        View
    </button>


    <button
        type="button"
        class="action-btn new-btn"
    >
        + New
    </button>


    <button
        type="button"
        class="action-btn update-btn"
    >
        Update
    </button>
    <button
    type="button"
    class="action-btn delete-btn"
>
    Delete
</button>

</td>

            `;


          const viewButton =
    row.querySelector(
        ".view-btn"
    );


if (viewButton) {

    viewButton.addEventListener(
        "click",
        function () {

            viewDialysisSession(
                session.sessionId
            );

        }
    );

}


/* =========================================
   NEW SESSION BUTTON
========================================= */

const newButton =
    row.querySelector(
        ".new-btn"
    );


if (newButton) {

    newButton.addEventListener(
        "click",
        function () {

            newDialysisSession(
                session.patientId,
                session.shift
            );

        }
    );

}


/* =========================================
   UPDATE BUTTON
========================================= */

const updateButton =
    row.querySelector(
        ".update-btn"
    );


if (updateButton) {

    updateButton.addEventListener(
        "click",
        function () {

            openUpdateSession(
                session.sessionId
            );

        }
    );

}
/* =========================================
   DELETE BUTTON
========================================= */

const deleteButton =
    row.querySelector(
        ".delete-btn"
    );

if (deleteButton) {

    deleteButton.addEventListener(
        "click",
        function () {

            deleteDialysisSession(
                session.sessionId
            );

        }
    );

}


dialysisTableBody.appendChild(
    row
);
        }
    );

}


// =====================================================
// APPROVAL BADGE
// =====================================================

function getApprovalBadge(
    status
) {

    const safeStatus =
        status ||
        "Pending";


    let className =
        "approval-badge";


    if (
        safeStatus ===
        "Approved"
    ) {

        className +=
            " approval-approved";

    }

    else if (
        safeStatus ===
        "Rejected"
    ) {

        className +=
            " approval-rejected";

    }

    else {

        className +=
            " approval-pending";

    }


    return `

        <span class="${className}">

            ${escapeHTML(
                safeStatus
            )}

        </span>

    `;

}


// =====================================================
// SEARCH
// =====================================================

function searchSessions() {

    if (!currentShift) {

        return;

    }


    if (!searchSession) {

        return;

    }


    displayDialysisSessions(
        searchSession.value
    );

}


// =====================================================
// CHANGE DATE RANGE
// =====================================================

function changeDialysisDate() {

    let startDate =
        "";

    let endDate =
        "";


    if (
        dialysisStartDate &&
        dialysisEndDate
    ) {

        startDate =
            dialysisStartDate.value;

        endDate =
            dialysisEndDate.value;

    }


    if (!startDate) {

        startDate =
            getToday();

    }


    if (!endDate) {

        endDate =
            startDate;

    }


    if (
        startDate >
        endDate
    ) {

        alert(
            "From date cannot be later than To date."
        );


        if (dialysisEndDate) {

            dialysisEndDate.value =
                startDate;

        }


        endDate =
            startDate;

    }


    selectedStartDate =
        startDate;


    selectedEndDate =
        endDate;


    if (searchSession) {

        searchSession.value =
            "";

    }


    updateAllStatistics();


    if (currentShift) {

        displayDialysisSessions();

    }

}


// =====================================================
// OPEN UPDATE SESSION
// =====================================================

function openUpdateSession(
    sessionId
) {

    const sessions =
        getDialysisSessions();


    const session =
        sessions.find(
            item =>
                String(
                    item.sessionId
                ) ===
                String(
                    sessionId
                )
        );


    if (!session) {

        alert(
            "Dialysis session not found."
        );

        return;

    }


    selectedSessionId =
        session.sessionId;


    /*
     * Patient information
     */

    setText(
        "updatePatientName",
        session.patientName ||
        "-"
    );


    setText(
        "updatePatientId",
        session.patientId ||
        "-"
    );


    setText(
        "updateShift",
        session.shift ||
        "-"
    );


    setText(
        "updateAccessType",
        session.accessType ||
        "-"
    );


    /*
     * Existing workflow values
     */

    const startInput =
        document.getElementById(
            "updateStartTime"
        );


    const endInput =
        document.getElementById(
            "updateEndTime"
        );


    const doctorInput =
        document.getElementById(
            "updateDoctorResponseTime"
        );


    const approvalStatusInput =
        document.getElementById(
            "updateApprovalStatus"
        );


    const approvalTimeInput =
        document.getElementById(
            "updateApprovalTime"
        );


    const remarkInput =
        document.getElementById(
            "updateRemark"
        );


    if (startInput) {

        startInput.value =
            session.startTime ||
            "";

    }


    if (endInput) {

        endInput.value =
            session.endTime ||
            "";

    }


    if (doctorInput) {

        doctorInput.value =
            session.doctorResponseTime ||
            "";

    }


    if (approvalStatusInput) {

        approvalStatusInput.value =
            session.approvalStatus ||
            "Pending";

    }


    if (approvalTimeInput) {

        approvalTimeInput.value =
            session.approvalTime ||
            "";

    }


    if (remarkInput) {

        remarkInput.value =
            session.remark ||
            "";

    }


    /*
     * Open modal
     */

    if (updateSessionModal) {

        updateSessionModal.classList.add(
            "show"
        );

    }

}


// =====================================================
// CLOSE UPDATE SESSION
// =====================================================

function closeUpdateSession() {

    if (updateSessionModal) {

        updateSessionModal.classList.remove(
            "show"
        );

    }


    selectedSessionId =
        null;

}


// =====================================================
// SET CURRENT TIME
// =====================================================

function setCurrentUpdateTime(
    elementId
) {

    const input =
        document.getElementById(
            elementId
        );


    if (!input) {

        return;

    }


    input.value =
        getCurrentTime();

}


// =====================================================
// SAVE SESSION UPDATE
// =====================================================

// =====================================================
// SAVE SESSION UPDATE
// =====================================================

async function saveSessionUpdate() {

    if (!selectedSessionId) {

        alert(
            "No dialysis session selected."
        );

        return;
    }

    const sessions =
        getDialysisSessions();

    const index =
        sessions.findIndex(
            session =>
                String(
                    session.sessionId
                ) ===
                String(
                    selectedSessionId
                )
        );

    // ... code yako inayofuata ibaki hivyo hivyo


    if (index === -1) {

        alert(
            "Dialysis session not found."
        );

        return;

    }


    const session =
        sessions[index];


    const startTime =
        document.getElementById(
            "updateStartTime"
        )?.value ||
        "";


    const endTime =
        document.getElementById(
            "updateEndTime"
        )?.value ||
        "";


    const doctorResponseTime =
        document.getElementById(
            "updateDoctorResponseTime"
        )?.value ||
        "";


    const approvalStatus =
        document.getElementById(
            "updateApprovalStatus"
        )?.value ||
        "Pending";


    let approvalTime =
        document.getElementById(
            "updateApprovalTime"
        )?.value ||
        "";


    const remark =
        document.getElementById(
            "updateRemark"
        )?.value
        .trim() ||
        "";


    /*
     * Validate end time
     */

    if (
        startTime &&
        endTime
    ) {

        const start =
            new Date(
                `${session.date}T${startTime}`
            );


        const end =
            new Date(
                `${session.date}T${endTime}`
            );


        if (
            end <= start
        ) {

            alert(
                "End time must be later than start time."
            );

            return;

        }

    }


    /*
     * Automatically set approval time
     * when status becomes Approved
     */

    if (
        approvalStatus ===
        "Approved" &&
        !approvalTime
    ) {

        approvalTime =
            getCurrentTime();

    }


    /*
     * If rejected, approval time can
     * still be manually entered or left blank.
     */


    /*
     * Update session
     */

   session.startTime =
    startTime;


session.endTime =
    endTime;


session.doctorResponseTime =
    doctorResponseTime;


session.approvalStatus =
    approvalStatus;


session.approvalTime =
    approvalTime;


session.remark =
    remark;


session.updatedAt =
    new Date()
    .toISOString();


// =====================================================
// UPDATE GOOGLE SHEETS FIRST
// =====================================================

try {

    console.log(
        "Updating dialysis session in Google Sheets...",
        session
    );


    await postDialysisSessionToGoogleSheet(
        "updateDialysisSession",
        {
            session: session
        }
    );


    // =================================================
    // GOOGLE SHEETS SUCCESS
    // UPDATE LOCAL CACHE
    // =================================================

    sessions[index] =
        session;


    saveDialysisSessions(
        sessions
    );


    console.log(
        "Dialysis session updated in Google Sheets successfully."
    );


    alert(
        "Dialysis session updated successfully! ✓"
    );


    closeUpdateSession();


    updateAllStatistics();


    if (currentShift) {

        displayDialysisSessions();

    }


} catch (error) {

    console.error(
        "Failed to update dialysis session:",
        error
    );


    alert(
        "Failed to update dialysis session in Google Sheets.\n\n" +
        "Changes were NOT saved."
    );

}
}
// =====================================================
// DELETE DIALYSIS SESSION
// =====================================================

async function deleteDialysisSession(sessionId) {

    if (!sessionId) {

        alert(
            "No dialysis session selected."
        );

        return;
    }


    const sessions =
        getDialysisSessions();


    const session =
        sessions.find(
            s =>
                String(s.sessionId) ===
                String(sessionId)
        );


    if (!session) {

        alert(
            "Dialysis session not found."
        );

        return;
    }


    const patientName =
        session.patientName ||
        session.patientId ||
        "this patient";


    const confirmed =
        confirm(
            "Are you sure you want to delete this dialysis session?\n\n" +
            "Patient: " +
            patientName +
            "\n" +
            "Date: " +
            (session.date || "") +
            "\n" +
            "Machine: " +
            (session.machine || "") +
            "\n\n" +
            "This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        console.log(
            "Deleting dialysis session from Google Sheets...",
            sessionId
        );


        // =================================================
        // DELETE FROM GOOGLE SHEETS FIRST
        // =================================================

        await postDialysisSessionToGoogleSheet(
            "deleteDialysisSession",
            {
                sessionId: sessionId
            }
        );


        // =================================================
        // UPDATE LOCAL CACHE
        // =================================================

        const updatedSessions =
            sessions.filter(
                s =>
                    String(s.sessionId) !==
                    String(sessionId)
            );


        saveDialysisSessions(
            updatedSessions
        );


        console.log(
            "Dialysis session deleted from Google Sheets successfully."
        );


        alert(
            "Dialysis session deleted successfully! ✓"
        );


        // =================================================
        // UPDATE DASHBOARD
        // =================================================

        updateAllStatistics();


        if (currentShift) {

            displayDialysisSessions(
                searchSession
                    ? searchSession.value
                    : ""
            );

        }


    } catch (error) {

        console.error(
            "Failed to delete dialysis session:",
            error
        );


        alert(
            "Failed to delete dialysis session from Google Sheets.\n\n" +
            "The session was NOT deleted."
        );

    }

}


// =====================================================
// VIEW SESSION
// =====================================================

function viewDialysisSession(
    sessionId
) {

    const sessions =
        getDialysisSessions();


    const session =
        sessions.find(
            item =>
                String(
                    item.sessionId
                ) ===
                String(
                    sessionId
                )
        );


    if (!session) {

        alert(
            "Dialysis session not found."
        );

        return;

    }


    alert(

        "DIALYSIS SESSION\n\n" +

        "Patient ID: " +
        (
            session.patientId ||
            "-"
        ) +

        "\n\n" +

        "Patient Name: " +
        (
            session.patientName ||
            "-"
        ) +

        "\n\n" +

        "Panel: " +
        (
            session.panel ||
            "-"
        ) +

        "\n\n" +

        "Patient Type: " +
        (
            session.patientType ||
            "-"
        ) +

        "\n\n" +

        "Access Type: " +
        (
            session.accessType ||
            "-"
        ) +

        "\n\n" +

        "Shift: " +
        (
            session.shift ||
            "-"
        ) +

        "\n\n" +

        "Date: " +
        (
            formatDisplayDate(
                session.date
            )
        ) +

        "\n\n" +

        "Machine: " +
        (
            session.machine ||
            "-"
        ) +

        "\n\n" +

        "Machine Code: " +
        (
            session.machineCode ||
            "-"
        ) +

        "\n\n" +

        "Start Time: " +
        (
            session.startTime ||
            "-"
        ) +

        "\n\n" +

        "End Time: " +
        (
            session.endTime ||
            "-"
        ) +

        "\n\n" +

        "Doctor Response Time: " +
        (
            session.doctorResponseTime ||
            "-"
        ) +

        "\n\n" +

        "Approval Status: " +
        (
            session.approvalStatus ||
            "Pending"
        ) +

        "\n\n" +

        "Approval Time: " +
        (
            session.approvalTime ||
            "-"
        ) +

        "\n\n" +

        "Remark: " +
        (
            session.remark ||
            "-"
        ) +

        "\n\n" +

        "Weight Before: " +
        (
            session.weightBefore ||
            "-"
        ) +
        " kg" +

        "\n\n" +

        "Weight After: " +
        (
            session.weightAfter ||
            "-"
        ) +
        " kg" +

        "\n\n" +

        "Notes: " +
        (
            session.notes ||
            "-"
        )

    );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDisplayDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const parts =
        String(
            dateString
        )
        .split("-");


    if (
        parts.length !==
        3
    ) {

        return dateString;

    }


    return (
        `${parts[2]}/${parts[1]}/${parts[0]}`
    );

}


// =====================================================
// NEW SESSION FROM PATIENT
// =====================================================

function newDialysisSession(
    patientId
) {

    openDialysisForm(
        patientId
    );

}


// =====================================================
// SET TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
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


    return String(
        value
    )

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
// INITIALIZE PAGE
// ===================================================
async function initializeDialysisPage() {

    const today =
        getToday();

    selectedStartDate =
        today;

    selectedEndDate =
        today;

    if (dialysisStartDate) {
        dialysisStartDate.value =
            today;
    }

    if (dialysisEndDate) {
        dialysisEndDate.value =
            today;
    }

    currentShift =
        null;

    selectedSessionId =
        null;


    // =====================================================
    // LOAD LOCAL DATA FIRST
    // =====================================================

    syncDialysisWithPatients();

    loadMachineDropdown();

    updateAllStatistics();


    if (dialysisEmptyState) {
        dialysisEmptyState.style.display =
            "block";
    }

    if (dialysisRecordsArea) {
        dialysisRecordsArea.style.display =
            "none";
    }

    if (searchSession) {
        searchSession.value =
            "";
    }


    // =====================================================
    // GOOGLE SHEETS SYNC IN BACKGROUND
    // =====================================================

    loadDialysisSessionsFromGoogleSheet()
        .then(() => {

            syncDialysisWithPatients();

            updateAllStatistics();

            if (currentShift) {

                displayDialysisSessions(
                    searchSession
                        ? searchSession.value
                        : ""
                );

            }

        })
        .catch(error => {

            console.error(
                "Background dialysis sync failed:",
                error
            );

        });


    // =====================================================
    // LOAD MACHINES IN BACKGROUND
    // =====================================================

    loadMachinesFromGoogleSheet()
        .then(() => {

            const machineSelect =
                document.getElementById(
                    "sessionMachine"
                );

            const selectedMachine =
                machineSelect
                    ? machineSelect.value
                    : "";

            loadMachineDropdown(
                selectedMachine
            );

        })
        .catch(error => {

            console.error(
                "Background machine sync failed:",
                error
            );

        });

}
// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(
    function () {

        loadDialysisSessionsFromGoogleSheet()
            .then(() => {

                syncDialysisWithPatients();

                updateAllStatistics();

                if (currentShift) {

                    displayDialysisSessions(
                        searchSession
                            ? searchSession.value
                            : ""
                    );

                }

            })
            .catch(error => {

                console.error(
                    "Auto-refresh dialysis failed:",
                    error
                );

            });


        const machineSelect =
            document.getElementById(
                "sessionMachine"
            );

        const selectedMachine =
            machineSelect
                ? machineSelect.value
                : "";

        loadMachineDropdown(
            selectedMachine
        );

    },
    60000
);


// =====================================================
// CLOSE MODALS WHEN CLICK OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            dialysisModal
        ) {

            closeDialysisForm();

        }


        if (
            event.target ===
            updateSessionModal
        ) {

            closeUpdateSession();

        }

    }
);


// =====================================================
// ESCAPE KEY
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeDialysisForm();

            closeUpdateSession();

        }

    }
);
// =====================================================
// BILLING AMOUNTS
// =====================================================

const DIALYSIS_AMOUNT = 240000;

const EPO_AMOUNT = 66000;


// =====================================================
// UPDATE EPO BILLING DISPLAY
// =====================================================

function updateBillingAmount() {

    const epoGiven =
        document.getElementById(
            "epoGiven"
        );

    const epoAmount =
        document.getElementById(
            "epoAmount"
        );

    const dialysisAmount =
        document.getElementById(
            "dialysisAmount"
        );

    const totalAmount =
        document.getElementById(
            "totalAmount"
        );


    if (!epoGiven) {

        return;

    }


    const isEpoGiven =
        epoGiven.value === "Yes";


    const epo =
        isEpoGiven
            ? EPO_AMOUNT
            : 0;


    const total =
        DIALYSIS_AMOUNT + epo;


    if (epoAmount) {

        epoAmount.value =
            `TZS ${epo.toLocaleString()}`;

    }


    if (dialysisAmount) {

        dialysisAmount.value =
            `TZS ${DIALYSIS_AMOUNT.toLocaleString()}`;

    }


    if (totalAmount) {

        totalAmount.value =
            `TZS ${total.toLocaleString()}`;

    }

}


// =====================================================
// EPO CHANGE
// =====================================================

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target &&
            event.target.id ===
            "epoGiven"
        ) {

            updateBillingAmount();

        }

    }
);


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.openDialysisForm =
    openDialysisForm;

window.closeDialysisForm =
    closeDialysisForm;

window.filterByShift =
    filterByShift;

window.searchSessions =
    searchSessions;

window.changeDialysisDate =
    changeDialysisDate;

window.newDialysisSession =
    newDialysisSession;

window.viewDialysisSession =
    viewDialysisSession;

window.openUpdateSession =
    openUpdateSession;

window.closeUpdateSession =
    closeUpdateSession;

window.setCurrentUpdateTime =
    setCurrentUpdateTime;

window.saveSessionUpdate =
    saveSessionUpdate;


// =====================================================
// START
// =====================================================

initializeDialysisPage();
