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

    isCellsFree(cellsToCheck) {
        return cellsToCheck.every(({row,col})=>!this.grid[row][col]);
    }
}
export const gamebox = new Gamebox;


