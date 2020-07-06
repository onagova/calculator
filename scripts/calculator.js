const OPERATOR_ADD = '0x002B';
const OPERATOR_SUBTRACT = '0x2212';
const OPERATOR_MULTIPLY = '0x00D7';
const OPERATOR_DIVIDE = '0x00F7';

const ERROR_DIVIDED_BY_ZERO = 0;

const COLOR_ERROR = 'hsl(15, 100%, 40%)';
const COLOR_CLEAR = 'hsl(220, 100%, 80%)';

startCalculator();

function startCalculator() {
    const calculator = {
        expression: [''],
        maxDecimalPlaces: 6,
        clear: function() {
            this.expression = [''];
        },
        appendChar: function(char) {
            this.expression[this.expression.length - 1] += char;
        },
        appendOperator: function(operator) {
            const exp = this.expression;

            if (exp[exp.length - 1] == '') {
                if (exp.length > 1) {
                    if (isNaN(exp[exp.length - 3])) return;
        
                    if (operator == OPERATOR_SUBTRACT) {
                        switch (exp[exp.length - 2]) {
                            case String.fromCharCode(OPERATOR_ADD):
                                exp[exp.length - 2] = String.fromCharCode(OPERATOR_SUBTRACT);
                                break;
        
                            case String.fromCharCode(OPERATOR_SUBTRACT):
                                break;
        
                            default:
                                exp[exp.length - 1] = String.fromCharCode(OPERATOR_SUBTRACT);
                                exp.push('');
                                break;
                        }
                    } else {
                        exp[exp.length - 2] = String.fromCharCode(operator);
                    }            
                } else if (operator == OPERATOR_SUBTRACT) {
                    exp[exp.length - 1] = String.fromCharCode(OPERATOR_SUBTRACT);
                    exp.push('');
                }
        
                return;
            }
        
            if (isNaN(exp[exp.length - 1])) return;
        
            exp.push(String.fromCharCode(operator));
            exp.push('');
        },
        appendDecimalPoint: function() {
            if (this.expression[this.expression.length - 1].includes('.')) return;
            this.appendChar('.');
        },
        removeLastItem: function() {
            if (this.expression[this.expression.length - 1] == '') {
                this.removeLastOperator();
            } else {
                this.removeLastChar();
            }
        },
        removeLastChar: function() {
            const exp = this.expression;
            exp[exp.length - 1] = exp[exp.length - 1].slice(0, -1);
        },
        removeLastOperator: function() {
            const exp = this.expression;

            if (exp.length == 1) return;
        
            if (exp.length < 3) {
                exp.shift();
                return;
            }
        
            if (isNaN(exp[exp.length - 3])) { // unary operator case
                exp.splice(exp.length - 2, 1);
            } else {
                exp.splice(exp.length - 2, 2);
            }
        },
        getEvaluated: function() {
            let evaluated = this.getTrimmed(this.expression);
        
            if (evaluated.length <= 1) return null;

            evaluated = this.evaluate(evaluated);
            evaluated[0] = roundToDecimal(+evaluated[0], this.maxDecimalPlaces).toString();

            switch (evaluated) {
                case ERROR_DIVIDED_BY_ZERO:
                    return evaluated;

                default:
                    return this.getUntrimmed(evaluated);
            }
        },
        getTrimmed: function(exp) {
            let trimmed = Array.from(exp);
        
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
        }, 
        getUntrimmed: function(exp) {
            const untrimmed = Array.from(exp);
        
            if (untrimmed[0] >= 0) return untrimmed;
        
            untrimmed[0] = untrimmed[0].slice(1);
            untrimmed.unshift(String.fromCharCode(OPERATOR_SUBTRACT));
        
            return untrimmed;
        },
        evaluate: function(exp) {
            if (exp.length < 2) return exp;
        
            const divIndex = exp.indexOf(String.fromCharCode(OPERATOR_DIVIDE));
        
            if (divIndex >= 0 && exp[divIndex + 1] == 0) return ERROR_DIVIDED_BY_ZERO;
        
            const addIndex = exp.indexOf(String.fromCharCode(OPERATOR_ADD));
            const subIndex = exp.indexOf(String.fromCharCode(OPERATOR_SUBTRACT));
            const mulIndex = exp.indexOf(String.fromCharCode(OPERATOR_MULTIPLY));
        
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
                return exp;
            }
        
            const operated = operate(operator, +exp[index - 1], +exp[index + 1]);
            exp.splice(index - 1, 3, operated.toString());
        
            return this.evaluate(exp);
        }
    };

    updateInputDisplay(['']);
    updateEvaluatedDisplay('');
    setupButtonsAndKeyboard(calculator);
}

