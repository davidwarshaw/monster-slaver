import properties from '../properties';
import TileMath from '../utils/TileMath';

export default class Pokemon extends Phaser.GameObjects.Sprite {
  constructor(scene, tile, male) {
    const spritesheetIndex = male ? 0 : 2;

    super(scene, 0, 0, 'player', spritesheetIndex);

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.name = name;
    scene.add.existing(this);

    scene.anims.create({
      key: `${name}_down`,
      frames: scene.anims.generateFrameNumbers('player', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 0),
          this.frameFromRowCol(spritesheetIndex, 1, 0),
          this.frameFromRowCol(spritesheetIndex, 2, 0),
          this.frameFromRowCol(spritesheetIndex, 3, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_up`,
      frames: scene.anims.generateFrameNumbers('player', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 4, 0),
          this.frameFromRowCol(spritesheetIndex, 5, 0),
          this.frameFromRowCol(spritesheetIndex, 6, 0),
          this.frameFromRowCol(spritesheetIndex, 7, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_left`,
      frames: scene.anims.generateFrameNumbers('player', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 1),
          this.frameFromRowCol(spritesheetIndex, 1, 1),
          this.frameFromRowCol(spritesheetIndex, 2, 1),
          this.frameFromRowCol(spritesheetIndex, 3, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_right`,
      frames: scene.anims.generateFrameNumbers('player', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 4, 1),
          this.frameFromRowCol(spritesheetIndex, 5, 1),
          this.frameFromRowCol(spritesheetIndex, 6, 1),
          this.frameFromRowCol(spritesheetIndex, 7, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });

    this.anims.play(`${name}_up`, true);
  }

  frameFromRowCol(index, row, col) {
    return index + col + row * 4;
  }

  moveTo(path) {
    this.path = path;
    this.pathIndex = 0;
    this.isMoving = true;
  }

  hasPath() {
    return this.path && this.pathIndex + 1 < this.path.length;
  }

  update(delta) {}
}
