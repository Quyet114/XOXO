// client/src/gamePlay/gamePlay/GamePlayScreen.js
import React from 'react';
import './gamePlay.css';

function GamePlayScreen({ players }) {
    return (
        <div className="gameplay-screen">
            <h2>Game in Progress</h2>
            <div className="game-board">
                {/* Khu vực bảng trò chơi (có thể thêm sau) */}
                <p>{players[0].name}  vs  {players[1].name}</p>
            </div>
        </div>
    );
}

export default GamePlayScreen;
