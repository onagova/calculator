const OPERATOR_ADD = '&#43;';
const OPERATOR_SUBTRACT = '&#8722;';
const OPERATOR_MULTIPLY = '&#215;';
const OPERATOR_DIVIDE = '&#247;';

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