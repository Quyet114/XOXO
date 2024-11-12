// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

let waitingPlayers = [];
let roomInfo = {}; // Thêm một đối tượng để lưu trữ thông tin phòng của mỗi socket

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Kết nối người chơi
  socket.on("joinGame", (name) => {
    waitingPlayers.push({ id: socket.id, name });
    socket.emit("waiting", "Waiting for an opponent...");

    if (waitingPlayers.length === 2) {
      const [player1, player2] = waitingPlayers;
      const roomName = `room-${player1.id}-${player2.id}`;
      roomInfo[player1.id] = roomName;
      roomInfo[player2.id] = roomName;

      const waitingSocket1 = io.sockets.sockets.get(player1.id);
      const waitingSocket2 = io.sockets.sockets.get(player2.id);

      if (waitingSocket1 && waitingSocket2) {
        waitingSocket1.join(roomName);
        waitingSocket2.join(roomName);

        io.to(roomName).emit("startCountdown", {
          players: [
            { id: player1.id, name: player1.name },
            { id: player2.id, name: player2.name },
          ],
          room: roomName,
        });

        setTimeout(() => {
          io.to(roomName).emit("gameStart", {
            players: [
              { id: player1.id, name: player1.name },
              { id: player2.id, name: player2.name },
            ],
          });
          waitingPlayers = [];
        }, 5000);
      }
    }
  });

  // Xử lý sự kiện di chuyển
  socket.on("move", ({ index, room }) => {
    socket.to(room).emit("flipTurn", index);
  });

  // chơi lại khi có waiting
  socket.on("gameReplay", (room) => {
    const players = io.sockets.adapter.rooms.get(room);
    if (players) {
      io.to(room).emit("gameReStart", {
        players: Array.from(players).map((playerId) => {
          const playerSocket = io.sockets.sockets.get(playerId);
          return { id: playerSocket.id, name: playerSocket.name };
        }),
      });
    }
  });
  // chơi lại khi không có waiting
  socket.on("SendReplay", (room) => {
    const players = io.sockets.adapter.rooms.get(room);
    if (players) {
      io.to(room).emit("rePlay");
      console.log("SendReplay - Joining game...");
      
    }
  });
  // chơi với người chơi khác 
  socket.on("playWithOther", (name) => {
      // đưa nguời chơi vào hàng đợi
      waitingPlayers.push({ id: socket.id, name: name });
      socket.emit("waiting", "Waiting for an opponent...");
      if (waitingPlayers.length === 2) {
        const [player1, player2] = waitingPlayers;
        const roomName = `room-${player1.id}-${player2.id}`;
        roomInfo[player1.id] = roomName;
        roomInfo[player2.id] = roomName;
  
        const waitingSocket1 = io.sockets.sockets.get(player1.id);
        const waitingSocket2 = io.sockets.sockets.get(player2.id);
  
        if (waitingSocket1 && waitingSocket2) {
          waitingSocket1.join(roomName);
          waitingSocket2.join(roomName);
  
          io.to(roomName).emit("startCountdown", {
            players: [
              { id: player1.id, name: player1.name },
              { id: player2.id, name: player2.name },
            ],
            room: roomName,
          });
  
          setTimeout(() => {
            io.to(roomName).emit("gameStart", {
              players: [
                { id: player1.id, name: player1.name },
                { id: player2.id, name: player2.name },
              ],
            });
            waitingPlayers = [];
          }, 5000);
        }
      }
  });
  socket.on("findOther", ( room ) => {
    const players = io.sockets.adapter.rooms.get(room);
    if (players) {
      io.to(room).emit("playerLeft");
      console.log("findOther - Joining game...");
    }
  });

  // Xử lý ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Xóa người chơi khỏi hàng đợi
    waitingPlayers = waitingPlayers.filter((player) => player.id !== socket.id);

    // Gửi thông báo tới phòng về việc người chơi đã rời đi
    const roomName = roomInfo[socket.id];
    if (roomName) {
      socket.broadcast.to(roomName).emit("playerLeft", {
        message: "A user has disconnected from the room",
        socketId: socket.id,
      });

      // Xóa thông tin phòng của socket
      delete roomInfo[socket.id];
    }
  });
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
