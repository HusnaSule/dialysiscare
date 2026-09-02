// =====================================================
// DIALYSISCARE - MACHINE & STOCK MANAGEMENT
// File: machine.js
// =====================================================

"use strict";


// =====================================================
// STORAGE KEYS
// =====================================================

const MACHINE_STORAGE_KEY = "dialysisMachines";
const SESSION_STORAGE_KEY = "dialysisSessions";
const STOCK_STORAGE_KEY = "dialysisStock";
const STOCK_TRANSACTION_KEY = "dialysisStockTransactions";
// =====================================================
// GOOGLE SHEETS API - MACHINES
// =====================================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxOTfQ3LrA8Drmscch46A_-dMET7LI-VEANyz6I0ndchfmMY4hyu6QgXwQmYF20IaUi/exec";


// =====================================================
// LOAD MACHINES FROM GOOGLE SHEETS
// =====================================================

async function loadMachinesFromGoogleSheet() {

    try {

        const response =
            await fetch(
                `${GOOGLE_SCRIPT_URL}?action=getMachines`
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
                "Failed to load machines."
            );

        }

        machines =
            Array.isArray(data.machines)
                ? data.machines
                : [];

        // Keep local cache
        localStorage.setItem(
            MACHINE_STORAGE_KEY,
            JSON.stringify(machines)
        );

        console.log(
            "Machines loaded from Google Sheets:",
            machines.length
        );

        return machines;

    }

    catch (error) {

        console.error(
            "Failed to load machines from Google Sheets:",
            error
        );

        // Fallback to localStorage
        loadMachines();

        return machines;

    }

}


// =====================================================
// POST MACHINE TO GOOGLE SHEETS
// =====================================================

