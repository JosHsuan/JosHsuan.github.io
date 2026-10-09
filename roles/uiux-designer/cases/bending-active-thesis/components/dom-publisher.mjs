/** Reads inline values only (never computed geometry). Reconcile the live node
 * so a discrete React render can replace attributes without stale cache values.
 * Callers group geometry reads separately from these write operations. */
export function createDOMPublisher() {
  let writes = 0, unchanged = 0;
  return {
    style(element, name, value) {
      if (!element) return;
      const text = String(value);
      if (element.style.getPropertyValue(name) === text) {unchanged++; return;}
      element.style.setProperty(name, text); writes++;
    },
    attribute(element, name, value) {
      if (!element) return;
      const text = value === null ? null : String(value);
      if (element.getAttribute(name) === text) {unchanged++; return;}
      if (text === null) element.removeAttribute(name); else element.setAttribute(name, text);
      writes++;
    },
    text(element, value) {
      if (!element) return;
      const text = String(value);
      if (element.textContent === text) {unchanged++; return;}
      element.textContent = text; writes++;
    },
    inspect() {return {writes, unchanged};},
  };
}
