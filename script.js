import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"
import { currentStatus, pauseResumeToggle, restartGame, toggleMessageBox, msToMinutesSecondsString, removeHeartOrEndGame } from "./gameStatus.js"

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
        gamebox.resetGrid();
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
                gamebox.resetGrid();
                tetromino = restartGame();
            } else if (this.keys.includes("Enter") & currentStatus.startScreen) {
                document.getElementById("startBox").style.display = "none";
                document.getElementById("startScreenOverlay").style.display = "none";
                currentStatus.startScreen = false;
                currentStatus.startTime = performance.now();
                currentStatus.heartStartTime = performance.now();
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
let isMovedDown=true;

async function animate() {
    if (currentStatus.isPaused === true) {
        return
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    isMovedDown=tetromino.moveDown(verticalSpeed);
    if (!isMovedDown) {
        gamebox.freezeTilesInBox(tetromino.getTiles());
        await gamebox.checkForFinishedRows();
        const randomTetrominoNumber = Math.floor(Math.random() * 7);
        if (!gamebox.checkIfNewTetrominoOverlapping(randomTetrominoNumber)) {
            tetromino = new Tetromino(tetrominoesData[randomTetrominoNumber]);
        } else {
            //Create bottom half of tetromino, as there's only space for that
            tetromino = new Tetromino(tetrominoesData[randomTetrominoNumber], true);
        }
        //New tetromino fits fully to screen, but ends game
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

    //On every 60 frames:
    if (currentStatus.frameCount % 60 === 0) {
        //Update main timer
        let playingTime = performance.now() - currentStatus.startTime - currentStatus.pauseDuration;
        document.getElementById('mainTimer').textContent = msToMinutesSecondsString(playingTime);

        //Update heart timer
        let heartTime = 20 - ((performance.now() - currentStatus.heartStartTime - currentStatus.pauseDuration) / 1000).toFixed();
        if (heartTime > 20) heartTime = 20;

        if (heartTime < 1) {
            removeHeartOrEndGame();
        } else {
            const heartStopperCollection = document.getElementsByClassName('heartStopper');
            heartStopperCollection[currentStatus.livesLeft-1].textContent = heartTime;
        }
        
        //Calculate the average frame rate over the last 60 frames
        let averageFPS = 60 / ((performance.now() - currentStatus.lastFrame) / 1000);
        document.getElementById("fpsDisplay").innerHTML = averageFPS.toFixed(2);
        currentStatus.lastFrame = performance.now();
    }

    currentStatus.frameCount++;

    //Loop the animation
    currentStatus.animationFrameId = requestAnimationFrame(animate);
}

//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();