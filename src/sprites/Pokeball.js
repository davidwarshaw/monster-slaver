export default class Pokeball extends Phaser.GameObjects.Sprite {
  constructor(scene, player) {
    super(scene, player.x, player.y, 'pokeball-small', 0);
    this.scene = scene;

    this.scene.add.existing(this);

    scene.anims.create({
      key: 'pokeball_main',
      frames: scene.anims.generateFrameNumbers('pokeball-small', { frames: [0] }),
      repeat: 0
    });
    scene.anims.create({
      key: 'pokeball_open',
      frames: scene.anims.generateFrameNumbers('pokeball-small', { frames: [1, 2, 3] }),
      repeat: 0
    });
  }

  //
  // throw(from, to) {
  //   this.setPosition(from);
  //   this.scene.add.tween(mySprite).to(
  //     { y: -200 },
  //     1000,
  //     t => {
  //       return -4 * t * t + 4 * t + 0;
  //     },
  //     true,
  //     0,
  //     2
  //   );
  //
  //   this.scene.add.tween(mySprite).to({ x: 250 }, 3000, Phaser.Easing.Linear.None, true, 0);
  // }
}
