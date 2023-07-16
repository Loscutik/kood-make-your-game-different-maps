import { tetrominoesData } from "./initData.js";
import { Tetromino } from "./tetrominoClass.js";
import { gamebox } from "./gameBox.js"
import { gameStatus, pauseResumeToggle, restartGame, gameOver, updateMainTimer, pickAndShowNextTetromino, updateGameStatisticsAfterRowComplete, updateHearts, calculateFPS } from "./gameStatusHandler.js"

//Option to disable start screen for development:
// 1) style.css: #startBox -> display: none; & #startScreenOverlay -> display: none;
// 2) gameStatus.js: gameStatus.startScreen = false;
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
    gameStatus.startInit(now);
    tetromino = new Tetromino(tetrominoesData[gameStatus.nextTetromino]);
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
                    if (!gameStatus.startScreen) pauseResumeToggle(e);
                    break;
                case "r":
                case "R":
                    if (!gameStatus.startScreen) renewGame(e);
                    break;
                case "Enter":
                    if (gameStatus.startScreen) startGame();

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

    /*----------------------------------------------------------------*/

    handleRotate(tetromino) {
        if (this.keys.ArrowUp) {
            tetromino.rotate();
            this.keys.ArrowUp = false;
        }
    }

    /*----------------------------------------------------------------*/

    handleSideMoving(tetromino) {

        if (this.keys.ArrowRight) {
            tetromino.moveRight();
            this.keys.ArrowRight = false;

        } else if (this.keys.ArrowLeft) {
            tetromino.moveLeft();
            this.keys.ArrowLeft = false;
        }
    }

    /*----------------------------------------------------------------*/

    handleSpeedUp() {

        if (this.keys.ArrowDown) { 
            return true;
        }

        return false;
    }

}

const input = new InputHandler();

function gameLoop(time) {
    if (tetromino == 0) {
        return
    }

    const frameDuration = time - gameStatus.prevAnimationTime;
    gameStatus.frame.count++;
    gameStatus.gameOneSecond += frameDuration;

    if (gameStatus.gameOneSecond >= 1000) {
        updateMainTimer(time);

        updateHearts(time);
        if (gameStatus.statistic.livesLeft === 0) {
            gameOver();
            return;
        }

        calculateFPS();
    }

    const totalSpeed = gameStatus.currentTetromino.speed.current * frameDuration + gameStatus.currentTetromino.speed.fraction
    let speed = Math.trunc(totalSpeed);
    gameStatus.currentTetromino.speed.fraction = totalSpeed - speed;
    
    if (input.handleSpeedUp()) speed=8; 

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    gameStatus.currentTetromino.isBeingMovedDown = tetromino.moveDown(speed);

    if (!gameStatus.currentTetromino.isBeingMovedDown) {

        gameStatus.currentTetromino.freezeDelayTime += frameDuration;
        if (gameStatus.currentTetromino.freezeDelayTime > gameStatus.currentTetromino.delayBeforeFreeze) {

            gamebox.freezeTilesInBox(tetromino.getOccupiedCells());

            const rowsToRemove = gamebox.checkForFinishedRows();
            if (rowsToRemove.length != 0) {
                gamebox.removeRows(rowsToRemove);
                updateGameStatisticsAfterRowComplete(time, rowsToRemove.length)
            }

            tetromino = new Tetromino(tetrominoesData[gameStatus.nextTetromino]);
            //New tetromino fits fully to screen, but ends game
            if (tetromino == 0) { // if the new tetromino is empty, toString will return ''
                gameOver();
                return
            }

            pickAndShowNextTetromino();
        }
    }

    input.handleRotate(tetromino);
    input.handleSideMoving(tetromino);

    gameStatus.prevAnimationTime = time;

    //Loop the animation if not paused
    gameStatus.frame.animationId = requestAnimationFrame(gameLoop);
}



//Decomment for running without startScreen
// tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
// animate();