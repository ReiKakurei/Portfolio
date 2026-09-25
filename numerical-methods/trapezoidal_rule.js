var funcInput = document.getElementById('funcInput');
var aInput = document.getElementById('aInput');
var bInput = document.getElementById('bInput');
var nInput = document.getElementById('nInput');

// --- LIVE PREVIEW: runs every time the user types in the function box ---
funcInput.addEventListener('input', function () {
    var raw = funcInput.value;
    var latex = raw.replace(/\*/g, ' \\cdot ');

    try {
        katex.render(latex, document.getElementById('funcPreview'));
    } catch (err) {
        document.getElementById('funcPreview').innerHTML = '';
    }
});

document.getElementById('calcBtn').addEventListener("click", () => {
    // 1. Clear old red borders
    funcInput.classList.remove('input-error');
    aInput.classList.remove('input-error');
    bInput.classList.remove('input-error');
    nInput.classList.remove('input-error');

    const functionValue = funcInput.value.trim();
    const a = Number(aInput.value);
    const b = Number(bInput.value);
    const n = Number(nInput.value);

    // 2. Validate inputs

    if (functionValue === "") {
        funcInput.classList.add("input-error");
        displayError("Please enter a function.");
        return;
    }

    if (!Number.isFinite(a)) {
        aInput.classList.add("input-error");
        displayError("Please enter a valid value for a.");
        return;
    }

    if (!Number.isFinite(b)) {
        bInput.classList.add("input-error");
        displayError("Please enter a valid value for b.");
        return;
    }

    if (!Number.isFinite(n) || n <= 0) {
        nInput.classList.add("input-error");
        displayError("n must be a number greater than 0.");
        return;
    }

    if (a >= b) {
        aInput.classList.add("input-error");
        bInput.classList.add("input-error");
        displayError("a must be less than b.");
        return;
    }

    // 3. Build the function
    let f;

    try {
    const jsExpr = functionValue.replace(/\^/g, '**');
    f = new Function("x", `return ${jsExpr};`);
    f(a);
    } catch (error) {
        funcInput.classList.add("input-error");
        displayError("Invalid function.");
        return;
    }

    // 4. Calculate h
    const h = (b - a) / n;

    let sum = 0;
    const rows = [];

    // 5. Calculate each point
    for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        const fx = f(x);

        let coefficient;

        if (i === 0 || i === n) {
            coefficient = 1;
        } else {
            coefficient = 2;
        }

        sum += coefficient * fx;

        rows.push({
            i: i,
            x: x,
            fx: fx,
            coefficient: coefficient
        });
    }

    // 6. Trapezoidal rule
    const result = (h / 2) * sum;

    // 7. Display result
    displayResults(rows, result);
});

// --- HELPER: shows an error message in the results box ---
function displayError(message) {
    document.getElementById('results').innerHTML = '<p class="error">' + message + '</p>';
}

// --- HELPER: builds the results table once the calculation finishes ---
function displayResults(rows, result) {
    var html = '<table><tr><th>i</th><th>x</th><th>f(x)</th><th>Coefficient</th></tr>';

    for (var j = 0; j < rows.length; j++) {
        var r = rows[j];
        html += '<tr><td>' + r.i + '</td><td>' + r.x.toFixed(4) + '</td><td>' +
                r.fx.toFixed(4) + '</td><td>' + r.coefficient + '</td></tr>';
    }

    html += '</table>';
    html += '<p><strong>Approximate integral: ' + result.toFixed(4) + '</strong></p>';

    document.getElementById('results').innerHTML = html;
}