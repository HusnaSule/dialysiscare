// =====================================================
// DIALYSISCARE - DASHBOARD
// File: app.js
// =====================================================

"use strict";


// =====================================================
// STORAGE KEYS
// =====================================================

const PATIENT_STORAGE_KEY =
    "patients";

const SESSION_STORAGE_KEY =
    "dialysisSessions";

const MACHINE_STORAGE_KEY =
    "dialysisMachines";


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCurrentDate();

        loadDashboard();

        startDashboardRefresh();

    }
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
        )
        .padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// =====================================================
// CURRENT DATE
// =====================================================

function updateCurrentDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {

        return;

    }


    const today =
        new Date();


    const options = {

        weekday:
            "long",

        year:
            "numeric",

        month:
            "long",

        day:
            "numeric"

    };


    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );

}


// =====================================================
// READ LOCAL STORAGE
// =====================================================

function getStorageArray(
    key
) {

    try {

        const saved =
            localStorage.getItem(
                key
            );


        if (!saved) {

            return [];

        }


        const data =
            JSON.parse(
                saved
            );


        return Array.isArray(data)
            ? data
            : [];

    }

    catch (error) {

        console.error(
            "Storage error:",
            error
        );

        return [];

    }

}


// =====================================================
// GET PATIENTS
// =====================================================

function getPatients() {

    return getStorageArray(
        PATIENT_STORAGE_KEY
    );

}


// =====================================================
// GET SESSIONS
// =====================================================

function getSessions() {

    return getStorageArray(
        SESSION_STORAGE_KEY
    );

}


// =====================================================
// GET MACHINES
// =====================================================

function getMachines() {

    return getStorageArray(
        MACHINE_STORAGE_KEY
    );

}


// =====================================================
// NORMALIZE APPROVAL STATUS
// =====================================================

function normalizeApprovalStatus(
    session
) {

    const status =
        String(
            session.approvalStatus ||
            ""
        )
        .trim()
        .toLowerCase();


    if (

        status === "approved"

        ||

        status === "approve"

        ||

        status === "yes"

    ) {

        return "Approved";

    }


    if (

        status === "rejected"

        ||

        status === "reject"

    ) {

        return "Rejected";

    }


    return "Pending";

}


// =====================================================
// GET TODAY SESSIONS
// =====================================================

function getTodaySessions() {

    const today =
        getToday();


    return getSessions()
        .filter(
            session => {

                return (

                    String(
                        session.date ||
                        ""
                    )
                    .trim()

                    ===

                    today

                );

            }
        );

}


// =====================================================
// GET TODAY'S PATIENTS
// =====================================================

