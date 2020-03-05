import properties from '../properties';

const types = ['earth', 'wind', 'fire', 'water', 'spirit'];

export default class MeleeSystem {
  constructor() {
    // Weaknesses should be different than types
    do {
      this.weaknesses = properties.rng.shuffle(types);
    } while (this.someTypesTheSame(this.weaknesses, types));

    // Strengths should always be different than both types and weaknesses
    do {
      this.strengths = properties.rng.shuffle(types);
    } while (
      this.someTypesTheSame(this.strengths, types) ||
      this.someTypesTheSame(this.strengths, this.weaknesses)
    );

    this.typeDefinition = {};
    types.forEach((type, i) => {
      this.typeDefinition[type] = {};
      this.typeDefinition[type].weakAgainst = this.weaknesses[i];
      this.typeDefinition[type].strongAgainst = this.strengths[i];
      console.log(`Type:           ${type}`);
      console.log(`Weak against:   ${this.typeDefinition[type].weakAgainst}`);
      console.log(`Strong against: ${this.typeDefinition[type].strongAgainst}`);
    });
  }

  someTypesTheSame(lefts, rights) {
    return lefts.some((left, i) => left === rights[i]);
  }

  attackDamageBySize(size) {
    switch (size) {
      case 1: {
        return 5;
      }
      case 2: {
        return 10;
      }
      case 3: {
        return 15;
      }
    }
  }

  attackChanceBySpeed(speed) {
    switch (speed) {
      case 1: {
        return 60;
      }
      case 2: {
        return 70;
      }
      case 3: {
        return 80;
      }
    }
  }

  attack(attacker, defender) {
    const attackerType = this.typeDefinition[attacker.definition.type];
    const defenderType = this.typeDefinition[defender.definition.type];

    let multiplier = 1.0;
    if (attackerType.weakAgainst === defenderType) {
      multiplier = 0.5;
    }
    if (attackerType.strongAgainst === defenderType) {
      multiplier = 2.0;
    }

    let damage = 0;
    const roll = properties.rng.getPercentage();
    const chance = this.attackChanceBySpeed(attacker.definition.speed);
    if (roll <= chance) {
      const baseDamage = this.attackDamageBySize(attacker.definition.size);
      damage = Math.round(baseDamage * multiplier);
    }

    return damage;
  }
}
