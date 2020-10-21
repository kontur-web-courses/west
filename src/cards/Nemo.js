import Creature from "../Creature.js";

class Nemo extends Creature {
    constructor(name = 'Немо', maxPower = 4, image = '../images/nemo.jpg') {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        const currentCard = currentPlayer.table[position];
        if (oppositeCard && currentCard) {
            Object.setPrototypeOf(currentCard, Object.getPrototypeOf(oppositeCard));
            updateView();
            this.doBeforeAttack(gameContext, continuation);
        } else {
            continuation();
        }
    }
}

export default Nemo;