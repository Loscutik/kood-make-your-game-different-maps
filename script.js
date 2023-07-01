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
        renewGame();
    })
}

function renewGame() {
    gamebox.resetGrid();
    tetromino = restartGame();
    animate();
}


let tetromino;

class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            // " ": false,
            // r: false,
            // Enter: false,

        };
        this.keysDownTimes = {}
        window.addEventListener('keydown', e => {
            switch (e.key) {
                case "ArrowLeft":
                case "ArrowRight":
                case "ArrowDown":
                case "ArrowUp":
                    this.keys[e.key] = true;
                    break;
                case " ":
                    if (!currentStatus.startScreen) pauseResumeToggle();
                    break;
                case "r":
                case "R":
                    if (!currentStatus.startScreen) renewGame();
                    break;
                case "Enter":
                    if (currentStatus.startScreen) {
                        document.getElementById("startBox").style.display = "none";
                        document.getElementById("startScreenOverlay").style.display = "none";
                        currentStatus.startScreen = false;
                        currentStatus.startTime = performance.now();
                        currentStatus.heartStartTime = performance.now();
                        tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
                        animate();
                    }

                    break;
            }
        });

        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp"
            ) {
                this.keys[e.key] = false;
            }
        });
    }
}

const input = new InputHandler();
let isMovedDown = true;

async function animate() {
    if (currentStatus.isPaused === true || Object.keys(tetromino).length === 0) {
        return
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    isMovedDown = tetromino.moveDown(verticalSpeed);
    if (!isMovedDown) {
        gamebox.freezeTilesInBox(tetromino.getOccupiedCells());
        await gamebox.checkForFinishedRows();
        const randomTetrominoNumber = Math.floor(Math.random() * 7);
        // if (!gamebox.checkIfNewTetrominoOverlapping(randomTetrominoNumber)) {
        //     tetromino = new Tetromino(tetrominoesData[randomTetrominoNumber]);
        // } else {
        //     //Create bottom half of tetromino, as there's only space for that
        //     tetromino = new Tetromino(tetrominoesData[randomTetrominoNumber], true);
        // }
        tetromino = new Tetromino(tetrominoesData[randomTetrominoNumber]);
        //New tetromino fits fully to screen, but ends game
        //console.log(tetromino.toString())
        if (Object.keys(tetromino).length === 0) { // if the new tetromino is empty
            toggleMessageBox("GAME OVER");
            currentStatus.isOver = true;
            return
        }
    }


    //Turn tetromino with Up Arrow key
    if (input.keys.ArrowUp) {
        tetromino.rotate();
        input.keys.ArrowUp = false;
    }

    //Move tile horizontally
    if (input.keys.ArrowRight) {
        tetromino.moveRight();
        input.keys.ArrowRight = false;

    } else if (input.keys.ArrowLeft) {
        tetromino.moveLeft();
        input.keys.ArrowLeft = false;
    }

    //Speed up downward movement with Down Arrow key
    if (input.keys.ArrowDown) {
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
            heartStopperCollection[currentStatus.livesLeft - 1].textContent = heartTime;
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