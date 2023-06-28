import { BOX_ROWS, BOX_COLUMNS, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { currentStatus, updateScore } from "./gameStatus.js"

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
        return cellsToCheck.some(({row, col})=>{
            let colToRight=col+1;
            return colToRight===BOX_COLUMNS || this.grid[row][colToRight]!==null;
        });
    
    }
    hasObstacleLeftOf(cellsToCheck) {
        return cellsToCheck.some(({row, col})=>{
            let colToLeft=col-1;
            return colToLeft<0 || this.grid[row][colToLeft]!==null;
        });
    }

    hasObstacleUnderOf(cellsToCheck) {
        return cellsToCheck.some(({row, col})=>{
            let rowUnder=row+1;
            return rowUnder===BOX_ROWS || this.grid[rowUnder][col]!==null;
        });
    }

    freezeTilesInBox(cells){
        cells.forEach(({row, col}) => this.grid[row][col] = true);
    }

    checkForFinishedRows(){
        const rowRemovalPromises = []; //Store promises of each line removal
        let completedRows = 0;
        for (let rowIndex in this.grid) {
            if (this.grid[rowIndex].every(value => value === true)) {
                completedRows += 1;
                let rowRemovalPromise = this.removeRowOfTiles(rowIndex);
                rowRemovalPromises.push(rowRemovalPromise);
                this.updateGridAfterCompletingRow(rowIndex);
            }
        }
        if (completedRows != 0){
            updateScore(completedRows);
        }
        return Promise.all(rowRemovalPromises);
    }

    updateGridAfterCompletingRow(rowIndex){
        for (let i = rowIndex; i > 0; i--){
            this.grid[i] = [...this.grid[i-1]];
        }
        for (let j = 0; j < BOX_COLUMNS; j++) {
            this.grid[0][j] = null;
        } 
    }

    removeRowOfTiles(rowIndex){
        const boxClientRect = this.element.getBoundingClientRect();
        const boxTop = boxClientRect.top + 3; //Box border width = 3
        const rowToBeDeletedCoord = TILE_SIZE * rowIndex + (TILE_SIZE / 2) + boxTop;
        const tiles = this.element.getElementsByClassName("tile");
        const tilesToRemove = [];
        const tilesToFall = [];

        //Get tiles by coordinates which are in given row or above
        for (let i = tiles.length - 1; i >= 0; i--) {
            let tileClientRect = tiles[i].getBoundingClientRect();
            if (rowToBeDeletedCoord > tileClientRect.top &&
                rowToBeDeletedCoord < tileClientRect.bottom) {
                    tilesToRemove.push(tiles[i]);
            } else if (rowToBeDeletedCoord > tileClientRect.top) {
                tilesToFall.push(tiles[i]);
            }
        }
        //Add classes to tile parts to add animation to them (first they go white, then fade away)
        tilesToRemove.forEach(tile => {
            tile.getElementsByClassName("tileMiddle")[0].classList.add("tileMiddleBrighten");
            tile.getElementsByClassName("tileLeft")[0].classList.add("tileLeftBrighten");
            tile.getElementsByClassName("tileRight")[0].classList.add("tileRightBrighten");
            tile.getElementsByClassName("tileCorners")[0].classList.add("tileCornersBrighten");
        })

        return new Promise((resolve) => {
            setTimeout(function() { //Wait once the animation is finished
                currentStatus.lastFrame += 350;
                tilesToRemove.forEach(tile => {
                    //Change class of the tile
                    tile.classList.remove("tile");
                    tile.classList.add("emptyTile");
                    //Remove tetromino div if it's now empty
                    let tetrominoTiles = Array.from(tile.parentNode.children);
                    if (tetrominoTiles.every(child => child.classList.contains("emptyTile"))) {
                        tile.parentNode.remove();
                    };
                });
                //Move tiles above downwards to fill the gap from removed row
                tilesToFall.forEach(tile => {
                    tile.classList.add("tileFall");
                    const currentTransform = tile.style.transform;
                    tile.style.transform = currentTransform + " translateY(30px)";
                });

                resolve();
            }, 350);
        })
    }
}
export const gamebox = new Gamebox;


