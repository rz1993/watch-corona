/*
Simple TtlCache with lazy eviction. Keys will be lazily evicted on read.
Time to live is with respect to the inital timestamp on write, not on last read.
*/
class TtlCache {
  constructor(ttl) {
    this.ttl = ttl * 1000;
    this.cache = {}
  }

  get(key) {
    if (this.cache[key]) {
      const { value, timestamp } = this.cache[key]
      if ((Date.now() - timestamp) < this.ttl) {
        return value
      }
      this.delete(key)
    }
    return undefined
  }

  set(key, value) {
    this.cache[key] = { value, timestamp: Date.now() }
  }

  delete(key) {
    delete this.cache[key]
  }
}

export default TtlCache;
