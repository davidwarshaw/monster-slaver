import properties from '../properties';

import Font from '../ui/Font';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
  // console.log(this.playState);
    this.font = new Font(this);

    this.images = [];

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;
    let offsetY = -32;
    let text = 'You caught them all!';
    let offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    offsetY += 32;
    const pokemonIndex = 25;
    const pokemonRowOffset = Math.trunc(pokemonIndex / 15) * 120;
    const pokemonColOffset = (pokemonIndex % 15) * 2;
    const pokemonSpriteIndex = pokemonRowOffset + pokemonColOffset + 60;
    this.images.push(this.add.image(centerX, centerY + offsetY, 'pokemon', pokemonSpriteIndex));

    const numberCaptured = this.playState.pokemon.captured.length;
    offsetY += 32;
    text = `Captured ${numberCaptured} of 16 monsters`;
    offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

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
