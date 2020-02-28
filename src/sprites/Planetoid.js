export default class Planetoid extends Phaser.Physics.Arcade.Image {
  constructor(scene) {
    super(scene, 800, 800, 'planetoid');
    scene.add.existing(this);
    scene.physics.world.enableBody(this, Phaser.Physics.Arcade.STATIC_BODY);

    this.setOrigin(0.5, 0.5);
    this.setScale(4);

    this.body.setCircle(this.width / 2);

    this.gravityRadius = 1000;
    this.gravityAcceleration = 50;

    this.refreshBody();

    this.radius = this.body.halfWidth;
    console.log(`planetoid: this.rotation: ${this.rotation}`);
  }
}
