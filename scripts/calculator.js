const OPERATOR_ADD = '0x002B';
const OPERATOR_SUBTRACT = '0x2212';
const OPERATOR_MULTIPLY = '0x00D7';
const OPERATOR_DIVIDE = '0x00F7';

startCalculator();

function startCalculator() {
    let expression = [''];

    setupButtons(expression);
}

function setupButtons(expression) {
    const numberButtons = document.querySelectorAll('.number-button');
    numberButtons.forEach(button => {
        button.addEventListener('click', e => {
            const char = e.target.getAttribute('data-char');
            appendChar(expression, char);
            updateDisplay(expression);
        });
    });

    const operatorButtons = document.querySelectorAll('.operator-button');
    operatorButtons.forEach(button => {
        button.addEventListener('click', e => {
            const operator = e.target.getAttribute('data-charcode');
            appendOperator(expression, operator);
            updateDisplay(expression);
        })
    });

    const equalsButton = document.querySelector('.equals-button');
    equalsButton.addEventListener('click', () => {
        const trimmed = getTrimmed(expression);
        const evaluated = getEvaluated(trimmed);

        if (trimmed != evaluated) {
            expression = getUntrimmed(evaluated);
        }

        updateDisplay(expression);
    });
}

function appendChar(expression, char) {
    expression[expression.length - 1] += char;
}

function appendOperator(expression, operator) {
    if (expression[expression.length - 1] == '') {
        if (expression.length == 1 && operator == OPERATOR_SUBTRACT) {
            expression.shift();
        } else {
            return;
        }
    }

    expression.push(String.fromCharCode(operator));
    expression.push('');
}

function updateDisplay(expression) {
    const display = document.querySelector('.calculator-display');
    display.textContent = expression.join('');
}

function getTrimmed(expression) {
    const trimmed = Array.from(expression);

    if (trimmed.length <= 1) return trimmed;

    if (trimmed[0] == String.fromCharCode(OPERATOR_SUBTRACT)) {
        trimmed[1] = `-${trimmed[1]}`;
        trimmed.shift();
    }

    if (trimmed[trimmed.length - 1] == '') {
        trimmed.splice(-2, 2);
    }

    return trimmed;
}

function getUntrimmed(expression) {
    const untrimmed = Array.from(expression);

    if (untrimmed[0] >= 0) return untrimmed;

    untrimmed[0] = Math.abs(expression[0]);
    untrimmed.unshift(String.fromCharCode(OPERATOR_SUBTRACT));

    return untrimmed;
}

function getEvaluated(expression) {
    const evaluating = Array.from(expression);

    const addIndex = evaluating.indexOf(String.fromCharCode(OPERATOR_ADD));
    const subIndex = evaluating.indexOf(String.fromCharCode(OPERATOR_SUBTRACT));
    const mulIndex = evaluating.indexOf(String.fromCharCode(OPERATOR_MULTIPLY));
    const divIndex = evaluating.indexOf(String.fromCharCode(OPERATOR_DIVIDE));

    let index, operator;

    if (mulIndex >= 0 && divIndex >= 0) {
        if (mulIndex < divIndex) {
            index = mulIndex;
            operator = OPERATOR_MULTIPLY;
        } else {
            index = divIndex;
            operator = OPERATOR_SUBTRACT;
        }
    } else if (mulIndex >= 0) {
        index = mulIndex;
        operator = OPERATOR_MULTIPLY;
    } else if (divIndex >= 0) {
        index = divIndex;
        operator = OPERATOR_DIVIDE;
    } else if (addIndex >= 0 && subIndex >= 0) {
        if (addIndex < subIndex) {
            index = addIndex;
            operator = OPERATOR_ADD;
        } else {
            index = subIndex;
            operator = OPERATOR_SUBTRACT;
        }
    } else if (addIndex >= 0) {
        index = addIndex;
        operator = OPERATOR_ADD;
    } else if (subIndex >= 0) {
        index = subIndex;
        operator = OPERATOR_SUBTRACT;
    } else {
        return evaluating;
    }

    const operated = operate(operator, +evaluating[index - 1], +evaluating[index + 1]);
    evaluating.splice(index - 1, 3, operated.toString());

    return getEvaluated(evaluating);
}

function operate(operator, a, b) {
    switch (operator) {
        case OPERATOR_ADD:
            return add(a, b);
        
        case OPERATOR_SUBTRACT:
            return subtract(a, b);

        case OPERATOR_MULTIPLY:
            return multiply(a, b);

        case OPERATOR_DIVIDE:
            return divide(a, b);

        default:
            return;
    }
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}