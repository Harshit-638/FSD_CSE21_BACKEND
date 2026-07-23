// =========================================
// Promises in JavaScript
// =========================================

// A Promise is an object that represents the
// eventual completion (success) or failure
// of an asynchronous operation.

// Promise - Way 1

const promiseOne = new Promise((resolve, reject) => {

    console.log("Promise is being executed...");

    // Simulating a successful operation
    let success = true;

    if (success) {
        resolve("Operation Successful");
    } else {
        reject("Operation Failed");
    }

});

// Handling the Promise

promiseOne
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.log(error);
    })
    .finally(() => {
        console.log("Promise execution completed.");
    });