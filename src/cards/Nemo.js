import Creature from "./Creature.js";

class Nemo extends Creature {
  constructor(name = "Немо", maxPower = 4, image) {
    super(name, maxPower, image);
  }

  stealPrototype(card, gameContext, continuation) {
    Object.setPrototypeOf(this, Object.getPrototypeOf(card));
    if ("doBeforeAttack" in this)
      this.doBeforeAttack(gameContext, continuation);
  }

  doBeforeAttack(gameContext, continuation) {
    const { oppositePlayer, position } = gameContext;
    const oppositeCard = oppositePlayer.table[position];
    if (oppositeCard)
      this.stealPrototype(oppositeCard, gameContext, continuation);
    else continuation();
  }
}

export default Nemo;
