//import chai from 'chai';
import { Tetromino } from '../tetrominoclass.js'

class Cell {
  constructor(r, c) {
    this.row = r;
    this.col = c;
  }
  toString() { return `{x: ${this.x}, y: ${this.y}} ` }
}
const tetrominoes = [
  // 1) The long one
  {
    shape: 'I',

    model: {
      placement: [[true, true, true, true]],
      rows: 1,
      columns: 4,
      colorCodes: ["#d92327", "#ff4245", "#a61b1e", "#9c191c"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 1)],
    rightEdges: [new Cell(1, 4)],
    bottomEdges: [new Cell(1, 1), new Cell(1, 2), new Cell(1, 3), new Cell(1, 4)],

    toString
  },
  // 2) The square
  {
    shape: 'O',
    model: {
      placement: [
        [true, true],
        [true, true]
      ],
      rows: 2,
      columns: 2,
      colorCodes: ["#fed304", "#fedf41", "#cca903", "#c2a103"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 1), new Cell(2, 1)],
    rightEdges: [new Cell(1, 2), new Cell(2, 2)],
    bottomEdges: [new Cell(2, 1), new Cell(2, 2)],
  },
  // 3) The small "T"
  {
    shape: 'T',
    model: {
      placement: [
        [false, true, false],
        [true, true, true]
      ], //0=empty, 1=tile
      rows: 2,
      columns: 3,
      colorCodes: ["#eb85b6", "#ffa3cf", "#b8688e", "#ad6186"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 2), new Cell(2, 1)],
    rightEdges: [new Cell(1, 2), new Cell(2, 3)],
    bottomEdges: [new Cell(2, 1), new Cell(2, 2), new Cell(2, 3)],
  },
  // 4) The "L"
  {
    shape: 'L',
    model: {
      placement: [
        [false, false, true],
        [true, true, true]
      ], //0=empty, 1=tile
      rows: 2,
      columns: 3,
      colorCodes: ["#1fa054", "#53bb6c", "#156e3a", "#166636"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 3), new Cell(2, 1)],
    rightEdges: [new Cell(1, 3), new Cell(2, 3)],
    bottomEdges: [new Cell(2, 1), new Cell(2, 2), new Cell(2, 3)],
  },
  // 5) The reverse "L"
  {
    shape: 'J',
    model: {
      placement: [
        [true, false, false],
        [true, true, true]
      ], //0=empty, 1=tile
      rows: 2,
      columns: 3,
      colorCodes: ["#5c4133", "#8f654f", "#291d17", "#211712"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 1), new Cell(2, 1)],
    rightEdges: [new Cell(1, 1), new Cell(2, 3)],
    bottomEdges:  [new Cell(2, 1), new Cell(2, 2), new Cell(2, 3)],
  },
  //6) The "S"
  {
    shape: 'S',
    model: {
      placement: [
        [false, true, true],
        [true, true, false]
      ], //0=empty, 1=tile
      rows: 2,
      columns: 3,
      colorCodes: ["#39a8a3", "#4adbd5", "#287572", "#256e6b"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 2), new Cell(2, 1)],
    rightEdges: [new Cell(1, 3), new Cell(2, 2)],
    bottomEdges: [new Cell(2, 1), new Cell(2, 2), new Cell(1, 3)],
  },
  // 7) The reverse "S"
  {
    shape: 'Z',
    model: {
      placement: [
        [true, true, false],
        [false, true, true]
      ], //0=empty, 1=tile
      rows: 2,
      columns: 3,
      colorCodes: ["#7e3d97", "#955aa4", "#532963", "#4a2459"],
    },

    addressOnGrid: new Cell(1, 1),

    leftEdges: [new Cell(1, 1), new Cell(2, 2)],
    rightEdges: [new Cell(1, 2), new Cell(2, 3)],
    bottomEdges: [new Cell(1, 1), new Cell(2, 2), new Cell(2, 3)],
  },

];

var expect = chai.expect
describe('taking edges', function () {
  tetrominoes.forEach((tetrData) => {
    //before(() => console.log(`figure is ${tetrData.shape}.`));
    let tetr = new Tetromino(tetrData.model);
    tetr.model.addressOnGrid = tetrData.addressOnGrid;
    describe(`left of ${tetrData.shape}`, function () {

      before(() => console.log(`left edges determinations start `));
      after(() => console.log("--------------------------------"));

      // beforeEach(() => console.log(`figure is ${tetrData.shape}.`));
      // afterEach(() => console.log("--------------------------------"));
      it(`edges should be: ${tetrData.leftEdges}  `, function () {
        for (let i = 0; i < tetrData.leftEdges.length; i++) {
          expect(tetr.getLeftEdgeGridCells()[i].row).equal(tetrData.leftEdges[i].row);
          expect(tetr.getLeftEdgeGridCells()[i].col).equal(tetrData.leftEdges[i].col);
        }
      });

      // it('should return 15 ', function () {
      //   expect(mathOperations.sum(10, 5)).equal(15);
      // });
    });

    describe(`right of ${tetrData.shape}`, function () {

      before(() => console.log(`right edges determinations start `));
      after(() => console.log("--------------------------------"));

      it(`edges should be: ${tetrData.rightEdges}  `, function () {
        for (let i = 0; i < tetrData.leftEdges.length; i++) {
          expect(tetr.getRightEdgeGridCells()[i].row).equal(tetrData.rightEdges[i].row);
          expect(tetr.getRightEdgeGridCells()[i].col).equal(tetrData.rightEdges[i].col);
        }
      });

    });

    describe(`bottom of ${tetrData.shape}`, function () {

      before(() => console.log(`bottom edges determinations start `));
      after(() => console.log("--------------------------------"));

      it(`edges should be: ${tetrData.bottomEdges}  `, function () {
        for (let i = 0; i < tetrData.leftEdges.length; i++) {
          expect(tetr.getBottomEdgeGridCells()[i].row).equal(tetrData.bottomEdges[i].row);
          expect(tetr.getBottomEdgeGridCells()[i].col).equal(tetrData.bottomEdges[i].col);
        }
      });

    });
  });
});