function getTodayPatients(
    sessions,
    patients
) {

    const patientIds =
        new Set();


    sessions.forEach(
        session => {

            const id =
                String(
                    session.patientId ||
                    ""
                )
                .trim();


            if (id) {

                patientIds.add(
                    id
                );

            }

        }
    );


    const result =
        [];


    patientIds.forEach(
        id => {

            const patient =
                patients.find(
                    item =>

                        String(
                            item.id ||
                            ""
                        )
                        .trim() ===
                        id
                );


            if (patient) {

                result.push(
                    patient
                );

            }

        }
    );


    return result;

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

function loadDashboard() {

    const sessions =
        getTodaySessions();


    const patients =
        getPatients();


    const machines =
        getMachines();


    updateMainStats(
        sessions,
        patients
    );


    updateApprovalStats(
        sessions
    );


    updateAccessSummary(
        sessions
    );


    updatePatientTypeSummary(
        sessions,
        patients
    );


    renderTodaySessions(
        sessions
    );


    renderMachineStatus(
        machines,
        sessions
    );

}


// =====================================================
// MAIN STATS
// =====================================================

function updateMainStats(
    sessions,
    patients
) {

    const todayPatients =
        getTodayPatients(
            sessions,
            patients
        );


    setText(
        "todayPatients",
        todayPatients.length
    );


    setText(
        "todaySessions",
        sessions.length
    );

}


// =====================================================
// APPROVAL STATS
// =====================================================

function updateApprovalStats(
    sessions
) {

    const approved =
        sessions.filter(
            session =>

                normalizeApprovalStatus(
                    session
                ) ===
                "Approved"

        ).length;


    const waitingApproval =
        sessions.filter(
            session =>

                normalizeApprovalStatus(
                    session
                ) ===
                "Pending"

        ).length;


    setText(
        "approvedSessions",
        approved
    );


    setText(
        "waitingApproval",
        waitingApproval
    );

}


// =====================================================
// ACCESS SUMMARY
// =====================================================

function updateAccessSummary(
    sessions
) {

    let avf =
        0;


    let catheter =
        0;


    sessions.forEach(
        session => {

            const access =
                String(
                    session.accessType ||
                    session.patientAccessType ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                access ===
                "avf"
            ) {

                avf++;

            }


            else if (
                access ===
                "catheter"
            ) {

                catheter++;

            }

        }
    );


    setText(
        "avfCount",
        avf
    );


    setText(
        "catheterCount",
        catheter
    );

}


// =====================================================
// PATIENT TYPE SUMMARY
// =====================================================

function updatePatientTypeSummary(
    sessions,
    patients
) {

    let newPatients =
        0;


    let oldPatients =
        0;


    sessions.forEach(
        session => {

            let patientType =
                session.patientType;


            // If the session does not have
            // patient type, check patient record.

            if (!patientType) {

                const patient =
                    patients.find(
                        item =>

                            String(
                                item.id ||
                                ""
                            )
                            .trim() ===

                            String(
                                session.patientId ||
                                ""
                            )
                            .trim()
                    );


                if (patient) {

                    patientType =
                        patient.patientType;

                }

            }


            const type =
                String(
                    patientType ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (

                type ===
                "new"

                ||

                type ===
                "new patient"

            ) {

                newPatients++;

            }


            else if (

                type ===
                "old"

                ||

                type ===
                "old patient"

            ) {

                oldPatients++;

            }

        }
    );


    setText(
        "newPatientsCount",
        newPatients
    );


    setText(
        "oldPatientsCount",
        oldPatients
    );

}


// =====================================================
// RENDER TODAY'S SESSIONS
// =====================================================

function renderTodaySessions(
    sessions
) {

    const tbody =
        document.getElementById(
            "dashboardSessionsBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


    if (
        sessions.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#6b7280;
                    "
                >

                    No dialysis sessions for today.

                </td>

            </tr>

        `;

        return;

    }


    const sortedSessions =
        [...sessions]
            .sort(
                (a, b) => {

                    return String(
                        a.startTime ||
                        "99:99"
                    )
                    .localeCompare(
                        String(
                            b.startTime ||
                            "99:99"
                        )
                    );

                }
            );


    sortedSessions.forEach(
        session => {

            const row =
                document.createElement(
                    "tr"
                );


            const patientName =
                session.patientName ||
                session.name ||
                "-";


            const patientId =
                session.patientId ||
                "-";


            const shift =
                session.shift ||
                "-";


            const access =
                session.accessType ||
                session.patientAccessType ||
                "-";


            const machine =
                session.machine ||
                "-";


            const startTime =
                session.startTime ||
                "-";


            const doctorResponse =
                session.doctorResponseTime ||
                "-";


            const approval =
                normalizeApprovalStatus(
                    session
                );


            const approvalTime =
                session.approvalTime ||
                "-";


            const endTime =
                session.endTime ||
                "-";


            row.innerHTML = `

                <!-- PATIENT -->

                <td>

                    <strong>
                        ${escapeHTML(
                            patientName
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            patientId
                        )}
                    </small>

                </td>


                <!-- SHIFT -->

                <td>
                    ${escapeHTML(
                        shift
                    )}
                </td>


                <!-- ACCESS -->

                <td>
                    ${escapeHTML(
                        access
                    )}
                </td>


                <!-- MACHINE -->

                <td>
                    ${escapeHTML(
                        machine
                    )}
                </td>


                <!-- START -->

                <td>
                    ${escapeHTML(
                        startTime
                    )}
                </td>


                <!-- DOCTOR RESPONSE -->

                <td>
                    ${escapeHTML(
                        doctorResponse
                    )}
                </td>


                <!-- APPROVAL -->

                <td>

                    <span
                        class="
                            dashboard-approval
                            approval-${approval.toLowerCase()}
                        "
                    >

                        ${escapeHTML(
                            approval
                        )}

                    </span>

                </td>


                <!-- APPROVAL TIME -->

                <td>
                    ${escapeHTML(
                        approvalTime
                    )}
                </td>


                <!-- END -->

                <td>
                    ${escapeHTML(
                        endTime
                    )}
                </td>
                <td class="dashboard-remark">
    ${session.remark || "-"}
</td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// MACHINE STATUS
// =====================================================

function renderMachineStatus(
    machines,
    sessions
) {

    const container =
        document.getElementById(
            "dashboardMachineList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        machines.length ===
        0
    ) {

        container.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                    color:#6b7280;
                "
            >

                No machines registered.

            </div>

        `;

        return;

    }


    machines.forEach(
        machine => {

            const machineName =
                machine.name ||
                machine.code ||
                "Machine";


            const machineCode =
                machine.code ||
                "";


            const machineNameLower =
                String(
                    machine.name ||
                    ""
                )
                .trim()
                .toLowerCase();


            const machineCodeLower =
                String(
                    machine.code ||
                    ""
                )
                .trim()
                .toLowerCase();


            const active =
                sessions.some(
                    session => {

                        const sessionMachine =
                            String(
                                session.machine ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        const sameMachine =

                            sessionMachine ===
                            machineNameLower

                            ||

                            sessionMachine ===
                            machineCodeLower;


                        return (
                            sameMachine
                        );

                    }
                );


            let status =
                String(
                    machine.status ||
                    "Available"
                );


            if (
                status ===
                "Maintenance"
            ) {

                status =
                    "Maintenance";

            }

            else if (
                active
            ) {

                status =
                    "In Use";

            }

            else {

                status =
                    "Available";

            }


            let statusClass =
                "available";


            if (
                status ===
                "In Use"
            ) {

                statusClass =
                    "busy";

            }


            else if (
                status ===
                "Maintenance"
            ) {

                statusClass =
                    "maintenance";

            }


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "machine-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            machineName
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            machineCode
                        )}
                    </span>

                </div>


                <span
                    class="
                        machine-status
                        ${statusClass}
                    "
                >

                    ${escapeHTML(
                        status
                    )}

                </span>

            `;


            container.appendChild(
                item
            );

        }
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
// AUTO REFRESH
// =====================================================

function startDashboardRefresh() {

    setInterval(
        function () {

            updateCurrentDate();

            loadDashboard();

        },
        3000
    );

}