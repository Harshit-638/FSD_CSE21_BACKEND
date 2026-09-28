// // Create one promisees that will display Username and Password.
// // Using resolve and if data willbe rejected it display error.

// // Create a Promise to validate username and password

// function checkLogin(username, password) {
//     return new Promise((resolve, reject) => {
//         if (username === "Harshit" && password === "12345") {
//             resolve(" Login Successful!");
//         } else {
//             reject(" Error: Invalid Username or Password!");
//         }
//     });
// }

// // Calling the Promise
// checkLogin("Harshit", "12345")
//     .then((message) => {
//         console.log(message);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

// new Promise((resolve, reject) => {
//     setTimeout(() => {
//         let err = false;

//         if (!err) {
//             resolve("User: CSE21, Password: 123");
//         } else {
//             reject("ERROR: Data failed");
//         }
//     }, 1000);
// })
// .then((data) => {
//     console.log(data);
// })
// .catch((error) => {
//     console.log(error);
// });


// =========================================
//               Async /Await 
// =========================================

console.log("This is Async/Await");

async function test() {
    console.log("1");
    await console.log("2");
    console.log("3");
    console.log("4");
}

test();

console.log("5");