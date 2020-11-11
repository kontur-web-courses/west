import Dog from "./Dog.js";

class Lad extends Dog {
  constructor() {
    super("Браток", 2);
  }

  modifyTakenDamage(value, fromCard, gameContext, continuation) {
    this.view.signalAbility(() => continuation(value - 1));
  }

  getDescriptions() {
    const hasProps =
      Lad.prototype.hasOwnProperty("modifyDealedDamageToCreature") ||
      Lad.prototype.hasOwnProperty("modifyTakenDamage");
    return [
      hasProps ? "Чем их больше, тем они сильнее" : "",
      ...super.getDescriptions(),
    ];
  }

  doAfterComingIntoPlay(gameContext, continuation) {
    Lad.setInGameCount(Lad.getInGameCount() + 1);
    continuation();
  }

  doBeforeRemoving(continuation) {
    Lad.setInGameCount(Lad.getInGameCount() - 1);
    continuation();
  }

  modifyTakenDamage(value, fromCard, gameContext, continuation) {
    const bonus = Lad.getBonus();
    this.view.signalAbility(() => continuation(value - bonus));
  }

  modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
    const bonus = Lad.getBonus();
    this.view.signalAbility(() => continuation(value + bonus));
  }

  static getBonus() {
    return (this.inGameCount * (this.inGameCount + 1)) / 2;
  }

  static getInGameCount() {
    return this.inGameCount || 0;
  }
  static setInGameCount(value) {
    this.inGameCount = value;
  }
}

export default Lad;
