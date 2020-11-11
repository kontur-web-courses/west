import Dog from "./Dog.js";

class Trasher extends Dog {
  constructor() {
    super("Громила", 5);
  }

  modifyTakenDamage(value, fromCard, gameContext, continuation) {
    this.view.signalAbility(() => continuation(value - 1));
  }

  getDescriptions() {
    return ["Получает на 1 ед. меньше урона.", ...super.getDescriptions()];
  }
}

export default Trasher;
