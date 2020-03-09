import properties from '../properties';

import Font from '../ui/Font';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;
    let offsetY = -32;
    let text = 'Intro';
    let offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    // offsetY += 32;
    // this.images.push(this.add.image(centerX, centerY + offsetY, 'uwumbstone'));
    //
    // const numberCaptured = this.playState.pokemon.captured.length;
    // offsetY += 32;
    // text = `Captured ${numberCaptured} of 16 monsters`;
    // offsetX = this.offsetForText(text);
    // this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    // Register the mouse listener
    this.input.on('pointerdown', () => this.pointerdown());
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  pointerdown() {
    this.scene.start('TitleScene');
  }
}
