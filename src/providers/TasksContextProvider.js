import { EventEmitter } from 'events';
export class TasksContextProvider extends EventEmitter {
  async getAllContext() {
    const context = {
      tasks: [
        { id: 'task1', status: 'completed' },
        { id: 'task2', status: 'pending' },
      ],
    };
    return context;
  }
  triggerContextExtraction() {
    this.emit('contextExtracted', {
      tasks: [
        { id: 'task1', status: 'completed' },
        { id: 'task2', status: 'pending' },
      ],
    });
  }
}
//# sourceMappingURL=TasksContextProvider.js.map
