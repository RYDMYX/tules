// key.js
window.__KEY_STATE__ = {
  key: "C",           // initial key
  listeners: new Set(),

  // Propose a new key
  setKey(newKey, source) {
    if (this.key === newKey) return; // no change
    this.key = newKey;

    // notify all subscribers, except the source
    for (const fn of this.listeners) fn(newKey, source);
  },

  // Components subscribe to key changes
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn); // optional unsubscribe
  }
};