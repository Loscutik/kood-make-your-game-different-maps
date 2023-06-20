import { tetrominoesData } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"

export const currentStatus = {
    _isPaused: false,
    _isOver: false,
    _animationFrameId: 0,
    get isPaused() {
        return this._isPaused;
    },
    set isPaused(bool) {
        if (typeof bool !== "boolean") {
            throw new Error("isPaused must be a boolean")
        }
        this._isPaused = bool;
    },
    get isOver() {
        return this._isOver;
    },
    set isOver(bool) {
        if (typeof bool !== "boolean") {
            throw new Error("isPaused must be a boolean")
        }
        this._isOver = bool;
    },
    get animationFrameId() {
        return this._animationFrameId;
    },
    set animationFrameId(id) {
        this._animationFrameId = id;
    }
}

export function pauseResumeToggle() {
    if (currentStatus.isOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    if (currentStatus.isPaused === true) {
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        toggleMessageBox();
        currentStatus.isPaused = false;
        window.dispatchEvent(new Event('runAnimation'));
    } else {
        pauseBtnText.textContent = "RESUME";
        pauseBtn.classList.remove("pauseButtonRed");
        pauseBtn.classList.add("pauseButtonGreen");
        toggleMessageBox("PAUSED");
        currentStatus.isPaused = true;
    }
}

export function restartGame() {
    window.cancelAnimationFrame(currentStatus.animationFrameId);
    const gameboxElement = document.getElementById("gamebox");
    const tetrominoes = gameboxElement.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });
    gamebox.resetColumnTops();
    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";
    currentStatus.isPaused = false;
    currentStatus.isOver = false;
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