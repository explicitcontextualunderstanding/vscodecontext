export declare enum ContextCategory {
    Editor = "Editor",
    Terminal = "Terminal",
    Workspace = "Workspace",
    Debug = "Debug",
    SCM = "SCM",
    Tasks = "Tasks"
}
export interface ContextDataProvider {
    category: ContextCategory;
    isEnabled(): boolean;
    getContext(): Promise<unknown>;
}
