import { tetrominoesData } from "./data.js";

let tetromino;
const gamebox = document.getElementById("gamebox");
let verticalSpeed = 2;
const horizontalSpeed = 30;

let columnTops = [  gamebox.clientHeight, //To keep track how high is each column
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
                    e.key === "ArrowUp") && 
                    !this.keys.includes(e.key)){
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown" ||
                e.key === "ArrowUp"){
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

function createTetromino() {
    const newTetromino = document.createElement("div");
    const gamebox = document.getElementById('gamebox');
    newTetromino.classList.add("tetromino");
    let tetrominoData = tetrominoesData[Math.floor(Math.random() * 7)];
    for (let char of tetrominoData.placement){
        if (char === "1"){
            createNewTile(newTetromino, tetrominoData.colorCodes)
        } else {
            const emptyTile = document.createElement("div");
            emptyTile.classList.add("emptyTile");
            newTetromino.appendChild(emptyTile);
        }
    }
    newTetromino.style.width = tetrominoData.width;
    newTetromino.style.height = tetrominoData.height;
    gamebox.appendChild(newTetromino);
    tetromino = newTetromino;
}

function createNewTile(tetromino, colorCodes) {
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgNode.setAttributeNS(null, 'width', '30px');
    svgNode.setAttributeNS(null, 'height', '30px');
    svgNode.setAttributeNS(null, 'viewBox', '0 0 30 30');
    svgNode.classList.add("tile");
    tetromino.appendChild(svgNode);

    const tileNodeMiddle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeMiddle.setAttributeNS(null, 'd', 'M2.9 2.9h25v25h-25z');
    tileNodeMiddle.setAttributeNS(null, 'style', 'fill:' + colorCodes[0] + ';fill-opacity:1;stroke-width:.17016');
    svgNode.appendChild(tileNodeMiddle);

    const tileNodeLeftSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeLeftSide.setAttributeNS(null, 'd', 'M0 0v30l3-3V3h24l3-3z');
    tileNodeLeftSide.setAttributeNS(null, 'style', 'fill:' + colorCodes[1] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeLeftSide);

    const tileNodeRightSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeRightSide.setAttributeNS(null, 'd', 'M30 0v30H0l3-3h24V3Z');
    tileNodeRightSide.setAttributeNS(null, 'style', 'fill:' + colorCodes[2] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeRightSide);

    const tileNodeCorners = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeCorners.setAttributeNS(null, 'd', 'M0 30v-1h1v-1h1v-1h1v1H2v1H1v1zM27 3V2h1V1h1V0h1v1h-1v1h-1v1z');
    tileNodeCorners.setAttributeNS(null, 'style', 'fill:' + colorCodes[3] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeCorners);
}

function turnTetromino() {
    const currentHeight = tetromino.clientHeight;
    const currentWidth = tetromino.clientWidth;
    tetromino.style.height = currentWidth + "px";
    tetromino.style.width = currentHeight + "px";
}

function updateColumnTops(column, top) { //Atm not very needed as a separate func. But was afraid that animate() will get pretty long later
    columnTops[column] = top;
}

const input = new InputHandler();

function animate() {
    let tetrominoVerticalPos = parseFloat(tetromino.style.top) || 0; 
    const tetrominoHorizontalPos = tetromino.style.left === "" ? 150 : parseFloat(tetromino.style.left);
    //On prev line only "parseFloat(square.style.left) || 150;" didn't work, 
    //as if the tile hits left side, square.style.left = "0px" and it would automatically put it to 150px from left then.
    const column = tetrominoHorizontalPos / 30;

    //Move tile downwards till the bottom or the top of column
    const newVerticalPos = tetrominoVerticalPos + verticalSpeed;
    if (newVerticalPos <= columnTops[column] - tetromino.clientHeight) {
        tetromino.style.top = newVerticalPos + "px";
    } else {
        if (columnTops[column] === 0){
            alert("Game over!")
            return
        }
        tetromino.style.top = (columnTops[column] - tetromino.clientHeight) + "px";
        tetrominoVerticalPos = parseFloat(tetromino.style.top) || 0;
        updateColumnTops(tetrominoHorizontalPos / 30, tetrominoVerticalPos);
        createTetromino();
    }

    //Move tile horizontally
    if (input.keys.includes("ArrowRight")){
        let newHorizontalPos = tetrominoHorizontalPos + horizontalSpeed;
        if (newHorizontalPos <= gamebox.clientWidth - tetromino.clientWidth) {
            tetromino.style.left = newHorizontalPos + "px";
        } else {
            tetromino.style.left = gamebox.clientWidth - tetromino.clientWidth;
        }
        input.keys.splice(input.keys.indexOf("ArrowRight"), 1);
    } else if (input.keys.includes("ArrowLeft")){
        let newHorizontalPos = tetrominoHorizontalPos - horizontalSpeed;
        if (newHorizontalPos >= 0) {
            tetromino.style.left = newHorizontalPos + "px";
        } else {
            tetromino.style.left = "0px";
        }
        input.keys.splice(input.keys.indexOf("ArrowLeft"), 1);
    }

    //Speed up downward movement with Down Arrow key
    if (input.keys.includes("ArrowDown")){
        verticalSpeed = 8;
    } else {
        verticalSpeed = 2;
    }

    //Turn tetromino with Up Arrow key
    if (input.keys.includes("ArrowUp")){
        input.keys.splice(input.keys.indexOf("ArrowUp"), 1);
        turnTetromino();
    }

    //Loop the animation
    requestAnimationFrame(animate);
}

createTetromino();
// animate();