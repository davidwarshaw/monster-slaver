import properties from '../properties';
import pokemonDefinitions from '../definitions/pokemonDefinitions.json';

import Font from './Font';

export default class InspectWindow {
  constructor(scene, pokemon) {
    const definition = pokemonDefinitions[pokemon.name];
    const worldPoint = scene.cameras.main.getWorldPoint(
      properties.width / 2,
      properties.height / 2
    );
    const centerX = worldPoint.x;
    const centerY = worldPoint.y;

    this.pokemon = pokemon;

    this.capturable = pokemon.enslaved;

    this.images = [];

    this.images.push(scene.add.image(centerX, centerY, 'window-small'));

    this.font = new Font(scene);
    let centeredOffset = 8 * (pokemon.name.length / 2);
    this.images.push(this.font.render(centerX - centeredOffset, centerY - 40, pokemon.name));

    this.images.push(scene.add.image(centerX, centerY - 16, 'pokemon', definition.index * 2 + 1));

    centeredOffset = 8 * (pokemon.type.length / 2);
    this.images.push(this.font.render(centerX - centeredOffset, centerY, pokemon.type));

    const healthString = `${pokemon.health}/${pokemon.maxHealth}`;
    centeredOffset = 8 * (healthString.length / 2);
    this.images.push(this.font.render(centerX - centeredOffset, centerY + 16, healthString));

    if (this.capturable) {
      const label = pokemon.enslaved ? 'recall' : 'capture';
      this.images.push(this.font.render(centerX - 8 * 3 - 4, centerY + 32, label));
      this.images.push(scene.add.image(centerX, centerY + 32 + 4, 'select-frame'));
      this.images[this.images.length - 1].setVisible(false);
    }
  }

  selectButton(point) {
    if (!this.capturable) {
      return null;
    }

    const buttonHit = Phaser.Geom.Rectangle.Contains(
      this.images[this.images.length - 1].getBounds(),
      point.x,
      point.y
    );
    console.log(`buttonHit: ${buttonHit}`);
    if (!buttonHit) {
      return null;
    }

    // Set the select frame to be visible
    const selectFrame = this.images[this.images.length - 1];
    selectFrame.setVisible(true);

    return this.pokemon;
  }

  destroy() {
    console.log('InspectWindow: destroy');
    this.images.forEach(image => image.destroy());
  }
}
