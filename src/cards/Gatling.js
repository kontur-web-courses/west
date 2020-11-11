import Creature from "./Creature.js";
import TaskQueue from "../TaskQueue.js";

const GATLING_DAMAGE = 2;

class Gatling extends Creature {
  constructor() {
    super("Гатлинг", 6);
  }

  attack(gameContext, continuation) {
    const taskQueue = new TaskQueue();
    const oppositeTable = gameContext.oppositePlayer.table;

    for (const oppositeCard of oppositeTable) {
      taskQueue.push((onDone) => this.view.showAttack(onDone));
      taskQueue.push((onDone) =>
        this.dealDamageToCreature(
          GATLING_DAMAGE,
          oppositeCard,
          gameContext,
          onDone
        )
      );
    }

    taskQueue.continueWith(continuation);
  }
}

export default Gatling;
