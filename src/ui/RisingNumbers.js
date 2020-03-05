import properties from '../properties';

import Font from './Font';

export default class RisingNumbers {
  constructor(scene, origin, number, fixed) {
    const font = new Font(scene);

    const numberString = number.toString();
    const xOffset = number < 0 ? -16 : -8;
    const text = font.render(origin.x + xOffset, origin.y, numberString);
    if (fixed) {
      text.setScrollFactor(0);
    }

    if (number > 0) {
      text.tint = 0x73fa79;
    }

    scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: properties.numberMillis
    });
    scene.tweens.add({
      targets: text,
      x: origin.x + xOffset,
      y: origin.y - 60,
      duration: properties.numberMillis,
      onComplete: () => {
        text.destroy();
      },
      onCompleteScope: this
    });
  }
}
