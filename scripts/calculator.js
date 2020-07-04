const OPERATOR_ADD = '0x002B';
const OPERATOR_SUBTRACT = '0x2212';
const OPERATOR_MULTIPLY = '0x00D7';
const OPERATOR_DIVIDE = '0x00F7';
const ERROR_DIVIDED_BY_ZERO = 0;

startCalculator();

function startCalculator() {
    const expression = [''];

    setupButtonsAndKeyboard(expression);
    updateInputDisplay(['']);
    updateEvaluatedDisplay('');
}

function setupButtonsAndKeyboard(expression) {
    // let checkedFirstZero = true;

    const numberButtons = document.querySelectorAll('.number-button');
    numberButtons.forEach(button => {
        button.addEventListener('click', e => {
            const char = e.target.getAttribute('data-char');
            onNumber(char);
        });
    });

    const decimalPointButton = document.querySelector('.decimal-point-button');
    decimalPointButton.addEventListener('click', onDecimal);

    const operatorButtons = document.querySelectorAll('.operator-button');
    operatorButtons.forEach(button => {
        button.addEventListener('click', e => {
            const operator = e.target.getAttribute('data-charcode');
            onOperator(operator);
        })
    });

    const equalsButton = document.querySelector('.equals-button');
    equalsButton.addEventListener('click', onEquals);

    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', onBack);

    const clearButton = document.querySelector('.clear-button');
    clearButton.addEventListener('click', onClear);

    window.addEventListener('keydown', e => {
        document.activeElement.blur();

        if (!isNaN(e.key)) {
            onNumber(e.key);
            return;
        }

        switch (e.key) {
            case '.':
                onDecimal();
                break;

            case '=':
            case 'Enter':
                onEquals();
                break;

            case 'Backspace':
                onBack();
                break;

            case 'c':
            case 'C':
                onClear();
                break;

            case '+':
                onOperator(OPERATOR_ADD);
                break;
            
            case '-':
                onOperator(OPERATOR_SUBTRACT);
                break;

            case '*':
                onOperator(OPERATOR_MULTIPLY);
                break;

            case '/':
                e.preventDefault(); // prevent quick find stealing keydown event
                onOperator(OPERATOR_DIVIDE);
                break;

            default:
                break;
        }
    });

    function onNumber(char) {
        // clearFirstZero();
        appendChar(expression, char);
        updateInputDisplay(expression);
        displayForwardEvaluation(expression);
    }

    function onDecimal() {
        // clearFirstZero();
        appendDecimalPoint(expression);
        updateInputDisplay(expression);
    }

    function onOperator(operator) {
        // clearFirstZero();
        appendOperator(expression, operator);
        updateInputDisplay(expression);
    }

    function onEquals() {
        const evaluated = getEvaluated(expression);

        switch (evaluated) {
            case null:
                return;

            case ERROR_DIVIDED_BY_ZERO:
                updateEvaluatedDisplay('Can\'t divide by 0');
                return;

            default:
                break;
        }
        
        expression.splice(0, expression.length, ...getUntrimmed(evaluated));
        updateInputDisplay(expression);
        updateEvaluatedDisplay(null);
        // checkedFirstZero = false;
    }

    function onBack() {
        if (expression[expression.length - 1] == '') {
            removeLastOperator(expression);
        } else {
            removeLastChar(expression);
        }
        
        updateInputDisplay(expression);
        displayForwardEvaluation(expression);
    }

    function onClear() {
        expression.splice(0, expression.length, '');
        updateInputDisplay(expression);
        updateEvaluatedDisplay(null);
        // checkedFirstZero = true;
    }

    // function clearFirstZero() {
    //     if (!checkedFirstZero) {
    //         if (expression[0] == '0') {
    //             expression[0] = '';
    //         }
    //         checkedFirstZero = true;
    //     }
    // }
}

function appendChar(expression, char) {
    expression[expression.length - 1] += char;
}

function appendDecimalPoint(expression) {
    if (expression[expression.length - 1].includes('.')) return;
    appendChar(expression, '.');
}

function appendOperator(expression, operator) {
    if (expression[expression.length - 1] == '') {
        if (expression.length > 1) {
            if (isNaN(expression[expression.length - 3])) return;

            if (operator == OPERATOR_SUBTRACT) {
                switch (expression[expression.length - 2]) {
                    case String.fromCharCode(OPERATOR_ADD):
                        expression[expression.length - 2] = String.fromCharCode(OPERATOR_SUBTRACT);
                        break;

                    case String.fromCharCode(OPERATOR_SUBTRACT):
                        break;

                    default:
                        expression[expression.length - 1] = String.fromCharCode(OPERATOR_SUBTRACT);
                        expression.push('');
                        break;
                }
            } else {
                expression[expression.length - 2] = String.fromCharCode(operator);
            }            
        } else if (operator == OPERATOR_SUBTRACT) {
            expression[expression.length - 1] = String.fromCharCode(OPERATOR_SUBTRACT);
            expression.push('');
        }

        return;
    }

    if (isNaN(expression[expression.length - 1])) return;

    expression.push(String.fromCharCode(operator));
    expression.push('');
}

