import {default as View} from './CardView.js';
import TaskQueue from './TaskQueue.js';


function getInheritanceDescription (card) {
    const names = [];
    let obj = card;
    while (true) {
        obj = Object.getPrototypeOf(obj);
        names.push(obj.constructor.name);
        if (obj === Card.prototype)
            break;
    }
    return names.join('➔ ');
}

export default class Card {
    constructor (name, maxPower, image) {
        this.name = name;
        this.image = image;

        this.maxPower = maxPower;
        this.currentPower = maxPower;

        this.view = new View();
        this.updateView();
    }

    putInDeck(deck, inBottomRow, position) {
        this.view.putInDeck(deck, inBottomRow, position);
    }

    comeIntoPlay(gameContext, place, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.view.flipFront(onDone));
        taskQueue.push(onDone => this.view.moveTo(place, onDone));

        taskQueue.push(onDone => this.doAfterComingIntoPlay(gameContext, onDone));

        taskQueue.continueWith(continuation);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    }

    actInTurn(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.doBeforeAttack(gameContext, onDone));
        taskQueue.push(onDone => this.attack(gameContext, onDone));

        taskQueue.push(onDone => gameContext.oppositePlayer.removeDead(onDone));
        taskQueue.push(onDone => gameContext.currentPlayer.removeDead(onDone));

        taskQueue.continueWith(continuation);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        continuation();
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();

        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));
        taskQueue.push(onDone => {
            const oppositeCard = oppositePlayer.table[position];

            if (oppositeCard) {
                this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
            } else {
                this.dealDamageToPlayer(1, gameContext, onDone);
            }
        });

        taskQueue.continueWith(continuation);
    }

    dealDamageToCreature(value, toCard, gameContext, continuation) {
        const taskQueue = new TaskQueue();

        let actualValue = value;

        taskQueue.push(onDone => {
            this.modifyDealedDamageToCreature(actualValue, toCard, gameContext, (v) => {
                if (v !== undefined) {
                    actualValue = v;
                }
                onDone();
            });
        });

        taskQueue.push(onDone => {
            toCard.takeDamage(Math.max(actualValue, 0), this, gameContext, onDone);
        });

        taskQueue.continueWith(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value);
    }

    dealDamageToPlayer(value, gameContext, continuation) {
        const taskQueue = new TaskQueue();

        let actualValue = value;

        taskQueue.push(onDone => {
            this.modifyDealedDamageToPlayer(actualValue, gameContext, (v) => {
                if (v !== undefined) {
                    actualValue = v;
                }
                onDone();
            });
        });

        taskQueue.push(onDone => {
            gameContext.oppositePlayer.takeDamage(Math.max(actualValue, 0), onDone);
        });

        taskQueue.continueWith(continuation);
    }

    modifyDealedDamageToPlayer(value, gameContext, continuation) {
        continuation(value);
    }

    takeDamage(value, fromCard, gameContext, continuation) {
        const taskQueue = new TaskQueue();

        let actualValue = value;

        taskQueue.push(onDone => {
            this.modifyTakenDamage(actualValue, fromCard, gameContext, (v) => {
                if (v !== undefined) {
                    actualValue = v;
                }
                onDone();
            });
        });

        taskQueue.push(onDone => {
            if (actualValue <= 0) {
                onDone();
                return;
            }

            this.currentPower = this.currentPower - actualValue;
            this.updateView();
            this.view.signalDamage(onDone);
        });

        taskQueue.continueWith(continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value);
    }

    moveTo(place, continuation) {
        this.view.moveTo(place, continuation);
    }

    removeFromGame(continuation) {
        const taskQueue = new TaskQueue();

        taskQueue.push(onDone => this.doBeforeRemoving(onDone));
        taskQueue.push(onDone => this.view.remove(onDone));

        taskQueue.continueWith(continuation);
    }

    doBeforeRemoving(continuation) {
        continuation();
    }

    getDescriptions() {
        return [
            getInheritanceDescription(this)
        ];
    }

    updateView() {
        this.view.updateData({
            name: this.name,
            descriptions: this.getDescriptions(),
            image: this.image,
            currentPower: this.currentPower,
            maxPower: this.maxPower
        });
    };

}
