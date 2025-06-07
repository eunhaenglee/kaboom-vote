const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let votes = { A: 0, B: 0 };

io.on("connection", (socket) => {
  socket.emit("update", votes);

  socket.on("vote", (choice) => {
    if (choice === "A" || choice === "B") {
      votes[choice]++;
      io.emit("update", votes);
    }
  });

  socket.on("resetVotes", () => {
    votes = { A: 0, B: 0 };
    io.emit("update", votes);
  });
});

// ✅ 이 부분이 가장 중요
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
