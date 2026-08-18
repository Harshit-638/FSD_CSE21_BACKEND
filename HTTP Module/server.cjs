// Create your own server using HTTP module 
const http=require('http');
const server=http.createServer((req,res)=>{

res.write ('Hello World!');
res.end(); 

})
server.listen(8000,()=>{
    console.log("server is running  on the port 8000");
})