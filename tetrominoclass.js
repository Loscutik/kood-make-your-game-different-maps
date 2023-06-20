import { BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { gamebox } from "./gamebox.js"

const horizontalSpeed = TILE_SIZE;

export class Tetromino {
    constructor(initialData) {
        this.colorCodes = initialData.colorCodes;
        this.placement = initialData.placement;
        this.rows = initialData.rows;
        this.columns = initialData.columns;
        this.left = (BOX_WIDTH / 2 - Math.ceil(this.columns / 2) * TILE_SIZE);
        this.top = 0;
        this.width = this.columns * TILE_SIZE;
        this.height = this.rows * TILE_SIZE;
        this.rotationCounter = 0;
        this.distanceToBottomObstacle=0;

        //this.column = this.left / ${TILE_SIZE};

        this.tileBottomEdges = this.tileBottomEdges = getBootomEdges(this.rows, this.columns, this.top + this.height, this.placement);

        this.element = createTetrominoElm(this.left, this.height, this.width, this.placement, this.colorCodes)

        // assign the turn method
        switch (initialData.shape) {
            case 'O':
                this.turn = () => { }
                break;
            case 'I':
                this.turn = () => {
                    this.turnContainer();
                    this.element.style.transform = `translate(${-(this.rotationCounter % 2) * 45}px, 0) rotate(${this.rotationCounter / 4}turn)`;
                }
                break;
            default:
                this.turn = () => {
                    this.turnContainer();
                    switch (this.rotationCounter) {
                        case 0:
                            this.element.style.transform = `rotate(0turn) `;
                            break;
                        case 1:
                            this.element.style.transform = `translate(${-TILE_SIZE / 2}px, 0) rotate(0.25turn) `;
                            break;
                        case 2:
                            this.element.style.transform = `rotate(0.5turn) `;
                            break;
                        case 3:
                            this.element.style.transform = `translate(${-TILE_SIZE / 2}px, 0) rotate(0.75turn) `;
                            break;
                    }
                    this.moveCells();
                }
        }


    }

    // isDown() {
    //     const column = this.left / TILE_SIZE;
    //     this.distanceToBottomObstacle = gamebox.columnTopsCurrent[column] - this.top - this.height
    //     return this.distanceToBottomObstacle <= 0;
    // }


    hasBeenPlaced() {
        const column = this.left / TILE_SIZE;
        return gamebox.columnTopsCurrent[column] === 0;
    }

    moveDown(speed) {
        const column = this.left / TILE_SIZE;
        let distanceToBottomObstacle = gamebox.columnTopsCurrent[column] - this.top - this.height
        if (distanceToBottomObstacle > 0){
            this.top += Math.min(speed, distanceToBottomObstacle);
            this.element.style.top = this.top + "px";
            return true;
        }
        return false;
    }

    moveRight() {
        this.left += horizontalSpeed;
        if (this.left > BOX_WIDTH - this.width) this.left = BOX_WIDTH - this.width

        this.element.style.left = this.left + "px";
    }

    moveLeft() {
        this.left -= horizontalSpeed;
        if (this.left < 0) this.left = 0

        this.element.style.left = this.left + "px";
    }

    turnContainer() {
        [this.rows, this.columns] = [this.columns, this.rows];
        [this.height, this.width] = [this.width, this.height];

        let left = this.left + (Math.floor(this.rows / 2) - Math.floor(this.columns / 2));
        left = Math.max(left, 0);
        left = Math.min(left, BOX_WIDTH - this.columns * TILE_SIZE);
        // this.element.style.left = left + "px"; 

        let top = this.top + (Math.floor(this.columns / 2) - Math.floor(this.rows / 2));
        top = Math.max(top, 0);
        top = Math.min(top, BOX_HEIGHT - this.height)
        // this.element.style.top = top + "px";// we don't need to change element.styles if we are using style.transform 

        // this.element.style.height = this.height + "px";
        // this.element.style.width = this.width + "px";
        this.rotationCounter = this.rotationCounter < 3 ? this.rotationCounter + 1 : 0;
    }

    moveCells() {
        /*calculate the new placement of the tiles */
        let newPlacement = [];
        const length = this.columns * this.rows;
        const offset = length - this.columns + 1;
        for (let i = 0; i < length; i++) {
            newPlacement[i] = this.placement[offset * (i + 1) % (length + 1) - 1];
        }

        this.placement = newPlacement;

        this.tileBottomEdges = getBootomEdges(this.rows, this.columns, this.top + this.height, this.placement);

    }
}

function getBootomEdges(rows, columns, bottom, placement) {
    let tileBottomEdges = [];
    for (let i = 0; i < columns; i++) {
        let boootmEdge = bottom;
        for (let row = rows - 1; row >= 0; row--) {
            if (placement[row]) {
                tileBottomEdges.push(boootmEdge);
                break;
            }

            boootmEdge -= TILE_SIZE;
        }
    }
    return tileBottomEdges;
}

function createTetrominoElm(left, height, width, placement, colorCodes) {
    const newTetromino = document.createElement("div");
    newTetromino.classList.add("tetromino");
    //let tetrominoData = tetrominoesData[Math.floor(Math.random() * 7)];
    for (let char of placement) {
        if (char === 1) {    // placement changed to array of numbers
            createNewTile(newTetromino, colorCodes)
        } else {
            const emptyTile = document.createElement("svg"); //changed div to svg
            emptyTile.classList.add("emptyTile");
            newTetromino.appendChild(emptyTile);
        }
    }
    newTetromino.style.width = width + "px";
    newTetromino.style.height = height + "px";
    newTetromino.style.left = left + "px";
    gamebox.element.appendChild(newTetromino);
    return newTetromino;
}

function createNewTile(tetromino, colorCodes) {
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // svgNode.setAttributeNS(null, 'width', `${TILE_SIZE}px`);
    // svgNode.setAttributeNS(null, 'height', `${TILE_SIZE}px`);
    // svgNode.setAttributeNS(null, 'viewBox', '0 0 ${TILE_SIZE} ${TILE_SIZE}');
    //!!! it's enaught to use setAttribute, not setAttributeNS
    svgNode.setAttribute('width', `${TILE_SIZE}px`);
    svgNode.setAttribute('height', `${TILE_SIZE}px`);
    svgNode.setAttribute('viewBox', `0 0 ${TILE_SIZE} ${TILE_SIZE}`);
    svgNode.classList.add("tile");
    tetromino.appendChild(svgNode);

    const tileNodeMiddle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeMiddle.setAttributeNS(null, 'd', `M2.9 2.9h25v25h-25z`);
    tileNodeMiddle.setAttributeNS(null, 'style', 'fill:' + colorCodes[0] + ';fill-opacity:1;stroke-width:.17016');
    svgNode.appendChild(tileNodeMiddle);

    const tileNodeLeftSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeLeftSide.setAttributeNS(null, 'd', `M0 0v${TILE_SIZE}l3-3V3h24l3-3z`);
    tileNodeLeftSide.setAttributeNS(null, 'style', 'fill:' + colorCodes[1] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeLeftSide);

    const tileNodeRightSide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeRightSide.setAttributeNS(null, 'd', `M${TILE_SIZE} 0v${TILE_SIZE}H0l3-3h24V3Z`);
    tileNodeRightSide.setAttributeNS(null, 'style', 'fill:' + colorCodes[2] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeRightSide);

    const tileNodeCorners = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tileNodeCorners.setAttributeNS(null, 'd', `M0 ${TILE_SIZE}v-1h1v-1h1v-1h1v1H2v1H1v1zM27 3V2h1V1h1V0h1v1h-1v1h-1v1z`);
    tileNodeCorners.setAttributeNS(null, 'style', 'fill:' + colorCodes[3] + ';fill-opacity:1;stroke-width:.264583');
    svgNode.appendChild(tileNodeCorners);
}