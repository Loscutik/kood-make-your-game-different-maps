import { tetrominoesData } from "./initData.js";
import { Tetromino } from "./tetrominoClass.js";
import { gamebox } from "./gameBox.js"
import { currentStatus, pauseResumeToggle, restartGame, gameOver, updateMainTimer, pickAndShowNextTetromino, updateGameStatistic,  updateHearts, calculateFPS } from "./gameStatus.js"

//Option to disable start screen for development:
// 1) style.css: #startBox -> display: none; & #startScreenOverlay -> display: none;
// 2) gameStatus.js: currentStatus.startScreen = false;
// 3) script.js: on the bottom decomment "tetromino = ..." & "gameLoop()"

window.addEventListener("DOMContentLoaded", function () {
    buttonListener("startButton", startGame);
    buttonListener("pauseButton", pauseResumeToggle); //?? move pauseResumeToggle() into game.js and remove "runAnimation" event
    buttonListener("restartButton", renewGame);
});

window.addEventListener("runAnimation", (event) => gameLoop(event.timeStamp));

//Helper function to handle button clicks
function buttonListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", callback);
}

function renewGame(event) {
    gamebox.resetGrid();
    tetromino = restartGame(event.timeStamp);
    gameLoop(event.timeStamp);
}

function startGame() {
    document.getElementById("startBox").style.display = "none";
    document.getElementById("startScreenOverlay").style.display = "none";
    const now = performance.now()
    currentStatus.startInit(now);
    tetromino = new Tetromino(tetrominoesData[currentStatus.nextTetromino]);
    pickAndShowNextTetromino();
    gameLoop(now);
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
                    if (!currentStatus.startScreen) pauseResumeToggle(e);
                    break;
                case "r":
                case "R":
                    if (!currentStatus.startScreen) renewGame(e);
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

function gameLoop(time) {
    if (tetromino == 0) {
        return
    }

    const frameDuration = time - currentStatus.prevAnimationTime;
    currentStatus.frame.count++;
    currentStatus.gameOneSecond += frameDuration;

    if (currentStatus.gameOneSecond >= 1000) {
        updateMainTimer(time);

        updateHearts(time);
        if (currentStatus.statistic.livesLeft === 0) {
            gameOver();
            return;
        }

        calculateFPS();
    }

    const totalSpeed = currentStatus.currentTetromino.speed.current * frameDuration + currentStatus.currentTetromino.speed.fraction
    let speed = Math.trunc(totalSpeed);
    currentStatus.currentTetromino.speed.fraction = totalSpeed - speed;
    //Speed up downward movement with Down Arrow key
    if (input.keys.ArrowDown) { //?? move to InputHandler class into method like handleSpeedUp which can return the speed 
        speed = 8;
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    currentStatus.currentTetromino.isBeingMovedDown = tetromino.moveDown(speed);

    if (!currentStatus.currentTetromino.isBeingMovedDown) {

        currentStatus.currentTetromino.freezeDelayTime += frameDuration;
        if (currentStatus.currentTetromino.freezeDelayTime > currentStatus.currentTetromino.delayBeforeFreeze) {
            
            gamebox.freezeTilesInBox(tetromino.getOccupiedCells());
            currentStatus.currentTetromino.freezeDelayTime = 0; //?? move to freezeTilesInBox
            currentStatus.currentTetromino.isBeingMovedDown = true; //?? move to freezeTilesInBox

            const rowsToRemove = gamebox.checkForFinishedRows();
            if (rowsToRemove.length != 0) {
                //  const removeRowsStart = performance.now();
                gamebox.removeRowsAndUpdateGrid(rowsToRemove);
                //  currentStatus.frame.numbersDuringRowsRemove = Math.round((performance.now() - removeRowsStart) * (currentStatus.frame.count / (currentStatus.gameOneSecond)));
                updateGameStatistic(time, rowsToRemove.length)
            }

            tetromino = new Tetromino(tetrominoesData[currentStatus.nextTetromino]);
            //New tetromino fits fully to screen, but ends game
            if (tetromino == 0) { // if the new tetromino is empty, toString will return ''
                gameOver();
                return
            }

            pickAndShowNextTetromino();
        }
    }

    //Turn tetromino with Up Arrow key
    if (input.keys.ArrowUp) { //?? move to InputHandler class into method like handleRotate(tetromino)  
        tetromino.rotate();
        input.keys.ArrowUp = false;
    }

    //Move tile horizontally
    if (input.keys.ArrowRight) { //?? move to InputHandler class into method like handleSideMoving(tetromino) 
        tetromino.moveRight();
        input.keys.ArrowRight = false;

    } else if (input.keys.ArrowLeft) {
        tetromino.moveLeft();
        input.keys.ArrowLeft = false;
    }

    currentStatus.prevAnimationTime = time;

    //Loop the animation if not paused
    currentStatus.frame.animationId = requestAnimationFrame(gameLoop);
}



//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();