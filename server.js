const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Server } = require("socket.io");
const http = require("http");

const express = require("express");
const path = require("path");
const { parseArgs } = require("util");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json())

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/index.html")
})


app.listen(3000,() => {
    console.log("Server berjalan di port 3000")
})

const port = new SerialPort({
    path: "/dev/ttyACM0",
    baudRate: 115200
}, function(err) {
    if (err) {
        return console.log('Error: ', err.message)
    }
})

io.on("connection", (socket) =>{
    console.log("Tersambung...")
    socket.on("disconnect",() => {
        console.log("Terputus dengan Server")
    })
})

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n"}))
parser.on("data", (result) => {
    console.log("data dari arduino " + result)
})