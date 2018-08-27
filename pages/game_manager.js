var Grid = require('./grid.js');
var Tile = require('./tile.js');

function GameManager(size) {
  this.size = size;
  this.startTiles = 2;
}

GameManager.prototype = {
  setup: function () {

    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.addStartTiles();
    return this.grid.cells;
  },

  addStartTiles: function () {
    for (var x = 0; x < this.startTiles; x++) {
      this.addRandomTiles();
    }
  },

  addRandomTiles: function () {

    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var cell = this.grid.randomSelectAvailableCell();
      var tile = new Tile(cell, value);
      this.grid.insertTile(tile);
    }
  },

  actuate: function () {

    return {
      grids: this.grid.cells,
      over: this.over,
      won: this.won,
      score: this.score
    }
  },

  getVector: function (direction) {

    var map = {
      0: { //上
        x: -1,
        y: 0
      },
      1: { // 右
        x: 0,
        y: 1
      },
      2: { // 下
        x: 1,
        y: 0
      },
      3: { // 左
        x: 0,
        y: -1
      }
    };
    return map[direction];
  },

  buildTraversals: function (vector) {
    var traversals = {
      x: [],
      y: []
    };

    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    if (vector.x === 1) {
      // 向下时
      traversals.x = traversals.x.reverse();
    }

    if (vector.y === 1) {
      // 向右时
      traversals.y = traversals.y.reverse();
    }

    return traversals;
  },

  moveTile: function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  },

  move: function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;
    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var cell;
    var tile;
    var moved = false;
    self.prepareTiles();
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = {
          x: x,
          y: y
        };
        tile = self.grid.cellContent(cell);
        if (tile) {
          var positions = self.findFarthestTile(cell, vector);
          var next = self.grid.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);
            tile.updatePosition(positions.next);
            self.score += merged.value;
            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }
          if (!self.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this.addRandomTiles();

      if (!this.movesAvailable()) {
        this.over = true;
      }

      return this.actuate();
    }
  },

  prepareTiles: function () {

    var tile;
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cells[x][y];
        if (tile) {
          tile.mergedFrom = null;
          tile.savePosition();
        }
      }
    }
  },

  positionsEqual: function (first, second) {
    return first.x === second.x && first.y === second.y;
  },

  movesAvailable: function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  },

  tileMatchesAvailable: function () {
    var self = this;

    var tile;

    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y });

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell = { x: x + vector.x, y: y + vector.y };

            var other = self.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },

  findFarthestTile: function (cell, vector) {
    var previous;

    do {
      previous = cell;
      cell = {
        x: previous.x + vector.x,
        y: previous.y + vector.y
      };
    }
    while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell
    }
  },

  restart: function () {
    return this.setup();
  }
}

module.exports = GameManager;
