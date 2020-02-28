export default class GravitySystem {
  static update(delta, player, planetoids) {
    // Exit early if already on the ground
    if (player.onGround) {
      return;
    }

    const gravityAcceleration = new Phaser.Math.Vector2(0, 0);

    planetoids
      .map(planetoid => {
        const playerLine = new Phaser.Geom.Line(player.x, player.y, planetoid.x, planetoid.y);
        return { planetoid, playerLine };
      })
      .filter(planetoidGeometry => {
        const { planetoid, playerLine } = planetoidGeometry;
        return Phaser.Geom.Line.Length(playerLine) <= planetoid.gravityRadius;
      })
      .forEach(planetoidGeometry => {
        const { planetoid, playerLine } = planetoidGeometry;
        const angle = Phaser.Geom.Line.Angle(playerLine);
        const planetoidGravityAcceleration = new Phaser.Math.Vector2(0, 0).setToPolar(
          angle,
          planetoid.gravityAcceleration * delta
        );
        gravityAcceleration.add(planetoidGravityAcceleration);
      });

    // Set the player rotation relative to the acceleration
    player.setUpFromGravity(gravityAcceleration.angle());

    player.body.acceleration.add(gravityAcceleration);
  }
}
