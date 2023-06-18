import { tetrominoesData, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { Tetromino } from "./tetrominoclass.js";


let tetromino;

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
            if ((e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp") &&
                !this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp") {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}


// function turnTetromino() {
//     const currentHeight = tetromino.clientHeight;
//     const currentWidth = tetromino.clientWidth;
//     tetromino.element.style.height = currentWidth + "px";
//     tetromino.element.style.width = currentHeight + "px";
// }

function updateColumnTops(column, top) { //Atm not very needed as a separate func. But was afraid that animate() will get pretty long later
    columnTops[column] = top;
}

const input = new InputHandler();

function animate() {
    const column = tetromino.left / 30;
    //Move tile downwards till the bottom or the top of column
    tetromino.top += verticalSpeed;
    if (tetromino.top + tetromino.height <= columnTops[column]) {
        tetromino.element.style.top = tetromino.top + "px";
    } else {
        if (columnTops[column] === 0) {
            alert("Game over!")
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
    requestAnimationFrame(animate);
}

tetromino = new Tetromino(tetrominoesData[Math.floor(Math.random() * 7)]);
animate();