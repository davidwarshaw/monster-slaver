export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Maps
    this.load.image('map-tiles', 'assets/maps/tileset-advanced.png');
    this.load.tilemapTiledJSON('map-start', 'assets/maps/start.json');

    // Sprites
    this.load.spritesheet('player', 'assets/images/players_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
    this.load.spritesheet('pokemon', 'assets/images/pokemon_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0
    });
  }

  create() {
    this.scene.start('GameScene');
  }
}
