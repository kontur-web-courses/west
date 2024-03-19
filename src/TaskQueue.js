function runNextTask(queue) {
    if (queue.running || queue.tasks.length === 0) {
        return;
    }
    queue.running = true;
    const task = queue.tasks.shift();

    if (task.runAndContinue) {
        setTimeout(() => {
            task.runAndContinue(() => {
                task.dispose && task.dispose();
                queue.running = false;

                setTimeout(() => {
                    runNextTask(queue);
                });
            });
        }, 0);
    } else {
        runNextTask(queue);
    }
}

class TaskQueue {
    constructor() {
        this.tasks = [];
        this.running = false;
    }

    push(run, dispose, duration) {
        if (duration === undefined || duration === null) {
            this.tasks.push({ runAndContinue: run, dispose });
        } else {
            this.tasks.push({
                runAndContinue: (continuation) => {
                    run();
                    setTimeout(() => {
                        continuation();
                    }, duration);
                },
                dispose
            });
        }
        runNextTask(this);
    }

    continueWith(action) {
        this.push(action, null, 0);
    }
}

export default TaskQueue;
