require('dotenv').config()
const bodyParser = require("body-parser");
const NODE_ENV=process.env.NODE_ENV||"PRODUCTION";
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require('morgan');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT=process.env.PORT||5000;
let database = {
  users: [],
  rooms: ["default"],
};
if (NODE_ENV === "DEVELOPMENT") {
  app.use(morgan('combined'))
}
io.on("connection", (socket) => {
  database.rooms.forEach((room) => {
    socket.join(room.toLowerCase());
  });
  socket.on("disconnect", () => {

  });
  socket.on("message", (data) => {
    io.sockets.in(data.room.toLowerCase()).emit(data.room.toLowerCase(), data);
  });
  database.rooms.forEach((room) => {
    io.sockets.in(room.toLowerCase()).emit(room.toLowerCase(), {
      isWelcome: true,
      message: "User Connected",
      room: room.toLowerCase(),
      socket: socket.id,
      size: io.sockets.adapter.rooms.get(room.toLowerCase()).size
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
app.post("/create-room", (req, res) => {
  if (
    !req.body.room ||
    database.rooms.indexOf(req.body.room) != -1 ||
    database.rooms.length > 8
  ) {
    return res.status(400).json({ status: false });
  }
  database.rooms.push(req.body.room.toLowerCase());
  return res.status(200).json({ status: true });
});
app.get("/check", (req, res) => {
  const query = req.query.room;
  const status = database.rooms.indexOf(query) !== -1;
  return res.status(200).json({ status });
});
app.delete("/delete-room", (req, res) => {
  const room = req.query.room;
  if (!room || room == null) {
    return res.status(400).json({ status: false });
  }
  const index = database.rooms.indexOf(room.toLowerCase());
  if (index != -1) {
    database.rooms.splice(index, 1);
    return res.status(200).json({ status: true });
  }
  return res.status(400).json({ status: false });
});
server.listen(PORT, () => {
  console.log("App is running on", PORT);
});
