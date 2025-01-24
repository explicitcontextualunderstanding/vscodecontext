export class VSCodeExtensionContextAdapter {
  constructor(context) {
    this.context = context;
  }
  get subscriptions() {
    return this.context.subscriptions;
  }
}
//# sourceMappingURL=VSCodeExtensionContextAdapter.js.map
