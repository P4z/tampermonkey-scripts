// ==UserScript==
// @name         Armagetron Advanced Player Stats Merger
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Summarize and filter Arma Player Stats by regex
// @author       P4@thefarm51.com
// @match        https://browser.armanelgtron.tk/playerstats/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=browser.armanelgtron.tk
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function createUI() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.zIndex = '9999';
        container.style.border = '1px solid #ccc';
        container.style.padding = '10px';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        const label = document.createElement('label');
        label.textContent = 'Regex filter: ';
        label.style.marginRight = '5px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. ^Player';
        input.style.marginRight = '5px';

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.style.marginRight = '5px';
        applyButton.style.cursor = 'pointer';

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.cursor = 'pointer';

        applyButton.onclick = () => {
            const pattern = input.value.trim();
            if (!pattern) return alert('Please enter a valid regular expression!');
            try {
                const regex = new RegExp(pattern, 'i');
                insertSummaryRow(regex);
            } catch (e) {
                alert('Invalid regular expression:\n' + e.message);
            }
        };

        resetButton.onclick = () => {
            const table = document.querySelector("table");
            if (!table) return;

            const rows = Array.from(table.querySelectorAll("tbody tr"));
            rows.forEach(row => {
                row.style.display = ''; // show all rows
            });

            const existing = document.getElementById('summary-row');
            if (existing) existing.remove();
        };

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                applyButton.click();
            }
        });

        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(applyButton);
        container.appendChild(resetButton);
        document.body.appendChild(container);
    }

    function parseNumber(str) {
        return parseFloat(str.replace(/,/g, '')) || 0;
    }

    function formatNumber(value) {
        return parseFloat(value.toFixed(6)).toString();
    }

    function insertSummaryRow(regex) {
        const table = document.querySelector("table");
        if (!table) return;

        const existing = document.getElementById('summary-row');
        if (existing) existing.remove();

        const rows = Array.from(table.querySelectorAll("tbody tr"));
        let totalTime = 0;
        let totalFraction = 0;
        let totalLastSeen = 0;
        let matchCount = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 5) return;
            const playerName = cells[1]?.innerText.trim();
            if (regex.test(playerName)) {
                row.style.display = '';
                totalTime += parseNumber(cells[2].innerText);
                totalFraction += parseNumber(cells[3].innerText);
                totalLastSeen += parseNumber(cells[4].innerText);
                matchCount++;
            } else {
                row.style.display = 'none';
            }
        });

        if (matchCount > 0) {
            const newRow = document.createElement("tr");
            newRow.id = 'summary-row';

            const tdIndex = document.createElement("td");
            tdIndex.textContent = '0';
            newRow.appendChild(tdIndex);

            const tdName = document.createElement("td");
            tdName.textContent = 'SUMMARY';
            newRow.appendChild(tdName);

            const tdTime = document.createElement("td");
            tdTime.textContent = formatNumber(totalTime);
            tdTime.style.textAlign = 'right';
            newRow.appendChild(tdTime);

            const tdFraction = document.createElement("td");
            tdFraction.textContent = formatNumber(totalFraction);
            tdFraction.style.textAlign = 'right';
            newRow.appendChild(tdFraction);

            const tdLastSeen = document.createElement("td");
            tdLastSeen.textContent = formatNumber(totalLastSeen);
            tdLastSeen.style.textAlign = 'right';
            newRow.appendChild(tdLastSeen);

            const tbody = table.querySelector("tbody");
            const firstDataRow = tbody.querySelector("tr");
            if (firstDataRow) {
                tbody.insertBefore(newRow, firstDataRow.nextSibling);
            } else {
                tbody.appendChild(newRow);
            }
        } else {
            alert('No players matched the regular expression.');
        }
    }

    const waitForTable = setInterval(() => {
        if (document.querySelector("table")) {
            clearInterval(waitForTable);
            createUI();
        }
    }, 500);
})();
