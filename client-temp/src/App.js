import './App.css';
import socket from './socket/socket';
import React, { useState, useEffect, useRef } from 'react';

import WaitingRoom from './gamePlay/waiting/waiting';
import GamePlayScreen from './gamePlay/gamePlay/gamePlay';



function App() {
  // joinGame
  const [name, setName] = useState(""); // tên người chơi
  const nameRef = useRef(name);  // tham chiếu tên người chơi
  const [players, setPlayers] = useState([]); // danh sách người chơi
  const [roomName, setRoomName] = useState(""); // tên phòng
  // waiting
  const [countdown, setCountdown] = useState(5); // đếm ngược 5s vào game - khi sự kiện isGameStarted = true
  const [waitingMessage, setWaitingMessage] = useState(""); // thông báo chờ
  const [isWaiting, setIsWaiting] = useState(false); // chuyển đổi đăng nhâp và gameBoard
  const [isGameStarted, setIsGameStarted] = useState(false); // tại waitingRoom - true = đếm ngược 5s - false = chờ ghép đôi
  const [isPlaying, setIsPlaying] = useState(false); // chuyển đổi waitingRoom và gamePlay
  // gamePlay
  const [isTurn, setIsTurn] = useState(false); // chuyển đổi lượt chơi
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(false); // xác định lượt chơi của player
  const [index, setIndex] = useState(null); // vị trí chọn
  // rePlay
  const [isReplay, setIsReplay] = useState(false); // biến chơi lại
  // Finised
  const [isGameFinished, setIsGameFinished] = useState(false); // biến kết thúc game
  const [winner, setWinner] = useState(null); // người chiến thắng

  useEffect(() => {
    nameRef.current = name;
  }, [name]);
  useEffect(() => {
    // Lắng nghe sự kiện thông báo đang chờ
    socket.on("waiting", (message) => {
      setWaitingMessage(message); // Cập nhật thông báo chờ
      console.log(message); // Log thông báo chờ
      setIsWaiting(true); // vào trạng thái chờ

      // đưa logic về ban đầu
      setIndex(null);
      setIsTurn(false);
      setIsPlayer1Turn(false);
      setIsGameFinished(false);
      setWinner(null);
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
    // lắng nghe sự kiện rePlay chơi lại game
    socket.on("rePlay", () => {
      setIsReplay(true);
      console.log('nhận sự kiện rePlay với name:', nameRef.current);
    });

    socket.on("gameReStart", () => {
      setIsGameStarted(true);
      console.log('chơi lại game cho cả hai');
      setIsReplay(false);
      setCountdown(5); // Reset countdown to 5
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(interval);
            setIsPlaying(true); // Start the game when countdown reaches 0
            console.log("Game has started!");
            return 0; // Ensure countdown reaches 0
          }
          return prevCountdown - 1;
        });
      }, 1000);
    });
    // nhận sự kieenjh người chơi thoát
    socket.on("playerLeft", () => {
      setIsWaiting(true); // chuyển tới gameBoard
      setIsPlaying(false); // chuyển tới waitingRoom
      setIsGameStarted(false); // đếm đợi ghép đôi
      console.log("playerLeft - Joining game...");
      socket.emit("playWithOther", nameRef.current);

    });
    // Dọn dẹp khi component bị hủy
    return () => {
      socket.off("waiting");
      socket.off("startCountdown");
      socket.off("gameStart");
      socket.off("flipTurn");
      socket.off("rePlay");
      socket.off("gameReStart");
      socket.off("playerLeft");
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
            <form onSubmit={(e) => e.preventDefault()} >
              <input type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)} />
              <button onClick={joinGame} className="btn btn-primary btn-block btn-large">Join Game</button>
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
          setIsWaiting={setIsWaiting}
          setIsGameStarted={setIsGameStarted}
          isReplay={isReplay}
          setIsReplay={setIsReplay}
        />
      )}
    </div>
  );
}

function GameBoard({ players, isGameStarted, isPlaying, isReplay, setIsReplay,
  isGameFinished, winner, setIsPlaying, setIsWaiting,
  countdown, setWinner, name, isTurn, setIsTurn, setIsGameStarted,
  roomName, index, setIndex, isPlayer1Turn, setIsPlayer1Turn }) {
  return (
    <div>
      {isPlaying ?
        <GamePlayScreen players={players} isGameFinished={isGameFinished} setWinner={setWinner}
          isTurn={isTurn} setIsTurn={setIsTurn} room={roomName} index={index} setIndex={setIndex}
          isPlayer1Turn={isPlayer1Turn} setIsPlayer1Turn={setIsPlayer1Turn} isPlaying={isPlaying}
          setIsPlaying={setIsPlaying} setIsWaiting={setIsWaiting} setIsGameStarted={setIsGameStarted}
          isReplay={isReplay} setIsReplay={setIsReplay}
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
