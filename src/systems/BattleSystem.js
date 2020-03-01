import properties from '../properties';
import TileMath from '../utils/TileMath';
import AStar from '../utils/AStar';

import InspectWindow from '../ui/InspectWindow';
import PokeballWindow from '../ui/PokeballWindow';

import Pokeball from '../sprites/Pokeball';

// Turn States
const CHOOSE_ACTION = 'CHOOSE_ACTION';
const TAKING_TURNS = 'TAKING_TURNS';
const INSPECT = 'INSPECT';
const POKEBALL_CHOOSE = 'POKEBALL_CHOOSE';
const POKEBALL_CHOOSE_WAIT = 'POKEBALL_CHOOSE_WAIT';
const POKEBALL_THROW = 'POKEBALL_THROW';
const POKEBALL_THROW_WAIT = 'POKEBALL_THROW_WAIT';

// Turn Types
const MOVE = 'MOVE';
const ATTACK = 'ATTACK';

export default class BattleSystem {
  constructor(scene, map, player, pokemonManager) {
    this.scene = scene;
    this.map = map;
    this.collisionMap = TileMath.collisionMapFromTileMap(map);
    this.player = player;
    this.pokemonManager = pokemonManager;

    this.turnState = CHOOSE_ACTION;
    this.turnQueue = [];
  }

  playerPathTo(toTile) {
    const playerTile = this.map.worldToTileXY(this.player.x, this.player.y);
    console.log(`playerTile: ${playerTile.x}, ${playerTile.y}`);
    const astar = new AStar(this.collisionMap, this.player, this.pokemonManager);
    const path = astar.findPath(playerTile, toTile);

    //console.log(path);
    return path;
  }

  fillTurnQueueWithPath(path) {
    // Skip the first tile
    this.turnQueue = path.slice(1).map((tile, i) => {
      const turn = {
        character: this.player,
        type: MOVE,
        from: path[i], // NOTE: This is the previous tile, because we sliced the array
        to: tile // The current tile
      };
      return turn;
    });

    console.log('turnQueue:');
    console.log(this.turnQueue);
  }

  pointerdown(pointer) {
    console.log('\nPointer Down:');
    switch (this.turnState) {
      case POKEBALL_THROW: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const toTile = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        const world = this.map.tileToWorldXY(toTile.x, toTile.y);

        // Throwing at the player cancels the throw
        if (this.player.isOnTile(toTile)) {
          this.turnState = CHOOSE_ACTION;
          break;
        }

        // Can't throw at another pokemon
        const pokemonTo = this.pokemonManager.getPokemonByTile(toTile);
        if (pokemonTo) {
          break;
        }

        // Can't throw on untraverable terrain
        const collisionMapTile = this.collisionMap[TileMath.keyFromPoint(toTile)];
        if (collisionMapTile) {
          break;
        }

        // Tween the pokeball throw
        const pokeball = new Pokeball(this.scene, this.player);
        this.scene.tweens.add({
          targets: pokeball,
          scale: 5,
          duration: properties.throwMillis / 2,
          yoyo: true
        });
        this.scene.tweens.add({
          targets: pokeball,
          rotation: Math.PI * 2,
          duration: properties.throwMillis
        });
        this.scene.tweens.add({
          targets: pokeball,
          y: world.y + 8,
          duration: properties.throwMillis
        });
        this.scene.tweens.add({
          targets: pokeball,
          x: world.x + 8,
          duration: properties.throwMillis,
          onComplete: () => {
            pokeball.play('pokeball_open', false);
            pokeball.once('animationcomplete', () => {
              pokeball.destroy();
            });
            this.selectedPokemon.iChooseYou(toTile);
            this.turnState = CHOOSE_ACTION;
          },
          onCompleteScope: this
        });

        this.turnState = POKEBALL_THROW_WAIT;
        break;
      }
      case POKEBALL_CHOOSE: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const selectedPokemon = this.pokeballWindow.selectPokemon(worldPoint);

        // If we selected a pokemon, throw it
        if (selectedPokemon) {
          console.log('selectedPokemon:');
          console.log(selectedPokemon);
          this.selectedPokemon = selectedPokemon;
          this.turnState = POKEBALL_CHOOSE_WAIT;

          // After the hang delay, close the window and throw
          this.scene.time.delayedCall(properties.uiHangMillis, () => {
            this.pokeballWindow.destroy();
            this.turnState = POKEBALL_THROW;
          });
        }

        // otherwise, go back to the main screen
        else {
          this.pokeballWindow.destroy();
          this.turnState = CHOOSE_ACTION;
        }
        break;
      }
      case INSPECT: {
        this.inspectWindow.destroy();
        this.turnState = CHOOSE_ACTION;
        break;
      }
      case CHOOSE_ACTION: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const toTile = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        const world = this.map.tileToWorldXY(toTile.x, toTile.y);
        console.log(`pointer: ${pointer.x}, ${pointer.y}`);
        console.log(`toTile: ${toTile.x}, ${toTile.y}`);
        console.log(`world: ${world.x}, ${world.y}`);

        if (this.player.isOnTile(toTile)) {
          console.log('Click on player');
          this.pokeballWindow = new PokeballWindow(this.scene, this.pokemonManager);
          this.turnState = POKEBALL_CHOOSE;
          break;
        }

        const pokemonTo = this.pokemonManager.getPokemonByTile(toTile);
        if (pokemonTo) {
          console.log('Click on pokemon');
          this.inspectWindow = new InspectWindow(this.scene, pokemonTo);
          this.turnState = INSPECT;
          break;
        }

        const collisionMapTile = this.collisionMap[TileMath.keyFromPoint(toTile)];
        console.log(`collisionMap: ${collisionMapTile}`);
        if (collisionMapTile) {
          console.log('Tile is not traversable');
          break;
        }

        console.log('Tile is traversable: filling turn queue with path');
        this.fillTurnQueueWithPath(this.playerPathTo(toTile));
        this.tryToTakeTurn();
        break;
      }
    }
  }

  tryToTakeTurn() {
    // Left pop turn from the queue
    console.log('tryToTakeTurn:');
    const turn = this.turnQueue.shift();
    if (!turn) {
      console.log('No more turns: CHOOSE_ACTION');
      this.turnState = CHOOSE_ACTION;
      return;
    }
    console.log('Turn found: TAKING_TURNS');
    this.turnState = TAKING_TURNS;
    console.log(turn);
    switch (turn.type) {
      case MOVE: {
        // Play moving animation only if different from the one that's playing now
        const moveAnimationKey = TileMath.animationKeyFromMove(turn.character, turn.from, turn.to);
        const currentAnimationKey = turn.character.anims.getCurrentKey();
        if (moveAnimationKey !== currentAnimationKey) {
          turn.character.anims.play(moveAnimationKey);
        }

        // Tween movement
        const toTileWorld = TileMath.addHalfTile(this.map.tileToWorldXY(turn.to.x, turn.to.y));
        this.scene.tweens.add({
          targets: turn.character,
          x: toTileWorld.x,
          y: toTileWorld.y,
          duration: properties.turnDurationMillis,
          onComplete: () => {
            // Stop animation
            const stopFrame = turn.character.anims.currentAnim.frames[0];
            turn.character.anims.stopOnFrame(stopFrame);

            // Try to take another turn
            this.tryToTakeTurn();
          },
          onCompleteScope: this
        });
        break;
      }
      case ATTACK: {
        // TODO
        break;
      }
    }
  }
}
