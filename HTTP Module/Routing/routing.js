// Practice routing using HTTP module

import http from "http";

const server = http.createServer((req, res) => {

    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end("<h1>This is Home Page</h1>");
    }

    else if (req.url === "/about" && req.method === "GET") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end("<h1>This is About Page</h1>");
    }

    else if (req.url === "/contactus" && req.method === "GET") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end("<h1>Contact: 12344456789</h1>");
    }

    else {
        res.writeHead(404, {
            "Content-Type": "text/html"
        });
        res.end("<h1>404 - Page Not Found</h1>");
    }

});

server.listen(3001, () => {
    console.log("Server working on 3001");
});