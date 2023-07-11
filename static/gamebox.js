import { BOX_ROWS, BOX_COLUMNS, TILE_SIZE } from "./data.js";
import { currentStatus } from "./gameStatus.js";

class Gamebox {

    constructor(element) {
        this.element = document.getElementById("gamebox");


        this.grid = Array(BOX_ROWS);
        for (let r = 0; r < BOX_ROWS; r++) {
            this.grid[r] = Array(BOX_COLUMNS);
            for (let c = 0; c < BOX_COLUMNS; c++) {
                this.grid[r][c] = null;
            }
        }
    }

    resetGrid() {
        for (let r = 0; r < BOX_ROWS; r++) {
            for (let c = 0; c < BOX_COLUMNS; c++) {
                this.grid[r][c] = null;
            }
        }
    }

    hasObstacleRightOf(cellsToCheck) {
        return cellsToCheck.some(({ row, col }) => {
            let colToRight = col + 1;
            return colToRight === BOX_COLUMNS || this.grid[row][colToRight] !== null;
        });

    }
    hasObstacleLeftOf(cellsToCheck) {
        return cellsToCheck.some(({ row, col }) => {
            let colToLeft = col - 1;
            return colToLeft < 0 || this.grid[row][colToLeft] !== null;
        });
    }

    hasObstacleUnderOf(cellsToCheck) {
        return cellsToCheck.some(({ row, col }) => {
            let rowUnder = row + 1;
            return rowUnder === BOX_ROWS || this.grid[rowUnder][col] !== null;
        });
    }

    freezeTilesInBox(cells) {
        cells.forEach(({ row, col }) => this.grid[row][col] = true);
    }

    // checkForFinishedRows() {
    //     const rowRemovalPromises = []; //Store promises of each line removal
    //     let numberOfCompletedRows = 0;
    //     for (let rowIndex = 0; rowIndex <BOX_ROWS; rowIndex++) { //CHNG this for is faster than for..in
    //         if (this.grid[rowIndex].every(value => value === true)) {
    //             numberOfCompletedRows += 1;
    //             let rowRemovalPromise = this.removeRowOfTiles(rowIndex);
    //             rowRemovalPromises.push(rowRemovalPromise);
    //             this.updateGridAfterCompletingRow(rowIndex);
    //         }
    //     }
    //     return {removeRows: Promise.all(rowRemovalPromises), numberOfCompletedRows};
    // }

    // updateGridAfterCompletingRow(rowIndex) {
    //     for (let i = rowIndex; i > 0; i--) {
    //         this.grid[i] = [...this.grid[i - 1]];
    //     }
    //     for (let j = 0; j < BOX_COLUMNS; j++) {
    //         this.grid[0][j] = null;
    //     }
    // }

    // removeRowOfTiles(rowIndex) {
    //     const boxClientRect = this.element.getBoundingClientRect();
    //     const boxTop = boxClientRect.top + 3; //Box border width = 3
    //     const rowToBeDeletedCoord = TILE_SIZE * rowIndex + (TILE_SIZE / 2) + boxTop;
    //     const tiles = this.element.getElementsByClassName("tile");
    //     const tilesToRemove = [];
    //     const tilesToFall = [];

    //     //Get tiles by coordinates which are in given row or above
    //     for (let i = tiles.length - 1; i >= 0; i--) {
    //         let tileClientRect = tiles[i].getBoundingClientRect();
    //         if (rowToBeDeletedCoord > tileClientRect.top &&
    //             rowToBeDeletedCoord < tileClientRect.bottom) {
    //             tilesToRemove.push(tiles[i]);
    //         } else if (rowToBeDeletedCoord > tileClientRect.top) {
    //             tilesToFall.push(tiles[i]);
    //         }
    //     }
    //     //Add classes to tile parts to add animation to them (first they go white, then fade away)
    //     tilesToRemove.forEach(tile => {
    //         tile.getElementsByClassName("tileMiddle")[0].classList.add("tileMiddleBrighten");
    //         tile.getElementsByClassName("tileLeft")[0].classList.add("tileLeftBrighten");
    //         tile.getElementsByClassName("tileRight")[0].classList.add("tileRightBrighten");
    //         tile.getElementsByClassName("tileCorners")[0].classList.add("tileCornersBrighten");
    //     })

    //     return new Promise((resolve) => {
    //         setTimeout(function () { //Wait once the animation is finished
    //             tilesToRemove.forEach(tile => {
    //                 //Change class of the tile
    //                 tile.classList.remove("tile");
    //                 tile.classList.add("emptyTile");
    //                 //Remove tetromino div if it's now empty
    //                 let tetrominoTiles = Array.from(tile.parentNode.children);
    //                 if (tetrominoTiles.every(child => child.classList.contains("emptyTile"))) {
    //                     tile.parentNode.remove();
    //                 };
    //             });
    //             //Move tiles above downwards to fill the gap from removed row
    //             tilesToFall.forEach(tile => {
    //                 tile.classList.add("tileFall");
    //                 const currentTransform = tile.style.transform;
    //                 tile.style.transform = currentTransform + " translateY(30px)";
    //             });

