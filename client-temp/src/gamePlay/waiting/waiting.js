// client/src/gamePlay/waiting/WaitingRoom.js
import React, { useState, useEffect } from 'react';
import './waiting.css';

function WaitingRoom({ players, isGameStarted }) {
    const [countTime, setCountTime] = useState(0);
    const [countDown, setCountDown] = useState(5);
    // đếm thời gian chờ
    useEffect(() => {
        let timer = 0;
        const interval = setInterval(() => {
            timer += 1;
            setCountTime(timer);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);
    useEffect(() => {
        if (isGameStarted) {
            let timer = 5;
            const interval = setInterval(() => {
                timer -= 1;
                setCountDown(timer);
                if (timer <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }   
    }, [isGameStarted]);
    return (
        <div className="waiting-room">
            {!isGameStarted ?
                <>
                    <h2>Waiting for an opponent... {countTime} s</h2>
                    <p>Please wait while we find someone for you to play with!</p>
                </>

                :
                <>
                    <h2>Starting... {countDown} s</h2>
                </>
            }
        </div>
    );
}

export default WaitingRoom;
