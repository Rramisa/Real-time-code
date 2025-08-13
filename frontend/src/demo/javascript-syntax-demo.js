// JavaScript Syntax Error Demo
// This file contains intentional syntax errors to test the validation

// Valid code (should not show errors)
const validVariable = "hello";
console.log(validVariable);

// Syntax errors (should show red underlines)

// 1. Unclosed string
const unclosedString = "this string is not closed

// 2. Missing closing parenthesis
console.log("hello world"

// 3. Missing closing brace
function testFunction() {
    console.log("test"
}

// 4. Missing closing bracket
const array = [1, 2, 3, 4

// 5. Unclosed comment block
/*
This comment is not closed

// 6. Extra closing brace
function test() {
    console.log("test");
}}

// 7. Missing semicolon (this might not be caught as it's style, not syntax)
const x = 5

// 8. Valid code that should NOT show errors
const validObject = {
    name: "John",
    age: 30
};

const validArray = [1, 2, 3, 4];

function validFunction() {
    return "hello";
}

if (true) {
    console.log("valid if statement");
}

// 9. Template literals
const template = `Hello ${validVariable}`;

// 10. Arrow functions
const arrowFunc = () => {
    return "arrow function";
};

