import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";


window.addEventListener("DOMContentLoaded", function(){
    pauseButtonListener();
    restartButtonListener();
});

let tetromino;
let animationFrameId;
let isPaused = false;
let gameOver = false;
const gamebox = document.getElementById("gamebox");

let verticalSpeed = 2;
const horizontalSpeed = 30;

let columnTops = [gamebox.clientHeight, //To keep track how high is each column
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight,
gamebox.clientHeight];

class InputHandler {
    constructor() {
        this.keys = [];
        this.keysDownTimes = {}
        window.addEventListener('keydown', e => {
            if ((   e.key === "ArrowLeft" ||
                    e.key === "ArrowRight" ||
                    e.key === "ArrowDown" ||
                    e.key === "ArrowUp" ||
                    e.key === " " ||
                    e.key === "r") && 
                    !this.keys.includes(e.key)){
                this.keys.push(e.key);
            }
            if (this.keys.includes(" ")){
                pauseResumeToggle();
            } else if (this.keys.includes("r")){
                restartGame();
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp" ||
                e.key === " " ||
                e.key === "r"){
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
    const gamebox = document.getElementById("gamebox");
    const tetrominoes = gamebox.querySelectorAll('.tetromino');
    tetrominoes.forEach(tetromino => {
        tetromino.remove();
    });
    columnTops = [  gamebox.clientHeight, //To keep track how high is each column
                    gamebox.clientHeight, 
                    gamebox.clientHeight, 
                    gamebox.clientHeight, 
                    gamebox.clientHeight, 
                    gamebox.clientHeight, 
                    gamebox.clientHeight, 
                    gamebox.clientHeight,
                    gamebox.clientHeight,
                    gamebox.clientHeight];
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
    pauseBtn.addEventListener("click", function(){
        pauseResumeToggle();
    })
}

function restartButtonListener() {
    const restartBtn = document.getElementById("restartButton");
    restartBtn.addEventListener("click", function(){
        restartGame();
    })
}

function updateColumnTops(column, top) { //Atm not very needed as a separate func. But was afraid that animate() will get pretty long later
    columnTops[column] = top;
}

const input = new InputHandler();

function animate() {
    if (isPaused === true) {
        return
    }

    const column = tetromino.left / 30;
    //Move tile downwards till the bottom or the top of column
    tetromino.top += verticalSpeed;
    if (tetromino.top + tetromino.height <= columnTops[column]) {
        tetromino.element.style.top = tetromino.top + "px";
    } else {
        if (columnTops[column] === 0){
            toggleMessageBox("GAME OVER");
            gameOver = true;
            return
        }
        tetromino.top = columnTops[column] - tetromino.height;
        tetromino.element.style.top = tetromino.top + "px";
        updateColumnTops(tetromino.left / 30, tetromino.top);
        tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
    }

    //Move tile horizontally
    if (input.keys.includes("ArrowRight")) {
        tetromino.left += horizontalSpeed;
        if (tetromino.left > BOX_WIDTH - tetromino.width) tetromino.left = BOX_WIDTH - tetromino.width

        tetromino.element.style.left = tetromino.left + "px";
        input.keys.splice(input.keys.indexOf("ArrowRight"), 1);

    } else if (input.keys.includes("ArrowLeft")) {
        tetromino.left -= horizontalSpeed;
        if (tetromino.left < 0) tetromino.left = 0
        
        tetromino.element.style.left = tetromino.left + "px";
        input.keys.splice(input.keys.indexOf("ArrowLeft"), 1);
    }

    //Speed up downward movement with Down Arrow key
    if (input.keys.includes("ArrowDown")) {
        verticalSpeed = 8;
    } else {
        verticalSpeed = 2;
    }

    //Turn tetromino with Up Arrow key
    if (input.keys.includes("ArrowUp")) {
        input.keys.splice(input.keys.indexOf("ArrowUp"), 1);
        //tetromino.element.style.transform = `rotate(0.5turn)`
        tetromino.turn();
    }

    //Loop the animation
    animationFrameId = requestAnimationFrame(animate);
}

tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
animate();