// server/server.js
const express = require("express"); // Import thư viện express

const http = require("http"); // Import thư viện http
const { Server } = require("socket.io"); // Import lớp Server từ thư viện socket.io
const path = require("path"); // Import thư viện path
const cors = require("cors"); // Import thư viện cors
const app = express(); // Tạo một ứng dụng express
const server = http.createServer(app); // Tạo một server HTTP từ ứng dụng express
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
}); // Tạo một server socket.io từ server HTTP với cấu hình CORS

// Middleware để xử lý CORS
app.use(cors());

let waitingPlayer = null; // Biến lưu trữ người chơi đang đợi

io.on("connection", (socket) => { // Lắng nghe sự kiện kết nối từ client
  console.log("A user connected:", socket.id); // In ra console khi có người dùng kết nối

  socket.on("joinGame", (name) => { // Lắng nghe sự kiện "joinGame" từ client
    // Nếu chưa có người đợi, đặt người chơi vào hàng chờ
    if (!waitingPlayer) {
      waitingPlayer = { id: socket.id, name }; // Lưu thông tin người chơi vào biến waitingPlayer
      socket.emit("waiting", "Waiting for an opponent..."); // Gửi thông báo cho người chơi rằng đang đợi đối thủ
    } else {
      // Ghép người chơi đang đợi và người chơi mới vào cùng một phòng
      const roomName = `room-${waitingPlayer.id}-${socket.id}`; // Tạo tên phòng từ id của hai người chơi
      socket.join(roomName); // Thêm người chơi mới vào phòng

      const waitingSocket = io.sockets.sockets.get(waitingPlayer.id);
      if (waitingSocket) {
        waitingSocket.join(roomName); // Thêm người chơi đợi vào phòng
      }
      io.to(waitingPlayer.id).emit("startCountdown", { players: [{ id: waitingPlayer.id, name: waitingPlayer.name }, { id: socket.id, name }] }); // Gửi sự kiện "startCountdown" cho người chơi đang đợi
      io.to(socket.id).emit("startCountdown", { players: [{ id: waitingPlayer.id, name: waitingPlayer.name }, { id: socket.id, name }] }); // Gửi sự kiện "startCountdown" cho người chơi mới

      setTimeout(() => {
        io.to(waitingPlayer.id).emit("gameStart", { players: [{ id: waitingPlayer.id, name: waitingPlayer.name }, { id: socket.id, name }] }); // Gửi sự kiện "gameStart" cho người chơi đang đợi
        io.to(socket.id).emit("gameStart", { players: [{ id: waitingPlayer.id, name: waitingPlayer.name }, { id: socket.id, name }] }); // Gửi sự kiện "gameStart" cho người chơi mới
      }, 5500); // đếm ngược 5s

      waitingPlayer = null; // Reset hàng đợi
    }
  });

  socket.on("disconnect", () => { // Lắng nghe sự kiện ngắt kết nối từ client
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null; // Reset hàng đợi nếu người chơi đợi rời đi    
    }
    console.log("User disconnected:", socket.id); // In ra console khi có người dùng ngắt kết nối
  });
});

app.use(express.static(path.join(__dirname, "../client/build"))); // Sử dụng thư mục tĩnh để phục vụ các file tĩnh từ thư mục build của client

app.get("*", (req, res) => { // Định nghĩa route cho tất cả các request
  res.sendFile(path.join(__dirname, "../client/build", "index.html")); // Gửi file index.html cho tất cả các request
});

server.listen(3001, () => { // Lắng nghe kết nối trên cổng 3001
  console.log("Server is running on http://localhost:3001"); // In ra console khi server bắt đầu chạy
});
