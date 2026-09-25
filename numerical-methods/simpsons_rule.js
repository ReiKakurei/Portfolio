// Grab the input boxes once, so we can reuse them everywhere below
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

// --- MAIN LOGIC: runs when the user clicks "Calculate" ---
document.getElementById('calcBtn').addEventListener('click', function () {

    // Clear any old red borders from a previous attempt
    funcInput.classList.remove('input-error');
    aInput.classList.remove('input-error');
    bInput.classList.remove('input-error');
    nInput.classList.remove('input-error');

    var funcStr = funcInput.value;
    var a = parseFloat(aInput.value);
    var b = parseFloat(bInput.value);
    var n = parseInt(nInput.value);

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

    if (isNaN(n) || n <= 0) {
        nInput.classList.add('input-error');
        displayError('n must be a positive whole number.');
        return;
    }

    if (n % 2 !== 0) {
        nInput.classList.add('input-error');
        displayError('n must be even for Simpson\'s Rule.');
        return;
    }

    var f;
    try {
        var jsExpr = funcStr.replace(/\^/g, '**');
        f = new Function('x', 'return ' + jsExpr + ';');
        f(a);
    } catch (err) {
        funcInput.classList.add('input-error');
        displayError('Invalid function. Check your syntax.');
        return;
    }

    // --- Simpson's Rule calculation ---

    var h = (b - a) / n;
    var rows = [];
    var sum = 0;

    for (var i = 0; i <= n; i++) {
        var x = a + i * h;
        var fx = f(x);

        var coefficient;
        if (i === 0 || i === n) {
            coefficient = 1;
        } else if (i % 2 === 0) {
            coefficient = 2;
        } else {
            coefficient = 4;
        }

        rows.push({ i: i, x: x, fx: fx, coefficient: coefficient });
        sum += coefficient * fx;
    }

    var result = (h / 3) * sum;

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