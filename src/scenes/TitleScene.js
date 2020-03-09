import properties from '../properties';

import Font from '../ui/Font';

import PokemonManager from '../sprites/PokemonManager';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const numberOfStartingPokemon = 2;
    this.playState = {
      currentMap: 'map-start',
      mapStartingTile: {
        x: 10,
        y: 9
      },
      pokemon: {
        identified: {},
        captured: PokemonManager.chooseStartingPokemon(numberOfStartingPokemon)
      }
    };

    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    let offsetY = 40;

    offsetY += -32;
    let text = 'Monster Garden';
    let offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    // offsetY += 32;
    // this.images.push(this.add.image(centerX, centerY + offsetY, 'uwumbstone'));
    //
    // const numberCaptured = this.playState.pokemon.captured.length;
    offsetY += 32;
    text = 'Click to Play';
    offsetX = this.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    // Register the mouse listener
    this.input.on('pointerdown', () => this.pointerdown());
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  pointerdown() {
    this.scene.start('GameScene', this.playState);
  }
}
