import Creature from "./Creature.js";

class Rogue extends Creature {
  constructor(name = "Изгой", maxPower = 2, image) {
    super(name, maxPower, image);
  }

  doBeforeAttack(gameContext, continuation) {
    const { oppositePlayer, position, updateView } = gameContext;
    const oppositeCard = oppositePlayer.table[position];
    if (oppositeCard) {
      this.stealAbilities(oppositeCard);
      updateView();
    }
    continuation();
  }

  stealAbilities(card) {
    const cardPrototype = Object.getPrototypeOf(card);
    const abilities = Object.getOwnPropertyNames(cardPrototype).filter(
      (x) => Rogue.abilitiesToSteal.indexOf(x) !== -1
    );
    for (const ability of abilities) {
      Rogue.prototype[ability] = cardPrototype[ability];
      delete cardPrototype[ability];
    }
  }

  static abilitiesToSteal = [
    "modifyTakenDamage",
    "modifyDealedDamageToPlayer",
    "modifyDealedDamageToCreature",
  ];
}

export default Rogue;
