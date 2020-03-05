import properties from '../properties';
import mapDefinitions from '../definitions/mapDefinitions';

import MapGenerationSystem from '../systems/MapGenerationSystem';
import BattleSystem from '../systems/BattleSystem';

import PokemonManager from '../sprites/PokemonManager';
import Player from '../sprites/Player';

import PokeballButton from '../ui/PokeballButton';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(playState) {
    //this.playState = playState;
    this.playState = {
      currentMap: 'woods-1'
    };
  }

  create() {
    // Create the map
    this.createMap();

    // Background and Collision
    this.createBackgroundLayers();

    // Sprites
    this.pokemonManager = new PokemonManager(this, this.map);
    this.player = new Player(this, this.map, { x: 4, y: 4 }, true);

    // Now foreground
    this.createForegroundLayer();

    // The pokeball button
    this.pokeballButton = new PokeballButton(this);

    // Create the systems
    this.battleSystem = new BattleSystem(this, this.map, this.player, this.pokemonManager);

    // Camera
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    // Register the mouse listener
    this.input.on('pointerdown', pointer => this.battleSystem.pointerdown(pointer));
  }

  createMap() {
    const definition = mapDefinitions[this.playState.currentMap];
    if (definition.type === 'static') {
      this.map = this.make.tilemap({ key: this.playState.currentMap });
    }
    else {
      const { tileWidth, tileHeight } = properties;
      const { width, height } = definition.mapSizeTiles;
      this.map = this.make.tilemap({ tileWidth, tileHeight, width, height });
    }
    this.tileset = this.map.addTilesetImage('tileset-advanced', 'map-tiles');
    this.mapLayers = {};
  }

  createBackgroundLayers() {
    const definition = mapDefinitions[this.playState.currentMap];
    if (definition.type === 'static') {
      this.mapLayers.background = this.map.createStaticLayer('background', this.tileset);
      this.mapLayers.collision = this.map.createStaticLayer('collision', this.tileset);
    }
    else {
      this.mapLayers.background = this.map.createBlankDynamicLayer('background', this.tileset);
      this.mapLayers.collision = this.map.createBlankDynamicLayer('collision', this.tileset);

      MapGenerationSystem.populateBackground(definition, this.mapLayers.background);
      MapGenerationSystem.populateCollision(definition, this.mapLayers.collision);
    }

    this.mapLayers.background.depth = -2000;
    this.mapLayers.collision.depth = -1000;
  }

  createForegroundLayer() {
    const definition = mapDefinitions[this.playState.currentMap];
    if (definition.type === 'static') {
      this.mapLayers.foreground = this.map.createStaticLayer('foreground', this.tileset);
    }
    else {
      this.mapLayers.foreground = this.map.createBlankDynamicLayer('foreground', this.tileset);
    }

    this.mapLayers.foreground.depth = 0;
  }
}
