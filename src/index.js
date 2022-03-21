import Game from './Game.js';
import SpeedRate from './SpeedRate.js';
import Dog from "./Dog.js";
import Duck from "./Duck.js";
import Gatling from "./Gatling.js";


class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }
}

class Lad extends Dog{
    constructor(name = 'Браток', power = 2) {
        super(name, power);
    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }
    static getBonus() {
        return this.getInGameCount() * (this.getInGameCount() + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value + Lad.getBonus());
        });
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(value - Lad.getBonus(), 0));
        });
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
    new Gatling(),
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
