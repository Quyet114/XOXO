// client/src/gamePlay/gamePlay/GamePlayScreen.js
import React, { useState, useEffect } from 'react';
import './gamePlay.css';
import socket from '../../socket/socket';

function GamePlayScreen({ players, isgameFinished, setWinner, isTurn, setIsTurn, room, index, setIndex }) {

    const [board, setBoard] = useState(Array(9).fill(null));
    const XImage = require('../image/x.png');
    const OImage = require('../image/o.png');

    useEffect(() => {
        if (index !== null) {
            const newBoard = [...board];
            newBoard[index] = !isTurn ? "X" : "O";
            setBoard(newBoard);
            if (isTurn) {
                setIsTurn(false);
            } else {
                setIsTurn(true);
            }

        }

    }, [index]);

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
    const status = winner
        ? `Winner: ${winner}`
        : `Next player: ${!isTurn ? "X" : "O"}`;

    const renderCell = (index) => (
        <div className="cell" onClick={() => handleClick(index)}>
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
                    <div className="player">{players[0].name}</div>
                    <div className="countdown">
                        <svg viewBox="-50 -50 100 100" stroke-width="10">
                            <circle r="45"></circle>
                            <circle r="45" pathLength="1"></circle>
                        </svg>
                    </div>
                    <div className="player">{players[1].name}</div>
                </div>


                <div className="grid">
                    {Array(9)
                        .fill(null)
                        .map((_, index) => renderCell(index))}
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
