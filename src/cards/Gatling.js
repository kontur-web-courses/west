import Creature from "../Creature.js";
import TaskQueue from "../TaskQueue.js";

class Gatling extends Creature {
    constructor(name = 'Мирная утка', maxPower = 6) {
        super(name, maxPower);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        oppositePlayer.table.map((oppositeCard) => {
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                this.dealDamageToCreature(2, oppositeCard, gameContext, onDone);
            });
        });

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        return [...super.getDescriptions(), 'При атаке наносит 2 урона по очереди всем картам противника на столе, но не атакует игрока-противника.'];
    }
}

export default Gatling;