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

// ✅ 반드시 PORT 환경변수 사용해야 함
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
