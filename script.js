let square;
const gamebox = document.getElementById("gamebox");
let verticalSpeed = 2;
const horizontalSpeed = 30;
const allTileColors = [ //Color codes for tiles (each tile contains 4 different colors)
    ["#39a8a3", "#4adbd5", "#287572", "#256e6b"],
    ["#5c4133", "#8f654f", "#291d17", "#211712"],
    ["#1fa054", "#53bb6c", "#156e3a", "#166636"],
    ["#eb85b6", "#ffa3cf", "#b8688e", "#ad6186"],
    ["#7e3d97", "#955aa4", "#532963", "#4a2459"],
    ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    ["#fed304", "#fedf41", "#cca903", "#c2a103"],
];
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
                    e.key === "ArrowDown") && 
                    !this.keys.includes(e.key)){
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowDown"){
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

function createNewTile() {
    const tileColors = allTileColors[Math.floor(Math.random() * 7)] //Get randomly one of the color schemes
    const targetDiv = document.getElementById('gamebox');
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgNode.setAttributeNS(null, 'width', '30px');
    svgNode.setAttributeNS(null, 'height', '30px');
    svgNode.setAttributeNS(null, 'viewBox', '0 0 30 30');
    svgNode.classList.add("square");
    targetDiv.appendChild(svgNode);

    const tileNodeMiddle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeMiddle.setAttributeNS(null, 'd', 'M2.9 2.9h25v25h-25z');
    tileNodeMiddle.setAttributeNS(null, 'style', 'fill:' + tileColors[0] + ';fill-opacity:1;stroke-width:.17016');
    svgNode.appendChild(tileNodeMiddle);

    const tileNodeLeftSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeLeftSide.setAttributeNS(null, 'd', 'M0 0v30l3-3V3h24l3-3z');
    tileNodeLeftSide.setAttributeNS(null, 'style', 'fill:' + tileColors[1] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeLeftSide);

    const tileNodeRightSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeRightSide.setAttributeNS(null, 'd', 'M30 0v30H0l3-3h24V3Z');
    tileNodeRightSide.setAttributeNS(null, 'style', 'fill:' + tileColors[2] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeRightSide);

    const tileNodeCorners = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeCorners.setAttributeNS(null, 'd', 'M0 30v-1h1v-1h1v-1h1v1H2v1H1v1zM27 3V2h1V1h1V0h1v1h-1v1h-1v1z');
    tileNodeCorners.setAttributeNS(null, 'style', 'fill:' + tileColors[3] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeCorners);

    square = svgNode;
}

function updateColumnTops(column, top) { //Atm not very needed as a separate func. But was afraid that animate() will get pretty long later
    columnTops[column] = top;
}

const input = new InputHandler();

function animate() {
    let squareVerticalPos = parseFloat(square.style.top) || 0; 
    const squareHorizontalPos = square.style.left === "" ? 150 : parseFloat(square.style.left);
    //On prev line only "parseFloat(square.style.left) || 150;" didn't work, 
    //as if the tile hits left side, square.style.left = "0px" and it would automatically put it to 150px from left then.
    const column = squareHorizontalPos / 30;

    //Move tile downwards till the bottom or the top of column
    const newVerticalPos = squareVerticalPos + verticalSpeed;
    if (newVerticalPos <= columnTops[column] - square.clientHeight) {
        square.style.top = newVerticalPos + "px";
    } else {
        square.style.top = columnTops[column] - square.clientHeight;
        squareVerticalPos = parseFloat(square.style.top) || 0;
        updateColumnTops(squareHorizontalPos / 30, squareVerticalPos);
        createNewTile();
    }

    //Move tile horizontally
    if (input.keys.includes("ArrowRight")){
        newHorizontalPos = squareHorizontalPos + horizontalSpeed;
        if (newHorizontalPos <= gamebox.clientWidth - square.clientWidth) {
            square.style.left = newHorizontalPos + "px";
        } else {
            square.style.left = "270px";
        }
        input.keys.splice(input.keys.indexOf("ArrowRight"), 1);
    } else if (input.keys.includes("ArrowLeft")){
        newHorizontalPos = squareHorizontalPos - horizontalSpeed;
        if (newHorizontalPos >= 0) {
            square.style.left = newHorizontalPos + "px";
        } else {
            square.style.left = "0px";
        }
        input.keys.splice(input.keys.indexOf("ArrowLeft"), 1);
    }

    //Speed up downward movement with Down Arrow key
    if (input.keys.includes("ArrowDown")){
        verticalSpeed = 8;
    } else {
        verticalSpeed = 2;
    }

    //Loop the animation
    requestAnimationFrame(animate);
}

createNewTile(); //Creates the first tile
animate();