import Pokemon from '../sprites/Pokemon';

export default class PokemonManager {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    this.pokemon = [];
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 5 }, 'Bulbasaur'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 6 }, 'Bulbasaur'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 7 }, 'Ivysaur'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 8 }, 'Venusaur'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 9 }, 'Charmander'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 10 }, 'Charmeleon'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 11 }, 'Charizard'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 12 }, 'Squirtle'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 13 }, 'Wartortle'));
    this.pokemon.push(new Pokemon(this.scene, { x: 5, y: 14 }, 'Blastoise'));
    this.pokemon.push(new Pokemon(this.scene, { x: 6, y: 13 }, 'Bulbasaur'));
    this.pokemon.push(new Pokemon(this.scene, { x: 6, y: 14 }, 'Bulbasaur'));

    this.pokemon.slice(1).forEach(p => p.enslave());

    this.currentPokemonIndex = 0;
  }

  getNext() {}

  getPokemonInBall() {
    return this.pokemon.filter(p => p.alive && p.inBall);
  }

  getPokemonByTile(tile) {
    const candidates = this.pokemon.filter(p => {
      const pTile = this.map.worldToTileXY(p.x, p.y);
      return p.alive && !p.inBall && pTile.x === tile.x && pTile.y === tile.y;
    });
    if (candidates.length === 0) {
      return null;
    }
    return candidates[0];
  }

  someOnTile(tile) {
    return this.getPokemonByTile(tile) != null;
  }
}
