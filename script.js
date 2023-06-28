import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"
import { currentStatus, pauseResumeToggle, restartGame, toggleMessageBox, msToMinutesSecondsString } from "./gameStatus.js"

//Option to disable start screen for development:
// 1) style.css: #startBox -> display: none; & #startScreenOverlay -> display: none;
// 2) gameStatus.js: currentStatus.startScreen = false;
// 3) script.js: on the bottom decomment "tetromino = ..." & "animate()"

let verticalSpeed = 2;

window.addEventListener("DOMContentLoaded", function () {
    startButtonListener();
    pauseButtonListener();
    restartButtonListener();
});

window.addEventListener("runAnimation", animate);

function startButtonListener() {
    const startBtn = document.getElementById("startButton");
    startBtn.addEventListener("click", function () {
        document.getElementById("startBox").style.display = "none";
        document.getElementById("startScreenOverlay").style.display = "none";
        currentStatus.startScreen = false;
        currentStatus.startTime = performance.now();
        tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
        animate();
    })
}

function pauseButtonListener() {
    const pauseBtn = document.getElementById("pauseButton");
    pauseBtn.addEventListener("click", function () {
        pauseResumeToggle();
    })
}

function restartButtonListener() {
    const restartBtn = document.getElementById("restartButton");
    restartBtn.addEventListener("click", function () {
        tetromino = restartGame();
    })
}

let tetromino;

class InputHandler {
    constructor() {
        this.keys = [];
        this.keysDownTimes = {}
        window.addEventListener('keydown', e => {
            if ((e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === " " ||
                e.key === "r" ||
                e.key === "Enter") &&
                !this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }
            if (this.keys.includes(" ") & !currentStatus.startScreen) {
                pauseResumeToggle();
            } else if (this.keys.includes("r") & !currentStatus.startScreen) {
                tetromino = restartGame();
            } else if (this.keys.includes("Enter") & currentStatus.startScreen) {
                document.getElementById("startBox").style.display = "none";
                document.getElementById("startScreenOverlay").style.display = "none";
                currentStatus.startScreen = false;
                currentStatus.startTime = performance.now();
                tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
                animate();
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === " " ||
                e.key === "r" ||
                e.key === "Enter") {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

const input = new InputHandler();

function animate() {
    if (currentStatus.isPaused === true) {
        return
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    if (!tetromino.moveDown(verticalSpeed)) {
        gamebox.freezeTilesInBox(tetromino.getTiles());
        gamebox.checkForFinishedRows();
        tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
        if (gamebox.hasObstacleUnderOf(tetromino.getBottomEdgeCells())) {
            toggleMessageBox("GAME OVER");
            currentStatus.isOver = true;
            return
        }
    }

    //Turn tetromino with Up Arrow key
    if (input.keys.includes("ArrowUp")) {
        tetromino.rotate();
        input.keys.splice(input.keys.indexOf("ArrowUp"), 1);
    }

    //Move tile horizontally
    if (input.keys.includes("ArrowRight")) {
        tetromino.moveRight();
        input.keys.splice(input.keys.indexOf("ArrowRight"), 1);

    } else if (input.keys.includes("ArrowLeft")) {
        tetromino.moveLeft();
        input.keys.splice(input.keys.indexOf("ArrowLeft"), 1);
    }

    //Speed up downward movement with Down Arrow key
    if (input.keys.includes("ArrowDown")) {
        verticalSpeed = 8;
    } else {
        verticalSpeed = 2;
    }

    //Update timer on every 60ms
    if (currentStatus.frameCount % 60 === 0) {
        let elapsedTime = performance.now() - currentStatus.startTime - currentStatus.pauseDuration;
        document.getElementById('timer').textContent = msToMinutesSecondsString(elapsedTime);
    }

    currentStatus.frameCount++;

    //Loop the animation
    currentStatus.animationFrameId = requestAnimationFrame(animate);
}

//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();