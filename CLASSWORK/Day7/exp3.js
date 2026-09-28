//Visualize the event loop using setTimeout,setimmediate and process.next tick

// Visualize the Event Loop using
// process.nextTick(), setTimeout(), and setImmediate()

console.log("1. Start");

process.nextTick(() => {
    console.log("2. process.nextTick()");
});

setTimeout(() => {
    console.log("3. setTimeout() - 0ms");
}, 0);

setImmediate(() => {
    console.log("4. setImmediate()");
});

console.log("5. End");