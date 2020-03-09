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

function getSingleAutoTile(map, x, y, tile) {
  const west = getFromMap(map, x - 1, y) === tile;
  const east = getFromMap(map, x + 1, y) === tile;
  const north = getFromMap(map, x, y - 1) === tile;
  const south = getFromMap(map, x, y + 1) === tile;
  if (north && south) {
    return 'north-south';
  }
  if (east && west) {
    return 'east-west';
  }
  if (north && west) {
    return 'north-west';
  }
  if (north && east) {
    return 'north-east';
  }
  if (south && west) {
    return 'south-west';
  }
  if (south && east) {
    return 'south-east';
  }
  if (north && !south) {
    return 'no-south';
  }
  if (south && !north) {
    return 'no-north';
  }
  if (east && !west) {
    return 'no-west';
  }
  if (west && !east) {
    return 'no-east';
  }
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

function populateBackground(definition, layer, doors) {
  layer.randomize(
    0,
    0,
    properties.mapWidthTiles,
    properties.mapHeightTiles,
    definition.tiles.background.base
  );

  // Add doors before autotiling
  doors.forEach(door => {
    const { x, y } = door.from;
    const { tileIndex } = door;
    layer.putTileAt(tileIndex, x, y);
  });
}

function populateCollision(definition, layer, doors) {
  const { width, height } = definition.mapSizeTiles;
  const { wall } = definition.tiles.collision;

  const baseMap = generateBaseMap(width, height);

  const rotMap = new ROT.Map.DividedMaze(width, height);

  //const rotMap = new ROT.Map.Uniform(width, height, { roomDugPercentage: 0.9 });
  rotMap.create((x, y, isWall) => {
    baseMap[y][x] = isWall > 0 ? 'wall' : 'floor';
  });

  // Add doors before autotiling
  doors.forEach(door => {
    const { x, y } = door.from;
    baseMap[y][x] = 'door';
  });

  const firstPass = [];
  baseMap.forEach((tileRow, y) => {
    firstPass[y] = [];
    tileRow.forEach((tile, x) => {
      firstPass[y][x] = tile;
      const floorNeighbors = neighborCount(baseMap, x, y, ['floor']);
      if (floorNeighbors === 0) {
        console.log(`floorNeighbors: ${floorNeighbors}`);
        firstPass[y][x] = 'fill';
      }
    });
  });

  firstPass.forEach((tileRow, y) => {
    tileRow.forEach((tile, x) => {
      if (tile === 'wall') {
        const autoTile = getSingleAutoTile(firstPass, x, y, 'wall');
        const tileIndex = wall[autoTile] || wall['default'];
        layer.putTileAt(tileIndex, x, y);
      }
    });
  });
}

export default {
  populateBackground,
  populateCollision
};
