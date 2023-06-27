import { BOX_ROWS, BOX_COLUMNS, BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";
import { gamebox } from "./gamebox.js";

const horizontalSpeed = TILE_SIZE;

export class Tetromino {
    constructor(initialData) {
        this.shape = initialData.shape;

        this.model = {
            rows: initialData.rows,
            columns: initialData.columns,
            offsetFromGridLine: 0,
        }

        this.model.addressOnGrid = { row: 0, col: Math.floor((BOX_COLUMNS - this.model.columns) / 2) };
        this.model.placement = Array(this.model.rows);
        for (let i = 0; i < this.model.rows; i++) {
            this.model.placement[i] = [...initialData.placement[i]];
        }

        this.view = {
            left: (BOX_WIDTH / 2 - Math.ceil(this.model.columns / 2) * TILE_SIZE), // TODO check if this is necessey
            top: 0, // TODO check if this is necessey
            colorCodes: initialData.colorCodes,
            rotationCounter: 0,
            translateOffsetX: 0,
            translateOffsetY: 0,
        }

        this.view.element = createTetrominoElm(this.view.left, this.model.rows * TILE_SIZE, this.model.columns * TILE_SIZE, this.model.placement, this.view.colorCodes);
    }

    moveDown(speed) {
        let offset = this.model.offsetFromGridLine + speed;
        if (offset < TILE_SIZE) {
            this.model.offsetFromGridLine = offset;

            this.view.translateOffsetY += speed;
            this.moveElm();
            return true;
        } else {
            this.model.addressOnGrid.row++;
            if (!gamebox.hasObstacleUnderOf(this.getBottomEdgeCells())) {
                this.model.offsetFromGridLine = offset - TILE_SIZE; // offset supposed to be < 2*TILE_SIZE. In this case we need to do %TILE_SIZE, but -TILE_SIZE is faster

                this.view.translateOffsetY += speed;
                this.moveElm();
                return true;
            } else {
                this.view.translateOffsetY += TILE_SIZE - this.model.offsetFromGridLine;

                this.model.offsetFromGridLine = 0;
                this.moveElm();
                return false;
            }
        }
    }

    moveRight() {
        if (!gamebox.hasObstacleRightOf(this.getRightEdgeCells())) {
            // move the model
            this.model.addressOnGrid.col++;

            // move the view
            this.view.translateOffsetX += TILE_SIZE;
            this.moveElm();
            return true;
        }
        return false;
    }

    moveLeft() {
        if (!gamebox.hasObstacleLeftOf(this.getLeftEdgeCells())) {
            // move the model
            this.model.addressOnGrid.col--;

            // move the view
            this.view.translateOffsetX -= TILE_SIZE;
            this.moveElm();
            return true;
        }
        return false;
    }

    moveElm() {
        this.view.element.style.transform =
            `translate(${this.view.translateOffsetX}px, ${this.view.translateOffsetY}px) rotate(${0.25 * this.view.rotationCounter}turn) `;

        for(let i=0; i<this.view.element.children.length; i++) {
            this.view.element.children[i].style.transform = 
                `rotate(${-0.25 * this.view.rotationCounter}turn)`;
        }
    }


    //TODO: Implement
    rotate() {

        if (this.shape === 'O') return;

        [this.model.rows, this.model.columns] = [this.model.columns, this.model.rows];
        // - change placement of the tiles
        const newPlacement = Array(this.model.rows);

        for (let row = 0; row < this.model.rows; row++) {
            newPlacement[row] = Array(this.model.columns);
            for (let col = 0; col < this.model.columns; col++) {
                newPlacement[row][col] = this.model.placement[col][row];
            }
        }

        if (this.shape !== 'I') {

            for (let row = 0; row < this.model.rows; row++) {
                for (let col = 0; col < Math.trunc(this.model.columns / 2); col++) {
                    [newPlacement[row][col], newPlacement[row][this.model.columns - 1 - col]] =
                        [newPlacement[row][this.model.columns - 1 - col], newPlacement[row][col]];
                }
            }
        }

        this.model.placement = newPlacement;

        // - rotate the container
        this.view.rotationCounter = (this.view.rotationCounter + 1) % 4;

        const diff = this.model.rows - this.model.columns;
        const containerMeasureChange = Math.trunc(diff / 2);
        // in theory we can calculate the shift of the tetromino after the rotation ( (diff%2)*TILE_SIZE), but
        // for all tetrominos (except for "O" which doesn't need to rotate) 'diff%2' is equal  +/-0.5.
        // just simplify the calculation
        const containerHalfShift = Math.sign(diff) * 0.5 * TILE_SIZE;

        // -- Horizontal positions
        // correct horizontal position of the tetromino view after rotation, in the other case it would stay in the middle of the grid.
        this.view.translateOffsetX -= containerHalfShift;

        this.model.addressOnGrid.col += containerMeasureChange;
        if (this.model.addressOnGrid.col < 0) {
            this.view.translateOffsetX += -this.model.addressOnGrid.col * TILE_SIZE;
            this.model.addressOnGrid.col = 0;
        }

        const rightAllowdEdgeForAddress = BOX_COLUMNS - this.model.columns;//this.model.addressOnGrid.col+this.model.columns;
        if (this.model.addressOnGrid.col > rightAllowdEdgeForAddress) {
            this.view.translateOffsetX -= (this.model.addressOnGrid.col - rightAllowdEdgeForAddress) * TILE_SIZE;
            this.model.addressOnGrid.col = rightAllowdEdgeForAddress;
        }

        // -- Vertical positions
        let verticalOffset = this.model.offsetFromGridLine - containerHalfShift;
        this.model.addressOnGrid.row -= containerMeasureChange - Math.floor(verticalOffset / TILE_SIZE);
        this.model.offsetFromGridLine = (TILE_SIZE + verticalOffset) % TILE_SIZE; // (TILE_SIZE+verticalOffset) - correction for negative verticalOffset 

        //TODO: check if there are any obsticles

        this.moveElm();

    }


    getBottomEdgeCells() {
        let tilesOnEdge = [];

        for (let col = 0; col < this.model.columns; col++) {
            let row = this.model.rows - 1;
            while (!this.model.placement[row][col]) row--;
            tilesOnEdge.push({ row: this.model.addressOnGrid.row + row, col: this.model.addressOnGrid.col + col });
        }
        return tilesOnEdge;
    }

    getRightEdgeCells() {
        const tilesOnEdge = this.model.placement.reduce((tilesOnEdge, rowVector, rowNumber) => {
            tilesOnEdge.push({ row: this.model.addressOnGrid.row + rowNumber, col: this.model.addressOnGrid.col + rowVector.lastIndexOf(true) });
            return tilesOnEdge;
        }, []);


        // if the tetromino is shifted from the grid,
        // add to the list of tiles on edge those that are under ledges:
        // XX    or    XX    or   X
        // X^         XX^         X
        // X           ^          XX
        // ^                       ^
        if (this.model.offsetFromGridLine > 0) {
            // add the cells under the bottom tile  
            let tilesOnEdgeLength = tilesOnEdge.length;
            for (let i = 0; i < tilesOnEdgeLength; i++) {
                tilesOnEdge.push({ row: tilesOnEdge.at(i).row + 1, col: tilesOnEdge.at(i).col });
            }

            
            // add the cell under the bottom tile  
            // tilesOnEdge.push({ row: tilesOnEdge.at(-1).row + 1, col: tilesOnEdge.at(-1).col });
            // find the ledge (if any) and add the cell under it
            // if (tilesOnEdge.at(-1).col < this.model.columns - 1) {
            //     console.log("Happens")
            //     for (let r = this.model.rows - 2; r >= 0; r--) {
            //         if (this.model.placement[r][this.model.columns - 1]) {
            //             tilesOnEdge.push({ row: this.model.addressOnGrid.row + r, col: this.model.addressOnGrid.col + this.model.columns - 1 });
            //         }
            //     }
            // }
        }
        return tilesOnEdge;
    }


    getLeftEdgeCells() {
        const tilesOnEdge = this.model.placement.reduce((tilesOnEdge, rowVector, rowNumber) => {
            tilesOnEdge.push({ row: this.model.addressOnGrid.row + rowNumber, col: this.model.addressOnGrid.col + rowVector.indexOf(true) })
            return tilesOnEdge;
        }, []);

        // if the tetromino is shifted from the grid,
        // add to the list of tiles on edge those that are under ledges:
        //  XX    or    XX       or  X
        //  ^X          ^XX          X
        //   X           ^          XX
        //   ^                      ^
        if (this.model.offsetFromGridLine > 0) {
            // add the cells under the bottom tile  
            let tilesOnEdgeLength = tilesOnEdge.length;
            for (let i = 0; i < tilesOnEdgeLength; i++) {
                tilesOnEdge.push({ row: tilesOnEdge.at(i).row + 1, col: tilesOnEdge.at(i).col });
            }

            //PREVIOUS IMPLEMENTATION
            // // add the cell under the bottom tile  
            // tilesOnEdge.push({ row: tilesOnEdge.at(-1).row + 1, col: tilesOnEdge.at(-1).col });
            // // find the ledge (if any) and add the cell under it
            // if (tilesOnEdge.at(-1).col > 0) {
            //     for (let r = this.model.rows - 2; r >= 0; r--) {
            //         if (this.model.placement[r][0]) {
            //             tilesOnEdge.push({ row: this.model.addressOnGrid.row + r, col: this.model.addressOnGrid.col });
            //         }
            //     }
            // }
        }

        return tilesOnEdge;
    }

    getTiles() {
        let tilesAddresses = [];
        for (let row = 0; row < this.model.rows; row++) {
            this.model.placement[row].reduce((allTiles, mark, col) => {
                if (mark) {
                    allTiles.push({ row: this.model.addressOnGrid.row + row, col: this.model.addressOnGrid.col + col })
                }
                return allTiles;
            }, tilesAddresses);
        }
        return tilesAddresses;
    }

}

function createTetrominoElm(left, height, width, placement, colorCodes) {
    const newTetromino = document.createElement("div");
    newTetromino.classList.add("tetromino");
    //let tetrominoData = tetrominoesData[Math.floor(Math.random() * 7)];
    for (let position of placement.flat()) {
        if (position) {
            createNewTile(newTetromino, colorCodes)
        } else {
            const emptyTile = document.createElement("div");
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