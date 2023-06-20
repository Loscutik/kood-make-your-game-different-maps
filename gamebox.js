import { BOX_WIDTH, BOX_HEIGHT, TILE_SIZE } from "./data.js";

export const columnTopsStart = [
    BOX_HEIGHT, //To keep track how high is each column
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT,
    BOX_HEIGHT];

 class Gamebox {

    element = document.getElementById("gamebox");

    columnTopsCurrent = [...columnTopsStart];

    updateColumnTops(column, top) { //Atm not very needed as a separate func. But was afraid that animate() will get pretty long later
        this.columnTopsCurrent[column] = top;
    }
}
export const gamebox= new Gamebox;


