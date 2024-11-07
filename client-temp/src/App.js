import './App.css';
import socket from './socket/socket';
import React, { useState, useEffect, useRef } from 'react';

import WaitingRoom from './gamePlay/waiting/waiting';
import GamePlayScreen from './gamePlay/gamePlay/gamePlay';



function App() {
  // joinGame
  const [name, setName] = useState("");
  const nameRef = useRef(name);
  const [players, setPlayers] = useState([]);
  const [roomName, setRoomName] = useState("");
  // waiting
  const [countdown, setCountdown] = useState(5);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false); // chuyển tới waiting.js
  const [isGameStarted, setIsGameStarted] = useState(false); // đếm ngược
  const [isPlaying, setIsPlaying] = useState(false); // chuyển tới gamePlay.js
  // gamePlay
  const [isTurn, setIsTurn] = useState(false);
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(false);
  const [index, setIndex] = useState(null);
  // Finised
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);
  useEffect(() => {
    // Lắng nghe sự kiện thông báo đang chờ
    socket.on("waiting", (message) => {
      setWaitingMessage(message); // Cập nhật thông báo chờ
      console.log(message); // Log thông báo chờ
      setIsWaiting(true); // vào trạng thái chờ
    });
    // Lắng nghe sự kiện khi bắt đầu đếm ngược
    socket.on("startCountdown", ({ players, room }) => {
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
          console.log("Room:", room);
          setRoomName(room);
        }
      }, 1000);
    });

    // Lắng nghe sự kiện khi game bắt đầu
    socket.on("gameStart", ({ players }) => {
      console.log("Game has started with players:", players);

      if (nameRef.current === players[0].name) {
        setIsTurn(true);
        setIsPlayer1Turn(true);
      }
      console.log("name: ", name, "players[0].name: ", players[0].name);

    });

    // Lắng nghe sự kiện di chuyển
    socket.on("flipTurn", (index) => {
      console.log("flipTurn", index);
      setIndex(index);
      setIsTurn((pre) => !pre);
    });

    // Dọn dẹp khi component bị hủy
    return () => {
      socket.off("waiting");
      socket.off("startCountdown");
      socket.off("gameStart");
      socket.off("flipTurn");
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
          <div className="login">
            <h1>Login</h1>
            <form onSubmit={(e)=> e.preventDefault()} >
              <input type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)} />
              <button onClick={joinGame}  className="btn btn-primary btn-block btn-large">Join Game</button>
            </form>
          </div>
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
          setWinner={setWinner}
          roomName={roomName}
          isTurn={isTurn}
          setIsTurn={setIsTurn}
          index={index}
          setIndex={setIndex}
          isPlayer1Turn={isPlayer1Turn}
          setIsPlayer1Turn={setIsPlayer1Turn}
        />
      )}
    </div>
  );
}

function GameBoard({ players, isGameStarted, isPlaying,
  isGameFinished, winner, setIsPlaying,
  countdown, setWinner, name, isTurn, setIsTurn, 
  roomName, index , setIndex, isPlayer1Turn, setIsPlayer1Turn}) {
  return (
    <div>
      {isPlaying ?
        <GamePlayScreen players={players} isGameFinished={isGameFinished} setWinner={setWinner}
          isTurn={isTurn} setIsTurn={setIsTurn} room={roomName} index={index}  setIndex={setIndex}
          isPlayer1Turn={isPlayer1Turn} setIsPlayer1Turn={setIsPlayer1Turn}
        />
        :
        <WaitingRoom players={players} isGameStarted={isGameStarted} />
      }

      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Leave Game" : "Start Game"}
      </button>
    </div>
  );
}

export default App;
