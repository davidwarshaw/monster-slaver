import properties from '../properties';

function edgeTileFromAngle(radians) {
  const x0 = Math.round(properties.localWidth / 2);
  const y0 = Math.round(properties.localHeight / 2);
  const x1 = Math.round(x0 + properties.localWidth * Math.cos(radians));
  const y1 = Math.round(y0 + properties.localHeight * Math.sin(radians));

  // console.log(`${x1}, ${y1}`);
  const ray = tileRay(x0, y0, x1, y1);
  const edgeTile = ray.pop();
  return edgeTile;
}

function tileLine(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while (x !== x1 || y !== y1) {
    //console.log(`${x}-${y}`);
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileRay(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while (
    x !== 0 &&
    x !== properties.localWidth - 1 &&
    (y !== 0 && y !== properties.localHeight - 1)
  ) {
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileFromScreen(screen) {
  const x = Math.floor(screen.x / properties.tileWidth);
  const y = Math.floor(screen.y / properties.tileHeight);
  return { x, y };
}

function screenFromTile(tile) {
  const x = Math.round((0.5 + tile.x) * properties.tileWidth);
  const y = Math.round((0.5 + tile.y) * properties.tileHeight);
  return { x, y };
}

function addHalfTile(point) {
  return { x: point.x + 0.5 * properties.tileWidth, y: point.y + 0.5 * properties.tileHeight };
}

function distance(from, to) {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

function keyFromXY(x, y) {
  return keyFromPoint({ x, y });
}

function keyFromPoint(point) {
  return `${point.x}-${point.y}`;
}

function collisionMapFromTileMap(tileMap) {
  const collision = tileMap.layers.filter(layer => layer.name === 'collision')[0];
  const collisionMap = {};
  collision.data.forEach(row =>
    row.forEach(tile => {
      collisionMap[keyFromPoint(tile)] = tile.index > 0 ? true : false;
    })
  );
  return collisionMap;
}

export default {
  edgeTileFromAngle,
  tileLine,
  tileRay,
  tileFromScreen,
  screenFromTile,
  addHalfTile,
  distance,
  keyFromXY,
  keyFromPoint,
  collisionMapFromTileMap
};
