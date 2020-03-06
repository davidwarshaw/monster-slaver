import properties from '../properties';
import TileMath from '../utils/TileMath';

export default class Npc extends Phaser.GameObjects.Sprite {
  constructor(scene, map, tile, male) {
    const spritesheetIndex = male ? 0 : 2;

    super(scene, 0, 0, 'player', spritesheetIndex);
    this.map = map;

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);
    this.updateDepth();

    // Origin is more towards the bottom of the sprite
    this.setOrigin(0.5, 0.6);

    const name = 'player';
    this.name = name;
    scene.add.existing(this);

        this.anims.play(`${name}_down`, true);
        const stopFrame = this.anims.currentAnim.frames[0];
        this.anims.stopOnFrame(stopFrame);
      }

      frameFromRowCol(index, row, col) {
        return index + col + row * 4;
      }

      updateDepth() {
        this.depth = this.y - 500;
      }

      isOnTile(tile) {
        const pTile = this.map.worldToTileXY(this.x, this.y);
        return pTile.x === tile.x && pTile.y === tile.y;
      }
