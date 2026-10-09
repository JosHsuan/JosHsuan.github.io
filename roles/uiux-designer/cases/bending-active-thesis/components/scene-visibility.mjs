// CPU-loaded source data may finish while the page is hidden/frozen. Do not
// create its GPU environment and targets until the existing lifecycle resumes.
// Cancellation always releases this subscription, including an aborted load.
export function waitForSceneVisibility(input, signal) {
  if (signal.aborted) return Promise.resolve(false);
  if (!input.get().hidden) return Promise.resolve(true);
  return new Promise(resolve => {
    let finished = false, unsubscribe = () => {};
    const finish = visible => {
      if (finished) return;
      finished = true;
      unsubscribe();
      signal.removeEventListener('abort', cancelled);
      resolve(visible);
    };
    const cancelled = () => finish(false);
    const check = () => {if (signal.aborted) finish(false); else if (!input.get().hidden) finish(true);};
    unsubscribe = input.subscribe(check);
    signal.addEventListener('abort', cancelled, {once: true});
    check();
  });
}
