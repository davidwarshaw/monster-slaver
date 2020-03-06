import dialogDefinitions from '../definitions/dialogDefinitions.json';

export default class DialogSystem {
  constructor(mapName) {
    this.mapSet = dialogDefinitions[mapName];

    this.isDialog = false;
    this.currentTextIndex = 0;
  }

  showNextText() {

  }

}
