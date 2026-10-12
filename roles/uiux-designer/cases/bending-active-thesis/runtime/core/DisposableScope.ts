export type Disposable = { dispose(): void };
export type Cleanup = Disposable | (() => void);

/** One feature/effect lifetime. Individual release and whole-scope release agree. */
export class DisposableScope implements Disposable {
  readonly label: string;
  private items = new Set<Disposable>();
  private closed = false;
  private onError: (error: unknown) => void;
  private onClose: () => void;

  constructor(label: string, onError?: (error: unknown) => void, onClose = () => {}) {
    this.label = label;
    this.onError = onError ?? ((error) => { throw error; });
    this.onClose = onClose;
  }

  get disposed() { return this.closed; }
  get size() { return this.items.size; }
  assertLive() { if (this.closed) throw Error(`Scope ${this.label} is disposed`); }

  add(cleanup: Cleanup): Disposable {
    let active = true;
    const resource: Disposable = { dispose: () => {
      if (!active) return;
      active = false;
      this.items.delete(resource);
      if (typeof cleanup === 'function') cleanup(); else cleanup.dispose();
    } };
    if (this.closed) {
      resource.dispose();
      throw Error(`Cannot add work to disposed scope ${this.label}`);
    }
    this.items.add(resource);
    return resource;
  }

  dispose() {
    if (this.closed) return;
    this.closed = true;
    const errors: unknown[] = [];
    for (const resource of [...this.items].reverse()) {
      try { resource.dispose(); } catch (error) { errors.push(error); }
    }
    this.items.clear();
    try { this.onClose(); } catch (error) { errors.push(error); }
    if (errors.length) this.onError(new AggregateError(errors, `Cleanup failed in ${this.label}`));
  }
}