function setupButtonsAndKeyboard(calculator) {
    const numberButtons = document.querySelectorAll('.number-button');
    const operatorButtons = document.querySelectorAll('.operator-button');

    const decimalPointButton = document.querySelector('.decimal-point-button');
    const equalsButton = document.querySelector('.equals-button');
    const backButton = document.querySelector('.back-button');
    const clearButton = document.querySelector('.clear-button');

    let lastEvaluated;
    
    numberButtons.forEach(button => {
        button.addEventListener('click', e => {
            const char = e.target.getAttribute('data-char');
            onNumber(char);
        });
    });

    operatorButtons.forEach(button => {
        button.addEventListener('click', e => {
            const operator = e.target.getAttribute('data-charcode');
            onOperator(operator);
        })
    });
    
    decimalPointButton.addEventListener('click', onDecimal);
    equalsButton.addEventListener('click', onEquals);
    backButton.addEventListener('click', onBack);
    clearButton.addEventListener('click', onClear);
    setupHoldToClear();

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
        clearLastEvaluated();
        calculator.appendChar(char);
        updateInputDisplay(calculator.expression);
        displayForwardEvaluation(calculator.getEvaluated());
    }

    function onOperator(operator) {
        pushLastEvaluated();
        calculator.appendOperator(operator);
        updateInputDisplay(calculator.expression);
    }

    function onDecimal() {
        clearLastEvaluated();
        calculator.appendDecimalPoint();
        updateInputDisplay(calculator.expression);
    }

    function onEquals() {
        const evaluated = calculator.getEvaluated();

        switch (evaluated) {
            case null:
                return;

            case ERROR_DIVIDED_BY_ZERO:
                updateInputDisplay(calculator.expression, COLOR_ERROR);
                updateEvaluatedDisplay('Can\'t divide by 0', COLOR_ERROR);
                flashDisplays(COLOR_ERROR);
                return;

            default:
                break;
        }
        
        calculator.clear();
        setLastEvaluated(evaluated);
        updateInputDisplay(evaluated);
        updateEvaluatedDisplay(null);
    }

    function onBack() {
        calculator.removeLastItem();
        updateInputDisplay(calculator.expression);
        displayForwardEvaluation(calculator.getEvaluated());
    }

    function onClear() {
        calculator.clear();
        clearLastEvaluated();
        updateInputDisplay(calculator.expression);
        updateEvaluatedDisplay(null);
        flashDisplays(COLOR_CLEAR);
    }

    function setupHoldToClear() {
        let timer;

        backButton.addEventListener('mousedown', onMouseDown);
        backButton.addEventListener('mouseleave', clearTimer);
        document.body.addEventListener('mouseup', clearTimer);

        function onMouseDown() {
            clearTimer();
            timer = window.setTimeout(() => {
                onClear();
            }, 700);
        }

        function clearTimer() {
            if (timer) {
                window.clearTimeout(timer);
            }
        }
    }

    function setLastEvaluated(exp) {
        lastEvaluated = exp;
        backButton.style.display = 'none';
        clearButton.style.display = 'initial'
    }

    function clearLastEvaluated() {
        lastEvaluated = null;
        backButton.style.display = 'initial';
        clearButton.style.display = 'none'
    }

    function pushLastEvaluated() {
        if (!lastEvaluated) return;

        calculator.expression = lastEvaluated;
        clearLastEvaluated();
    }
}

function updateInputDisplay(expression, color = null) {
    const display = document.querySelector('#calculator-input-display');
    const span = getInnerSpan(display);
    let str = expression.join('');
    span.textContent = !str ? '\n' : str;
    span.style.color = color;
}

function updateEvaluatedDisplay(str, color = null) {
    const display = document.querySelector('#calculator-evaluated-display');
    const span = getInnerSpan(display);
    span.textContent = !str ? '\n' : str;
    span.style.color = color;
}

function getInnerSpan(node) {
    let span = node.querySelector('span');

    if (!span) {
        span = document.createElement('span');
        node.appendChild(span);
    }

    return span;
}

function displayForwardEvaluation(evaluated) {
    switch (evaluated) {
        case null:
        case ERROR_DIVIDED_BY_ZERO:
            updateEvaluatedDisplay(null);
            return;

        default:
            break;
    }

    updateEvaluatedDisplay(evaluated.join(''));
}

function flashDisplays(color) {
    const container = document.querySelector('#displays-container');
    const flash = document.createElement('div');
    flash.classList.add('flash');
    flash.style.backgroundColor = color;

    flash.addEventListener('animationend', () => {
        container.removeChild(flash);
    });

    container.appendChild(flash);
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

function roundToDecimal(num, places) {
    const multiplier = 10 ** places;
    return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
}

// function shortenNumber(str) {
//     if (!str || isNaN(str)) return str;

//     let n = +str;

//     const digits = getDigits(n);
//     if (digits > 6) {
//         const excessCycle = Math.floor((digits - 1) / 3);
//         const e = 3 * excessCycle;
//         n = roundToDecimal(n / (10 ** e), 2);
//         str = `${n}e${e}`;

//         return str;
//     }

//     const decimals = getDecimals(str);
//     if (decimals > 6) {
//         if (n >= 1) return roundToDecimal(n, 6).toString();

//         const decimalArray = str.slice(-decimals).split('');
//         const nonZeroIndex = decimalArray.findIndex(char => char != 0) + 1;
//         n = roundToDecimal(n * (10 ** nonZeroIndex), 2); // use first zero decimal as first integer
//         str = `${n}e${-nonZeroIndex}`;

//         return str;
//     }

//     return str.includes('.') ? str : n.toString();
// }

// function getDigits(n) {
//     let digits = 0;

//     while (n >= 1) {
//         digits++;
//         n /= 10;
//     }

//     return digits;
// }

// function getDecimals(str) {
//     const decimalIndex = str.indexOf('.');
//     return decimalIndex < 0 ? 0 : str.length - (decimalIndex + 1);
// }