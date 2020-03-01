import properties from '../properties';
import pokemonDefinitions from './pokemonDefinitions.json';

import Font from './Font';

export default class PokeballWindow {
  constructor(scene, pokemonManager) {
    this.pokemonManager = pokemonManager;

    const worldPoint = scene.cameras.main.getWorldPoint(
      properties.width / 2,
      properties.height / 2
    );
    const centerX = worldPoint.x;
    const centerY = worldPoint.y;

    this.targetRects = [];

    this.images = [];
    this.images.push(scene.add.image(centerX, centerY, 'window-big'));

    this.font = new Font(scene);

    const columnWidth = 88;
    const rowHeight = 16;
    const offsetX = -this.images[0].width / 2 + 16;
    const offsetY = -this.images[0].height / 2 + 16;
    const ballPokemon = this.pokemonManager.getPokemonInBall();
    ballPokemon.forEach((pokemon, i) => {
      const row = i % 8;
      const column = Math.floor(i / 8);

      //console.log(`row: ${row} column: ${column}`);

      const entryX = centerX + offsetX + column * columnWidth;
      const entryY = centerY + offsetY + row * rowHeight;
      const definition = pokemonDefinitions[pokemon.name];

      this.images.push(scene.add.image(entryX, entryY, 'pokemon', definition.index * 2 + 1));

      const healthString = `${pokemon.health}/${pokemon.maxHealth}`;
      this.images.push(this.font.render(entryX + 16, entryY - 4, healthString));

      const rectX = centerX + offsetX + column * columnWidth + columnWidth / 2 - 12;
      const rectY = centerY + offsetY + row * rowHeight;

      const rect = scene.add.rectangle(rectX, rectY, columnWidth, rowHeight, 0xff0000);
      rect.setVisible(false);
      const rectPokemon = ballPokemon[i];
      this.targetRects.push({ rect, rectPokemon });
    });

    // Add the select frame last and set it to be invisible
    this.images.push(scene.add.image(this.targetRects.x, this.targetRects.y, 'select-frame'));
    this.images[this.images.length - 1].setVisible(false);
  }

  selectPokemon(point) {
    console.log('selectPokemon:');
    console.log(`point: ${point.x}, ${point.y}`);
    const rects = this.targetRects.filter(targetRect => {
      return Phaser.Geom.Rectangle.Contains(targetRect.rect.getBounds(), point.x, point.y);
    });
    if (rects.length === 0) {
      return null;
    }

    // Set the select frame to be visible
    const selectFrame = this.images[this.images.length - 1];

    // This needs to be offset a little
    selectFrame.setPosition(rects[0].rect.x, rects[0].rect.y);
    selectFrame.setVisible(true);

    return rects[0].rectPokemon;
  }

  destroy() {
    console.log('PokeballWindow: destroy');
    this.targetRects.forEach(rect => rect.rect.destroy());
    this.images.forEach(image => image.destroy());
  }
}
