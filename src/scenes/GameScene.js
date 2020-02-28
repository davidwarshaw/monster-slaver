import properties from '../properties';

import BattleSystem from '../systems/BattleSystem';
import PokemonManager from '../sprites/PokemonManager';
import Player from '../sprites/Player';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    // this.cameras.main.setBounds(0, 0, 10000, 10000);
    // this.physics.world.setBounds(0, 0, 10000, 10000);

    this.map = this.make.tilemap({ key: 'map-start' });
    console.log(this.map);
    this.tileset = this.map.addTilesetImage('tileset-advanced', 'map-tiles');

    // Background and Collision
    this.mapCollider = this.map.createStaticLayer('background', this.tileset, 0, 0);
    this.mapCollider = this.map.createStaticLayer('collision', this.tileset, 0, 0);

    // Sprites
    this.pokemonManager = new PokemonManager(this, this.map);
    this.player = new Player(this, { x: 4, y: 4 }, true);

    // Now foreground
    this.mapCollider = this.map.createStaticLayer('foreground', this.tileset, 0, 0);

    // Create the systems
    this.battleSystem = new BattleSystem(this, this.map, this.player, this.pokemonManager);

    // Register the mouse listener
    this.input.on('pointerdown', pointer => this.battleSystem.pointerdown(pointer));
  }

  update(time, delta) {
  }
}
