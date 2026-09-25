// Grab the input boxes once, so we can reuse them everywhere below
var funcInput = document.getElementById('funcInput');
var aInput = document.getElementById('aInput');
var bInput = document.getElementById('bInput');

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

// --- MAIN LOGIC: runs when the user clicks "Calculate" ---
document.getElementById('calcBtn').addEventListener('click', function () {

    // Clear any old red borders from a previous attempt
    funcInput.classList.remove('input-error');
    aInput.classList.remove('input-error');
    bInput.classList.remove('input-error');

    var funcStr = funcInput.value;
    var a = parseFloat(aInput.value);
    var b = parseFloat(bInput.value);

    // --- Validation checks ---

    if (funcStr.trim() === '') {
        funcInput.classList.add('input-error');
        displayError('Please enter a function.');
        return;
    }

    if (isNaN(a)) {
        aInput.classList.add('input-error');
        displayError('a must be a valid number.');
        return;
    }

    if (isNaN(b)) {
        bInput.classList.add('input-error');
        displayError('b must be a valid number.');
        return;
    }

    if (a >= b) {
        aInput.classList.add('input-error');
        bInput.classList.add('input-error');
        displayError('a must be smaller than b.');
        return;
    }

    var f;
    try {
        var jsExpr = funcStr.replace(/\^/g, '**'); // turn ^ into JS's ** operator
        f = new Function('x', 'return ' + jsExpr + ';');
        f(a); // test run, to catch bad syntax early
    } catch (err) {
        funcInput.classList.add('input-error');
        displayError('Invalid function. Check your syntax.');
        return;
    }

    if (f(a) * f(b) > 0) {
        aInput.classList.add('input-error');
        bInput.classList.add('input-error');
        displayError('f(a) and f(b) must have opposite signs (no guaranteed root in this interval).');
        return;
    }

    // --- Everything checked out, so run the bisection loop ---

    var tolerance = 0.0001;
    var maxSteps = 20;
    var rows = [];
    var c, fc;

    for (var i = 0; i < maxSteps; i++) {
        c = (a + b) / 2;
        fc = f(c);

        rows.push({ step: i + 1, a: a, b: b, c: c, fc: fc });

        if (Math.abs(fc) < tolerance) {
            break;
        }

        if (f(a) * fc < 0) {
            b = c;
        } else {
            a = c;
        }
    }

    displayResults(rows, c);
});

// --- HELPER: shows an error message in the results box ---
function displayError(message) {
    document.getElementById('results').innerHTML = '<p class="error">' + message + '</p>';
}

// --- HELPER: builds the results table once the loop finishes ---
function displayResults(rows, root) {
    var html = '<table><tr><th>Step</th><th>a</th><th>b</th><th>c</th><th>f(c)</th></tr>';

    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        html += '<tr><td>' + r.step + '</td><td>' + r.a.toFixed(4) + '</td><td>' +
                r.b.toFixed(4) + '</td><td>' + r.c.toFixed(4) + '</td><td>' +
                r.fc.toFixed(4) + '</td></tr>';
    }

    html += '</table>';
    html += '<p><strong>Approximate root: ' + root.toFixed(4) + '</strong></p>';

    document.getElementById('results').innerHTML = html;
}