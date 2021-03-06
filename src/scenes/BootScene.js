export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Misc
    this.load.image('font-small', 'assets/fonts/atari_like.png');
    this.load.image('pokeball-big', 'assets/images/pokeball_big.png');
    this.load.image('select-frame', 'assets/images/select_frame.png');
    this.load.image('window-small', 'assets/images/window_small.png');
    this.load.image('window-big', 'assets/images/window_big.png');
    this.load.image('window-intro', 'assets/images/window_intro.png');

    // Maps
    this.load.image('map-tiles', 'assets/maps/tileset-advanced.png');
    this.load.tilemapTiledJSON('map-start', 'assets/maps/map-start.json');

    // Sprites
    this.load.spritesheet('pokeball-small', 'assets/images/pokeball_small.png', {
      frameWidth: 16,
      frameHeight: 16
    });
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
    this.load.spritesheet('uwumbstone', 'assets/images/uwumbstone.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    this.scene.start('TitleScene');
  }
}
