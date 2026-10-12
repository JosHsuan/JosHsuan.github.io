type Target = HTMLElement | null | undefined;

/** One DOM publication interface, with owner-specific counters for comparable diagnostics. */
export class DOMPresenter {
  private counters=new Map<string,{writes:number;unchanged:number}>();
  forOwner(owner:string){
    const counter=this.counters.get(owner)??{writes:0,unchanged:0};this.counters.set(owner,counter);
    return{
      style(element:Target,name:string,value:unknown){
        if(!element)return;const text=String(value);
        if(element.style.getPropertyValue(name)===text){counter.unchanged++;return;}
        element.style.setProperty(name,text);counter.writes++;
      },
      attribute(element:Target,name:string,value:unknown){
        if(!element)return;const text=value===null?null:String(value);
        if(element.getAttribute(name)===text){counter.unchanged++;return;}
        if(text===null)element.removeAttribute(name);else element.setAttribute(name,text);counter.writes++;
      },
      text(element:Target,value:unknown){
        if(!element)return;const text=String(value);
        if(element.textContent===text){counter.unchanged++;return;}
        element.textContent=text;counter.writes++;
      },
      inspect:()=>({...counter}),
    };
  }
  inspect(){return Object.fromEntries([...this.counters].map(([owner,value])=>[owner,{...value}]));}
}
