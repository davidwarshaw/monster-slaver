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
}