    //             resolve();
    //         }, 350);
    //     })
    // }

    checkForFinishedRows() {
        let completedRowIndexes = [];
        for (let rowIndex = 0; rowIndex < BOX_ROWS; rowIndex++) {
            if (this.grid[rowIndex].every(value => value === true)) {
                completedRowIndexes.push(rowIndex);
            }
        }
        return completedRowIndexes;
    }

    removeRowsAndUpdateGrid(completedRowIndexes) {
        this.updateGridAfterRemovingRows(completedRowIndexes);
        this.removeCompletedRowsAndShiftRemaining(completedRowIndexes);
    }

    updateGridAfterRemovingRows(completedRowIndexes) {
        //Remove completed rows from grid
        for (let i = completedRowIndexes.length - 1; i >= 0; i--) {
            this.grid.splice(completedRowIndexes[i], 1);
        }
        //Add empty rows to the top of the grid
        for (let i = 0; i < completedRowIndexes.length; i++) {
            this.grid.unshift(new Array(BOX_COLUMNS).fill(null));
        }
    }

    removeCompletedRowsAndShiftRemaining(completedRowIndexes) {
        const boxClientRect = this.element.getBoundingClientRect();
        const boxTop = boxClientRect.top + 3; //Box border width = 3
        const tiles = this.element.getElementsByClassName("tile");
        const tetrominoDivs = Array.from(this.element.getElementsByClassName("tetromino"));
        const tilesToRemove = [];
        const tilesToShift = [];
        let rowShifts = {};

        //Add to rowShifts object info about each row - does it have to be deleted or how much to be moved down
        for (let i = completedRowIndexes.length-1; i >= 0; i--) {
            rowShifts[completedRowIndexes[i]] = 0; //Row which has to be deleted has value of 0
            for (let j = 0; j < completedRowIndexes[i]; j++) {
                rowShifts[j] = (j in rowShifts) ? rowShifts[j] + 1 : 1; //For each deleted row add +1 to a shift value to each row above
            }
        }

        //Sort tiles by which have to be removed and which have to move down
        for (let i = tiles.length - 1; i >= 0; i--) {
            let tileClientRect = tiles[i].getBoundingClientRect();
            const tileRow = (tileClientRect.top - boxTop) / 30; // Find in which row current tile is
            if (rowShifts[tileRow] === 0) {
                tilesToRemove.push(tiles[i]);
            } else if (rowShifts[tileRow] !== undefined) {
                tilesToShift.push({ tile: tiles[i], shift: rowShifts[tileRow] });
            }
        }

        //Remove tiles by adding classes to them to start animation (first they go white, then fade away)
        tilesToRemove.forEach(tile => {
            tile.classList.remove("tile");
            tile.classList.add("emptyTile");
            tile.getElementsByClassName("tileMiddle")[0].classList.add("tileMiddleBrighten");
            tile.getElementsByClassName("tileLeft")[0].classList.add("tileLeftBrighten");
            tile.getElementsByClassName("tileRight")[0].classList.add("tileRightBrighten");
            tile.getElementsByClassName("tileCorners")[0].classList.add("tileCornersBrighten");
        })

        //After animation has run remove empty tetromino div's and shift remaining tiles below
        setTimeout(function () { //Wait once the animation is finished
            //Go over each tetromino div and delete it if all it's children are emptyTile
            for (let i = tetrominoDivs.length - 1; i >= 0; i--) {
                const tetrominoTiles = Array.from(tetrominoDivs[i].children)
                if (tetrominoTiles.every(tile => tile.classList.contains("emptyTile"))) {
                    tetrominoDivs[i].remove();
                }
            }
            //Shift tiles by corresponding distance
            for (let i = 0; i < tilesToShift.length; i++) {
                tilesToShift[i].tile.classList.add("tileFall"); //Add transition class if tile doesn't have it yet
                const currentTransform = tilesToShift[i].tile.style.transform;
                const shiftInPixels = tilesToShift[i].shift * 30;
                tilesToShift[i].tile.style.transform = currentTransform + " translateY(" + shiftInPixels + "px)";
            }
        }, 200);
    }

    isCellsFree(cellsToCheck) {
        return cellsToCheck.every(({ row, col }) => !this.grid[row][col]);
    }
}
export const gamebox = new Gamebox;


