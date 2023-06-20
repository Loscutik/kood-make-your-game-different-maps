import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { columnTopsStart, gamebox } from "./gamebox.js"

let verticalSpeed = 2;

window.addEventListener("DOMContentLoaded", function () {
    pauseButtonListener();
    restartButtonListener();
});

let tetromino;
let animationFrameId;
let isPaused = false;
let gameOver = false;


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
                e.key === "r") &&
                !this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }
            if (this.keys.includes(" ")) {
                pauseResumeToggle();
            } else if (this.keys.includes("r")) {
                restartGame();
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === " " ||
                e.key === "r") {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

function pauseResumeToggle() {
    if (gameOver === true) {
        return
    };
    const pauseBtn = document.getElementById("pauseButton");
    const pauseBtnText = document.getElementById("pauseButtonText");
    if (isPaused === true) {
        pauseBtnText.textContent = "PAUSE";
        pauseBtn.classList.remove("pauseButtonGreen");
        pauseBtn.classList.add("pauseButtonRed");
        toggleMessageBox();
        isPaused = false;
        animate();
    } else {
        pauseBtnText.textContent = "RESUME";
        pauseBtn.classList.remove("pauseButtonRed");
        pauseBtn.classList.add("pauseButtonGreen");
        toggleMessageBox("PAUSED");
        isPaused = true;
    }
}

function restartGame() {
    window.cancelAnimationFrame(animationFrameId);
    const tetrominoes = gamebox.element.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });
    columnTops = [...columnTopsStart] //To keep track how high is each column

    const messageBox = document.getElementById("gameMessageBox");
    messageBox.style.display = "none";
    isPaused = false;
    gameOver = false;
    tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
    animate();
}

function toggleMessageBox(message) {
    const messageBox = document.getElementById("gameMessageBox");
    const messageSpan = document.getElementById("gameMessage");
    console.log(messageBox.style.display);
    if (messageBox.style.display !== "flex") {
        messageSpan.textContent = message;
        messageBox.style.display = "flex";
    } else {
        messageBox.style.display = "none";
    }
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
        restartGame();
    })
}



const input = new InputHandler();

function animate() {
    if (isPaused === true) {
        return
    }

    // moveDown moves the tetromino down if it is possible
    // and returns true if the movement had done and false otherwise
    if (!tetromino.moveDown(verticalSpeed)) {
        gamebox.updateColumnTops(tetromino.left / 30, tetromino.top);
        tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
        if (tetromino.hasBeenPlaced()) {
            toggleMessageBox("GAME OVER");
            gameOver = true;
            return
        }
    }
    

    //Turn tetromino with Up Arrow key
    if (input.keys.includes("ArrowUp")) {
        tetromino.turn();
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


    //Loop the animation
    animationFrameId = requestAnimationFrame(animate);
}

tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
animate();