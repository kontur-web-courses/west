import Creature from "./Creature.js";
import TaskQueue from "./TaskQueue.js";

export default class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {oppositePlayer} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            for(let position = 0; position < oppositePlayer.table.length; position++) {
                const oppositeCard = oppositePlayer.table[position];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            }
        });

        taskQueue.continueWith(continuation);
    }
}