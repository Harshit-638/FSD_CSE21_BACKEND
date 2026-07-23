// synchronous programming : code is executed line  by line
// function hello(){
//     console.log("hello,world");

// }
// hello();
// console.log("This is synchronous programming");

// Asynchornous programming : the code is executed line by line, but some 
// setTimeout(): function that is used to execute the function 

// const hello =()=> {
//     setTimeout(() => {
//         console.log("Hello,world");
//     }, 2000);
// }
// hello();
// console.log("This is asynchronous programming");

// callback, promises, async/await

// function add(n1,n2,callback){
//     console.log (n1+n2);   
//     callback();
// }

// let a =10;
// let b = 20;

// add(a,b,sayHI);
// add(a,b,hello);
// add(hello,sayHI);

// function sayHI(){
//     console.log("This is callback funtion");
// }
// function hello(){
//     console.log("Hello,Harshit");
// }

// create a function that display(callback) that print "Welcome to ABES,then call callback which print learning "FSD Workshop"
// function welcome(callback){
//     console.log("Welcome to ABES");
//     callback();
// }
 
// function callback(){
//     console.log("FSD");
// }