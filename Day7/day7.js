 // Simulate DOM-like event handling in Node.js using events
//Buttons : click and mouseover events 
class Button extends EventEmiter{
    
    click(){
        console.log("call button click event");
        this.emit("click");
    }

    mouseover(){
        console.log("/n call button mouseover event");
        this.emit("mouseover");
    }


}