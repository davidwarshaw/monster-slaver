import Pokemon from '../sprites/Pokemon';

export default class PokemonManager {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    this.pokemon = [];
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 5 }, 'Bulbasaur'));

    this.currentPokemonIndex = 0;
  }

  getNext() {
    
  }

  someOnTile(x, y) {
    return this.pokemon.some(p => {
      const tile = this.map.worldToTileXY(p.x, p.y);
      console.log(tile);
      console.log(`${x}, ${y}`);
      return p.alive && tile.x === x && tile.y === y;
    });
  }
}
