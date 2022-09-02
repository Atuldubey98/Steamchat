const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
let database = {
    users: [],
    rooms: ["Default", "Pokemon"],
};
io.on("connection", (socket) => {
    console.log("Connected " + socket.id);
    database.rooms.forEach((room) => {
        socket.join(room.toLowerCase());
    });
    socket.on("disconnect", () => {
        console.log("user disconnected" + socket.id);
    });
    socket.on("message", (data) => {
        io.sockets
            .in(data.room.toLowerCase())
            .emit(data.room.toLowerCase(), data);
    });
    database.rooms.forEach((room) => {
        io.sockets.in(room.toLowerCase()).emit(room.toLowerCase(), {
            isWelcome: true,
            message: "User Connected",
            room: room.toLowerCase(),
        });
    });
});

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(cors());

app.get("/", (req, res) => {
    return res.render("pages/index", { title: "Register user" });
});

app.get("/rooms", (req, res) => {
    return res.render("pages/rooms", { title: "Rooms", rooms: database.rooms });
});

app.post("/register", (req, res) => {
    database.users.push(req.body.username);
    return res.status(200).json({ staus: true });
});
app.post("/create-room", (req, res)=>{
    if (!req.body.room || database.rooms.indexOf(req.body.room) != -1 || database.rooms.length > 8) {
        return res.status(400).json({status : false});
    }
    database.rooms.push(req.body.room);
    return res.status(200).json({status : true});
})
server.listen(3000, () => {
    console.log("App is running on", 3000);
});
