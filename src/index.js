import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.


// Дает описание существа по схожести с утками и собаками


class Creature extends Card {
	constructor(name, maxPower, image) {
		super(name, maxPower, image);
	}

	getDescriptions() {
		return [Creature.getCreatureDescription(this), ...super.getDescriptions()];
	}

	static getCreatureDescription(card) {
		if (Creature.isDuck(card) && Creature.isDog(card)) {
			return 'Утка-Собака'
		}
		if (Creature.isDuck(card)) {
			return 'Утка'
		}
		if (Creature.isDog(card)) {
			return 'Собака'
		}
		return 'Существо';
	}

	static isDuck(card) {
		return card && card.quacks && card.swims
	}

	static isDog(card) {
		return card instanceof Dog
	}
}

// Основа для утки.
class Duck extends Creature {
	constructor(name = 'Мирная утка', power = 2) {
		super(name, power);
	}
	quacks = function () {
		console.log('quack')
	}
	swims = function () {
		console.log('float: both;')
	}
}


// Основа для собаки.
class Dog extends Creature {
	constructor(name = 'Пес-бандит', power = 2) {
		super(name, power);
	}
}

class Trasher extends Dog {
	constructor(name = 'Громила', power = 5) {
		super(name, power)
	}
	getDescriptions() {
        return ['Громила', 'Получает на 1 меньше урона', ...super.getDescriptions()]
    }
    modifyTakenDamage (value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => continuation(value - 1));
    }
}

class Gatling extends Creature {
	constructor(name = 'Гатлинг', power = 6) {
		super(name, power)
	}
	attack(gameContext, continuation) {
		const taskQueue = new TaskQueue();
		gameContext.oppositePlayer.table.forEach(oppositeCard => {
            if (oppositeCard){
                taskQueue.push(onDone => this.view.showAttack(onDone))
				taskQueue.push(onDone =>
				this.dealDamageToCreature(
					2,
					oppositeCard,
					gameContext,
					onDone)
				);
            }		
		});
        taskQueue.continueWith(continuation);
	}
}

class Lad extends Dog {

	constructor() {
		super('Браток', 2);		
	}

	doAfterComingIntoPlay(gameContext, continuation) {
		Lad.setInGameCount(Lad.getInGameCount() + 1);
		continuation();
	}

    doBeforeRemoving(gameContext, continuation) {
		Lad.setInGameCount(Lad.getInGameCount() - 1);
		continuation();
	}

	getDescriptions() {
		let descriptions = super.getDescriptions()
		if(Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')
		   && Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
			descriptions.unshift('Чем их больше, тем они сильнее');
		}
		
        return descriptions;
    }

	modifyTakenDamage (value, fromCard, gameContext, continuation){
        super.modifyTakenDamage(value - Lad.getBonus(), fromCard, gameContext, continuation);
    }

	modifyDealedDamageToCreature (value, toCard, gameContext, continuation) {
		super.modifyDealedDamageToCreature(value + Lad.getBonus(), toCard, gameContext, continuation);
	}

	static getBonus() {
		let count = this.inGameCount;
		return count * (count + 1) / 2;
	}

	static getInGameCount() {
		return this.inGameCount || 0;
	}

	static setInGameCount(value) {
		this.inGameCount = value;
	}
}
// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
	new Duck(),
	new Duck(),
	new Duck(),
];
const banditStartDeck = [
	new Lad(),
	new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
