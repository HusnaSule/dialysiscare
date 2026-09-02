/* =========================================================
   DIALYSISCARE
   DDR REPORT
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =================================================
           CONSTANTS
           ================================================= */

        const MODE_OF_DIALYSIS =
            "HEMODIALYSIS";

        const ZNZ_CTZN_AMOUNT =
            240000;

        const ZHSF_AMOUNT =
            240000;

        const CASH_AMOUNT =
            240000;

        const EPO_AMOUNT =
            66000;


        /* =================================================
           ELEMENTS
           ================================================= */

        const dateFromInput =
            document.getElementById(
                "dateFrom"
            );

        const dateToInput =
            document.getElementById(
                "dateTo"
            );

        const searchButton =
            document.getElementById(
                "searchDDR"
            );

        const exportButton =
            document.getElementById(
                "exportDDR"
            );

        const tableBody =
            document.getElementById(
                "ddrTableBody"
            );

        const resultCount =
            document.getElementById(
                "resultCount"
            );

        const reportStatus =
            document.getElementById(
                "reportStatus"
            );

        const totalZnz =
            document.getElementById(
                "totalZnzAmount"
            );

        const totalCash =
            document.getElementById(
                "totalCashAmount"
            );

        const grandTotal =
            document.getElementById(
                "grandTotalAmount"
            );


        /* =================================================
           GET DIALYSIS SESSIONS
           ================================================= */

        function getDialysisSessions() {

            try {

                const data =
                    localStorage.getItem(
                        "dialysisSessions"
                    );


                if (!data) {

                    return [];

                }


                const sessions =
                    JSON.parse(data);


                if (
                    !Array.isArray(
                        sessions
                    )
                ) {

                    return [];

                }


                return sessions;

            }

            catch (error) {

                console.error(
                    "Error reading dialysis sessions:",
                    error
                );

                return [];

            }

        }


        /* =================================================
           GET PATIENTS
           ================================================= */

        function getPatients() {

            try {

                const data =
                    localStorage.getItem(
                        "patients"
                    );


                if (!data) {

                    return [];

                }


                const patients =
                    JSON.parse(data);


                if (
                    !Array.isArray(
                        patients
                    )
                ) {

                    return [];

                }


                return patients;

            }

            catch (error) {

                console.error(
                    "Error reading patients:",
                    error
                );

                return [];

            }

        }


        /* =================================================
           NORMALIZE ID
           ================================================= */

        function normalizeId(
            value
        ) {

            return String(
                value || ""
            )
                .trim()
                .toUpperCase();

        }


        /* =================================================
           FIND PATIENT
           ================================================= */

        function findPatient(
            session
        ) {

            const patients =
                getPatients();


            const sessionPatientId =
                normalizeId(
                    session.patientId
                );


            return patients.find(
                patient => {

                    return (
                        normalizeId(
                            patient.id
                        ) ===
                        sessionPatientId
                    );

                }
            ) || null;

        }


        /* =================================================
           GET PANEL
           ================================================= */

        function getPanel(
            session
        ) {

            /*
             * First use panel saved
             * inside dialysis session.
             */

            if (
                session.panel
            ) {

                return String(
                    session.panel
                )
                    .trim()
                    .toUpperCase();

            }


            /*
             * If session does not
             * contain panel, get it
             * from patient record.
             */

            const patient =
                findPatient(
                    session
                );


            if (
                patient &&
                patient.panel
            ) {

                return String(
                    patient.panel
                )
                    .trim()
                    .toUpperCase();

            }


            return "";

        }


        /* =================================================
           GET EPO VALUE
           ================================================= */

        function getEPO(
            session
        ) {

            const value =
                session.erythropoietin ??
                session.epo ??
                session.epoGiven ??
                "No";


            const text =
                String(
                    value
                )
                    .trim()
                    .toLowerCase();


            if (
                text === "yes" ||
                text === "true" ||
                text === "1"
            ) {

                return "Yes";

            }


            return "No";

        }


        /* =================================================
           CALCULATE BILLING
           ================================================= */

        function calculateBilling(
            session
        ) {

            const panel =
                getPanel(
                    session
                );


            let znzCtznAmount =
                0;

            let cashAmount =
                0;

            let epoAmount =
                0;


            /* =============================================
               ZNZ CTZN
               ============================================= */

            if (
                panel ===
                "ZANZIBAR CITIZEN"
            ) {

                znzCtznAmount =
                    ZNZ_CTZN_AMOUNT;

            }


            /* =============================================
               ZHSF
               ============================================= */

            else if (
                panel ===
                "ZHSF"
            ) {

                znzCtznAmount =
                    ZHSF_AMOUNT;

            }


            /* =============================================
               CASH
               ============================================= */

            else if (
                panel ===
                "CASH"
            ) {

                cashAmount =
                    CASH_AMOUNT;

            }


            /* =============================================
               EPO
               ============================================= */

            const epo =
                getEPO(
                    session
                );


            if (
                epo === "Yes"
            ) {

                epoAmount =
                    EPO_AMOUNT;

            }


            /* =============================================
               TOTAL
               ============================================= */

            const totalAmount =
                znzCtznAmount +
                cashAmount +
                epoAmount;


            return {

                panel,

                epo,

                znzCtznAmount,

                cashAmount,

                epoAmount,

                totalAmount

            };

        }


        /* =================================================
           FORMAT MONEY
           ================================================= */

        function formatMoney(
            value
        ) {

            return (
                Number(
                    value
                ) || 0
            )
                .toLocaleString(
                    "en-US"
                );

        }


        /* =================================================
           FORMAT DATE
           ================================================= */

        function formatDate(
            value
        ) {

            if (!value) {

                return "-";

            }


            const parts =
                String(
                    value
                ).split("-");


            if (
                parts.length !== 3
            ) {

                return value;

            }


            return (
                parts[2] +
                "/" +
                parts[1] +
                "/" +
                parts[0]
            );

        }


        /* =================================================
           ESCAPE HTML
           ================================================= */

        function escapeHTML(
            value
        ) {

            return String(
                value ?? ""
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


        /* =================================================
           GET REPORT RECORDS
           ================================================= */

        function getReportRecords() {

            const from =
                dateFromInput.value;

            const to =
                dateToInput.value;


            if (
                !from ||
                !to
            ) {

                return [];

            }


            const sessions =
                getDialysisSessions();


            return sessions
                .filter(
                    session => {

                        if (
                            !session.date
                        ) {

                            return false;

                        }


                        return (
                            session.date >=
                            from
                            &&
                            session.date <=
                            to
                        );

                    }
                )
                .sort(
                    (a, b) => {

                        const dateA =
                            String(
                                a.date || ""
                            );

                        const dateB =
                            String(
                                b.date || ""
                            );


                        return dateA.localeCompare(
                            dateB
                        );

                    }
                );

        }


        /* =================================================
           RENDER REPORT
           ================================================= */

        function renderReport() {

            const records =
                getReportRecords();


            tableBody.innerHTML =
                "";


            let znzTotal =
                0;

            let cashTotal =
                0;

            let grandTotalValue =
                0;


            /* =============================================
               NO RECORDS
               ============================================= */

            if (
                records.length === 0
            ) {

                tableBody.innerHTML = `

                    <tr>

                        <td
                            colspan="13"
                            class="empty-state"
                        >

                            No dialysis records
                            found for the selected
                            date range.

                        </td>

                    </tr>

                `;


                resultCount.textContent =
                    "0 records";


                reportStatus.textContent =
                    "No records found";


                totalZnz.textContent =
                    "0";


                totalCash.textContent =
                    "0";


                grandTotal.textContent =
                    "0";


                return;

            }


            /* =============================================
               CREATE ROWS
               ============================================= */

            records.forEach(
                session => {


                    const billing =
                        calculateBilling(
                            session
                        );


                    znzTotal +=
                        billing.znzCtznAmount;


                    cashTotal +=
                        billing.cashAmount;


                    grandTotalValue +=
                        billing.totalAmount;


                    const row =
                        document.createElement(
                            "tr"
                        );


                    const epoClass =
                        billing.epo === "Yes"
                            ? "epo-yes"
                            : "epo-no";


                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                formatDate(
                                    session.date
                                )
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                session.shift ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                session.machine ||
                                "-"
                            )}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    session.patientId ||
                                    "-"
                                )}
                            </strong>

                        </td>


                        <td>
                            ${escapeHTML(
                                session.patientName ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                session.startTime ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                session.endTime ||
                                "-"
                            )}
                        </td>


                        <td>

                            <span class="${epoClass}">

                                ${billing.epo}

                            </span>

                        </td>


                        <td>
                            ${formatMoney(
                                billing.znzCtznAmount
                            )}
                        </td>


                        <td>
                            ${formatMoney(
                                billing.cashAmount
                            )}
                        </td>


                        <td>

                            <span class="mode-badge">

                                ${MODE_OF_DIALYSIS}

                            </span>

                        </td>


                        <td>

                            <strong>

                                ${formatMoney(
                                    billing.totalAmount
                                )}

                            </strong>

                        </td>


                        <td>

                            <span class="panel-badge">

                                ${escapeHTML(
                                    billing.panel ||
                                    "-"
                                )}

                            </span>

                        </td>

                    `;


                    tableBody.appendChild(
                        row
                    );

                }
            );


            /* =============================================
               SUMMARY
               ============================================= */

            resultCount.textContent =
                records.length +
                (
                    records.length === 1
                        ? " record"
                        : " records"
                );


            reportStatus.textContent =
                "Report generated";


            totalZnz.textContent =
                formatMoney(
                    znzTotal
                );


            totalCash.textContent =
                formatMoney(
                    cashTotal
                );


            grandTotal.textContent =
                formatMoney(
                    grandTotalValue
                );

        }


        /* =================================================
           SEARCH BUTTON
           ================================================= */

        searchButton.addEventListener(
            "click",
            function () {

                const from =
                    dateFromInput.value;

                const to =
                    dateToInput.value;


                if (
                    !from ||
                    !to
                ) {

                    alert(
                        "Please select Date From and Date To."
                    );

                    return;

                }


                if (
                    from > to
                ) {

                    alert(
                        "Date From cannot be greater than Date To."
                    );

                    return;

                }


                renderReport();

            }
        );


        /* =================================================
           EXPORT DDR
           ================================================= */

        exportButton.addEventListener(
            "click",
            function () {

                const records =
                    getReportRecords();


                if (
                    records.length === 0
                ) {

                    alert(
                        "No DDR records to export."
                    );

                    return;

                }


                if (
                    typeof XLSX ===
                    "undefined"
                ) {

                    alert(
                        "Excel export library is not loaded."
                    );

                    return;

                }


                const exportData =
                    records.map(
                        session => {

                            const billing =
                                calculateBilling(
                                    session
                                );


                            return {

                                "DATE":
                                    formatDate(
                                        session.date
                                    ),

                                "SHIFT":
                                    session.shift ||
                                    "",

                                "BED / MACHINE":
                                    session.machine ||
                                    "",

                                "PATIENT ID":
                                    session.patientId ||
                                    "",

                                "PATIENT NAME":
                                    session.patientName ||
                                    "",

                                "START TIME":
                                    session.startTime ||
                                    "",

                                "END TIME":
                                    session.endTime ||
                                    "",

                                "ERYTHROPOIETIN":
                                    billing.epo,

                                "ZNZ CTZN AMOUNT":
                                    billing.znzCtznAmount,

                                "CASH AMOUNT":
                                    billing.cashAmount,

                                "MODE OF DIALYSIS":
                                    MODE_OF_DIALYSIS,

                                "TOTAL AMOUNT":
                                    billing.totalAmount,

                                "PANEL":
                                    billing.panel ||
                                    ""

                            };

                        }
                    );


                /* =========================================
                   CREATE WORKSHEET
                   ========================================= */

                const worksheet =
                    XLSX.utils.json_to_sheet(
                        exportData
                    );


                worksheet["!cols"] = [

                    { wch: 14 },

                    { wch: 12 },

                    { wch: 18 },

                    { wch: 20 },

                    { wch: 28 },

                    { wch: 14 },

                    { wch: 14 },

                    { wch: 18 },

                    { wch: 20 },

                    { wch: 18 },

                    { wch: 22 },

                    { wch: 18 },

                    { wch: 16 }

                ];


                /* =========================================
                   CREATE WORKBOOK
                   ========================================= */

                const workbook =
                    XLSX.utils.book_new();


                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "DDR Report"
                );


                /* =========================================
                   FILE NAME
                   ========================================= */

                const from =
                    dateFromInput.value;

                const to =
                    dateToInput.value;


                const fileName =
                    `DDR_Report_${from}_${to}.xlsx`;


                /* =========================================
                   DOWNLOAD
                   ========================================= */

                XLSX.writeFile(
                    workbook,
                    fileName
                );


                reportStatus.textContent =
                    "DDR exported successfully";

            }
        );


        /* =================================================
           DEFAULT DATE
           ================================================= */

        function setDefaultDates() {

            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(
                    today.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            const day =
                String(
                    today.getDate()
                )
                    .padStart(
                        2,
                        "0"
                    );


            const todayString =
                `${year}-${month}-${day}`;


            dateFromInput.value =
                todayString;


            dateToInput.value =
                todayString;

        }


        /* =================================================
           LOGOUT
           ================================================= */

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (
            logoutButton
        ) {

            logoutButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const confirmed =
                        confirm(
                            "Are you sure you want to logout?"
                        );


                    if (
                        confirmed
                    ) {

                        window.location.href =
                            "../index.html";

                    }

                }
            );

        }


        /* =================================================
           INITIALIZE
           ================================================= */

        setDefaultDates();

    }
);