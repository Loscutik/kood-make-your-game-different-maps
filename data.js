export const tetrominoesData = [
    // 1) The long one
    {   color: "red", //Color name string is actually not used, but kept it here atm as these color codes don't say much
        colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
        placement: "1111",
        height: "120px",
        width: "30px",
    },
    // 2) The square
    {   color: "yellow",
        colorCodes: ["#fed304", "#fedf41", "#cca903", "#c2a103"],
        placement: "1111",
        height: "60px",
        width: "60px",
    },
    // 3) The small "T"
    {   color: "pink",
        colorCodes: ["#eb85b6", "#ffa3cf", "#b8688e", "#ad6186"],
        placement: "010111", //0=empty, 1=tile
        height: "60px",
        width: "90px",
    },
    // 4) The "L"
    {   color: "green",
        colorCodes: ["#1fa054", "#53bb6c", "#156e3a", "#166636"],
        placement: "001111", //0=empty, 1=tile
        height: "60px",
        width: "90px",
    },
    // 5) The reverse "L"
    {   color: "brown",
        colorCodes: ["#5c4133", "#8f654f", "#291d17", "#211712"],
        placement: "100111", //0=empty, 1=tile
        height: "60px",
        width: "90px",
    },
    // 6) The "S"
    {   color: "blue",
        colorCodes: ["#39a8a3", "#4adbd5", "#287572", "#256e6b"],
        placement: "011110", //0=empty, 1=tile
        height: "60px",
        width: "90px",
    },
    // 7) The reverse "S"
    {   color: "purple",
        colorCodes: ["#7e3d97", "#955aa4", "#532963", "#4a2459"],
        placement: "110011", //0=empty, 1=tile
        height: "60px",
        width: "90px",
    },

];


// const allTileColors = { //Color codes for tiles (each tile contains 4 different colors)
//     blue:   ["#39a8a3", "#4adbd5", "#287572", "#256e6b"],

//     purple: ["#7e3d97", "#955aa4", "#532963", "#4a2459"],

// };