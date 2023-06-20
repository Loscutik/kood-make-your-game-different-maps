import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";
import { currentStatus, pauseResumeToggle, restartGame, toggleMessageBox } from "./gameStatus.js"


window.addEventListener("DOMContentLoaded", function(){
    pauseButtonListener();
    restartButtonListener();
});

window.addEventListener("runAnimation", animate);

function pauseButtonListener() {
    const pauseBtn = document.getElementById("pauseButton");
    pauseBtn.addEventListener("click", function(){
        pauseResumeToggle();
    })
}

function restartButtonListener() {
    const restartBtn = document.getElementById("restartButton");
    restartBtn.addEventListener("click", function(){
        tetromino = restartGame(initializeColumnTops);
    })
}

let tetromino;
let columnTops;
const gamebox = document.getElementById("gamebox");

let verticalSpeed = 2;
const horizontalSpeed = 30;

function initializeColumnTops() {
    columnTops = Array(10).fill(gamebox.clientHeight);
}

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
                tetromino = restartGame(initializeColumnTops);
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

const input = new InputHandler();

function animate() {
    if (currentStatus.isPaused === true) {
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
            currentStatus.isOver = true;
            return
        }
        tetromino.top = columnTops[column] - tetromino.height;
        tetromino.element.style.top = tetromino.top + "px";
        columnTops[column] = tetromino.top;
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
    currentStatus.animationFrameId = requestAnimationFrame(animate);
}

initializeColumnTops();
tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
animate();