const EventEmitter = require("events");

// Create custom EventEmitter class
class MyEmitter extends EventEmitter {}

// Create object
const event = new MyEmitter();

// Register greet event
event.on("greet", (msg) => {
    console.log(`Hello ${msg}`);
});

// Register exit event
event.on("exit", () => {
    console.log("Exiting MyEmitter application...");
});

// Trigger events
event.emit("greet", "Harshit");
event.emit("greet", "CSE-21, Welcome to FSD Class");
event.emit("exit");