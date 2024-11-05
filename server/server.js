// server/server.js
const express = require("express"); // Import thư viện express

const http = require("http"); // Import thư viện http
const { Server } = require("socket.io"); // Import lớp Server từ thư viện socket.io
const path = require("path"); // Import thư viện path
const cors = require("cors"); // Import thư viện cors
const app = express(); // Tạo một ứng dụng express
const server = http.createServer(app); // Tạo một server HTTP từ ứng dụng express
const io = new Server(server); // Tạo một server socket.io từ server HTTP

// Middleware để xử lý CORS
app.use(cors());

let waitingPlayers = []; // Biến lưu trữ người chơi đang đợi
let roomName = ""; // Biến lưu trữ tên phòng


io.on("connection", (socket) => { // Lắng nghe sự kiện kết nối từ client
  console.log("A user connected:", socket.id); // In ra console khi có người dùng kết nối
  // kết nối người chơi
  socket.on("joinGame", (name) => { // Lắng nghe sự kiện "joinGame" từ client
    waitingPlayers.push({ id: socket.id, name }); // Thêm người chơi vào hàng chờ
    socket.emit("waiting", "Waiting for an opponent..."); // Gửi thông báo cho người chơi rằng đang đợi đối thủ


    if (waitingPlayers.length === 2) {
      const [player1, player2] = waitingPlayers; // Lấy thông tin hai người chơi
      roomName = `room-${player1.id}-${player2.id}`; // Tạo tên phòng từ id của hai người chơi

      // Thêm cả hai người chơi vào cùng một phòng
      //socket.join(roomName); // Gọi socket.join() cho người chơi mới
      const waitingSocket = io.sockets.sockets.get(player1.id);
      if (waitingSocket) {
        waitingSocket.join(roomName); // Gọi join() cho người chơi đang chờ
        console.log("player1.id", player1.id);
        
      }
      const waitingSocket1 = io.sockets.sockets.get(player2.id);
      if (waitingSocket1) {
        waitingSocket1.join(roomName); // Gọi join() cho người chơi đang chờ
        console.log("player1.id", player1.id);
      }

      io.to(roomName).emit("startCountdown", {
        players: [
          { id: player1.id, name: player1.name },
          { id: player2.id, name: player2.name },
        ],
        room: roomName,
      });

      // Đếm ngược 5 giây

      setTimeout(() => {
        io.to(roomName).emit("gameStart", {
          players: [{ id: player1.id, name: player1.name }, { id: player2.id, name: player2.name }],
        });

        waitingPlayers = []; // Reset hàng đợi sau khi bắt đầu game
      }, 5000);
    }
  });

  // Xử lý sự kiện di chuyển
  socket.on("move", ({ index, room }) => {
    // console.log("move", { index, room });
    // socket.to(room).emit("flipTurn", index);
    // lấy người chơi có trong room
    const players = io.sockets.adapter.rooms.get(room);
    const [player1, player2] = [...players];
    socket.to(player1).to(player2).emit("flipTurn", index);
  });


  socket.on("disconnect", () => { // Lắng nghe sự kiện ngắt kết nối từ client                                                                                                                                                                                                                                                                      
    console.log("User disconnected:", socket.id); // In ra console khi có người dùng ngắt kết nối
    waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
  });

});

// 


app.use(express.static(path.join(__dirname, "../client/build"))); // Sử dụng thư mục tĩnh để phục vụ các file tĩnh từ thư mục build của client

app.get("*", (req, res) => { // Định nghĩa route cho tất cả các request
  res.sendFile(path.join(__dirname, "../client/build", "index.html")); // Gửi file index.html cho tất cả các request
});

server.listen(3001, () => { // Lắng nghe kết nối trên cổng 3001
  console.log("Server is running on http://localhost:3001"); // In ra console khi server bắt đầu chạy
});
