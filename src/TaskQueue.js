export default class TaskQueue {
    constructor() {
        this.tasks = [];
        // noinspection JSUnusedGlobalSymbols
        this.running = false;
    }

    push(run, dispose, duration) {
        if (duration === undefined || duration === null) {
            this.tasks.push({runAndContinue: run, dispose});
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

        TaskQueue.runNextTask(this);
    };

    continueWith(action) {
        this.push(action, null, 0);
    };

    static runNextTask(taskQueue) {
        if (taskQueue.running || taskQueue.tasks.length === 0) {
            return;
        }
        taskQueue.running = true;
        const task = taskQueue.tasks.shift();

        if (task.runAndContinue) {
            setTimeout(() => {
                task.runAndContinue(() => {
                    task.dispose && task.dispose();
                    taskQueue.running = false;

                    setTimeout(() => {
                        TaskQueue.runNextTask(taskQueue);
                    });
                });
            }, 0);
        }
        else {
            TaskQueue.runNextTask(taskQueue);
        }
    }
}
