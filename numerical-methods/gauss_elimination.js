var sizeSelect = document.getElementById('sizeSelect');
var matrixGrid = document.getElementById('matrixGrid');

// --- BUILD THE GRID: creates the input boxes based on selected size ---
function buildGrid() {
    var n = parseInt(sizeSelect.value);
    var html = '<table class="matrix-table">';

    for (var i = 0; i < n; i++) {
        html += '<tr>';
        for (var j = 0; j < n; j++) {
            html += '<td><input type="text" class="matrix-input" id="cell-' + i + '-' + j + '" placeholder="0"></td>';
        }
        html += '<td class="eq-sign">=</td>';
        html += '<td><input type="text" class="matrix-input" id="cell-' + i + '-' + n + '" placeholder="0"></td>';
        html += '</tr>';
    }

    html += '</table>';
    matrixGrid.innerHTML = html;
}

// Build the grid immediately when the page loads, and rebuild it whenever the size changes
buildGrid();
sizeSelect.addEventListener('change', buildGrid);

// --- MAIN LOGIC: runs when the user clicks "Calculate" ---
document.getElementById('calcBtn').addEventListener('click', function () {
    var n = parseInt(sizeSelect.value);
    var matrix = [];
    var hasError = false;

    // --- Read every box into a 2D array, and validate as we go ---
    for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j <= n; j++) {
            var cell = document.getElementById('cell-' + i + '-' + j);
            cell.classList.remove('input-error');

            var value = parseFloat(cell.value);

            if (isNaN(value)) {
                cell.classList.add('input-error');
                hasError = true;
                value = 0;
            }

            row.push(value);
        }
        matrix.push(row);
    }

    if (hasError) {
        displayError('Please fill in every box with a valid number.');
        return;
    }

    // --- FORWARD ELIMINATION: turn the matrix into upper-triangular form ---
    var steps = [];

    for (var col = 0; col < n; col++) {

        // Partial pivoting: swap rows if the current pivot is 0 or very small
        var pivotRow = col;
        for (var r = col + 1; r < n; r++) {
            if (Math.abs(matrix[r][col]) > Math.abs(matrix[pivotRow][col])) {
                pivotRow = r;
            }
        }

        if (Math.abs(matrix[pivotRow][col]) < 1e-10) {
            displayError('This system has no unique solution (a column became all zeros).');
            return;
        }

        if (pivotRow !== col) {
            var temp = matrix[col];
            matrix[col] = matrix[pivotRow];
            matrix[pivotRow] = temp;
        }

        // Eliminate all rows below the pivot
        for (var r = col + 1; r < n; r++) {
            var factor = matrix[r][col] / matrix[col][col];
            for (var c = col; c <= n; c++) {
                matrix[r][c] -= factor * matrix[col][c];
            }
        }

        steps.push(cloneMatrix(matrix));
    }

    // --- BACK SUBSTITUTION: solve for each variable, starting from the last row ---
    var solution = new Array(n).fill(0);

    for (var i = n - 1; i >= 0; i--) {
        var sum = matrix[i][n];
        for (var j = i + 1; j < n; j++) {
            sum -= matrix[i][j] * solution[j];
        }
        solution[i] = sum / matrix[i][i];
    }

    displayResults(steps, solution);
});

// --- HELPER: makes a deep copy of the matrix, so saved steps don't change later ---
function cloneMatrix(matrix) {
    return matrix.map(function (row) {
        return row.slice();
    });
}

// --- HELPER: shows an error message in the results box ---
function displayError(message) {
    document.getElementById('results').innerHTML = '<p class="error">' + message + '</p>';
}

// --- HELPER: builds the final solution + step tables ---
function displayResults(steps, solution) {
    var html = '';

    for (var s = 0; s < steps.length; s++) {
        html += '<p class="hint">After eliminating column ' + (s + 1) + ':</p>';
        html += matrixToTable(steps[s]);
    }

    html += '<p><strong>Solution:</strong></p><ul class="solution-list">';
    for (var i = 0; i < solution.length; i++) {
        html += '<li>x' + (i + 1) + ' = ' + solution[i].toFixed(4) + '</li>';
    }
    html += '</ul>';

    document.getElementById('results').innerHTML = html;
}

// --- HELPER: turns one matrix snapshot into an HTML table ---
function matrixToTable(matrix) {
    var html = '<table class="step-table">';
    for (var i = 0; i < matrix.length; i++) {
        html += '<tr>';
        for (var j = 0; j < matrix[i].length; j++) {
            html += '<td>' + matrix[i][j].toFixed(2) + '</td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}