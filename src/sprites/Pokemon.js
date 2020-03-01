import properties from '../properties';
import TileMath from '../utils/TileMath';
import pokemonDefinitions from './pokemonDefinitions.json';

export default class Pokemon extends Phaser.GameObjects.Sprite {
  constructor(scene, tile, name) {
    const spritesheetIndex = pokemonDefinitions[name].index * 2;

    super(scene, 100, 100, 'pokemon', spritesheetIndex);

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.name = name;
    this.alive = true;
    this.enslaved = false;
    this.inBall = false;
    this.definition = pokemonDefinitions[name];
    this.type = 'grass';
    this.maxHealth = 100;
    this.health = 100;

    scene.add.existing(this);

    scene.anims.create({
      key: `${name}_up`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 0),
          this.frameFromRowCol(spritesheetIndex, 1, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_down`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 2, 0),
          this.frameFromRowCol(spritesheetIndex, 3, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_left`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 1),
          this.frameFromRowCol(spritesheetIndex, 1, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_right`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 2, 1),
          this.frameFromRowCol(spritesheetIndex, 3, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });

    this.anims.play(`${name}_down`, true);
    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);
  }

  frameFromRowCol(index, row, col) {
    return index + col + row * 30;
  }

  enslave() {
    this.enslaved = true;
    this.inBall = true;
    this.setActive(false);
    this.setVisible(false);
  }

  iChooseYou(tile) {
    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.inBall = false;
    this.setActive(true);
    this.setVisible(true);
  }
}
