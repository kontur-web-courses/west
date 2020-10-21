import Creature from "../Creature.js";

class Rogue extends Creature {
    constructor(name = 'Изгой', maxPower = 2, image = '../images/rogue.jpg') {
        super(name, maxPower, image);
    }

    doBeforeAttack(gameContext, continuation) {
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;
        const oppositeCard = oppositePlayer.table[position];
        if (oppositeCard) {
            const cardProto = Object.getPrototypeOf(oppositeCard);
            if (cardProto.hasOwnProperty('modifyDealedDamageToCreature')) {
                this.modifyDealedDamageToCreature = cardProto.modifyDealedDamageToCreature;
                delete cardProto['modifyDealedDamageToCreature'];
            }
            if (cardProto.hasOwnProperty('modifyDealedDamageToPlayer')) {
                this.modifyDealedDamageToPlayer = cardProto.modifyDealedDamageToPlayer;
                delete cardProto['modifyDealedDamageToPlayer'];
            }
            if (cardProto.hasOwnProperty('modifyTakenDamage')) {
                this.modifyTakenDamage = cardProto.modifyTakenDamage;
                delete cardProto['modifyTakenDamage'];
            }
            gameContext.updateView();
        }
        continuation();
    }
}

export default Rogue;