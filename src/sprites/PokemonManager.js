import properties from '../properties';
import pokemonDefinitions from '../definitions/pokemonDefinitions.json';

import Pokemon from '../sprites/Pokemon';

export default class PokemonManager {
  constructor(scene, map, identified, captured) {
    this.scene = scene;
    this.map = map;
    this.identified = identified;

    this.pokemon = captured.map(
      captured => new Pokemon(scene, { x: 0, y: 0 }, captured.name, captured.health)
    );
    this.pokemon.forEach(p => p.capture());

    this.turnList = [];
  }

  startTurn() {
    this.turnList = this.pokemon
      .filter(p => p.alive && !p.inBall)
      .sort((l, r) => r.definition.speed - l.definition.speed);
  }

  getNextInTurn() {
    return this.turnList.shift();
  }

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

  capture(pokemon) {
    this.identified[pokemon.name] = true;
    pokemon.capture();
  }

  doDamage(pokemon, damage) {
    pokemon.doDamage(damage);
  }

  healBall(health) {
    this.getPokemonInBall().forEach(p => p.heal(health));
  }

  spaceInBall() {
    return this.getPokemonInBall().length < 16;
  }

  allCaptured() {
    const names = {};
    this.getPokemonInBall().forEach(p => {
      names[p.name] = true;
    });
    return Object.keys(names).length === 16;
  }

  getCapturedState() {
    return this.getPokemonInBall().map(p => {
      const { name, health } = p;
      return { name, health };
    });
  }

  populatePokemon(tiles) {
    const spawns = PokemonManager.chooseStartingPokemon(tiles.length);
    tiles.forEach((tile, i) => {
      const spawn = spawns[i];
      this.pokemon.push(new Pokemon(this.scene, tile, spawn.name));
    });
  }

  static getPokemonBaseFrequency() {
    const baseFrequency = {};
    Object.entries(pokemonDefinitions)
      .map(definition => {
        const name = definition[0];
        const { index, size, speed } = definition[1];
        return { name, index, size, speed, randomOrder: properties.rng.getUniform() };
      })
      .sort((l, r) => l.randomOrder - r.randomOrder)
      .slice(0, 16)
      .forEach(definition => {
        const { name, size, speed } = definition;
        baseFrequency[name] = 7 - size + speed;
      });

    return baseFrequency;
  }

  static chooseStartingPokemon(number) {
    const baseFrequency = this.getPokemonBaseFrequency();
    const starting = [...Array(number).keys()].map(() => {
      const name = properties.rng.getWeightedValue(baseFrequency);
      const health = pokemonDefinitions[name].maxHealth;
      return { name, health };
    });
    return starting;
  }
}
