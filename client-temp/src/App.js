import './App.css';
import io from "socket.io-client";
import React, { useState, useEffect } from 'react';

import WaitingRoom from './gamePlay/waiting/waiting';
import GamePlayScreen from './gamePlay/gamePlay/gamePlay';

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  withCredentials: true, // Chuyển thông tin xác thực nếu cần
}); // Đảm bảo kết nối tới địa chỉ chính xác của server

function App() {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(5);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false); // chuyển tới waiting.js
  const [isGameStarted, setIsGameStarted] = useState(false); // đếm ngược
  const [isPlaying, setIsPlaying] = useState(false); // chuyển tới gamePlay.js
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    // Lắng nghe sự kiện thông báo đang chờ
    socket.on("waiting", (message) => {
      setWaitingMessage(message); // Cập nhật thông báo chờ
      console.log(message); // Log thông báo chờ
      setIsWaiting(true); // vào trạng thái chờ
    });
    // Lắng nghe sự kiện khi bắt đầu đếm ngược
    socket.on("startCountdown", ({ players }) => {
      setPlayers(players);
      setIsGameStarted(true)
      setCountdown(5); // Reset đếm ngược về 5 giây
      let timer = 5;
      const interval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setIsPlaying(true); // Bắt đầu game khi đếm ngược xong
          setIsWaiting(true); // vào trạng thái chờ
          console.log("Game has started!");
          console.log("Players:", players);
          
        }
      }, 1000);
    });

    // Lắng nghe sự kiện khi game bắt đầu
    socket.on("gameStart", ({ players }) => {
      console.log("Game has started with players:", players);
    });

    // Dọn dẹp khi component bị hủy
    return () => {
      socket.off("waiting");
      socket.off("startCountdown");
      socket.off("gameStart");
    };
  }, []);

  // Hàm tham gia game
  const joinGame = () => {
    if (name.length > 0) {
      socket.emit("joinGame", name); // Gửi tên người chơi với sự kiện joinGame
      console.log("Joining game...");
    }
  };

  return (
    <div className="App">
      {!isWaiting ? (
        <>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
          {waitingMessage && <p>{waitingMessage}</p>} {/* Hiển thị thông báo chờ */}
          {players.length === 2 && <p>Game starting in {countdown}s...</p>}
        </>

      ) : (
        <GameBoard 
        players={players} 
        isGameStarted={isGameStarted} 
        isPlaying={isPlaying} 
        isGameFinished={isGameFinished} 
        winner={winner} 
        setIsPlaying={setIsPlaying} 
        countdown={countdown} 
      />
      )}
    </div>
  );
}

function GameBoard({ players , isGameStarted, isPlaying, isGameFinished, winner, setIsPlaying , countdown}) {
  return (
    <div>
      {isPlaying ? <GamePlayScreen players={players} /> : <WaitingRoom players={players} isGameStarted={isGameStarted}/>}
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Leave Game" : "Start Game"}
      </button>
    </div>
  );
}

export default App;
