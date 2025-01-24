import { EventEmitter } from 'events';
export class ExtensionHostContextProvider extends EventEmitter {
    async getAllContext() {
        const context = {
            extensionHost: 'vscode',
            version: '1.0.0',
            activeExtensions: ['extension1', 'extension2'],
        };
        return context;
    }
    triggerContextExtraction() {
        this.emit('contextExtracted', {
            extensionHost: 'vscode',
            version: '1.0.0',
            activeExtensions: ['extension1', 'extension2'],
        });
    }
}
//# sourceMappingURL=ExtensionHostContextProvider.js.map