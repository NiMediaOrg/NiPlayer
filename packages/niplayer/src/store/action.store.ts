import BaseStore from "@/base/base.store";
interface ActionState {
    isProgressDrag: boolean;
}

export default class ActionStore extends BaseStore<ActionState> {
    get defaultState(): ActionState {
        return {
            isProgressDrag: false,
        }
    }

    mounted(): void {
        
    }
}