import properties from '../properties';
import pokemonDefinitions from '../definitions/pokemonDefinitions.json';

import Font from './Font';

export default class InspectWindow {
  constructor(scene, pokemon, pokemonManager) {
    const definition = pokemonDefinitions[pokemon.name];
    const worldPoint = scene.cameras.main.getWorldPoint(
      properties.width / 2,
      properties.height / 2
    );
    const centerX = worldPoint.x;
    const centerY = worldPoint.y;

    this.font = new Font(scene);

    this.pokemon = pokemon;

    const identified = this.pokemon.name in pokemonManager.identified;

    this.capturable = (pokemon.health <= 10 || pokemon.captured) && pokemonManager.spaceInBall();

    this.images = [];

    this.images.push(scene.add.image(centerX, centerY, 'window-small'));

    let offsetCenterY = centerY - 48;
    this.images.push(
      this.font.render(centerX + this.offsetForText(pokemon.name), offsetCenterY, pokemon.name)
    );

    offsetCenterY += 22;
    const pokemonRowOffset = Math.trunc(definition.index / 15) * 120;
    const pokemonColOffset = (definition.index % 15) * 2;
    const pokemonSpriteIndex = pokemonRowOffset + pokemonColOffset + 1;
    this.images.push(scene.add.image(centerX, offsetCenterY, 'pokemon', pokemonSpriteIndex));

    offsetCenterY += 13;
    const type = identified ? pokemon.definition.type.toString() : '???';
    this.images.push(this.font.render(centerX + this.offsetForText(type), offsetCenterY, type));

    offsetCenterY += 13;
    const size = identified ? `size: ${pokemon.definition.size}` : 'size: ???';
    this.images.push(this.font.render(centerX + this.offsetForText(size), offsetCenterY, size));

    offsetCenterY += 13;
    const speed = identified ? `speed: ${pokemon.definition.speed}` : 'speed: ???';
    this.images.push(this.font.render(centerX + this.offsetForText(speed), offsetCenterY, speed));

    offsetCenterY += 13;
    const health = `hp: ${pokemon.health}/${pokemon.maxHealth}`;
    this.images.push(this.font.render(centerX + this.offsetForText(health), offsetCenterY, health));

    offsetCenterY += 13;
    if (this.capturable) {
      const label = pokemon.captured ? 'recall' : 'capture';
      this.images.push(this.font.render(centerX + this.offsetForText(label), offsetCenterY, label));
      this.images.push(scene.add.image(centerX, offsetCenterY + 4, 'select-frame'));
      this.images[this.images.length - 1].setVisible(false);
    }
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
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
  // console.log(`buttonHit: ${buttonHit}`);
    if (!buttonHit) {
      return null;
    }

    // Set the select frame to be visible
    const selectFrame = this.images[this.images.length - 1];
    selectFrame.setVisible(true);

    return this.pokemon;
  }

  destroy() {
  // console.log('InspectWindow: destroy');
    this.images.forEach(image => image.destroy());
  }
}
