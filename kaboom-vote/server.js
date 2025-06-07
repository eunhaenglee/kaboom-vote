const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let voteCounts = { A: 0, B: 0 };

io.on("connection", (socket) => {
  console.log("👤 New user connected");

  socket.emit("update", voteCounts);

  socket.on("vote", (option) => {
    if (option === "A" || option === "B") {
      voteCounts[option]++;
      io.emit("update", voteCounts);
    }
  });

  socket.on("resetVotes", () => {
    voteCounts = { A: 0, B: 0 };
    io.emit("update", voteCounts);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected");
  });
});

server.listen(3000, () => {
  console.log("🚀 Server listening on http://localhost:3000");
});
