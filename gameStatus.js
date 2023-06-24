import { tetrominoesData } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"

export let currentStatus = {
    startScreen: true,
    startTime: performance.now(),
    pauseStartTime: undefined,
    pauseDuration: 0,
    frameCount: 0,
    isPaused: false,
    isOver: false,
    animationFrameId: 0,
}

export function pauseResumeToggle() {
    if (currentStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    if (currentStatus.isPaused === true) {
        currentStatus.pauseDuration += performance.now() - currentStatus.pauseStartTime;
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        toggleMessageBox();
        currentStatus.isPaused = false;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        currentStatus.pauseStartTime = performance.now();
        pauseBtnText.textContent = "RESUME";
        pauseBtn.classList.remove("pauseButtonRed");
        pauseBtn.classList.add("pauseButtonGreen");
        toggleMessageBox("PAUSED");
        currentStatus.isPaused = true;
    }
}

export function restartGame() {
    window.cancelAnimationFrame(currentStatus.animationFrameId);
    document.getElementById('timer').textContent = "00:00";
    currentStatus.frameCount = 0;
    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });
    gamebox.resetGrid();
    if (currentStatus.isPaused === true) {
        const pauseBtn = document.getElementById("pauseButton");
        const pauseBtnText = document.getElementById("pauseButtonText");
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        currentStatus.isPaused = false;   
    }
    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";
    currentStatus.isOver = false;
    currentStatus.pauseDuration = 0;
    currentStatus.startTime = performance.now();
    window.dispatchEvent(new Event('runAnimation'));
    return new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
}

export function toggleMessageBox(message) {
    const messageBox = document.getElementById("gameMessageBox");
    const messageSpan = document.getElementById("gameMessage");
    if (messageBox.style.display !== "flex") {
        messageSpan.textContent = message;
        messageBox.style.display = "flex";
    } else {
        messageBox.style.display = "none";
    }
}

export function msToMinutesSecondsString(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}