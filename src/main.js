import 'phaser';

import properties from './properties';

import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import WinScene from './scenes/WinScene';

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  roundPixels: true,
  scale: {
    width: properties.width,
    height: properties.height,
    zoom: properties.scale
  },
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 } }
  },
  scene: [BootScene, TitleScene, GameScene, WinScene]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
