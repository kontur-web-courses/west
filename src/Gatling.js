import Creature from "./Creature";
import TaskQueue from "./TaskQueue";

export default class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            for(let position = 0; position < oppositePlayer.table.length; position++) {
                const oppositeCard = oppositePlayer.table[position];

                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    this.dealDamageToPlayer(1, gameContext, onDone);
                }
            }
        });

        taskQueue.continueWith(continuation);
    }
}