// Grab the input boxes once, so we can reuse them everywhere below
var funcInput = document.getElementById('funcInput');
var x0Input = document.getElementById('x0Input');

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

// --- HELPER: approximates f'(x) using the central difference formula ---
function derivative(f, x) {
    var h = 0.0001;
    return (f(x + h) - f(x - h)) / (2 * h);
}

// --- MAIN LOGIC: runs when the user clicks "Calculate" ---
document.getElementById('calcBtn').addEventListener('click', function () {

    // Clear any old red borders from a previous attempt
    funcInput.classList.remove('input-error');
    x0Input.classList.remove('input-error');

    var funcStr = funcInput.value;
    var x0 = parseFloat(x0Input.value);

    // --- Validation checks ---

    if (funcStr.trim() === '') {
        funcInput.classList.add('input-error');
        displayError('Please enter a function.');
        return;
    }

    if (isNaN(x0)) {
        x0Input.classList.add('input-error');
        displayError('x0 must be a valid number.');
        return;
    }

    var f;
    try {
        var jsExpr = funcStr.replace(/\^/g, '**');
        f = new Function('x', 'return ' + jsExpr + ';');
        f(x0);
    } catch (err) {
        funcInput.classList.add('input-error');
        displayError('Invalid function. Check your syntax.');
        return;
    }

    // --- Everything checked out, so run the Newton-Raphson loop ---

    var tolerance = 0.0001;
    var maxSteps = 20;
    var rows = [];
    var x = x0;
    var converged = false;

    for (var i = 0; i < maxSteps; i++) {
        var fx = f(x);
        var fpx = derivative(f, x);

        if (Math.abs(fpx) < 1e-10) {
            displayError('Derivative too close to zero at x = ' + x.toFixed(4) + '. Try a different x0.');
            return;
        }

        var xNext = x - fx / fpx;

        rows.push({ step: i + 1, x: x, fx: fx, fpx: fpx, xNext: xNext });

        if (Math.abs(xNext - x) < tolerance) {
            x = xNext;
            converged = true;
            break;
        }

        x = xNext;
    }

    if (!converged) {
        displayError('Did not converge within ' + maxSteps + ' steps. Try a different x0.');
        return;
    }

    displayResults(rows, x);
});

// --- HELPER: shows an error message in the results box ---
function displayError(message) {
    document.getElementById('results').innerHTML = '<p class="error">' + message + '</p>';
}

// --- HELPER: builds the results table once the loop finishes ---
function displayResults(rows, root) {
    var html = '<table><tr><th>Step</th><th>x</th><th>f(x)</th><th>f\'(x)</th><th>x (next)</th></tr>';

    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        html += '<tr><td>' + r.step + '</td><td>' + r.x.toFixed(4) + '</td><td>' +
                r.fx.toFixed(4) + '</td><td>' + r.fpx.toFixed(4) + '</td><td>' +
                r.xNext.toFixed(4) + '</td></tr>';
    }

    html += '</table>';
    html += '<p><strong>Approximate root: ' + root.toFixed(4) + '</strong></p>';

    document.getElementById('results').innerHTML = html;
}