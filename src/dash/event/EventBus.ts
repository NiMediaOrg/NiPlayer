import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
class EventBus {
    private config: FactoryObject = {};
    private __events: {[props:string]: Array<{cb:Function,scope:FactoryObject}>} = {};
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup() {

    }

    on(type: string,listener:Function,scope:FactoryObject): void | never {
        if(!this.__events[type]) {
            this.__events[type] = [{
                cb: listener,
                scope
            }]
            return;
        }
        if(this.__events[type].filter(event=>{
            return event.cb === listener && event.scope === scope;
        }).length > 0) {
            throw new Error("请勿重复绑定监听器");
        }
        this.__events[type].push({
            cb:listener,
            scope
        })
    }

    off(type:string,listener:Function,scope:FactoryObject): void | never {
        if(!this.__events[type] || this.__events[type].filter(event => {
            return event.cb === listener && event.scope === scope;
        })) {
            throw new Error("不存在该事件");
        }
        this.__events[type] = this.__events[type].filter(event => {
            return event.cb === listener && event.scope === scope;
        })
    }

    trigger(type:string,...payload:any[]): void | never {
        console.log(this.__events)
        if(this.__events[type]) {
            this.__events[type].forEach(event=>{
                event.cb.call(event.scope,...payload);
            })
        }
    }
}

const factory = FactoryMaker.getSingleFactory(EventBus);
export default factory;
export {EventBus}