// TODO check for the possobility of movingafter move at side (case is fell on the line, moved ta the side which have a gap under)
// TODO hearts musn't disappear when waiting at the start screen
import { tetrominoesData, HEART_TIME } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"
import { currentStatus, pauseResumeToggle, restartGame, toggleMessageBox, msToMinutesSecondsString, blinkHeart, removeHeartOrEndGame, pickAndShowNextTetromino } from "./gameStatus.js"

//Option to disable start screen for development:
// 1) style.css: #startBox -> display: none; & #startScreenOverlay -> display: none;
// 2) gameStatus.js: currentStatus.startScreen = false;
// 3) script.js: on the bottom decomment "tetromino = ..." & "animate()"

let verticalSpeed = 1;

window.addEventListener("DOMContentLoaded", function () {
    buttonListener("startButton", startGame);
    buttonListener("pauseButton", pauseResumeToggle);
    buttonListener("restartButton", renewGame);
});

window.addEventListener("runAnimation", (event) => animate(event.timeStamp));

//Helper function to handle button clicks
function buttonListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", callback);
}

function renewGame() {
    gamebox.resetGrid();
    tetromino = restartGame();
    animate(performance.now());
}

function startGame() {
    document.getElementById("startBox").style.display = "none";
    document.getElementById("startScreenOverlay").style.display = "none";
    currentStatus.startScreen = false;
    currentStatus.startTime = performance.now();
    currentStatus.heartStartTime = performance.now();
    tetromino = new Tetromino(tetrominoesData[currentStatus.nextTetromino]);
    pickAndShowNextTetromino();
    animate(performance.now());
}

let tetromino;

class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
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
                    if (currentStatus.startScreen) startGame();

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

async function animate(time) {
    const now = performance.now();

    if (currentStatus.isPaused === true || tetromino == 0) {
        return
    }

    if (!currentStatus.isMovingDown) {
        currentStatus.freezeDelayTime += time - currentStatus.prevAnimationTime;
        if (currentStatus.freezeDelayTime > 100) {
            gamebox.freezeTilesInBox(tetromino.getOccupiedCells());
            await gamebox.checkForFinishedRows();
            tetromino = new Tetromino(tetrominoesData[currentStatus.nextTetromino]);
            pickAndShowNextTetromino();
            //New tetromino fits fully to screen, but ends game
            if (tetromino == 0) { // if the new tetromino is empty, toString will return ''
                toggleMessageBox("GAME OVER");
                currentStatus.isOver = true;
                //cancelAnimationFrame(currentStatus.animationFrameId);
                return
            }
            currentStatus.freezeDelayTime = 0;
            currentStatus.isMovingDown = true;
        }
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    currentStatus.isMovingDown = tetromino.moveDown(verticalSpeed);

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
        let playingTime = now - currentStatus.startTime - currentStatus.pauseDuration;
        document.getElementById('mainTimer').textContent = msToMinutesSecondsString(playingTime);

        //Update heart timer
        let heartTime = HEART_TIME - ((now - currentStatus.heartStartTime - currentStatus.heartPauseDuration) / 1000).toFixed();
        if (heartTime > HEART_TIME) heartTime = HEART_TIME;

        if (heartTime < 1) {
            removeHeartOrEndGame();
        } else {
            const heartStopperCollection = document.getElementsByClassName('heartStopper');
            heartStopperCollection[currentStatus.livesLeft - 1].textContent = heartTime;
            if (heartTime === 3) {
                blinkHeart();
            }
        }

        //Calculate the average frame rate over the last 60 frames
        let averageFPS = 60 / ((now - currentStatus.lastFrame) / 1000);
        document.getElementById("fpsDisplay").innerHTML = averageFPS.toFixed(2);
        currentStatus.lastFrame = now;
    }

    currentStatus.prevAnimationTime = time;
    currentStatus.frameCount++;

    //Loop the animation
    currentStatus.animationFrameId = requestAnimationFrame(animate);
}

//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();