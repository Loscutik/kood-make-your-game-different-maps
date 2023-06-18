import { tetrominoesData } from "./data.js";
const TILE_SIZE = 30;
export class Tetromino {
    constructor(initialData) {
        this.colorCodes = initialData.colorCodes;
        this.placement = initialData.placement;
        this.rows = initialData.rows;
        this.columns = initialData.columns;
        this.height = this.rows * TILE_SIZE + "px";
        this.width = this.columns * TILE_SIZE + "px";
        this.centerShift = {
            top: this.height / 2,
            left: this.width / 2,
        }
        this.isBottomTiled = [];
        for (let i = 0; i < this.columns; i++) {
            this.isBottomTiled.push(!!this.placement[(this.rows - 1) * this.columns + i])
        }

    }

    turn = turnAlgorithms;

}

function turnContainer() {
    [this.height, this.width] = [this.width, this.height]
    [this.rows, this.columns] = [this.columns, this.rows]
    [this.centerShift.top, this.centerShift.left] = [this.centerShift.left, this.centerShift.top]
}

function moveCells(rows, columns) {
    let newPlacement = [];
    const length = columns * rows;
    const offset = length - columns + 1;
    for (let i = 0; i < length; i++) {
        newPlacement[i] = this.placement[offset * (i + 1) % (length + 1) - 1];
    }

    this.placement = newPlacement;

    for (let i = 0; i < this.columns; i++) {
        this.isBottomTiled[i]=!!this.placement[(this.rows - 1) * this.columns + i]
    }
}

// return the function that will turn a tetromino with the given shape.
function turnAlgorithms(shape) {
    if (shape === 'O') return () => { };
    if (shape === 'I') return turnContainer;
    return function () {
        turnContainer();
        moveCells(this.rows, this.columns);
    }
}