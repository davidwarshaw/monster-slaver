import properties from '../properties';

export default class PokeballButton extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 30, properties.height - 30, 'pokeball-big');
    this.scene = scene;

    this.scene.add.existing(this);
    this.setScrollFactor(0);
  }

  selectButton(point) {
    return Phaser.Geom.Rectangle.Contains(this.getBounds(), point.x, point.y);
  }
}
