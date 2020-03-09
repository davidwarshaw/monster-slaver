import properties from '../properties';
import TileMath from '../utils/TileMath';
import AStar from '../utils/AStar';

import InspectWindow from '../ui/InspectWindow';
import PokeballWindow from '../ui/PokeballWindow';
import RisingNumbers from '../ui/RisingNumbers';

import Pokeball from '../sprites/Pokeball';

import MeleeSystem from './MeleeSystem';

// Turn States
const CHOOSE_ACTION = 'CHOOSE_ACTION';
const TAKING_TURNS = 'TAKING_TURNS';
const INSPECT = 'INSPECT';
const INSPECT_WAIT = 'INSPECT_WAIT';
const POKEBALL_CHOOSE = 'POKEBALL_CHOOSE';
const POKEBALL_CHOOSE_WAIT = 'POKEBALL_CHOOSE_WAIT';
const POKEBALL_THROW = 'POKEBALL_THROW';
const POKEBALL_THROW_WAIT = 'POKEBALL_THROW_WAIT';

// Turn Types
const ATTACK = 'ATTACK';
const MOVE = 'MOVE';
const WAIT = 'WAIT';

export default class BattleSystem {
  constructor(scene, map, player, pokemonManager, doors) {
    this.scene = scene;
    this.map = map;
    this.collisionMap = TileMath.collisionMapFromTileMap(map);
    this.player = player;
    this.pokemonManager = pokemonManager;
    this.doors = doors;

    this.dialogTiles = [];

    this.turnState = CHOOSE_ACTION;
    this.turnQueue = [];

    this.meleeSystem = new MeleeSystem();

    this.astar = new AStar(this.collisionMap, this.player, this.pokemonManager);
  }

  playerPathTo(toTile) {
    const playerTile = this.map.worldToTileXY(this.player.x, this.player.y);
    console.log(`playerTile: ${playerTile.x}, ${playerTile.y}`);
    const astar = new AStar(this.collisionMap, this.player, this.pokemonManager);
    const path = astar.findPath(playerTile, toTile);
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
    console.log(`turnState: ${this.turnState}`);
    switch (this.turnState) {

      // case TAKING_TURNS: {
      //   // Clicking cancels the player moving
      //   this.turnQueue = [];
      //   this.changeTurnState(CHOOSE_ACTION);
      //   break;
      // }
      case POKEBALL_THROW: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const toTile = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        const world = this.map.tileToWorldXY(toTile.x, toTile.y);

        // Throwing at the player cancels the throw
        if (this.player.isOnTile(toTile)) {
          // Hide the preview when we cancel the throw
          this.scene.pokeballButton.hidePreview();
          this.changeTurnState(CHOOSE_ACTION);
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

        // Hide the preview when we throw the ball
        this.scene.pokeballButton.hidePreview();

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

            console.log('pokemonManager.startTurn:');
            this.changeTurnState(TAKING_TURNS);
            this.pokemonManager.startTurn();
            this.tryToTakePokemonTurn();
          },
          onCompleteScope: this
        });

        this.changeTurnState(POKEBALL_THROW_WAIT);
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
          this.changeTurnState(POKEBALL_CHOOSE_WAIT);

          this.scene.pokeballButton.showPreview(this.selectedPokemon);

