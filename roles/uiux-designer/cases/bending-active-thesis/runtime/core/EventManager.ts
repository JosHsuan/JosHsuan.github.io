import {DisposableScope, type Disposable} from './DisposableScope.ts';

type Listener<T> = (value: T) => void;

/** Shared registration infrastructure; feature behavior stays with its owner. */
export class EventManager<Events extends object = Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<unknown>>>();
  private scopes = new Set<DisposableScope>();
  private closed = false;
  private nativeCount = 0;
  private subscriptions = 0;
  private deliveries = 0;
  private faults = 0;
  private onError: (error: unknown) => void;

  constructor(onError: (error: unknown) => void = error => console.error('Runtime listener failed', error)) {
    this.onError = onError;
  }

  private report(error: unknown) { this.faults++; this.onError(error); }
  private assertLive() { if (this.closed) throw Error('EventManager is disposed'); }

  createScope(label: string): DisposableScope {
    this.assertLive();
    const scope = new DisposableScope(label, error => this.report(error), () => this.scopes.delete(scope));
    this.scopes.add(scope);
    return scope;
  }

  listen<T extends Event>(scope: DisposableScope, target: EventTarget, type: string,
    listener: Listener<T>, options: boolean | AddEventListenerOptions = false): Disposable {
    this.assertLive(); scope.assertLive();
    const signal = typeof options === 'object' ? options.signal : undefined;
    if (signal?.aborted) return {dispose() {}};
    const capture = typeof options === 'boolean' ? options : !!options.capture;
    const once = typeof options === 'object' && !!options.once;
    let resource: Disposable | undefined;
    const release = () => resource?.dispose();
    const handler: EventListener = event => {
      if (once) release();
      listener.call(target, event as T);
    };
    target.addEventListener(type, handler, options);
    this.nativeCount++;
    resource = scope.add(() => {
      target.removeEventListener(type, handler, capture);
      signal?.removeEventListener('abort', release);
      this.nativeCount--;
    });
    signal?.addEventListener('abort', release, {once: true});
    return resource;
  }

  on<K extends keyof Events>(scope: DisposableScope, type: K, listener: Listener<Events[K]>): Disposable {
    this.assertLive(); scope.assertLive();
    let bucket = this.listeners.get(type);
    if (!bucket) { bucket = new Set(); this.listeners.set(type, bucket); }
    // Each registration has its own lifetime, including the same callback in two scopes.
    const registered: Listener<unknown> = value => listener(value as Events[K]);
    bucket.add(registered); this.subscriptions++;
    return scope.add(() => {
      bucket.delete(registered); this.subscriptions--;
      if (!bucket.size) this.listeners.delete(type);
    });
  }

  emit<K extends keyof Events>(type: K, value: Events[K]) {
    if (this.closed) return;
    const bucket = this.listeners.get(type);
    if (!bucket) return;
    // Delivery mutation has a contract: new listeners wait, released ones do not run.
    for (const listener of [...bucket]) {
      if (!bucket.has(listener)) continue;
      try { this.deliveries++; listener(value); } catch (error) { this.report(error); }
    }
  }

  inspect() {
    return {scopes: this.scopes.size, nativeListeners: this.nativeCount,
      subscriptions: this.subscriptions, deliveries: this.deliveries, faults: this.faults, disposed: this.closed};
  }

  checkpoint(){return new Set(this.scopes);}
  rollback(checkpoint:ReadonlySet<DisposableScope>){for(const scope of [...this.scopes].reverse())if(!checkpoint.has(scope))scope.dispose();}

  dispose() {
    if (this.closed) return;
    this.closed = true;
    for (const scope of [...this.scopes]) scope.dispose();
    this.listeners.clear();
  }
}
