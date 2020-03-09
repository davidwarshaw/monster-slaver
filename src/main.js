import 'phaser';

import properties from './properties';

import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import IntroScene from './scenes/IntroScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
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
  scene: [BootScene, TitleScene, IntroScene, GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
