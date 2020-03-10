import * as ROT from 'rot-js';

ROT.RNG.setSeed(Date.now());

export default {
  debug: true,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  scale: 3,
  tileWidth: 16,
  tileHeight: 16,
  mapWidthTiles: 100,
  mapHeightTiles: 100,
  throwMillis: 1000,
  captureMillis: 500,
  attackMillis: 100,
  numberMillis: 1200,
  animFrameRate: 10,
  turnDelayMillis: 600,
  turnDurationMillis: 200,
  uiFlashTint: 0x000000,
  uiHangMillis: 100
};
