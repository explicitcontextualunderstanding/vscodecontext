import { EventEmitter } from 'events';
export class SCMContextProvider extends EventEmitter {
    async getAllContext() {
        const context = {
            scmProvider: 'git',
            branches: ['main', 'develop'],
            currentBranch: 'main',
        };
        return context;
    }
    triggerContextExtraction() {
        this.emit('contextExtracted', {
            scmProvider: 'git',
            branches: ['main', 'develop'],
            currentBranch: 'main',
        });
    }
}
//# sourceMappingURL=SCMContextProvider.js.map