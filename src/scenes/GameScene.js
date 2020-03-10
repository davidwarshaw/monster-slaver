import properties from '../properties';
import mapDefinitions from '../definitions/mapDefinitions';

import TileMath from '../utils/TileMath';

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
    this.playState = playState;
  }

  create() {
    // Create the doors
    this.createDoors();

    // Create the map
    this.createMap();

    // Background and Collision
    this.createBackgroundLayers();

    const { identified, captured } = this.playState.pokemon;
    this.pokemonManager = new PokemonManager(this, this.map, identified, captured);

    // If we've captured all pokemon, we win the game
    if (this.pokemonManager.allCaptured()) {
      this.win();
    }

    const { x, y } = this.playState.mapStartingTile;
    this.player = new Player(this, this.map, { x, y }, true);

    // Now foreground
    this.createForegroundLayer();

    // The pokeball button
    this.pokeballButton = new PokeballButton(this);

    // Create the systems
    this.battleSystem = new BattleSystem(
      this,
      this.map,
      this.player,
      this.pokemonManager,
      this.doors
    );

    this.createPokemon();

    // Camera
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    // Register the mouse listener
    this.input.on('pointerdown', pointer => this.battleSystem.pointerdown(pointer));
  }

  createDoors() {
    const definition = mapDefinitions[this.playState.currentMap];
    this.doors = {};
    definition.doors.forEach(door => {
      const doorkey = TileMath.keyFromPoint(door.from);
      this.doors[doorkey] = door;
    });
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
    const { doors } = definition;
    if (definition.type === 'static') {
      this.mapLayers.background = this.map.createStaticLayer('background', this.tileset);
      this.mapLayers.collision = this.map.createStaticLayer('collision', this.tileset);
    }
    else {
      this.mapLayers.background = this.map.createBlankDynamicLayer('background', this.tileset);
      this.mapLayers.collision = this.map.createBlankDynamicLayer('collision', this.tileset);

      MapGenerationSystem.populateBackground(definition, this.mapLayers.background, doors);
      MapGenerationSystem.populateCollision(definition, this.mapLayers.collision, doors);
    }

    this.mapLayers.background.depth = -5000;
    this.mapLayers.collision.depth = -4000;
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

  createPokemon() {
    const { pokemonFrequency } = mapDefinitions[this.playState.currentMap];
    const candidates = Object.entries(this.battleSystem.collisionMap)

      // Only spawn on traversable tiles
      .filter(e => !e[1])

      // Don't spawn near doors
      .filter(e => {
        const candidatePoint = TileMath.pointFromKey(e[0]);
        const someCloseDoors = Object.keys(this.doors).some(doorKey => {
          const doorPoint = TileMath.pointFromKey(doorKey);
          return TileMath.distance(candidatePoint, doorPoint) <= 8;
        });
        return !someCloseDoors;
      })

      // Decompose to x and y coords and sort randomly
      .map(e => {
        const { x, y } = TileMath.pointFromKey(e[0]);
        return { x, y, randomOrder: properties.rng.getUniform() };
      })
      .sort((l, r) => l.randomOrder - r.randomOrder);

    console.log(`candidates.length: ${candidates.length} pokemonFrequency: ${pokemonFrequency}`);
    const numberToCreate = candidates.length * pokemonFrequency;
    const tiles = candidates.slice(0, numberToCreate);

    this.pokemonManager.populatePokemon(tiles);
  }

  goToNewMap(nextMap, nextStartingTile) {
    // New map data
    this.playState.currentMap = nextMap;
    this.playState.mapStartingTile = nextStartingTile;

    // Pokemon data
    this.playState.pokemon.identified = this.pokemonManager.identified;
    this.playState.pokemon.captured = this.pokemonManager.getCapturedState();

    this.scene.start('GameScene', this.playState);
  }

  gameOver() {
    // Pokemon data
    this.playState.pokemon.identified = this.pokemonManager.identified;
    this.playState.pokemon.captured = this.pokemonManager.getCapturedState();

    this.scene.start('GameOverScene', this.playState);
  }

  win() {
    // Pokemon data
    this.playState.pokemon.identified = this.pokemonManager.identified;
    this.playState.pokemon.captured = this.pokemonManager.getCapturedState();

    this.scene.start('WinScene', this.playState);
  }
}
