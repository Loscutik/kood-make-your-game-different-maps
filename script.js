// TODO improve the implement level rising (speed & delay at the bottom) every 10 lines
// TODO tidy this up
import { tetrominoesData, HEART_TIME } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { gamebox } from "./gamebox.js"
import { currentStatus, pauseResumeToggle, restartGame, toggleMessageBox, msToMinutesSecondsString, blinkHeart, removeHeart, pickAndShowNextTetromino, updateScore, refillHeart, updateLines, updateLevel } from "./gameStatus.js"

//Option to disable start screen for development:
// 1) style.css: #startBox -> display: none; & #startScreenOverlay -> display: none;
// 2) gameStatus.js: currentStatus.startScreen = false;
// 3) script.js: on the bottom decomment "tetromino = ..." & "animate()"

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
    // cancelAnimationFrame(currentStatus.animationFrameId)
}

function startGame() {

    document.getElementById("startBox").style.display = "none";
    document.getElementById("startScreenOverlay").style.display = "none";
    const now = performance.now()
    currentStatus.startScreen = false;
    currentStatus.startTime = now;
    currentStatus.heartStartTime = now;
    tetromino = new Tetromino(tetrominoesData[currentStatus.nextTetromino]);
    pickAndShowNextTetromino();
    animate(now);
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

let durationToMoveDown =1000/60;
async function animate(time) {
    //console.log('start ', currentStatus.animationFrameId);
    if (/*currentStatus.isPaused === true ||*/ tetromino == 0) {
        return
    }

    const prevFrameDuration = time - currentStatus.prevAnimationTime;
    console.log('prev duration: ' + prevFrameDuration);
    //let speed = currentStatus.verticalSpeed;
    let speed = roundIfClose(currentStatus.verticalSpeed * durationToMoveDown);
    //Speed up downward movement with Down Arrow key
    if (input.keys.ArrowDown) {
        speed = 8;
    }


    if (Number.isInteger(speed)) {
        // moveDown moves the tetromino down if it is possible
        // and returns true if the movement had done and false otherwise
        currentStatus.isMovingDown = tetromino.moveDown(speed);
        durationToMoveDown=1000/60;
    }else{
        durationToMoveDown+=prevFrameDuration//-currentStatus.pauseDuration;
    }

    if (!currentStatus.isMovingDown) {
        currentStatus.freezeDelayTime += prevFrameDuration;
        if (currentStatus.freezeDelayTime > currentStatus.delayBeforeFreeze) {
            gamebox.freezeTilesInBox(tetromino.getOccupiedCells());

            const rowsToRemove = gamebox.checkForFinishedRows();


            if (rowsToRemove.numberOfCompletedRows != 0) {
                // TODO:
                // increaseLevelIfNeeded
                await rowsToRemove.removeRows;
                refillHeart(time);
                updateScore(rowsToRemove.numberOfCompletedRows);
                updateLines(rowsToRemove.numberOfCompletedRows);
                updateLevel(prevFrameDuration);
            }


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

    //On every 60 frames:
    if (currentStatus.frameCount % 60 === 0) {
        //Update main timer
        let playingTime = time - currentStatus.startTime - currentStatus.pauseDuration;
        document.getElementById('mainTimer').textContent = msToMinutesSecondsString(playingTime);

        //Update heart timer
        let heartTime = HEART_TIME - ((time - currentStatus.heartStartTime - currentStatus.heartPauseDuration) / 1000).toFixed();
        if (heartTime > HEART_TIME) heartTime = HEART_TIME;
        if (heartTime < 1) {
            removeHeart();
            if (currentStatus.livesLeft === 0) {
                toggleMessageBox("GAME OVER");
                currentStatus.isOver = true;
                return;
            }
        } else {
            const heartStopperCollection = document.getElementsByClassName('heartStopper');
            heartStopperCollection[currentStatus.livesLeft - 1].textContent = heartTime;
            if (heartTime === 3) {
                blinkHeart();
            }
        }

        //Calculate the average frame rate over the last 60 frames
        let averageFPS = 60 / ((time - currentStatus.lastFrame) / 1000);
        document.getElementById("fpsDisplay").innerHTML = averageFPS.toFixed(2);
        currentStatus.lastFrame = time;
    }

    currentStatus.prevAnimationTime = time;
    currentStatus.frameCount++;

    //Loop the animation
   // console.log('finish ', currentStatus.animationFrameId);

    currentStatus.animationFrameId = requestAnimationFrame(animate);
  //  console.log('run new ', currentStatus.animationFrameId, performance.now());
}

function roundIfClose(number) {
    console.log(number);
    if (Math.abs(number - Math.round(number)) < 0.4) { return Math.round(number); }
    return number;
}

//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();