import properties from '../properties';
import TileMath from '../utils/TileMath';
import AStar from '../utils/AStar';

// Turn States
const CHOOSE_ACTION = 'CHOOSE_ACTION';
const TAKING_TURNS = 'TAKING_TURNS';

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
    console.log(path);
    return path;
  }

  pointerdown(pointer) {
    console.log('\nPointer Down:');
    switch (this.turnState) {
      case CHOOSE_ACTION: {
        const toTile = this.map.worldToTileXY(pointer.x, pointer.y);
        const world = this.map.tileToWorldXY(toTile.x, toTile.y);
        console.log(`pointer: ${pointer.x}, ${pointer.y}`);
        console.log(`toTile: ${toTile.x}, ${toTile.y}`);
        console.log(`world: ${world.x}, ${world.y}`);

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
