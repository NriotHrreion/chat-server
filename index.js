/**
 * @author NriotHrreion
 * @license MIT
 * 
 * Copyright (c) NriotHrreion 2020
 */

"use strict";

const process = require("process");
const express = require("express");
const fs = require("fs");
// const path = require("path");
const keypress = require("keypress");
const https = require("http");
const ws = require("ws");
const chalk = require("chalk");

var app = express();
var server = https.createServer(app);
var wss = new ws.Server({server});

wss.on("connection", function(ws) {
    ws.on("message", function(data) {
        data = JSON.parse(data);
        switch(data.type) {
            case "message":
                wss.clients.forEach((client) => {
                    var user = data.user;
                    var message = data.message;
                    client.send(JSON.stringify({type: "message", message: `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] ${user}: ${message}`}));
                    console.log(chalk.green("[") + new Date() + chalk.green("]") +" "+ chalk.yellow(user) +": "+ message);
                });
                break;
            case "image":
                wss.clients.forEach((client) => {
                    var user = data.user;
                    var src = data.src;
                    client.send(JSON.stringify({type: "image", message: `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] ${user}: <img src="${src}"></img>`}));
                    console.log(chalk.green("[") + new Date() + chalk.green("]") +" "+ chalk.yellow(user) +": [Image]");
                });
                break;
            case "withdraw":
                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({type: "withdraw", id: data.id}));
                });
                break;
        }
    });
    ws.on("close", function() {
        console.log("Client disconnected");
        wss.clients.forEach((client) => {
            client.send("Client disconnected");
        });
    });
});

server.listen(3500, function() {
    console.log("Server Start!");
    console.log("You can press ESC to close the server");
});

var chat_app = express();

chat_app.get("/", (req, res) => {
    res.set("Content-Type","text/html;charset=utf-8");
    res.send(fs.readFileSync("./client/index.html").toString());
});

chat_app.listen(8920);

keypress(process.stdin);
process.stdin.on("keypress", (ch, key) => {
    if(key && key.name == "escape") {
        process.exit();
    }
});
process.stdin.setRawMode(true);
process.stdin.resume();
