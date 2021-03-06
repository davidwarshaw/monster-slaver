import properties from '../properties';
import pokemonDefinitions from '../definitions/pokemonDefinitions.json';

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

  showPreview(pokemon) {
    const definition = pokemonDefinitions[pokemon.name];
    const pokemonRowOffset = Math.trunc(definition.index / 15) * 120;
    const pokemonColOffset = (definition.index % 15) * 2;
    const pokemonSpriteIndex = pokemonRowOffset + pokemonColOffset + 1;
    this.pokemonPreview = this.scene.add.image(
      30 + 8,
      properties.height - 30 - 8,
      'pokemon',
      pokemonSpriteIndex
    );
  }

  hidePreview() {
    this.pokemonPreview.destroy();
  }
}
