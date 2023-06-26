//import chai from 'chai';
import { Tetromino } from '../tetrominoclass.js'
import { gamebox } from "../gamebox.js";


class Cell {
  constructor(r, c) {
    this.row = r;
    this.col = c;
  }
  toString() { return `{ row: ${this.row}, col: ${this.col} } ` }
}

const tetrominoesHorizontal = [
  // 1) from horizontal to vertical
  {
    shape: 'I',

    model: {
      placement: [[true, true, true, true]],
      rows: 1,
      columns: 4,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(2, 1),
    offsetFromGridLine: 0,

    shouldBe: {
      addressOnGrid: new Cell(0, 2),
      offsetFromGridLine: 15,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true, true, true, true]],
      rows: 1,
      columns: 4,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(2, 1),
    offsetFromGridLine: 2,

    shouldBe: {
      addressOnGrid: new Cell(0, 2),
      offsetFromGridLine: 17,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true, true, true, true]],
      rows: 1,
      columns: 4,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(2, 1),
    offsetFromGridLine: 15,

    shouldBe: {
      addressOnGrid: new Cell(1, 2),
      offsetFromGridLine: 0,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true, true, true, true]],
      rows: 1,
      columns: 4,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(2, 1),
    offsetFromGridLine: 18,

    shouldBe: {
      addressOnGrid: new Cell(1, 2),
      offsetFromGridLine: 3,
    },

  },

];

const tetrominoesVertical = [
  // 1) from horizontal to vertical
  {
    shape: 'I',

    model: {
      placement: [[true], [true], [true], [true]],
      rows: 4,
      columns: 1,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(4, 5),
    offsetFromGridLine: 0,

    shouldBe: {
      addressOnGrid: new Cell(5, 4),
      offsetFromGridLine: 15,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true], [true], [true], [true]],
      rows: 4,
      columns: 1,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(4, 5),
    offsetFromGridLine: 2,

    shouldBe: {
      addressOnGrid: new Cell(5, 4),
      offsetFromGridLine: 17,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true], [true], [true], [true]],
      rows: 4,
      columns: 1,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(4, 5),
    offsetFromGridLine: 15,

    shouldBe: {
      addressOnGrid: new Cell(6, 4),
      offsetFromGridLine: 0,
    },

  },

  {
    shape: 'I',

    model: {
      placement: [[true], [true], [true], [true]],
      rows: 4,
      columns: 1,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(4, 5),
    offsetFromGridLine: 18,

    shouldBe: {
      addressOnGrid: new Cell(6, 4),
      offsetFromGridLine: 3,
    },

  },

];

function printGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  let output = '  |';
  for (let i = 0; i < cols; i++) {
    output += String(i).padStart(2, '0');
    output += '|';
  }

  output += '\n---------------------------------\n';

  for (let i = 0; i < rows; i++) {
    output += String(i).padStart(2, '0') + '|';
    for (let j = 0; j < cols; j++) {
      output += grid[i][j] ? `XX|` : '  |';
    }
    output += '\n---------------------------------\n';
  }
  return output;
}

var expect = chai.expect
describe('rotate horizontal tetromino', function () {
  tetrominoesHorizontal.forEach((tetrData) => {
    let tetr = new Tetromino(tetrData.model);
    tetr.model.addressOnGrid = tetrData.addressOnGrid;
    tetr.model.offsetFromGridLine = tetrData.offsetFromGridLine;
    describe(`turn horizontal. From  ${tetrData.addressOnGrid} - ${tetrData.offsetFromGridLine}  \\address - offset\\ to`, function () {

      it(`should be:  ${tetrData.shouldBe.addressOnGrid}-${tetrData.shouldBe.offsetFromGridLine}  \\address - offset\\ `, function () {

        gamebox.freezeTilesInBox(tetr.getTiles());
        //console.log(printGrid(gamebox.grid));
        // console.log("rotate");
        tetr.rotate();
        gamebox.freezeTilesInBox(tetr.getTiles());
        console.log(printGrid(gamebox.grid));
        gamebox.resetGrid();

        expect(tetr.model.addressOnGrid.raw).equal(tetrData.shouldBe.addressOnGrid.raw);
        expect(tetr.model.addressOnGrid.col).equal(tetrData.shouldBe.addressOnGrid.col);
        expect(tetr.model.offsetFromGridLine).equal(tetrData.shouldBe.offsetFromGridLine);
      });

    });
  });
});

describe('rotate vertical tetromino', function () {
  tetrominoesVertical.forEach((tetrData) => {
    let tetr = new Tetromino(tetrData.model);
    tetr.model.addressOnGrid = tetrData.addressOnGrid;
    tetr.model.offsetFromGridLine = tetrData.offsetFromGridLine;
    describe(`turn vertical. From  ${tetrData.addressOnGrid} - ${tetrData.offsetFromGridLine}  \\address - offset\\ to`, function () {

      it(`should be:  ${tetrData.shouldBe.addressOnGrid}-${tetrData.shouldBe.offsetFromGridLine}  \\address - offset\\ `, function () {

        gamebox.freezeTilesInBox(tetr.getTiles());
        //console.log(printGrid(gamebox.grid));
        // console.log("rotate");
        tetr.rotate();
        gamebox.freezeTilesInBox(tetr.getTiles());
        console.log(printGrid(gamebox.grid));
        gamebox.resetGrid();

        expect(tetr.model.addressOnGrid.raw).equal(tetrData.shouldBe.addressOnGrid.raw);
        expect(tetr.model.addressOnGrid.col).equal(tetrData.shouldBe.addressOnGrid.col);
        expect(tetr.model.offsetFromGridLine).equal(tetrData.shouldBe.offsetFromGridLine);
      });

    });
  });
});