async function postMachineToGoogleSheet(
    action,
    payload = {}
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

                    action:
                        action,

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
// GLOBAL VARIABLES
// =====================================================

let machines = [];
let stockItems = [];
let stockTransactions = [];

let editingMachineId = null;


// =====================================================
// STOCK ITEMS
// =====================================================

const DEFAULT_STOCK_ITEMS = [

    {
        name: "DIALYZER",
        unit: "Piece",
        category: "Dialysis Consumables"
    },

    {
        name: "BLOOD LINES",
        unit: "Set",
        category: "Dialysis Consumables"
    },

    {
        name: "IV SET",
        unit: "Set",
        category: "Dialysis Consumables"
    },

    {
        name: "N. S. (Normal Saline)",
        unit: "Bag",
        category: "Dialysis Consumables"
    },

    {
        name: "ACID (PART-A)",
        unit: "Bottle",
        category: "Dialysis Consumables"
    },

    {
        name: "BICARB (PART-B)",
        unit: "Bottle",
        category: "Dialysis Consumables"
    },

    {
        name: "SYRINGE 10CC",
        unit: "Piece",
        category: "Dialysis Consumables"
    },

    {
        name: "SYRINGE 5CC",
        unit: "Piece",
        category: "Dialysis Consumables"
    },

    {
        name: "AVF NEEDLE",
        unit: "Piece",
        category: "Dialysis Consumables"
    },

    {
        name: "LATEX GLOVES",
        unit: "Pair",
        category: "PPE"
    },

    {
        name: "STERILE GLOVES",
        unit: "Pair",
        category: "PPE"
    },

    {
        name: "INJ HEPARN",
        unit: "Vial",
        category: "Medication"
    },

    {
        name: "INJ EPO",
        unit: "Vial",
        category: "Medication"
    },

    {
        name: "INJ IRON",
        unit: "Vial",
        category: "Medication"
    },

    {
        name: "Temporary Catheter",
        unit: "Piece",
        category: "Other"
    }

];


// =====================================================
// GET TODAY
// =====================================================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================================
// LOAD MACHINES
// =====================================================

function loadMachines() {

    try {

        const saved =
            localStorage.getItem(
                MACHINE_STORAGE_KEY
            );

        if (!saved) {

            machines = [];

            return;

        }

        const data =
            JSON.parse(saved);

        machines =
            Array.isArray(data)
                ? data
                : [];

    }

    catch (error) {

        console.error(
            "Error loading machines:",
            error
        );

        machines = [];

    }

}


// =====================================================
// SAVE MACHINES
// =====================================================

function saveMachines() {

    localStorage.setItem(
        MACHINE_STORAGE_KEY,
        JSON.stringify(machines)
    );

}


// =====================================================
// LOAD STOCK
// =====================================================

function loadStock() {

    try {

        const saved =
            localStorage.getItem(
                STOCK_STORAGE_KEY
            );

        if (!saved) {

            stockItems =
                DEFAULT_STOCK_ITEMS.map(
                    item => ({
                        ...item,
                        opening: 0
                    })
                );

            saveStock();

            return;

        }

        const data =
            JSON.parse(saved);

        stockItems =
            Array.isArray(data)
                ? data
                : [];

        /*
         * Make sure all default items
         * exist.
         */

        DEFAULT_STOCK_ITEMS.forEach(
            defaultItem => {

                const exists =
                    stockItems.some(
                        item =>
                            String(
                                item.name
                            ).toLowerCase() ===
                            String(
                                defaultItem.name
                            ).toLowerCase()
                    );

                if (!exists) {

                    stockItems.push({

                        ...defaultItem,

                        opening: 0

                    });

                }

            }
        );

        saveStock();

    }

    catch (error) {

        console.error(
            "Error loading stock:",
            error
        );

        stockItems =
            DEFAULT_STOCK_ITEMS.map(
                item => ({
                    ...item,
                    opening: 0
                })
            );

    }

}


// =====================================================
// SAVE STOCK
// =====================================================

function saveStock() {

    localStorage.setItem(
        STOCK_STORAGE_KEY,
        JSON.stringify(stockItems)
    );

}


// =====================================================
// LOAD STOCK TRANSACTIONS
// =====================================================

function loadStockTransactions() {

    try {

        const saved =
            localStorage.getItem(
                STOCK_TRANSACTION_KEY
            );

        if (!saved) {

            stockTransactions = [];

            return;

        }

        const data =
            JSON.parse(saved);

        stockTransactions =
            Array.isArray(data)
                ? data
                : [];

    }

    catch (error) {

        console.error(
            "Error loading stock transactions:",
            error
        );

        stockTransactions = [];

    }

}


// =====================================================
// SAVE STOCK TRANSACTIONS
// =====================================================

function saveStockTransactions() {

    localStorage.setItem(
        STOCK_TRANSACTION_KEY,
        JSON.stringify(
            stockTransactions
        )
    );

}


// =====================================================
// GET DIALYSIS SESSIONS
// =====================================================

function getDialysisSessionsForMachines() {

    try {

        const saved =
            localStorage.getItem(
                SESSION_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const data =
            JSON.parse(saved);

        return Array.isArray(data)
            ? data
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
// MACHINE ID
// =====================================================

function createMachineId() {

    return (

        Date.now().toString() +

        Math.random()
            .toString(36)
            .substring(2, 8)

    );

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Load local data first
        loadMachines();

        loadStock();

        loadStockTransactions();

        setupMachineForm();

        setupStockForms();

        renderMachines();

        updateMachineSummary();

        renderStock();


        // Load latest machines from Google Sheets
        await loadMachinesFromGoogleSheet();

        renderMachines();

        updateMachineSummary();


        // Start auto refresh
        startMachineAutoRefresh();

    }
);

// =====================================================
// MACHINE FORM
// =====================================================

function setupMachineForm() {

    const form =
        document.getElementById(
            "machineForm"
        );

    if (!form) {

        return;

    }

    form.addEventListener(
        "submit",
        saveMachine
    );

}


// =====================================================
// STOCK FORMS
// =====================================================

function setupStockForms() {

    const receivedForm =
        document.getElementById(
            "receivedStockForm"
        );

    const openingForm =
        document.getElementById(
            "openingStockForm"
        );


    if (receivedForm) {

        receivedForm.addEventListener(
            "submit",
            receiveStock
        );

    }


    if (openingForm) {

        openingForm.addEventListener(
            "submit",
            saveOpeningStock
        );

    }

}


// =====================================================
// SAVE MACHINE
// =====================================================

// =====================================================
// SAVE MACHINE
// =====================================================

async function saveMachine(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "machineName"
        )?.value.trim();


    const code =
        document.getElementById(
            "machineCode"
        )?.value.trim();


    const status =
        document.getElementById(
            "machineStatus"
        )?.value;


    const location =
        document.getElementById(
            "machineLocation"
        )?.value.trim();


    const lastMaintenance =
        document.getElementById(
            "lastMaintenance"
        )?.value;


    const nextMaintenance =
        document.getElementById(
            "nextMaintenance"
        )?.value;


    const notes =
        document.getElementById(
            "machineNotes"
        )?.value.trim();


    // =================================================
    // VALIDATION
    // =================================================

    if (!name) {

        alert(
            "Please enter machine name."
        );

        return;

    }


    if (!code) {

        alert(
            "Please enter machine code."
        );

        return;

    }


    // =================================================
    // CHECK DUPLICATE MACHINE CODE
    // =================================================

    const duplicate =
        machines.find(
            machine =>

                String(
                    machine.code || ""
                )
                .trim()
                .toLowerCase() ===
                code
                    .trim()
                    .toLowerCase()

                &&

                String(
                    machine.id
                ) !==
                String(
                    editingMachineId
                )
        );


    if (duplicate) {

        alert(
            "Machine code already exists."
        );

        return;

    }


    // =================================================
    // MACHINE OBJECT
    // =================================================

    const machine = {

        id:
            editingMachineId ||
            createMachineId(),

        name:
            name,

        code:
            code,

        status:
            status ||
            "Available",

        location:
            location,

        lastMaintenance:
            lastMaintenance,

        nextMaintenance:
            nextMaintenance,

        notes:
            notes,

        createdAt:
            new Date().toISOString()

    };


    // =================================================
    // KEEP ORIGINAL CREATED AT WHEN EDITING
    // =================================================

    if (editingMachineId) {

        const existingMachine =
            machines.find(
                item =>
                    String(item.id) ===
                    String(editingMachineId)
            );


        if (existingMachine) {

            machine.createdAt =
                existingMachine.createdAt ||
                machine.createdAt;

        }

    }


    // =================================================
    // SAVE TO GOOGLE SHEETS
    // =================================================

    try {

        if (editingMachineId) {

            await postMachineToGoogleSheet(
                "updateMachine",
                {
                    machine:
                        machine
                }
            );

        }

        else {

            await postMachineToGoogleSheet(
                "addMachine",
                {
                    machine:
                        machine
                }
            );

        }


        // =================================================
        // UPDATE LOCAL CACHE
        // =================================================

        if (editingMachineId) {

            const index =
                machines.findIndex(
                    item =>
                        String(item.id) ===
                        String(editingMachineId)
                );


            if (index !== -1) {

                machines[index] =
                    machine;

            }

        }

        else {

            machines.push(
                machine
            );

        }


        saveMachines();


        // =================================================
        // REFRESH UI
        // =================================================

        renderMachines();

        updateMachineSummary();

        closeMachineForm();

        resetMachineForm();


        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        alert(
            editingMachineId
                ? "Machine updated successfully! ✓"
                : "Machine added successfully! ✓"
        );

    }

    catch (error) {

        console.error(
            "Error saving machine:",
            error
        );


        alert(
            "Failed to save machine to Google Sheets.\n\n" +
            error.message
        );

    }

}


// =====================================================
// RESET MACHINE FORM
// =====================================================

function resetMachineForm() {

    const form =
        document.getElementById(
            "machineForm"
        );


    if (form) {

        form.reset();

    }


    const status =
        document.getElementById(
            "machineStatus"
        );


    if (status) {

        status.value =
            "Available";

    }


    editingMachineId =
        null;

}


// =====================================================
// OPEN MACHINE FORM
// =====================================================

function openMachineForm() {

    editingMachineId =
        null;

    resetMachineForm();


    const title =
        document.getElementById(
            "machineModalTitle"
        );


    if (title) {

        title.textContent =
            "Add Machine";

    }


    const modal =
        document.getElementById(
            "machineModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE MACHINE FORM
// =====================================================

function closeMachineForm() {

    const modal =
        document.getElementById(
            "machineModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    editingMachineId =
        null;

}


// =====================================================
// EDIT MACHINE
// =====================================================

function editMachine(id) {

    const machine =
        machines.find(
            item =>
                String(
                    item.id
                ) ===
                String(id)
        );


    if (!machine) {

        return;

    }


    editingMachineId =
        machine.id;


    setValue(
        "machineName",
        machine.name
    );

    setValue(
        "machineCode",
        machine.code
    );

    setValue(
        "machineStatus",
        machine.status ||
        "Available"
    );

    setValue(
        "machineLocation",
        machine.location
    );

    setValue(
        "lastMaintenance",
        machine.lastMaintenance
    );

    setValue(
        "nextMaintenance",
        machine.nextMaintenance
    );

    setValue(
        "machineNotes",
        machine.notes
    );


    setText(
        "machineModalTitle",
        "Edit Machine"
    );


    const modal =
        document.getElementById(
            "machineModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// DELETE MACHINE
// =====================================================
// =====================================================
// DELETE MACHINE
// =====================================================

async function deleteMachine(id) {

    const machine =
        machines.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!machine) {

        return;

    }


    const confirmed =
        confirm(
            `Delete ${machine.name}?`
        );


    if (!confirmed) {

        return;

    }


    // =================================================
    // DELETE FROM GOOGLE SHEETS
    // =================================================

    try {

        await postMachineToGoogleSheet(
            "deleteMachine",
            {
                machineId:
                    id
            }
        );


        // =================================================
        // DELETE FROM LOCAL CACHE
        // =================================================

        machines =
            machines.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        saveMachines();


        // =================================================
        // REFRESH UI
        // =================================================

        renderMachines();

        updateMachineSummary();


        alert(
            "Machine deleted successfully! ✓"
        );

    }

    catch (error) {

        console.error(
            "Error deleting machine:",
            error
        );


        alert(
            "Failed to delete machine from Google Sheets.\n\n" +
            error.message
        );

    }

}


// =====================================================
// GET MACHINE SESSIONS
// =====================================================

function getMachineSessions(
    machine,
    sessions
) {

    const machineName =
        String(
            machine.name || ""
        )
        .trim()
        .toLowerCase();


    const machineCode =
        String(
            machine.code || ""
        )
        .trim()
        .toLowerCase();


    return sessions.filter(
        session => {

            const sessionMachine =
                String(
                    session.machine || ""
                )
                .trim()
                .toLowerCase();


            const sessionMachineCode =
                String(
                    session.machineCode || ""
                )
                .trim()
                .toLowerCase();


            return (

                sessionMachine ===
                machineName

                ||

                sessionMachine ===
                machineCode

                ||

                sessionMachineCode ===
                machineCode

            );

        }
    );

}


// =====================================================
// GET TODAY MACHINE SESSIONS
// =====================================================

function getTodayMachineSessions(
    machine,
    sessions
) {

    const machineSessions =
        getMachineSessions(
            machine,
            sessions
        );


    const today =
        getToday();


    return machineSessions.filter(
        session =>
            session.date ===
            today
    );

}


// =====================================================
// ACTIVE SESSION
// =====================================================

function getActiveSession(
    machine,
    sessions
) {

    const todaySessions =
        getTodayMachineSessions(
            machine,
            sessions
        );


    const now =
        new Date();


    const activeSessions =
        todaySessions.filter(
            session => {

                if (
                    !session.startTime
                ) {

                    return false;

                }


                const start =
                    new Date(
                        `${session.date}T${session.startTime}`
                    );


                if (
                    isNaN(
                        start.getTime()
                    )
                ) {

                    return false;

                }


                if (
                    now < start
                ) {

                    return false;

                }


                if (
                    session.endTime
                ) {

                    const end =
                        new Date(
                            `${session.date}T${session.endTime}`
                        );


                    if (
                        !isNaN(
                            end.getTime()
                        )
                        &&
                        now >= end
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    activeSessions.sort(
        (a, b) =>

            String(
                b.startTime || ""
            )
            .localeCompare(
                String(
                    a.startTime || ""
                )
            )
    );


    return (
        activeSessions[0] ||
        null
    );

}


// =====================================================
// LAST USED SESSION
// =====================================================

function getLastUsedSession(
    machine,
    sessions
) {

    const machineSessions =
        getMachineSessions(
            machine,
            sessions
        );


    if (
        machineSessions.length ===
        0
    ) {

        return null;

    }


    const sorted =
        [...machineSessions]
            .sort(
                (a, b) => {

                    const dateA =
                        `${a.date || ""} ${
                            a.startTime ||
                            "00:00"
                        }`;

                    const dateB =
                        `${b.date || ""} ${
                            b.startTime ||
                            "00:00"
                        }`;

                    return dateB.localeCompare(
                        dateA
                    );

                }
            );


    return sorted[0];

}


// =====================================================
// MACHINE INFORMATION
// =====================================================

function getMachineInfo(
    machine,
    sessions
) {

    const todaySessions =
        getTodayMachineSessions(
            machine,
            sessions
        );


    const activeSession =
        getActiveSession(
            machine,
            sessions
        );


    const lastSession =
        getLastUsedSession(
            machine,
            sessions
        );


    let status =
        machine.status ||
        "Available";


    if (
        status ===
        "Maintenance"
    ) {

        status =
            "Maintenance";

    }

    else if (
        activeSession
    ) {

        status =
            "In Use";

    }

    else {

        status =
            "Available";

    }


    return {

        status:

            status,

        currentPatient:

            activeSession
                ? (
                    activeSession.patientName ||
                    "-"
                )
                : "-",

        currentShift:

            activeSession
                ? (
                    activeSession.shift ||
                    "-"
                )
                : "-",

        todaySessions:

            todaySessions.length,

        totalSessions:

            getMachineSessions(
                machine,
                sessions
            ).length,

        lastUsed:

            lastSession
                ? (
                    `${lastSession.date || ""} ${
                        lastSession.startTime || ""
                    }`
                ).trim()
                : "",

        activeSession:

            activeSession

    };

}


// =====================================================
// RENDER MACHINES
// =====================================================

function renderMachines() {

    const tbody =
        document.getElementById(
            "machineTableBody"
        );


    if (!tbody) {

        return;

    }


    const searchInput =
        document.getElementById(
            "machineSearch"
        );


    const filter =
        document.getElementById(
            "machineStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedFilter =
        filter
            ? filter.value
            : "All";


    const sessions =
        getDialysisSessionsForMachines();


    tbody.innerHTML =
        "";


    const filtered =
        machines.filter(
            machine => {

                const info =
                    getMachineInfo(
                        machine,
                        sessions
                    );


                const name =
                    String(
                        machine.name || ""
                    )
                    .toLowerCase();


                const code =
                    String(
                        machine.code || ""
                    )
                    .toLowerCase();


                const location =
                    String(
                        machine.location || ""
                    )
                    .toLowerCase();


                const matchesSearch =

                    name.includes(
                        search
                    )

                    ||

                    code.includes(
                        search
                    )

                    ||

                    location.includes(
                        search
                    );


                const matchesStatus =

                    selectedFilter ===
                    "All"

                    ||

                    info.status ===
                    selectedFilter;


                return (

                    matchesSearch &&
                    matchesStatus

                );

            }
        );


    if (
        filtered.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    No machines found.

                </td>

            </tr>

        `;

        return;

    }


    filtered.forEach(
        machine => {

            const info =
                getMachineInfo(
                    machine,
                    sessions
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            machine.name
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(
                            machine.code
                        )}
                    </small>

                </td>


                <td>

                    ${getStatusBadge(
                        info.status
                    )}

                </td>


                <td>

                    ${
                        info.currentPatient !==
                        "-"
                            ? escapeHTML(
                                info.currentPatient
                            )
                            : "—"
                    }

                </td>


                <td>

                    ${
                        info.currentShift !==
                        "-"
                            ? escapeHTML(
                                info.currentShift
                            )
                            : "—"
                    }

                </td>


                <td>

                    <strong>
                        ${info.todaySessions}
                    </strong>

                </td>


                <td>

                    ${
                        info.lastUsed
                            ? escapeHTML(
                                formatMachineDateTime(
                                    info.lastUsed
                                )
                            )
                            : "—"
                    }

                </td>


                <td>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="viewMachineDetails('${machine.id}')"
                    >
                        View
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        onclick="editMachine('${machine.id}')"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="secondary-button"
                        onclick="deleteMachine('${machine.id}')"
                    >
                        Delete
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// STATUS BADGE
// =====================================================

function getStatusBadge(
    status
) {

    let className =
        "status-badge";


    if (
        status ===
        "Available"
    ) {

        className +=
            " status-available";

    }

    else if (
        status ===
        "In Use"
    ) {

        className +=
            " status-in-use";

    }

    else if (
        status ===
        "Maintenance"
    ) {

        className +=
            " status-maintenance";

    }


    return `

        <span class="${className}">

            ${escapeHTML(
                status
            )}

        </span>

    `;

}


// =====================================================
// MACHINE SUMMARY
// =====================================================

function updateMachineSummary() {

    const sessions =
        getDialysisSessionsForMachines();


    let total =
        machines.length;


    let available =
        0;


    let inUse =
        0;


    let maintenance =
        0;


    machines.forEach(
        machine => {

            const info =
                getMachineInfo(
                    machine,
                    sessions
                );


            if (
                info.status ===
                "Maintenance"
            ) {

                maintenance++;

            }

            else if (
                info.status ===
                "In Use"
            ) {

                inUse++;

            }

            else {

                available++;

            }

        }
    );


    setText(
        "totalMachines",
        total
    );


    setText(
        "availableMachines",
        available
    );


    setText(
        "inUseMachines",
        inUse
    );


    setText(
        "maintenanceMachines",
        maintenance
    );

}


// =====================================================
// MACHINE SEARCH
// =====================================================

function searchMachines() {

    renderMachines();

}


// =====================================================
// MACHINE FILTER
// =====================================================

function filterMachines() {

    renderMachines();

}


// =====================================================
// VIEW MACHINE DETAILS
// =====================================================

function viewMachineDetails(
    id
) {

    const machine =
        machines.find(
            item =>
                String(
                    item.id
                ) ===
                String(id)
        );


    if (!machine) {

        return;

    }


    const sessions =
        getDialysisSessionsForMachines();


    const info =
        getMachineInfo(
            machine,
            sessions
        );


    setText(
        "detailsMachineName",
        machine.name
    );


    setText(
        "detailsStatus",
        info.status
    );


    setText(
        "detailsCode",
        machine.code || "-"
    );


    setText(
        "detailsLocation",
        machine.location || "-"
    );


    setText(
        "detailsPatient",
        info.currentPatient
    );


    setText(
        "detailsShift",
        info.currentShift
    );


    setText(
        "detailsTodaySessions",
        info.todaySessions
    );


    setText(
        "detailsTotalSessions",
        info.totalSessions
    );


    setText(
        "detailsLastMaintenance",
        formatMachineDate(
            machine.lastMaintenance
        )
    );


    setText(
        "detailsNextMaintenance",
        formatMachineDate(
            machine.nextMaintenance
        )
    );


    setText(
        "detailsNotes",
        machine.notes ||
        "No notes available."
    );


    const modal =
        document.getElementById(
            "machineDetailsModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE MACHINE DETAILS
// =====================================================

function closeMachineDetails() {

    const modal =
        document.getElementById(
            "machineDetailsModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// STOCK CALCULATION
// =====================================================

function getStockItem(
    itemName
) {

    return stockItems.find(
        item =>
            String(
                item.name
            )
            .trim()
            .toLowerCase() ===
            String(
                itemName
            )
            .trim()
            .toLowerCase()
    );

}


// =====================================================
// GET RECEIVED STOCK
// =====================================================

function getReceivedQuantity(
    itemName
) {

    return stockTransactions

        .filter(
            transaction =>

                transaction.type ===
                "received"

                &&

                String(
                    transaction.item
                )
                .trim()
                .toLowerCase() ===
                String(
                    itemName
                )
                .trim()
                .toLowerCase()
        )

        .reduce(
            (
                total,
                transaction
            ) =>

                total +
                Number(
                    transaction.quantity
                || 0
                ),

            0
        );

}


// =====================================================
// GET CONSUMPTION
// =====================================================

function getStockConsumption(
    itemName
) {

    const sessions =
        getDialysisSessionsForMachines();


    let total =
        0;


    sessions.forEach(
        session => {

            total +=
                calculateSessionConsumption(
                    session,
                    itemName
                );

        }
    );


    return total;

}


// =====================================================
// CALCULATE SESSION CONSUMPTION
// =====================================================

function calculateSessionConsumption(
    session,
    itemName
) {

    const item =
        String(
            itemName
        )
        .trim()
        .toUpperCase();


    let quantity = 0;


    // =================================================
    // GENERAL DIALYSIS CONSUMPTION
    // =================================================

    if (
        item ===
        "DIALYZER"
    ) {

        quantity = 1;

    }


    else if (
        item ===
        "BLOOD LINES"
    ) {

        quantity = 1;

    }


    else if (
        item ===
        "BICARB (PART-B)"
    ) {

        quantity = 1;

    }


    else if (
        item ===
        "SYRINGE 10CC"
    ) {

        quantity = 1;

    }


    else if (
        item ===
        "ACID (PART-A)"
    ) {

        quantity = 1;

    }


    else if (
        item ===
        "IV SET"
    ) {

        quantity = 2;

    }


    else if (
        item ===
        "N. S. (NORMAL SALINE)"
    ) {

        quantity = 2;

    }


    else if (
        item ===
        "LATEX GLOVES"
    ) {

        quantity = 6;

    }


    // =================================================
    // ACCESS TYPE
    // =================================================

    const accessType =
        String(
            session.patientAccessType ||
            session.accessType ||
            ""
        )
        .trim()
        .toLowerCase();


    // =================================================
    // AVF
    // =================================================

    if (
        accessType ===
        "avf"
    ) {

        if (
            item ===
            "AVF NEEDLE"
        ) {

            quantity = 1;

        }


        if (
            item ===
            "SYRINGE 5CC"
        ) {

            quantity = 1;

        }

    }


    // =================================================
    // CATHETER
    // =================================================

    if (
        accessType ===
        "catheter"
    ) {

        if (
            item ===
            "SYRINGE 5CC"
        ) {

            quantity = 2;

        }


        if (
            item ===
            "IV SET"
        ) {

            /*
             * General IV SET = 2
             * Catheter additional IV SET = 1
             *
             * Total = 3
             */

            quantity = 3;

        }


        if (
            item ===
            "STERILE GLOVES"
        ) {

            quantity = 2;

        }


        /*
         * Temporary catheter only for
         * new catheter patient.
         */

        const isNewPatient =
            session.newPatient === true
            ||

            String(
                session.patientStatus ||
                ""
            )
            .trim()
            .toLowerCase() ===
            "new";


        if (
            item ===
            "TEMPORARY CATHETER"
            &&
            isNewPatient
        ) {

            quantity = 1;

        }

    }


    // =================================================
    // MEDICATION
    // =================================================

    if (
        item ===
        "INJ EPO"
    ) {

        quantity = 1;

    }


    /*
     * Heparin and Iron are left
     * as 0 because their consumption
     * depends on clinical protocol.
     */

    if (
        item ===
        "INJ HEPARN"
    ) {

        quantity = 0;

    }


    if (
        item ===
        "INJ IRON"
    ) {

        quantity = 0;

    }


    return quantity;

}


// =====================================================
// GET CLOSING STOCK
// =====================================================

function getClosingStock(
    itemName
) {

    const item =
        getStockItem(
            itemName
        );


    if (!item) {

        return 0;

    }


    const opening =
        Number(
            item.opening
        || 0
        );


    const received =
        getReceivedQuantity(
            itemName
        );


    const consumed =
        getStockConsumption(
            itemName
        );


    return (
        opening +
        received -
        consumed
    );

}


// =====================================================
// RENDER STOCK
// =====================================================

function renderStock() {

    const tbody =
        document.getElementById(
            "stockTableBody"
        );


    if (!tbody) {

        return;

    }


    const searchInput =
        document.getElementById(
            "stockSearch"
        );


    const categoryFilter =
        document.getElementById(
            "stockCategoryFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "All";


    tbody.innerHTML =
        "";


    const filtered =
        stockItems.filter(
            item => {

                const matchesSearch =

                    String(
                        item.name || ""
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesCategory =

                    category ===
                    "All"

                    ||

                    item.category ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (
        filtered.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    No stock items found.

                </td>

            </tr>

        `;

        return;

    }


    filtered.forEach(
        item => {

            const opening =
                Number(
                    item.opening
                || 0
                );


            const received =
                getReceivedQuantity(
                    item.name
                );


            const consumed =
                getStockConsumption(
                    item.name
                );


            const closing =
                opening +
                received -
                consumed;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            item.name
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(
                            item.category
                        )}
                    </small>

                </td>


                <td>
                    ${escapeHTML(
                        item.unit
                    )}
                </td>


                <td>
                    ${formatNumber(
                        opening
                    )}
                </td>


                <td>
                    ${formatNumber(
                        received
                    )}
                </td>


                <td>
                    ${formatNumber(
                        consumed
                    )}
                </td>


                <td>

                    <strong
                        class="${
                            closing < 0
                                ? "stock-negative"
                                : closing <= 5
                                    ? "stock-low"
                                    : ""
                        }"
                    >
                        ${formatNumber(
                            closing
                        )}
                    </strong>

                </td>


                <td>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="viewStockDetails('${escapeAttribute(
                            item.name
                        )}')"
                    >
                        View
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// SEARCH STOCK
// =====================================================

function searchStock() {

    renderStock();

}


// =====================================================
// FILTER STOCK
// =====================================================

function filterStock() {

    renderStock();

}


// =====================================================
// OPEN RECEIVED STOCK
// =====================================================

function openReceivedStock() {

    const modal =
        document.getElementById(
            "receivedStockModal"
        );


    const form =
        document.getElementById(
            "receivedStockForm"
        );


    if (form) {

        form.reset();

    }


    const date =
        document.getElementById(
            "receivedStockDate"
        );


    if (date) {

        date.value =
            getToday();

    }


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE RECEIVED STOCK
// =====================================================

function closeReceivedStock() {

    const modal =
        document.getElementById(
            "receivedStockModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// RECEIVE STOCK
// =====================================================

function receiveStock(event) {

    event.preventDefault();


    const item =
        document.getElementById(
            "receivedStockItem"
        )?.value;


    const quantity =
        Number(
            document.getElementById(
                "receivedStockQuantity"
            )?.value
            || 0
        );


    const date =
        document.getElementById(
            "receivedStockDate"
        )?.value;


    const reference =
        document.getElementById(
            "receivedStockReference"
        )?.value.trim();


    const notes =
        document.getElementById(
            "receivedStockNotes"
        )?.value.trim();


    if (!item) {

        alert(
            "Please select stock item."
        );

        return;

    }


    if (
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select received date."
        );

        return;

    }


    stockTransactions.push({

        id:
            Date.now(),

        type:
            "received",

        item:
            item,

        quantity:
            quantity,

        date:
            date,

        reference:
            reference,

        notes:
            notes,

        createdAt:
            new Date().toISOString()

    });


    saveStockTransactions();


    renderStock();


    closeReceivedStock();


    alert(
        "Stock received successfully! ✓"
    );

}


// =====================================================
// OPEN OPENING STOCK
// =====================================================

function openOpeningStock() {

    const modal =
        document.getElementById(
            "openingStockModal"
        );


    const form =
        document.getElementById(
            "openingStockForm"
        );


    if (form) {

        form.reset();

    }


    const date =
        document.getElementById(
            "openingStockDate"
        );


    if (date) {

        date.value =
            getToday();

    }


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE OPENING STOCK
// =====================================================

function closeOpeningStock() {

    const modal =
        document.getElementById(
            "openingStockModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// SAVE OPENING STOCK
// =====================================================

function saveOpeningStock(event) {

    event.preventDefault();


    const itemName =
        document.getElementById(
            "openingStockItem"
        )?.value;


    const quantity =
        Number(
            document.getElementById(
                "openingStockQuantity"
            )?.value
            || 0
        );


    const date =
        document.getElementById(
            "openingStockDate"
        )?.value;


    const notes =
        document.getElementById(
            "openingStockNotes"
        )?.value.trim();


    if (!itemName) {

        alert(
            "Please select stock item."
        );

        return;

    }


    if (
        quantity < 0
    ) {

        alert(
            "Opening stock cannot be negative."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select opening date."
        );

        return;

    }


    const item =
        getStockItem(
            itemName
        );


    if (!item) {

        alert(
            "Stock item not found."
        );

        return;

    }


    item.opening =
        quantity;


    item.openingDate =
        date;


    item.openingNotes =
        notes;


    saveStock();


    renderStock();


    closeOpeningStock();


    alert(
        "Opening stock saved successfully! ✓"
    );

}


// =====================================================
// VIEW STOCK DETAILS
// =====================================================

function viewStockDetails(
    itemName
) {

    const item =
        getStockItem(
            itemName
        );


    if (!item) {

        return;

    }


    const opening =
        Number(
            item.opening
        || 0
        );


    const received =
        getReceivedQuantity(
            item.name
        );


    const consumed =
        getStockConsumption(
            item.name
        );


    const closing =
        opening +
        received -
        consumed;


    alert(

        "STOCK DETAILS\n\n" +

        "Item: " +
        item.name +

        "\n\n" +

        "Unit: " +
        item.unit +

        "\n\n" +

        "Category: " +
        item.category +

        "\n\n" +

        "Opening Stock: " +
        opening +

        "\n\n" +

        "Received Stock: " +
        received +

        "\n\n" +

        "Consumed: " +
        consumed +

        "\n\n" +

        "Closing Stock: " +
        closing +

        "\n\n" +

        "Calculation:\n" +

        "Opening + Received - Consumption\n\n" +

        opening +
        " + " +
        received +
        " - " +
        consumed +
        " = " +
        closing

    );

}


// =====================================================
// STOCK CALCULATION REFERENCE
// =====================================================

function showStockCalculationReference() {

    const modal =
        document.getElementById(
            "stockReferenceModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// =====================================================
// CLOSE STOCK REFERENCE
// =====================================================

function closeStockCalculationReference() {

    const modal =
        document.getElementById(
            "stockReferenceModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(
    value
) {

    const number =
        Number(
            value
        || 0
        );


    return Number.isInteger(
        number
    )
        ? String(number)
        : number.toFixed(1);

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatMachineDate(
    value
) {

    if (!value) {

        return "-";

    }


    const parts =
        String(value)
            .split("-");


    if (
        parts.length ===
        3
    ) {

        return (
            `${parts[2]}/${parts[1]}/${parts[0]}`
        );

    }


    return value;

}


// =====================================================
// FORMAT DATE TIME
// =====================================================

function formatMachineDateTime(
    value
) {

    if (!value) {

        return "-";

    }


    const parts =
        String(value)
            .split(" ");


    if (
        parts.length >=
        2
    ) {

        return (

            formatMachineDate(
                parts[0]
            )

            +

            ` ${parts[1]}`

        );

    }


    return formatMachineDate(
        value
    );

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
            value ||
            "";

    }

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
            value ??
            "";

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

    return String(
        value || ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

}


// =====================================================
// AUTO REFRESH
// =====================================================

// =====================================================
// AUTO REFRESH
// =====================================================

function startMachineAutoRefresh() {

    setInterval(
        async function () {

            // =============================================
            // MACHINES FROM GOOGLE SHEETS
            // =============================================

            await loadMachinesFromGoogleSheet();


            // =============================================
            // STOCK REMAINS LOCAL FOR NOW
            // =============================================

            loadStock();

            loadStockTransactions();


            // =============================================
            // REFRESH UI
            // =============================================

            renderMachines();

            updateMachineSummary();

            renderStock();

        },
        5000
    );

}


// =====================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    function (event) {

        const machineModal =
            document.getElementById(
                "machineModal"
            );


        const detailsModal =
            document.getElementById(
                "machineDetailsModal"
            );


        const receivedModal =
            document.getElementById(
                "receivedStockModal"
            );


        const openingModal =
            document.getElementById(
                "openingStockModal"
            );


        const referenceModal =
            document.getElementById(
                "stockReferenceModal"
            );


        if (
            event.target ===
            machineModal
        ) {

            closeMachineForm();

        }


        if (
            event.target ===
            detailsModal
        ) {

            closeMachineDetails();

        }


        if (
            event.target ===
            receivedModal
        ) {

            closeReceivedStock();

        }


        if (
            event.target ===
            openingModal
        ) {

            closeOpeningStock();

        }


        if (
            event.target ===
            referenceModal
        ) {

            closeStockCalculationReference();

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

            closeMachineForm();

            closeMachineDetails();

            closeReceivedStock();

            closeOpeningStock();

            closeStockCalculationReference();

        }

    }
);


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.openMachineForm =
    openMachineForm;

window.closeMachineForm =
    closeMachineForm;

window.closeMachineDetails =
    closeMachineDetails;

window.searchMachines =
    searchMachines;

window.filterMachines =
    filterMachines;

window.editMachine =
    editMachine;

window.deleteMachine =
    deleteMachine;

window.viewMachineDetails =
    viewMachineDetails;


// STOCK

window.openReceivedStock =
    openReceivedStock;

window.closeReceivedStock =
    closeReceivedStock;

window.openOpeningStock =
    openOpeningStock;

window.closeOpeningStock =
    closeOpeningStock;

window.showStockCalculationReference =
    showStockCalculationReference;

window.closeStockCalculationReference =
    closeStockCalculationReference;

window.searchStock =
    searchStock;

window.filterStock =
    filterStock;

window.viewStockDetails =
    viewStockDetails;