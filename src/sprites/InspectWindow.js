import properties from '../properties';
import pokemonDefinitions from './pokemonDefinitions.json';

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
  }

  destroy() {
    console.log('InspectWindow: destroy');
    this.images.forEach(image => image.destroy());
  }
}
