import properties from '../properties';
import TileMath from '../utils/TileMath';
import AStar from '../utils/AStar';

export default class BattleSystem {
  constructor(scene, map, player, enemies) {
    this.scene = scene;
    this.map = map;
    this.collisionMap = TileMath.collisionMapFromTileMap(map);
    this.player = player;
    this.enemies = enemies;

    this.turnState = 'CHOOSE_ACTION';
  }

  playerPathTo(toTile) {
    const playerTile = this.map.worldToTileXY(this.player.x, this.player.y);
    console.log(`playerTile: ${playerTile.x}, ${playerTile.y}`);
    const astar = new AStar(this.collisionMap, this.player);
    const path = astar.findPath(playerTile, toTile);
    console.log(path);
    return path;
  }

  pointerdown(pointer) {
    console.log('\nPointer Down:');
    switch (this.turnState) {
      case 'CHOOSE_ACTION': {
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

        console.log('Tile is traversable: pathing player');
        this.player.moveTo(this.playerPathTo(toTile));
        this.turnState = 'PLAYER_INPUT';
        break;
      }
    }
  }

  takeTurn() {
    if (this.player.hasPath()) {
      this.player.pathIndex++;
      const nextTile = this.player.path[this.player.pathIndex];
      const nextTileWorld = TileMath.addHalfTile(this.map.tileToWorldXY(nextTile.x, nextTile.y));
      this.scene.tweens.add({
        targets: this.player,
        x: nextTileWorld.x,
        y: nextTileWorld.y,
        duration: properties.turnDurationMillis
      });
    }
    else {
      // End turn taking
      this.turnTimer.remove();
      this.turnState = 'CHOOSE_ACTION';
    }
  }

  update() {
    switch (this.turnState) {
      case 'PLAYER_INPUT': {
        console.log(this.scene);
        this.turnTimer = this.scene.time.addEvent({
          delay: properties.turnDelayMillis,
          loop: true,
          callback: this.takeTurn,
          callbackScope: this
        });
      }
    }
  }
}
