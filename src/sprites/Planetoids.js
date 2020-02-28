export default class Planetoids {
  constructor(scene) {
    this.group = scene.physics.add.staticGroup();
    [...Array(3).keys()].forEach(i => {
      const x = 800 + i * 200;
      this.group
        .create(x, 800, 'ground')
        .setScale(i)
        .refreshBody();
    });
  }
}
