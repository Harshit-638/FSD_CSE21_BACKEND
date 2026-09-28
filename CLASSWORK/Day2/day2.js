// ================================
// Synchronous Programming
// ================================
// Code is executed line by line.

// function hello() {
//     console.log("Hello, World");
// }

// hello();
// console.log("This is synchronous programming");


// ================================
// Asynchronous Programming
// ================================
// Code is executed line by line, but some tasks
// (like setTimeout) are executed later.

// const hello = () => {
//     setTimeout(() => {
//         console.log("Hello, World");
//     }, 2000);
// };

// hello();
// console.log("This is asynchronous programming");


// ================================
// Callback Function Example 1
// ================================

// function add(n1, n2, callback) {
//     console.log("Sum =", n1 + n2);
//     callback();
// }

// function sayHi() {
//     console.log("This is a callback function.");
// }

// function hello() {
//     console.log("Hello, Harshit!");
// }

// let a = 10;
// let b = 20;

// add(a, b, sayHi);
// add(a, b, hello);


// ================================
// Callback Function Example 2
// Question:
// Create a function display(callback)
// that prints "Welcome to ABES"
// then calls the callback function
// which prints "Learning FSD Workshop".
// ================================

function display(callback) {
    console.log("Welcome to ABES");
    callback();
}

function learning() {
    console.log("Learning FSD Workshop");
}

// Function Call
display(learning);