
import {io} from 'socket.io-client';
const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true, // Chuyển thông tin xác thực nếu cần
  reconnection: false,
}); // Đảm bảo kết nối tới địa chỉ chính xác của server
export default socket;