function removeLastChar(expression) {
    expression[expression.length - 1] = expression[expression.length - 1].slice(0, -1);
}

function removeLastOperator(expression) {
    if (expression.length == 1) return;

    if (expression.length < 3) {
        expression.shift();
        return;
    }

    if (isNaN(expression[expression.length - 3])) { // unary operator case
        expression.splice(expression.length - 2, 1);
    } else {
        expression.splice(expression.length - 2, 2);
    }
}

function updateInputDisplay(expression) {
    const display = document.querySelector('#calculator-input-display');
    const shortened = expression.map(item => shortenNumber(item));
    let str = shortened.join('');
    display.textContent = !str ? '\n' : str;
}

function updateEvaluatedDisplay(str) {
    const display = document.querySelector('#calculator-evaluated-display');
    str = shortenNumber(str);
    display.textContent = !str ? '\n' : str;
}

function displayForwardEvaluation(expression) {
    let evaluated = getEvaluated(expression);

    switch (evaluated) {
        case null:
        case ERROR_DIVIDED_BY_ZERO:
            updateEvaluatedDisplay(null);
            return;

        default:
            break;
    }

    evaluated = getUntrimmed(evaluated);
    updateEvaluatedDisplay(evaluated.join(''));
}

function getTrimmed(expression) {
    let trimmed = Array.from(expression);

    if (trimmed.length >= 2 &&
        (trimmed[trimmed.length - 1] == '' || isNaN(trimmed[trimmed.length - 1]))) 
    {
        trimmed = isNaN(trimmed[trimmed.length - 3]) ? // in case the last operator is a unary minus
                trimmed.slice(0, -3) :
                trimmed.slice(0, -2);
    }

    for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] == String.fromCharCode(OPERATOR_SUBTRACT)) {
            if (i == 0) {
                trimmed[i + 1] *= -1;
                trimmed.shift();
            } else if (isNaN(trimmed[i - 1])) {
                trimmed[i + 1] *= -1;
                trimmed.splice(i, 1);
            }
        }
    }

    return trimmed;
}

function getUntrimmed(expression) {
    const untrimmed = Array.from(expression);

    if (untrimmed[0] >= 0) return untrimmed;

    untrimmed[0] = untrimmed[0].slice(1);
    untrimmed.unshift(String.fromCharCode(OPERATOR_SUBTRACT));

    return untrimmed;
}

function getEvaluated(expression) {
    const trimmed = getTrimmed(expression);

    if (trimmed.length <= 1) return null;

    return evaluate(trimmed);
}

function evaluate(expression) {
    if (expression.length < 2) return expression;

    const divIndex = expression.indexOf(String.fromCharCode(OPERATOR_DIVIDE));

    if (divIndex >= 0 && expression[divIndex + 1] == 0) return ERROR_DIVIDED_BY_ZERO;

    const addIndex = expression.indexOf(String.fromCharCode(OPERATOR_ADD));
    const subIndex = expression.indexOf(String.fromCharCode(OPERATOR_SUBTRACT));
    const mulIndex = expression.indexOf(String.fromCharCode(OPERATOR_MULTIPLY));

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
        return expression;
    }

    const operated = operate(operator, +expression[index - 1], +expression[index + 1]);
    expression.splice(index - 1, 3, operated.toString());

    return evaluate(expression);
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

function shortenNumber(str) {
    if (!str || isNaN(str)) return str;

    let n = +str;

    const digits = getDigits(n);
    if (digits > 6) {
        const excessCycle = Math.floor((digits - 1) / 3);
        const e = 3 * excessCycle;
        n = roundToDecimal(n / (10 ** e), 2);
        str = `${n}e${e}`;

        return str;
    }

    const decimals = getDecimals(str);
    if (decimals > 6) {
        const decimalArray = str.slice(-decimals).split('');
        const nonZeroIndex = decimalArray.findIndex(char => char != 0) + 1;
        n = roundToDecimal(n * (10 ** nonZeroIndex), 2); // use first zero decimal as first integer
        str = `${n}e${-nonZeroIndex}`;
        
        return str;
    }

    return str.includes('.') ? str : n.toString();
}

function roundToDecimal(number, places) {
    const multiplier = 10 ** places;
    return Math.round(number * multiplier) / multiplier;
}

function getDigits(n) {
    let digits = 0;

    while (n >= 1) {
        digits++;
        n /= 10;
    }

    return digits;
}

function getDecimals(str) {
    const decimalIndex = str.indexOf('.');
    return decimalIndex < 0 ? 0 : str.length - (decimalIndex + 1);
}