          // After the hang delay, close the window and throw
          this.scene.time.delayedCall(properties.uiHangMillis, () => {
            this.pokeballWindow.destroy();
            this.changeTurnState(POKEBALL_THROW);
          });
        }

        // otherwise, go back to the main screen
        else {
          this.pokeballWindow.destroy();
          this.changeTurnState(CHOOSE_ACTION);
        }
        break;
      }
      case INSPECT: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const pokemon = this.inspectWindow.selectButton(worldPoint);
        if (pokemon) {
          // After the hang delay, close the window and throw
          this.scene.time.delayedCall(properties.uiHangMillis, () => {
            this.inspectWindow.destroy();

            // Tween the pokemon disapearing
            this.scene.tweens.add({
              targets: pokemon,
              scale: 0.25,
              duration: properties.captureMillis
            });
            this.scene.tweens.add({
              targets: pokemon,
              rotation: Math.PI * 2,
              duration: properties.captureMillis,
              onComplete: () => {
                const pokeball = new Pokeball(this.scene, pokemon);
                pokeball.play('pokeball_open', false);
                pokeball.once('animationcomplete', () => {
                  pokemon.capture();
                  pokeball.destroy();

                  console.log('pokemonManager.startTurn:');
                  this.changeTurnState(TAKING_TURNS);
                  this.pokemonManager.startTurn();
                  this.tryToTakePokemonTurn();
                });
              },
              onCompleteScope: this
            });
          });
          this.changeTurnState(INSPECT_WAIT);
        }
        else {
          this.inspectWindow.destroy();
          this.changeTurnState(CHOOSE_ACTION);
        }
        break;
      }
      case CHOOSE_ACTION: {
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const toTile = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
        const world = this.map.tileToWorldXY(toTile.x, toTile.y);
        console.log(`pointer: ${pointer.x}, ${pointer.y}`);
        console.log(`toTile: ${toTile.x}, ${toTile.y}`);
        console.log(`world: ${world.x}, ${world.y}`);

        // Check button against screen point
        if (this.scene.pokeballButton.selectButton(pointer)) {
          console.log('Click on pokeball button');
          this.pokeballWindow = new PokeballWindow(this.scene, this.pokemonManager);
          this.changeTurnState(POKEBALL_CHOOSE);
          break;
        }

        if (this.player.isOnTile(toTile)) {
          console.log('Click on player');
          this.turnQueue = [{ character: this.player, type: WAIT }];
          this.changeTurnState(TAKING_TURNS);
          this.tryToTakePlayerTurn();
          break;
        }

        const pokemonTo = this.pokemonManager.getPokemonByTile(toTile);
        if (pokemonTo) {
          console.log('Click on pokemon');
          this.inspectWindow = new InspectWindow(this.scene, pokemonTo, this.pokemonManager);
          this.changeTurnState(INSPECT);
          break;
        }

        const collisionMapTile = this.collisionMap[TileMath.keyFromPoint(toTile)];
        console.log(`collisionMap: ${collisionMapTile}`);
        if (collisionMapTile) {
          console.log('Tile is not traversable');
          break;
        }

        console.log('Tile is traversable: filling turn queue with path');
        this.changeTurnState(TAKING_TURNS);
        this.fillTurnQueueWithPath(this.playerPathTo(toTile));
        this.tryToTakePlayerTurn();
        break;
      }
    }
  }

  tryToTakePlayerTurn() {
    // Left pop turn from the queue
    console.log('tryToTakePlayerTurn:');
    const turn = this.turnQueue.shift();
    if (!turn) {
      console.log('No more turns: CHOOSE_ACTION');
      this.changeTurnState(CHOOSE_ACTION);
      return;
    }
    console.log('Turn found: TAKING_TURNS');
    console.log(turn);
    switch (turn.type) {

      // Player cannot attack
      case MOVE: {
        const moveSucceeded = this.characterMove(this.player, turn.to, () => {
          console.log('pokemonManager.startTurn:');
          this.changeTurnState(TAKING_TURNS);
          this.pokemonManager.startTurn();
          this.tryToTakePokemonTurn();
        });

        // If a player move fails, kill the turn queue. Don't run the pokemon turns though
        if (!moveSucceeded) {
          this.turnQueue = [];
          this.changeTurnState(CHOOSE_ACTION);
        }
        break;
      }
      case WAIT: {
        console.log('pokemonManager.startTurn:');
        this.changeTurnState(TAKING_TURNS);
        this.pokemonManager.startTurn();
        this.tryToTakePokemonTurn();
        break;
      }
    }
  }

  tryToTakePokemonTurn() {
    console.log('tryToTakePokemonTurn:');
    const pokemon = this.pokemonManager.getNextInTurn();

    // If there are no more pokemon, the turn is over
    if (!pokemon) {
      this.tryToTakePlayerTurn();
      return;
    }

    // If the pokemon died, skip their turn
    if (!pokemon.alive) {
      this.tryToTakePokemonTurn();
      return;
    }

    const action = pokemon.chooseAction(this.map, this.player, this.pokemonManager, this.astar);
    switch (action.type) {
      case ATTACK: {
        this.characterAttack(pokemon, action.target, () => {
          this.tryToTakePokemonTurn();
        });
        break;
      }
      case MOVE: {
        const moveSucceeded = this.characterMove(pokemon, action.to, () => {
          this.tryToTakePokemonTurn();
        });

        // If the move failed, take another pokemon turn
        if (!moveSucceeded) {
          this.tryToTakePokemonTurn();
        }
        break;
      }
      case WAIT: {
        this.tryToTakePokemonTurn();
        break;
      }
    }
  }

  characterAttack(character, target, afterMove) {
    console.log(`character: ${character.name} target: ${target.name}`);

    // From is the characters current location, to is the targets
    const from = this.map.worldToTileXY(character.x, character.y);
    const to = this.map.worldToTileXY(target.x, target.y);

    // Play moving animation only if different from the one that's playing now
    const moveAnimationKey = TileMath.animationKeyFromMove(character, from, to);
    const currentAnimationKey = character.anims.getCurrentKey();
    if (moveAnimationKey !== currentAnimationKey) {
      character.anims.play(moveAnimationKey);
    }

    this.scene.tweens.add({
      targets: character,
      x: target.x,
      y: target.y,
      duration: properties.attackMillis,
      repeat: 0,
      yoyo: true,
      onComplete: () => {
        // Stop animation
        const stopFrame = character.anims.currentAnim.frames[0];
        character.anims.stopOnFrame(stopFrame);

        // If the target is the player, end the game
        if (target.name === 'player') {
          this.scene.gameOver();
          return;
        }

        const damage = this.meleeSystem.attack(character, target);
        this.pokemonManager.doDamage(target, damage);

        // Damage numbers on target
        new RisingNumbers(this.scene, target, -damage);

        const earnHealth = character.captured;
        if (earnHealth) {
          this.pokemonManager.healBall(damage);

          // Health numbers on pokeball
          new RisingNumbers(this.scene, this.scene.pokeballButton, damage, true);
        }

        afterMove();
      },
      onCompleteScope: this
    });
  }

  characterMove(character, to, afterMove) {
    console.log(`character: ${character.name} to: ${to.x}, ${to.y}`);

    // From is the characters current location
    const from = this.map.worldToTileXY(character.x, character.y);

    // If the character is the player and they're moving onto a door tile, start a new scene
    const fromKey = TileMath.keyFromPoint(from);
    const toKey = TileMath.keyFromPoint(to);

    // Only go to the next map if we're moving from a non-door to a door
    if (toKey in this.doors && !(fromKey in this.doors)) {
      const { map, to } = this.doors[toKey];
      this.scene.goToNewMap(map, to);
    }

    // If the to tile is occupied, don't move there
    const pokemonTo = this.pokemonManager.getPokemonByTile(to);
    if (pokemonTo) {
      console.log(`Move cancelled. Tile occupied: ${pokemonTo.name}`);
      return false;
    }
    if (this.player.isOnTile(to)) {
      console.log('Move cancelled. Tile occupied by player');
      return false;
    }

    // Play moving animation only if different from the one that's playing now
    const moveAnimationKey = TileMath.animationKeyFromMove(character, from, to);
    const currentAnimationKey = character.anims.getCurrentKey();

    // Play a new animation it's different than the previous one, or if nothing is playing
    if (moveAnimationKey !== currentAnimationKey || !character.anims.isPlaying) {
      character.anims.play(moveAnimationKey);
    }

    // Tween movement
    const toTileWorld = TileMath.addHalfTile(this.map.tileToWorldXY(to.x, to.y));
    this.scene.tweens.add({
      targets: character,
      x: toTileWorld.x,
      y: toTileWorld.y,
      duration: properties.turnDurationMillis,
      onComplete: () => {
        // Set the character draw order
        character.updateDepth();

        // Stop animation
        const stopFrame = character.anims.currentAnim.frames[0];
        character.anims.stopOnFrame(stopFrame);
        afterMove();
      },
      onCompleteScope: this
    });

    return true;
  }

  changeTurnState(newState) {
    console.log(`changing turn state from: ${this.turnState} to: ${newState}`);
    this.turnState = newState;
  }
}
