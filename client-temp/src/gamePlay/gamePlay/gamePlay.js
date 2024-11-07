// client/src/gamePlay/gamePlay/GamePlayScreen.js
import React, { useState, useEffect } from 'react';
import './gamePlay.css';
import socket from '../../socket/socket';

function GamePlayScreen(
    { players, isgameFinished, setWinner, isTurn,
        setIsTurn, room, index, setIndex, isPlayer1Turn, setIsPlayer1Turn
    }
) {

    const [board, setBoard] = useState(Array(9).fill(null));
    const XImage = require('../image/x.png');
    const OImage = require('../image/o.png');
    const [titleFinished, setTitleFinished] = useState("Bạn đã thua");
    useEffect(() => {
        const newBoard = [...board];
        newBoard[index] = !isTurn ? "X" : "O";
        setBoard(newBoard);
    }, [isTurn]);

    const handleClick = (index) => {
        if (!isTurn) {
            alert("It's not your turn!");
        } else {
            if (board[index] || calculateWinner(board)) return;
            socket.emit("move", { index, room: room });
            console.log("move", { index, room: room });
            setIsTurn(pre => !pre);
            setIndex(index);
        }
    };
    const winner = calculateWinner(board);
    useEffect(() => {
        console.log('winner', winner);
        if (winner === "X") {
            setWinner(winner);
            setTitleFinished("Ban đã chiến thắng");
            document.getElementById("myModal").style.display = "block";
        } else if (winner === "O") {
            setWinner(winner);
            setTitleFinished("Ban đẫ thua");
            document.getElementById("myModal").style.display = "block";
        }


    }, [winner]);
    window.onclick = function (event) {
        const modal = document.getElementById("myModal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    const renderCell = (index) => (
        <div className="cell"
            onClick={() => handleClick(index)}
            style={{ pointerEvents: board[index] ? 'none' : 'auto' }}
        >
            {board[index] && (
                <img
                    src={board[index] === "X" ? XImage : OImage}
                    alt={board[index]}
                    className="cell-image"
                />
            )}
        </div>
    );


    return (
        <div className="gameplay-screen">
            <div className="board">
                <div className='header-player'>
                    <div className='playerLine'>
                        <div className="player">{players[0].name}</div>
                        {isTurn == isPlayer1Turn ? <div className="line"></div> : <div className="lineStart"></div>}
                    </div>
                    <div className="countdown">

                    </div>
                    <div className='playerLine'>
                        <div className="player">{players[1].name}</div>
                        {isTurn != isPlayer1Turn ? <div className="line"></div> : <div className="lineStart"></div>}
                    </div>

                </div>

                <div className="grid">
                    {Array(9)
                        .fill(null)
                        .map((_, index) => renderCell(index))}
                </div>
                <div id="myModal" class="modal">
                    <div class="modal-content">
                        <span class="close" onclick="closeModal()">&times;</span>
                        <div className='title'>{titleFinished}</div>
                        <p></p>
                        <div className='button-parent'>
                            <button className='button'>Đấu lại</button>
                            <button className='button'>Tìm người khác</button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
// Hàm kiểm tra người thắng cuộc
const calculateWinner = (squares) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let line of lines) {
        const [a, b, c] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};
export default GamePlayScreen;
