import { BOX_ROWS, BOX_COLUMNS, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";

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
        cells.forEach(({row, col})=>this.grid[row][col] =true);
    }

    checkForFinishedRows(){
        for (let rowIndex in this.grid) {
            if (this.grid[rowIndex].every(value => value === true)) {
                this.removeRowOfTiles(rowIndex);
            }
        }
    }

    removeRowOfTiles(rowIndex){
        const boxClientRect = this.element.getBoundingClientRect();
        const boxTop = boxClientRect.top + 3; //Box border width = 3
        const rowToBeDeletedCoord = TILE_SIZE * rowIndex + (TILE_SIZE / 2) + boxTop;
        const tiles = this.element.getElementsByClassName("tile");
        const tilesToRemove = [];
        const tilesToFall = [];

        for (let i = tiles.length - 1; i >= 0; i--) {
            let tileClientRect = tiles[i].getBoundingClientRect();
            if (rowToBeDeletedCoord > tileClientRect.top &&
                rowToBeDeletedCoord < tileClientRect.bottom) {
                    tilesToRemove.push(tiles[i]);
            } else if (rowToBeDeletedCoord > tileClientRect.top) {
                tilesToFall.push(tiles[i]);
            }
        }
        tilesToRemove.forEach(tile => {
            tile.getElementsByClassName("tileMiddle")[0].classList.add("tileMiddleBrighten");
            tile.getElementsByClassName("tileLeft")[0].classList.add("tileLeftBrighten");
            tile.getElementsByClassName("tileRight")[0].classList.add("tileRightBrighten");
            tile.getElementsByClassName("tileCorners")[0].classList.add("tileCornersBrighten");
        })

        // WORK IN PROGRESS:
        // setTimeout(function() {
        //     tilesToRemove.forEach(tile => tile.parentNode.removeChild(tile));
        //     tilesToFall.forEach(tile => {
        //         //Transform would be better here, but issues with previous transforms applied
        //         tile.classList.add("tileFall");
        //         let currentTop = parseInt(window.getComputedStyle(tile).top, 10);
        //         tile.style.top = (currentTop + TILE_SIZE) + "px";
        //     });
        // }, 700);
    }

    isCellsFree(cellsToCheck) {
        return cellsToCheck.every(({row,col})=>!this.grid[row][col]);
    }
}
export const gamebox = new Gamebox;


