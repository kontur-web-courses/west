import TaskQueue from "./TaskQueue.js";
import {Creature} from "./Creature.js";

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }
    attack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const taskQueue = new TaskQueue();
        for (let card of gameContext.oppositePlayer.table) {

            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}

export default Gatling