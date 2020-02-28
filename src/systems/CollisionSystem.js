export default class CollisionSystem {
  static update(delta, player, planetoids) {
    // Exit early if already on the ground
    if (player.onGround) {
      return;
    }

    const planetoidCandidates = planetoids
      .map(planetoid => {
        const playerLine = new Phaser.Geom.Line(player.x, player.y, planetoid.x, planetoid.y);
        const penetration = player.radius + planetoid.radius - Phaser.Geom.Line.Length(playerLine);
        return { planetoid, playerLine, penetration };
      })
      .filter(planetoidGeometry => {
        const { penetration } = planetoidGeometry;
        return penetration > 10;
      });

    // Exit early if no candidates
    if (planetoidCandidates.length === 0) {
      return;
    }

    const groundPlanetoid = planetoidCandidates[0];
    const { playerLine, penetration } = groundPlanetoid;
    const stopLine = Phaser.Geom.Line.Extend(playerLine, penetration);

    player.setPosition(stopLine.x1, stopLine.y1);

    player.body.stop();

    //player.setAcceleration(0);
    //player.setVelocity(0);
    player.onGround = true;
    player.jumping = false;

    console.log(`penetration: ${penetration}`);
  }
}
