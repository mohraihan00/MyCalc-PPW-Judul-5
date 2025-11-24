let display = document.getElementById('display');
let historyDisplay = document.getElementById('historyDisplay');
let historyList = document.getElementById('historyList');
let memoryIndicator = document.getElementById('memoryIndicator');

let currentValue = '0';
let expression = ''; // Menyimpan seluruh ekspresi matematika
let shouldResetDisplay = false;
let memory = 0;
let historyArray = [];

function updateDisplay() {
    display.textContent = currentValue;
    updateMemoryIndicator();
}

function updateHistoryDisplay() {
    historyDisplay.textContent = expression;
}

function getOperatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return symbols[op] || op;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentValue = num;
        shouldResetDisplay = false;
    } else {
        currentValue = currentValue === '0' ? num : currentValue + num;
    }
    updateDisplay();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentValue = '0,';
        shouldResetDisplay = false;
    } else if (!currentValue.includes(',')) {
        currentValue += ',';
    }
    updateDisplay();
}

function clearAll() {
    currentValue = '0';
    expression = '';
    shouldResetDisplay = false;
    historyDisplay.textContent = '';
    updateDisplay();
}

function setOperator(op) {
    if (currentValue !== '' && currentValue !== '0') {
        if (expression !== '' && !shouldResetDisplay) {
            // Tambahkan angka saat ini ke ekspresi
            expression += currentValue;
        } else if (expression === '') {
            // Mulai ekspresi baru
            expression = currentValue;
        }
        
        // Tambahkan operator ke ekspresi
        expression += ' ' + op + ' ';
        shouldResetDisplay = true;
        updateHistoryDisplay();
    } else if (expression !== '' && shouldResetDisplay) {
        // Ganti operator terakhir jika user menekan operator berturut-turut
        expression = expression.trim();
        expression = expression.slice(0, -1) + op + ' ';
        updateHistoryDisplay();
    }
}

function calculate() {
    if (expression === '') return;
    
    // Tambahkan angka terakhir ke ekspresi
    if (!shouldResetDisplay && currentValue !== '') {
        expression += currentValue;
    }
    
    try {
        // Parse dan evaluasi ekspresi dengan urutan operasi yang benar
        const result = evaluateExpression(expression);
        
        if (result === 'Error') {
            alert('Error: Tidak dapat membagi dengan nol!');
            clearAll();
            return;
        }
        
        // Simpan ke history
        const displayExpression = formatExpressionForDisplay(expression);
        const calculation = `${displayExpression} = ${formatNumber(result)}`;
        addToHistory(calculation);
        
        currentValue = formatNumber(result);
        expression = '';
        shouldResetDisplay = true;
        historyDisplay.textContent = '';
        updateDisplay();
    } catch (error) {
        alert('Error: Ekspresi tidak valid!');
        clearAll();
    }
}

function evaluateExpression(expr) {
    // Ganti koma dengan titik untuk parsing
    expr = expr.replace(/,/g, '.');
    
    // Split ekspresi menjadi token (angka dan operator)
    const tokens = expr.split(' ').filter(token => token !== '');
    
    // Konversi ke array dengan angka sebagai number dan operator sebagai string
    let values = [];
    let operators = [];
    
    for (let i = 0; i < tokens.length; i++) {
        if (i % 2 === 0) {
            // Ini adalah angka
            values.push(parseFloat(tokens[i]));
        } else {
            // Ini adalah operator
            operators.push(tokens[i]);
        }
    }
    
    // Langkah 1: Proses perkalian dan pembagian terlebih dahulu
    let i = 0;
    while (i < operators.length) {
        if (operators[i] === '*' || operators[i] === '/') {
            let result;
            if (operators[i] === '*') {
                result = values[i] * values[i + 1];
            } else {
                if (values[i + 1] === 0) {
                    return 'Error';
                }
                result = values[i] / values[i + 1];
            }
            
            // Ganti dua angka dengan hasil operasi
            values.splice(i, 2, result);
            operators.splice(i, 1);
        } else {
            i++;
        }
    }
    
    // Langkah 2: Proses penjumlahan dan pengurangan
    i = 0;
    while (i < operators.length) {
        let result;
        if (operators[i] === '+') {
            result = values[i] + values[i + 1];
        } else if (operators[i] === '-') {
            result = values[i] - values[i + 1];
        }
        
        values.splice(i, 2, result);
        operators.splice(i, 1);
    }
    
    return values[0];
}

function formatExpressionForDisplay(expr) {
    // Ganti operator dengan simbol yang lebih baik untuk display
    return expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');
}

function formatNumber(num) {
    // Bulatkan hasil jika terlalu panjang
    if (!isFinite(num)) return '0';
    
    let result = num;
    
    // Jika angka memiliki desimal yang panjang, bulatkan
    if (num.toString().includes('.') && num.toString().split('.')[1].length > 8) {
        result = parseFloat(num.toFixed(8));
    }
    
    return result.toString().replace('.', ',');
}

function percentage() {
    const num = parseFloat(currentValue.replace(',', '.'));
    currentValue = formatNumber(num / 100);
    updateDisplay();
}

function toggleSign() {
    if (currentValue === '0') return;
    const num = parseFloat(currentValue.replace(',', '.'));
    currentValue = formatNumber(num * -1);
    updateDisplay();
}

function memoryAdd() {
    const num = parseFloat(currentValue.replace(',', '.'));
    memory += num;
    updateMemoryIndicator();
}

function memorySubtract() {
    const num = parseFloat(currentValue.replace(',', '.'));
    memory -= num;
    updateMemoryIndicator();
}

function memoryRecall() {
    currentValue = formatNumber(memory);
    shouldResetDisplay = false;
    updateDisplay();
}

function memoryClear() {
    memory = 0;
    updateMemoryIndicator();
}

function updateMemoryIndicator() {
    memoryIndicator.textContent = memory !== 0 ? `M: ${formatNumber(memory)}` : '';
}

function addToHistory(calculation) {
    historyArray.unshift(calculation);
    if (historyArray.length > 5) {
        historyArray.pop();
    }
    updateHistoryList();
}

function updateHistoryList() {
    historyList.innerHTML = '';
    historyArray.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item;
        historyList.appendChild(div);
    });
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === '.' || event.key === ',') {
        appendDecimal();
    } else if (event.key === '+') {
        setOperator('+');
    } else if (event.key === '-') {
        setOperator('-');
    } else if (event.key === '*') {
        setOperator('*');
    } else if (event.key === '/') {
        event.preventDefault();
        setOperator('/');
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
    } else if (event.key === 'Escape' || event.key === 'c' || event.key === 'C') {
        clearAll();
    } else if (event.key === '%') {
        percentage();
    } else if (event.key === 'Backspace') {
        if (currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = '0';
        }
        updateDisplay();
    }
});

updateDisplay();