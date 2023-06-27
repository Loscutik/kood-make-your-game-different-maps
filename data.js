// placement changed to array of numbers
// added shape property
export const BOX_ROWS = 20;
export const BOX_COLUMNS = 10;
export const TILE_SIZE = 30;
export const BOX_WIDTH = BOX_COLUMNS*TILE_SIZE;
export const BOX_HEIGHT = BOX_ROWS*TILE_SIZE;
export const tetrominoesData = [
    // 1) The long one
    {
        shape: 'I',
        color: "red", //Color name string is actually not used, but kept it here atm as these color codes don't say much
        colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
        placement: [[true, true, true, true]],
        rows: 1,
        columns: 4,
        height: "120px",
        width: "30px",
    },
    // 2) The square
    {
        shape: 'O',
        color: "yellow",
        colorCodes: ["#fed304", "#fedf41", "#cca903", "#c2a103"],
        placement: [
            [true, true],
            [true, true]
        ],
        rows: 2,
        columns: 2,
        height: "60px",
        width: "60px",
    },
    // 3) The small "T"
    {
        shape: 'T',
        color: "pink",
        colorCodes: ["#eb85b6", "#ffa3cf", "#b8688e", "#ad6186"],
        placement: [
            [false, true, false],
            [true, true, true]
        ], //0=empty, 1=tile
        rows: 2,
        columns: 3,
        height: "60px",
        width: "90px",
    },
    // 4) The "L"
    {
        shape: 'L',
        color: "green",
        colorCodes: ["#1fa054", "#53bb6c", "#156e3a", "#166636"],
        placement: [
            [false, false, true],
            [true, true, true]
        ], //0=empty, 1=tile
        rows: 2,
        columns: 3,
        height: "60px",
        width: "90px",
    },
    // 5) The reverse "L"
    {
        shape: 'J',
        color: "brown",
        colorCodes: ["#5c4133", "#8f654f", "#291d17", "#211712"],
        placement: [
            [true, false, false],
            [true, true, true]
        ], //0=empty, 1=tile
        rows: 2,
        columns: 3,
        height: "60px",
        width: "90px",
    },
    // 6) The "S"
    {
        shape: 'S',
        color: "blue",
        colorCodes: ["#39a8a3", "#4adbd5", "#287572", "#256e6b"],
        placement: [
            [false, true, true],
            [true, true, false]
        ], //0=empty, 1=tile
        rows: 2,
        columns: 3,
        height: "60px",
        width: "90px",
    },
    // 7) The reverse "S"
    {
        shape: 'Z',
        color: "purple",
        colorCodes: ["#7e3d97", "#955aa4", "#532963", "#4a2459"],
        placement: [
            [true, true, false],
            [false, true, true]
        ], //0=empty, 1=tile
        rows: 2,
        columns: 3,
        height: "60px",
        width: "90px",
    },

];