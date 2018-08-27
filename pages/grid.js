
function Grid(size) {
  this.size = size;
  this.cells = this.empty();
}

Grid.prototype = {

  empty: function () {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];

      for (var y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
    return cells;
  },

  randomSelectAvailableCell: function () {
    var cells = this.availableCells();

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  },

  // 获取可填充的格子坐标
  availableCells: function () {
    var cells = [];

    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        if (!this.cells[i][j]) {
          cells.push({
            x: i,
            y: j
          });
        }
      }
    }

    return cells;
  },

  // 是否存在空单元格
  cellsAvailable: function () {
    return !!this.availableCells().length;
  },

  cellAvailable: function (cell) {
    return !this.cellContent(cell);
  },

  cellContent: function (cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y] || null;
    } else {
      return null;
    }
  },

  insertTile: function (tile) {
    this.cells[tile.x][tile.y] = tile;
  },

  removeTile: function (tile) {
    this.cells[tile.x][tile.y] = null;
  },

  withinBounds: function (cell) {
    return cell.x >= 0 && cell.x < this.size && cell.y >= 0 && cell.y < this.size;
  },
}

module.exports = Grid;
