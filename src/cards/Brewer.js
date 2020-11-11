import Duck from "./Duck.js";

class Brewer extends Duck {
  constructor(name = "Пивовар", maxPower = 2, image) {
    super(name, maxPower, image);
  }

  doBeforeAttack(gameContext, continuation) {
    const { currentPlayer, oppositePlayer } = gameContext;
    const taskQueue = new TaskQueue();
    currentPlayer.table
      .concat(oppositePlayer.table)
      .filter(isDuck)
      .forEach((c) => {
        c.maxPower++;
        c.currentPower += 2;
        c.currentPower -=
          c.currentPower > c.maxPower ? c.currentPower - c.maxPower : 0;
        taskQueue.push((onDone) => {
          c.view.signalHeal(onDone);
        });
        taskQueue.push((onDone) => {
          c.updateView();
          onDone();
        });
      });
    taskQueue.continueWith(continuation);
  }
}

export default Brewer;
