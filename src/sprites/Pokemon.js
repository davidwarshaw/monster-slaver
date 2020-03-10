import properties from '../properties';
import pokemonDefinitions from '../definitions/pokemonDefinitions.json';

import TileMath from '../utils/TileMath';

// Turn Types
const ATTACK = 'ATTACK';
const MOVE = 'MOVE';
const WAIT = 'WAIT';

// AI
const IGNORE_DISTANCE = 8;

export default class Pokemon extends Phaser.GameObjects.Sprite {
  constructor(scene, tile, name, health) {
    const spritesheetIndex = pokemonDefinitions[name].index * 2;

    super(scene, 100, 100, 'pokemon', spritesheetIndex);

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);
    this.updateDepth();

    this.name = name;
    this.alive = true;
    this.captured = false;
    this.inBall = false;
    this.definition = pokemonDefinitions[name];

    this.maxHealth = Phaser.Math.RoundTo(
      40 + this.definition.size * 20 * properties.rng.getUniform(),
      1
    );
    this.health = health || this.maxHealth;

    scene.add.existing(this);

    scene.anims.create({
      key: `${name}_up`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 0),
          this.frameFromRowCol(spritesheetIndex, 1, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_down`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 2, 0),
          this.frameFromRowCol(spritesheetIndex, 3, 0)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_left`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 0, 1),
          this.frameFromRowCol(spritesheetIndex, 1, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_right`,
      frames: scene.anims.generateFrameNumbers('pokemon', {
        frames: [
          this.frameFromRowCol(spritesheetIndex, 2, 1),
          this.frameFromRowCol(spritesheetIndex, 3, 1)
        ]
      }),
      frameRate: properties.animFrameRate,
      repeat: -1
    });
    scene.anims.create({
      key: `${name}_dead`,
      frames: scene.anims.generateFrameNumbers('uwumbstone', { frames: [0] })
    });

    this.anims.play(`${name}_down`, true);
    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);
  }

  frameFromRowCol(index, row, col) {
    const pokemonIndex = index / 2;
    const pokemonRowOffset = Math.trunc(pokemonIndex / 15) * 120;
    const pokemonColOffset = (pokemonIndex % 15) * 2;
    const frameRowOffset = row * 30;
    const frameColOffset = col;
    const frame = pokemonRowOffset + pokemonColOffset + frameRowOffset + frameColOffset;

    // console.log(`name: ${this.name} index: ${index}`);
    // console.log(`pokemonRowOffset: ${pokemonRowOffset} pokemonColOffset: ${pokemonColOffset}`);
    // console.log(`frameRowOffset: ${frameRowOffset} frameColOffset: ${frameColOffset}`);
    return frame;
  }

  updateDepth() {
    this.depth = this.y - 1000;
  }

  doDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.alive = false;
      this.anims.play(`${this.name}_dead`);
      this.depth = -3000;
    }
  }

  heal(health) {
    // console.log(`health ${health} this.health: ${this.health} this.maxHealth: ${this.maxHealth}`);
    this.health += health;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  capture() {
    this.scale = 1;
    this.captured = true;
    this.inBall = true;
    this.setActive(false);
    this.setVisible(false);
  }

  iChooseYou(tile) {
    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.inBall = false;
    this.setActive(true);
    this.setVisible(true);
  }

  chooseAction(map, player, pokemonManager, astar) {
    const { x, y } = map.worldToTileXY(this.x, this.y);
    const playerTile = map.worldToTileXY(player.x, player.y);
    const distanceToPlayer = TileMath.distance({ x, y }, playerTile);

    // Wild pokemon try to attack the player
    if (!this.captured) {
      const playerAttackable = [
        { x, y: y - 1 },
        { x: x + 1, y },
        { x, y: y + 1 },
        { x: x - 1, y }
      ].filter(location => location.x === playerTile.x && location.y === playerTile.y);

      // console.log('playerAttackable:');
      // console.log(playerAttackable);
      if (playerAttackable.length > 0) {
        return { type: ATTACK, target: player };
      }
    }

    // If the player is close to a wild pokemon, move towards them
    if (!this.captured && distanceToPlayer <= IGNORE_DISTANCE) {
      const pathToPlayer = astar.findPath({ x, y }, playerTile);

      // console.log('pathToPlayer:');
      // console.log(pathToPlayer);
      if (pathToPlayer.length > 2) {
        const nextTile = pathToPlayer[1];
        return { type: MOVE, to: nextTile };
      }
    }

    // Check for pokemon to attack, start at north then go clockwise
    const attackCandidates = [
      pokemonManager.getPokemonByTile({ x, y: y - 1 }),
      pokemonManager.getPokemonByTile({ x: x + 1, y }),
      pokemonManager.getPokemonByTile({ x, y: y + 1 }),
      pokemonManager.getPokemonByTile({ x: x - 1, y })
    ]
      .filter(candidate => candidate)
      .filter(candidate => candidate.captured !== this.captured);

    // console.log('attackCandidates:');
    // console.log(attackCandidates);
    if (attackCandidates.length > 0) {
      return { type: ATTACK, target: attackCandidates[0] };
    }

    // If the player is close to a tame pokemon, move towards them
    if (this.captured) {
      const pathToPlayer = astar.findPath({ x, y }, playerTile);

      // console.log('pathToPlayer:');
      // console.log(pathToPlayer);
      if (pathToPlayer.length > 2) {
        const nextTile = pathToPlayer[1];
        return { type: MOVE, to: nextTile };
      }
    }

    return { type: WAIT };
  }
}
