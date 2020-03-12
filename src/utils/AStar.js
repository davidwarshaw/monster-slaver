import TileMath from './TileMath';
const CIRCUIT_BREAKER = 500;

export default class AStar {
  constructor(map, player, pokeManager) {
    this.map = map;
    this.player = player;
    this.pokeManager = pokeManager;
  }

  addNeighbor(neighbors, x, y) {
    if (this.pokeManager.someOnTile({ x, y }) > 0) {
      return;
    }

    const collision = this.map[TileMath.keyFromXY(x, y)];
    if (collision) {
      return;
    }

    neighbors.push({ x, y });
  }

  getNeighbors(point) {
    const neighbors = [];
    this.addNeighbor(neighbors, point.x, point.y - 1);
    this.addNeighbor(neighbors, point.x, point.y + 1);
    this.addNeighbor(neighbors, point.x - 1, point.y);
    this.addNeighbor(neighbors, point.x + 1, point.y);
    return neighbors;
  }

  addToOpenSet(openSet, goal, current, previous) {
    // Calculate the scores need to judge better paths
    const gScore = previous ? previous.gScore + 1 : 0;
    const hScore = TileMath.distance(current, goal);
    const fScore = gScore + hScore;
    const currentNode = {
      x: current.x,
      y: current.y,
      previous,
      gScore,
      hScore,
      fScore
    };

    // if the open set is empty no need to search for the insertion point
    if (openSet.length === 0) {
      openSet.push(currentNode);
      return;
    }

    // Search for the insertion point in the queue and insert
    for (let i = 0; i < openSet.length; i++) {
      const e = openSet[i];
      if (fScore < e.fScore || (fScore === e.fScore && hScore < e.hScore)) {
        openSet.splice(i, 0, currentNode);
        return;
      }
    }
  }

  findPath(from, to) {
    let circuitCount = 0;
    const openSet = [];
    const closedSet = {};

    this.addToOpenSet(openSet, to, from, null);

    while (openSet.length > 0) {
      // Left pop the next best node from the priority queue
      const current = openSet.shift();

      // If the current key is in the closed set, go to the next one
      const currentKey = TileMath.keyFromPoint(current);
      if (currentKey in closedSet) {
        continue;
      }

      // Add to the closed set
      closedSet[currentKey] = current;

      // If we're at the goal, stop searching
      if (current.x === to.x && current.y === to.y) {
        break;
      }

      // Check neighbors
      for (let neighbor of this.getNeighbors(current)) {
        const neighborKey = TileMath.keyFromPoint(neighbor);
        if (neighborKey in closedSet) {
          continue;
        }
        this.addToOpenSet(openSet, to, neighbor, current);
      }

      circuitCount++;
      if (circuitCount >= CIRCUIT_BREAKER) {
        console.log('AStar CIRCUIT_BREAKER tripped.');
        return [];
      }
    }

    // Reconstruct path by left pushing previous nodes back to start
    const path = [];
    let node = closedSet[TileMath.keyFromPoint(to)];
    while (node) {
      path.unshift({ x: node.x, y: node.y });
      node = node.previous;
    }
    return path;
  }
}
