import * as ROT from 'rot-js';

import properties from '../properties';

function getFromMap(map, x, y) {
  const height = map.length;
  const width = map[0].length;

  return x >= 0 && y >= 0 && x < width && y < height ? map[y][x] : null;
}

function getNeighbors(map, x, y) {
  return [
    getFromMap(map, x - 1, y - 1),
    getFromMap(map, x, y - 1),
    getFromMap(map, x + 1, y - 1),
    getFromMap(map, x - 1, y),
    getFromMap(map, x + 1, y),
    getFromMap(map, x - 1, y + 1),
    getFromMap(map, x, y + 1),
    getFromMap(map, x + 1, y + 1)
  ].filter(tile => tile);
}

function getBits(map, x, y, tile) {
  const bitArray = new Array(9);
  bitArray[4] = true;
  bitArray[3] = getFromMap(map, x - 1, y) === tile;
  bitArray[5] = getFromMap(map, x + 1, y) === tile;
  bitArray[1] = getFromMap(map, x, y - 1) === tile;
  bitArray[7] = getFromMap(map, x, y + 1) === tile;
  bitArray[0] = getFromMap(map, x - 1, y - 1) === tile;
  bitArray[2] = getFromMap(map, x + 1, y - 1) === tile;
  bitArray[6] = getFromMap(map, x - 1, y + 1) === tile;
  bitArray[8] = getFromMap(map, x + 1, y + 1) === tile;
  const bits = bitArray.map(patch => (patch ? 1 : 0)).join('');
  return bits;
}

function neighborCount(map, x, y, neighbors) {
  const neighborsToCheck = Array.isArray(neighbors) ? neighbors : [neighbors];

  return getNeighbors(map, x, y)
    .map(tile => neighborsToCheck.includes(tile))
    .filter(matchingTile => matchingTile).length;
}

function generateBaseMap(width, height) {
  return [...Array(height).keys()].map(() => [...Array(width).keys()].map(() => ''));
}

function populateBackground(definition, layer) {
  layer.randomize(
    0,
    0,
    properties.mapWidthTiles,
    properties.mapHeightTiles,
    definition.tiles.background.base
  );
}

function populateCollision(definition, layer) {
  const { width, height } = definition.mapSizeTiles;

  const baseMap = generateBaseMap(width, height);
  const rotMap = new ROT.Map.DividedMaze(width, height);
  rotMap.create((x, y, isWall) => {
    baseMap[y][x] = isWall > 0 ? 'wall' : 'floor';
  });
  baseMap.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (tile === 'wall') {
        layer.putTileAt(definition.tiles.collision.wall, x, y);
      }
    });
  });
}

export default {
  populateBackground,
  populateCollision
};
